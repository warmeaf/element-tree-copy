<template>
  <div class="el-tree" role="tree">
    <el-tree-node
      v-for="child in root.childNodes"
      :key="getNodeKey(child)"
      :node="child"
      :props="props"
      @node-expand="handleNodeExpand"
    />

    <div v-if="isEmpty" class="el-tree__empty-block">
      <span class="el-tree__empty-text">{{ emptyText }}</span>
    </div>
  </div>
</template>

<script>
import TreeStore from './model/tree-store'
import { getNodeKey } from './model/util'
import ElTreeNode from './tree-node.vue'

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
    expandOnClickNode: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['node-expand', 'node-collapse', 'node-click', 'current-change'],

  data() {
    return {
      store: null,
      root: null,
    }
  },

  computed: {
    isEmpty() {
      const { childNodes } = this.root
      return !childNodes || childNodes.length === 0
    },
  },

  created() {
    this.isTree = true

    this.store = new TreeStore({
      key: this.nodeKey,
      data: this.data,
      props: this.props,
      defaultExpandAll: this.defaultExpandAll,
    })

    this.root = this.store.root
  },

  methods: {
    getNodeKey(node) {
      return getNodeKey(this.nodeKey, node.data)
    },

    handleNodeExpand(nodeData, node, instance) {
      this.$emit('node-expand', nodeData, node, instance)
    },
  },
}
</script>

<style>
@import './style/tree.css';
</style>

