<template>
  <div
    class="el-tree"
    :class="{
      'el-tree--highlight-current': highlightCurrent,
      'el-tree--keyboard-focus': keyboardFocus,
      'is-dragging': !!dragState.draggingNode,
      'is-drop-not-allow': !dragState.allowDrop,
      'is-drop-inner': dragState.dropType === 'inner',
    }"
    role="tree"
  >
    <el-tree-node
      v-for="child in root.childNodes"
      :key="getNodeKey(child)"
      :node="child"
      :props="props"
      :render-after-expand="renderAfterExpand"
      :show-checkbox="showCheckbox"
      :render-content="renderContent"
      @node-expand="handleNodeExpand"
    />

    <div v-if="isEmpty" class="el-tree__empty-block">
      <span class="el-tree__empty-text">{{ emptyText }}</span>
    </div>

    <!-- 拖拽指示器 -->
    <div
      v-show="dragState.showDropIndicator"
      ref="dropIndicator"
      class="el-tree__drop-indicator"
    />
  </div>
</template>

<script>
import TreeStore from './model/tree-store'
import { getNodeKey } from './model/util'
import ElTreeNode from './tree-node.vue'
import { createDragHandler } from './utils/drag-handler'
import { createKeyboardHandler } from './utils/keyboard-handler'

export default {
  name: 'ElTree',

  components: {
    ElTreeNode,
  },

  props: {
    data: {
      type: Array,
    },
    emptyText: {
      type: String,
      default: '暂无数据',
    },
    nodeKey: String,
    props: {
      type: Object,
      default() {
        return {
          children: 'children',
          label: 'label',
          disabled: 'disabled',
        }
      },
    },
    defaultExpandAll: Boolean,
    defaultExpandedKeys: Array,
    expandOnClickNode: {
      type: Boolean,
      default: true,
    },
    highlightCurrent: Boolean,
    renderContent: Function,
    currentNodeKey: [String, Number],
    indent: {
      type: Number,
      default: 18,
    },
    iconClass: String,
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    checkStrictly: Boolean,
    defaultCheckedKeys: Array,
    checkOnClickNode: Boolean,
    checkDescendants: {
      type: Boolean,
      default: false,
    },
    autoExpandParent: {
      type: Boolean,
      default: true,
    },
    lazy: {
      type: Boolean,
      default: false,
    },
    load: Function,
    // 拖拽相关props
    draggable: {
      type: Boolean,
      default: false,
    },
    allowDrag: Function,
    allowDrop: Function,
    // 过滤相关props
    filterNodeMethod: Function,
    accordion: Boolean,
    renderAfterExpand: {
      type: Boolean,
      default: true,
    },
    // 键盘导航焦点样式控制
    keyboardFocus: {
      type: Boolean,
      default: false,
    },
  },

  emits: [
    'node-expand',
    'node-collapse',
    'node-click',
    'current-change',
    'check',
    'check-change',
    // 拖拽相关事件
    'node-drag-start',
    'node-drag-enter',
    'node-drag-leave',
    'node-drag-over',
    'node-drag-end',
    'node-drop',
  ],

  data() {
    return {
      store: null,
      root: null,
      currentNode: null,
      // 拖拽状态
      dragState: {
        showDropIndicator: false,
        draggingNode: null,
        dropNode: null,
        allowDrop: true,
        dropType: null,
      },
      // 键盘导航相关
      treeItems: null,
      checkboxItems: [],
    }
  },

  computed: {
    isEmpty() {
      const { childNodes } = this.root
      return (
        !childNodes ||
        childNodes.length === 0 ||
        childNodes.every(({ visible }) => !visible)
      )
    },

    treeItemArray() {
      if (!this.treeItems) return []
      return Array.prototype.slice.call(this.treeItems)
    },
  },

  watch: {
    data(newVal) {
      this.store.setData(newVal)
    },

    defaultCheckedKeys(newVal) {
      this.store.setDefaultCheckedKey(newVal)
    },

    defaultExpandedKeys(newVal) {
      this.store.defaultExpandedKeys = newVal
      this.store.setDefaultExpandedKeys(newVal)
    },

    checkStrictly(newVal) {
      this.store.checkStrictly = newVal
    },

    checkboxItems(val) {
      Array.prototype.forEach.call(val, (checkbox) => {
        checkbox.setAttribute('tabindex', -1)
      })
    },
  },

  created() {
    this.isTree = true

    this.store = new TreeStore({
      key: this.nodeKey,
      data: this.data,
      lazy: this.lazy,
      props: this.props,
      load: this.load,
      currentNodeKey: this.currentNodeKey,
      checkStrictly: this.checkStrictly,
      checkDescendants: this.checkDescendants,
      defaultCheckedKeys: this.defaultCheckedKeys,
      defaultExpandedKeys: this.defaultExpandedKeys,
      autoExpandParent: this.autoExpandParent,
      defaultExpandAll: this.defaultExpandAll,
      filterNodeMethod: this.filterNodeMethod,
    })

    this.root = this.store.root

    // 初始化拖拽处理器（延迟到 mounted，确保 $el 已存在）
    // 注意：拖拽处理器需要在 mounted 中初始化，因为需要访问 $el
  },
  
  mounted() {
    // 初始化拖拽处理器
    if (this.draggable) {
      const dragHandler = createDragHandler({
        dragState: this.dragState,
        allowDrag: this.allowDrag,
        allowDrop: this.allowDrop,
        store: this.store,
        $emit: this.$emit.bind(this),
        $refs: this.$refs,
        $el: this.$el,
      })

      // 注册拖拽事件
      this.$on('tree-node-drag-start', dragHandler.handleDragStart)
      this.$on('tree-node-drag-over', dragHandler.handleDragOver)
      this.$on('tree-node-drag-end', dragHandler.handleDragEnd)
      
      // 保存引用以便清理
      this._dragHandler = dragHandler
    }
    
    this.initTabIndex()
    // 初始化键盘处理器
    this._keyboardHandler = createKeyboardHandler({
      $el: this.$el,
    })
    this.$el.addEventListener('keydown', this.handleKeydown)
  },

  beforeDestroy() {
    // 清理事件监听器
    if (this.$el && this.handleKeydown) {
      this.$el.removeEventListener('keydown', this.handleKeydown)
    }
    // 清理键盘处理器引用
    this._keyboardHandler = null
  },

  updated() {
    this.treeItems = this.$el.querySelectorAll('[role=treeitem]')
    this.checkboxItems = this.$el.querySelectorAll('input[type=checkbox]')
    this.initTabIndex()
  },

  methods: {
    filter(value) {
      if (!this.filterNodeMethod)
        throw new Error('[Tree] filterNodeMethod is required when filter')
      this.store.filter(value)
    },

    getNodeKey(node) {
      return getNodeKey(this.nodeKey, node.data)
    },

    handleNodeExpand(nodeData, node, instance) {
      // 手风琴模式：展开当前节点时收起其他同级节点
      if (this.accordion) {
        this.store.setCurrentNode(node)
        const siblings = node.parent
          ? node.parent.childNodes
          : this.root.childNodes
        siblings.forEach((sibling) => {
          if (sibling !== node && sibling.expanded) {
            sibling.collapse()
          }
        })
      }

      this.$emit('node-expand', nodeData, node, instance)
    },

    getCurrentNode() {
      const currentNode = this.store.getCurrentNode()
      return currentNode ? currentNode.data : null
    },

    getCurrentKey() {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in getCurrentKey')
      const currentNode = this.getCurrentNode()
      return currentNode ? currentNode[this.nodeKey] : null
    },

    setCurrentNode(node) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCurrentNode')
      this.store.setUserCurrentNode(node)
    },

    setCurrentKey(key) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCurrentKey')
      this.store.setCurrentNodeKey(key)
      this.initTabIndex()
    },

    getNode(data) {
      return this.store.getNode(data)
    },

    getCheckedNodes(leafOnly, includeHalfChecked) {
      return this.store.getCheckedNodes(leafOnly, includeHalfChecked)
    },

    getCheckedKeys(leafOnly) {
      return this.store.getCheckedKeys(leafOnly)
    },

    setCheckedNodes(nodes, leafOnly) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCheckedNodes')
      this.store.setCheckedNodes(nodes, leafOnly)
    },

    setCheckedKeys(keys, leafOnly) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCheckedKeys')
      this.store.setCheckedKeys(keys, leafOnly)
    },

    setChecked(data, checked, deep) {
      this.store.setChecked(data, checked, deep)
      this.initTabIndex()
    },

    getHalfCheckedNodes() {
      return this.store.getHalfCheckedNodes()
    },

    getHalfCheckedKeys() {
      return this.store.getHalfCheckedKeys()
    },

    // 删除节点
    remove(data) {
      this.store.remove(data)
    },

    // 添加子节点
    append(data, parentNode) {
      this.store.append(data, parentNode)
    },

    // 在指定节点前插入
    insertBefore(data, refNode) {
      this.store.insertBefore(data, refNode)
    },

    // 在指定节点后插入
    insertAfter(data, refNode) {
      this.store.insertAfter(data, refNode)
    },

    // 更新指定节点的子节点列表
    updateKeyChildren(key, data) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in updateKeyChild')
      this.store.updateChildren(key, data)
    },

    // 初始化tab索引
    initTabIndex() {
      this.treeItems = this.$el.querySelectorAll('.is-focusable[role=treeitem]')
      this.checkboxItems = this.$el.querySelectorAll('input[type=checkbox]')

      // 先设置所有项目为 -1
      Array.prototype.forEach.call(this.treeItems, (item) => {
        item.setAttribute('tabindex', -1)
      })

      // 查找当前选中的项目
      const checkedItem = this.$el.querySelectorAll('.is-checked[role=treeitem]')
      const currentItem = this.$el.querySelectorAll('.is-current[role=treeitem]')

      if (checkedItem.length) {
        checkedItem[0].setAttribute('tabindex', 0)
      } else if (currentItem.length) {
        currentItem[0].setAttribute('tabindex', 0)
      } else {
        this.treeItems[0] && this.treeItems[0].setAttribute('tabindex', 0)
      }
    },

    // 处理键盘事件（已移至 keyboard-handler.js）
    handleKeydown(ev) {
      // 调用键盘处理器
      if (this._keyboardHandler) {
        this._keyboardHandler(ev)
      }
    },

    // 获取节点路径
    getNodePath(data) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in getNodePath')
      const node = this.store.getNode(data)
      if (!node) return []
      const path = [node.data]
      let parent = node.parent
      while (parent && parent !== this.root) {
        path.push(parent.data)
        parent = parent.parent
      }
      return path.reverse()
    },
  },
}
</script>

<style>
@import './style/tree.css';
</style>
