<template>
  <div
    v-show="node.visible"
    class="el-tree-node"
    :class="{
      'is-expanded': expanded,
      'is-current': node.isCurrent,
      'is-hidden': !node.visible,
    }"
    role="treeitem"
  >
    <div
      class="el-tree-node__content"
      :style="{ 'padding-left': (node.level - 1) * 18 + 'px' }"
      @click.stop="handleClick"
    >
      <!-- 展开图标 -->
      <span
        :class="[
          { 'is-leaf': node.isLeaf, expanded: !node.isLeaf && expanded },
          'el-tree-node__expand-icon',
        ]"
        @click.stop="handleExpandIconClick"
      />

      <!-- 节点文本 -->
      <span class="el-tree-node__label">{{ node.label }}</span>
    </div>

    <!-- 递归渲染子节点 -->
    <el-collapse-transition>
      <div v-show="expanded" class="el-tree-node__children" role="group">
        <el-tree-node
          v-for="child in node.childNodes"
          :key="getNodeKey(child)"
          :node="child"
          :props="props"
          @node-expand="handleChildNodeExpand"
        />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import { getNodeKey } from './model/util'
import ElCollapseTransition from './collapse-transition.js'

export default {
  name: 'ElTreeNode',

  components: {
    ElCollapseTransition,
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
  },

  emits: ['node-expand'],

  data() {
    return {
      tree: null,
      expanded: false,
    }
  },

  watch: {
    'node.expanded'(val) {
      this.$nextTick(() => (this.expanded = val))
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

      if (this.tree.expandOnClickNode) {
        this.handleExpandIconClick()
      }

      this.tree.$emit('node-click', this.node.data, this.node, this)
    },

    handleChildNodeExpand(nodeData, node, instance) {
      this.$emit('node-expand', nodeData, node, instance)
    },
  },
}
</script>
