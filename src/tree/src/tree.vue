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
import { getNodeKey, findNearestComponent } from './model/util'
import ElTreeNode from './tree-node.vue'
import { addClass, removeClass } from './utils/dom'

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

    // 拖拽事件监听
    const dragState = this.dragState

    // 拖拽开始
    this.$on('tree-node-drag-start', (event, treeNode) => {
      if (
        typeof this.allowDrag === 'function' &&
        !this.allowDrag(treeNode.node)
      ) {
        event.preventDefault()
        return false
      }
      event.dataTransfer.effectAllowed = 'move'

      // 设置拖拽数据
      try {
        event.dataTransfer.setData('text/plain', '')
      } catch (e) {
        // Ignore IE11 error
      }

      dragState.draggingNode = treeNode
      this.$emit('node-drag-start', treeNode.node, event)
    })

    // 拖拽经过
    this.$on('tree-node-drag-over', (event) => {
      const dropNode = findNearestComponent(event.target, 'ElTreeNode')
      const oldDropNode = dragState.dropNode
      if (oldDropNode && oldDropNode !== dropNode) {
        removeClass(oldDropNode.$el, 'is-drop-inner')
      }
      const draggingNode = dragState.draggingNode
      if (!draggingNode || !dropNode) return

      let dropPrev = true
      let dropInner = true
      let dropNext = true
      let userAllowDropInner = true

      if (typeof this.allowDrop === 'function') {
        dropPrev = this.allowDrop(draggingNode.node, dropNode.node, 'prev')
        userAllowDropInner = dropInner = this.allowDrop(
          draggingNode.node,
          dropNode.node,
          'inner'
        )
        dropNext = this.allowDrop(draggingNode.node, dropNode.node, 'next')
      }

      event.dataTransfer.dropEffect = dropInner ? 'move' : 'none'

      if ((dropPrev || dropInner || dropNext) && oldDropNode !== dropNode) {
        if (oldDropNode) {
          this.$emit(
            'node-drag-leave',
            draggingNode.node,
            oldDropNode.node,
            event
          )
        }
        this.$emit('node-drag-enter', draggingNode.node, dropNode.node, event)
      }

      if (dropPrev || dropInner || dropNext) {
        dragState.dropNode = dropNode
      }

      // 检查拖拽限制
      if (dropNode.node.nextSibling === draggingNode.node) {
        dropNext = false
      }
      if (dropNode.node.previousSibling === draggingNode.node) {
        dropPrev = false
      }
      if (dropNode.node.contains(draggingNode.node, false)) {
        dropInner = false
      }
      if (
        draggingNode.node === dropNode.node ||
        draggingNode.node.contains(dropNode.node)
      ) {
        dropPrev = false
        dropInner = false
        dropNext = false
      }

      const targetPosition = dropNode.$el.getBoundingClientRect()
      const treePosition = this.$el.getBoundingClientRect()

      let dropType
      const prevPercent = dropPrev
        ? dropInner
          ? 0.25
          : dropNext
          ? 0.45
          : 1
        : -1
      const nextPercent = dropNext
        ? dropInner
          ? 0.75
          : dropPrev
          ? 0.55
          : 0
        : 1

      let indicatorTop = -9999
      const distance = event.clientY - targetPosition.top
      if (distance < targetPosition.height * prevPercent) {
        dropType = 'before'
      } else if (distance > targetPosition.height * nextPercent) {
        dropType = 'after'
      } else if (dropInner) {
        dropType = 'inner'
      } else {
        dropType = 'none'
      }

      const iconPosition = dropNode.$el
        .querySelector('.el-tree-node__expand-icon')
        .getBoundingClientRect()
      const dropIndicator = this.$refs.dropIndicator
      if (dropType === 'before') {
        indicatorTop = iconPosition.top - treePosition.top
      } else if (dropType === 'after') {
        indicatorTop = iconPosition.bottom - treePosition.top
      }
      dropIndicator.style.top = indicatorTop + 'px'
      dropIndicator.style.left = iconPosition.right - treePosition.left + 'px'

      if (dropType === 'inner') {
        addClass(dropNode.$el, 'is-drop-inner')
      } else {
        removeClass(dropNode.$el, 'is-drop-inner')
      }

      dragState.showDropIndicator =
        dropType === 'before' || dropType === 'after'
      dragState.allowDrop = dragState.showDropIndicator || userAllowDropInner
      dragState.dropType = dropType
      this.$emit('node-drag-over', draggingNode.node, dropNode.node, event)
    })

    // 拖拽结束
    this.$on('tree-node-drag-end', (event) => {
      const { draggingNode, dropType, dropNode } = dragState
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      if (draggingNode && dropNode) {
        const draggingNodeCopy = { data: draggingNode.node.data }
        if (dropType !== 'none') {
          draggingNode.node.remove()
        }
        if (dropType === 'before') {
          dropNode.node.parent.insertBefore(draggingNodeCopy, dropNode.node)
        } else if (dropType === 'after') {
          dropNode.node.parent.insertAfter(draggingNodeCopy, dropNode.node)
        } else if (dropType === 'inner') {
          dropNode.node.insertChild(draggingNodeCopy)
        }
        if (dropType !== 'none') {
          this.store.registerNode(draggingNodeCopy)
        }

        removeClass(dropNode.$el, 'is-drop-inner')

        this.$emit(
          'node-drag-end',
          draggingNode.node,
          dropNode.node,
          dropType,
          event
        )
        if (dropType !== 'none') {
          this.$emit(
            'node-drop',
            draggingNode.node,
            dropNode.node,
            dropType,
            event
          )
        }
      }
      if (draggingNode && !dropNode) {
        this.$emit('node-drag-end', draggingNode.node, null, dropType, event)
      }

      dragState.showDropIndicator = false
      dragState.draggingNode = null
      dragState.dropNode = null
      dragState.allowDrop = true
    })
  },

  mounted() {
    this.initTabIndex()
    this.$el.addEventListener('keydown', this.handleKeydown)
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

    // 处理键盘事件
    handleKeydown(ev) {
      const currentItem = ev.target
      if (!currentItem || currentItem.className.indexOf('el-tree-node') === -1) return
      const keyCode = ev.keyCode
      this.treeItems = this.$el.querySelectorAll('.is-focusable[role=treeitem]')

      // 如果当前元素不在 treeItems 中，尝试找到第一个有 tabindex="0" 的元素
      let currentIndex = this.treeItemArray.indexOf(currentItem)
      if (currentIndex === -1 && this.treeItemArray.length > 0) {
        // 找到当前有 tabindex="0" 的元素
        for (let i = 0; i < this.treeItemArray.length; i++) {
          if (this.treeItemArray[i].getAttribute('tabindex') === '0') {
            currentIndex = i
            break
          }
        }
        // 如果还是找不到，使用第一个元素
        if (currentIndex === -1) currentIndex = 0
      }

      let nextIndex

      if ([38, 40].indexOf(keyCode) > -1) {
        // up、down
        ev.preventDefault()
        if (keyCode === 38) {
          // up
          nextIndex = currentIndex !== 0 ? currentIndex - 1 : 0
        } else {
          nextIndex = (currentIndex < this.treeItemArray.length - 1) ? currentIndex + 1 : 0
        }
        this.treeItemArray[nextIndex].focus() // 选中
      }

      if ([37, 39].indexOf(keyCode) > -1) {
        // left、right 控制展开收起
        ev.preventDefault()
        currentItem.click() // 选中节点并可能触发展开
      }

      // Enter 和 Space 键只处理 checkbox，不触发展开收起
      const hasInput = currentItem.querySelector('[type="checkbox"]')
      if ([13, 32].indexOf(keyCode) > -1 && hasInput) {
        // space enter 选中 checkbox
        ev.preventDefault()
        hasInput.click()
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
