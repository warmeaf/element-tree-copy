<template>
  <div
    class="el-tree"
    :class="{
      'el-tree--highlight-current': highlightCurrent,
    }"
    role="tree"
  >
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
    highlightCurrent: Boolean,
    currentNodeKey: [String, Number],
  },

  emits: ['node-expand', 'node-collapse', 'node-click', 'current-change'],

  data() {
    return {
      store: null,
      root: null,
      currentNode: null,
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
      currentNodeKey: this.currentNodeKey,
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
    },

    getNode(data) {
      return this.store.getNode(data)
    },
  },
}
</script>

<style>
@import './style/tree.css';
</style>

