<template>
  <div
    v-show="node.visible"
    ref="node"
    class="el-tree-node"
    :class="{
      'is-expanded': expanded,
      'is-current': node.isCurrent,
      'is-hidden': !node.visible,
      'is-focusable': !node.disabled,
      'is-checked': !node.disabled && node.checked,
    }"
    role="treeitem"
    tabindex="-1"
    :aria-expanded="expanded"
    :aria-disabled="node.disabled"
    :aria-checked="node.checked"
    :aria-selected="node.isCurrent"
    :aria-level="node.level"
    :aria-setsize="node.parent ? node.parent.childNodes.length : 0"
    :aria-posinset="getAriaPosInSet()"
    :draggable="tree.draggable"
    :data-key="getNodeKey(node)"
    @click.stop="handleClick"
    @dragstart.stop="handleDragStart"
    @dragover.stop="handleDragOver"
    @dragend.stop="handleDragEnd"
    @drop.stop="handleDrop"
  >
    <div
      class="el-tree-node__content"
      :style="{ 'padding-left': (node.level - 1) * tree.indent + 'px' }"
    >
      <!-- Loading 图标 -->
      <span v-if="node.loading" class="el-tree-node__loading-icon" />

      <!-- 展开图标 -->
      <span
        v-else
        :class="[
          { 'is-leaf': node.isLeaf, expanded: !node.isLeaf && expanded },
          'el-tree-node__expand-icon',
          tree.iconClass ? tree.iconClass : 'el-icon-caret-right',
        ]"
        @click.stop="handleExpandIconClick"
      />

      <!-- 复选框 -->
      <el-checkbox
        v-if="showCheckbox"
        v-model="node.checked"
        :indeterminate="node.indeterminate"
        :disabled="!!node.disabled"
        @click.native.stop
        @change="handleCheckChange"
      />

      <!-- 节点内容 -->
      <node-content :node="node" />
    </div>

    <!-- 递归渲染子节点 -->
    <el-collapse-transition>
      <div v-show="expanded" class="el-tree-node__children" role="group">
        <el-tree-node
          v-for="child in node.childNodes"
          :key="getNodeKey(child)"
          :node="child"
          :props="props"
          :render-after-expand="renderAfterExpand"
          :show-checkbox="showCheckbox"
          :render-content="renderContent"
          @node-expand="handleChildNodeExpand"
        />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import { getNodeKey } from './model/util'
import ElCollapseTransition from './collapse-transition.js'
import ElCheckbox from './checkbox.vue'

export default {
  name: 'ElTreeNode',

  components: {
    ElCollapseTransition,
    ElCheckbox,
    NodeContent: {
      props: {
        node: {
          required: true,
        },
      },
      render(h) {
        const parent = this.$parent
        const tree = parent.tree
        const node = this.node
        const { data, store } = node
        const { renderContent } = parent

        // 渲染优先级：renderContent > 默认插槽 > 默认渲染
        let result = null

        // 1. 尝试使用 renderContent
        if (renderContent) {
          try {
            result = renderContent.call(parent.renderProxy, h, { _self: tree.$vnode.context, node, data, store })
            // 如果 renderContent 返回 null 或 undefined，降级到默认插槽
            if (result == null) {
              result = null // 重置为null，让后面的逻辑处理降级
            }
          } catch (error) {
            console.error('[Tree] Error in renderContent:', error)
            result = null // 出错时重置为null，让后面的逻辑处理降级
          }
        }

        // 2. 如果 renderContent 失败或返回 null，尝试使用默认插槽
        if (result === null && tree.$scopedSlots.default) {
          try {
            result = tree.$scopedSlots.default({ node, data })
          } catch (error) {
            console.error('[Tree] Error in default slot:', error)
            result = null // 插槽出错时重置为null，使用默认渲染
          }
        }

        // 3. 如果以上都失败，使用默认渲染
        if (result === null) {
          result = h('span', { class: 'el-tree-node__label' }, [node.label])
        }

        return result
      },
    },
  },

  props: {
    node: {
      type: Object,
      default() {
        return {}
      },
    },
    props: {
      type: Object,
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    renderAfterExpand: {
      type: Boolean,
      default: true,
    },
    renderContent: Function,
  },

  emits: ['node-expand'],

  data() {
    return {
      tree: null,
      expanded: false,
      oldChecked: null,
      oldIndeterminate: null,
      renderProxy: null,
    }
  },

  watch: {
    'node.expanded'(val) {
      this.$nextTick(() => (this.expanded = val))
    },

    'node.indeterminate'(val) {
      this.handleSelectChange(this.node.checked, val)
    },

    'node.checked'(val) {
      this.handleSelectChange(val, this.node.indeterminate)
    },
  },

  created() {
    const parent = this.$parent

    // 向上查找 tree 根组件
    if (parent.isTree) {
      this.tree = parent
    } else {
      this.tree = parent.tree
    }

    // 初始化渲染代理
    this._renderProxy = this

    // 同步展开状态
    if (this.node.expanded) {
      this.expanded = true
    }
  },

  methods: {
    getNodeKey(node) {
      return getNodeKey(this.tree.nodeKey, node.data)
    },

    handleSelectChange(checked, indeterminate) {
      if (
        this.oldChecked !== checked ||
        this.oldIndeterminate !== indeterminate
      ) {
        this.tree.$emit('check-change', this.node.data, checked, indeterminate)
      }
      this.oldChecked = checked
      this.oldIndeterminate = indeterminate
    },

    handleExpandIconClick() {
      if (this.node.isLeaf) return

      if (this.expanded) {
        this.tree.$emit('node-collapse', this.node.data, this.node, this)
        this.node.collapse()
      } else {
        this.node.expand()
        this.$emit('node-expand', this.node.data, this.node, this)
      }
    },

    handleClick() {
      const store = this.tree.store
      store.setCurrentNode(this.node)
      this.tree.$emit(
        'current-change',
        store.currentNode ? store.currentNode.data : null,
        store.currentNode
      )
      this.tree.currentNode = this

      if (this.tree.expandOnClickNode) {
        this.handleExpandIconClick()
      }

      if (this.tree.checkOnClickNode && !this.node.disabled) {
        this.handleCheckChange(null, {
          target: { checked: !this.node.checked },
        })
      }

      this.tree.$emit('node-click', this.node.data, this.node, this)
    },

    handleCheckChange(value, ev) {
      // 如果是直接点击checkbox，value是checkbox传递的新值
      // 如果是通过代码调用，ev可能是undefined
      const checkedValue = ev && ev.target ? ev.target.checked : value
      this.node.setChecked(checkedValue, !this.tree.checkStrictly)
      this.$nextTick(() => {
        const store = this.tree.store
        this.tree.$emit('check', this.node.data, {
          checkedNodes: store.getCheckedNodes(),
          checkedKeys: store.getCheckedKeys(),
          halfCheckedNodes: store.getHalfCheckedNodes(),
          halfCheckedKeys: store.getHalfCheckedKeys(),
        })
      })
    },

    handleChildNodeExpand(nodeData, node, instance) {
      this.$emit('node-expand', nodeData, node, instance)
    },

    // 拖拽事件处理
    handleDragStart(event) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-start', event, this)
    },

    handleDragOver(event) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-over', event, this)
      event.preventDefault()
    },

    handleDrop(event) {
      event.preventDefault()
    },

    handleDragEnd(event) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-end', event, this)
    },

    // 获取节点在同级中的位置，用于无障碍访问
    getAriaPosInSet() {
      if (!this.node.parent) return 1
      const siblings = this.node.parent.childNodes
      return siblings.indexOf(this.node) + 1
    },
  },
}
</script>
