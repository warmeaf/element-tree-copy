<template>
  <div
    v-show="node.visible"
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
    @click.stop="handleClick"
  >
    <div
      class="el-tree-node__content"
      :style="{ 'padding-left': (node.level - 1) * tree.indent + 'px' }"
    >
      <!-- Loading 图标 -->
      <span
        v-if="node.loading"
        class="el-tree-node__loading-icon"
      />

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
          :show-checkbox="showCheckbox"
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
        const node = this.node
        return h('span', { class: 'el-tree-node__label' }, [node.label])
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
  },

  emits: ['node-expand'],

  data() {
    return {
      tree: null,
      expanded: false,
      oldChecked: null,
      oldIndeterminate: null,
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
      this.node.setChecked(ev.target.checked, !this.tree.checkStrictly)
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
  },
}
</script>

<style scoped>
/* Loading 图标样式 */
.el-tree-node__loading-icon {
  display: inline-block;
  position: relative;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  vertical-align: middle;
}

.el-tree-node__loading-icon::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border: 2px solid #c0c4cc;
  border-top: 2px solid #409eff;
  border-radius: 50%;
  animation: el-loading-rotate 1s linear infinite;
}

/* 旋转动画 */
@keyframes el-loading-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 悬停效果 */
.el-tree-node__loading-icon:hover::before {
  border-top-color: #66b1ff;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .el-tree-node__loading-icon::before {
    border-color: #4c4d4f;
    border-top-color: #409eff;
  }
}
</style>
