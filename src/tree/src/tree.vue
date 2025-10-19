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
      :show-checkbox="showCheckbox"
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
  },

  emits: [
    'node-expand',
    'node-collapse',
    'node-click',
    'current-change',
    'check',
    'check-change',
  ],

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

  watch: {
    data(newVal) {
      this.store.setData(newVal)
    },

    defaultCheckedKeys(newVal) {
      this.store.setDefaultCheckedKey(newVal)
    },

    checkStrictly(newVal) {
      this.store.checkStrictly = newVal
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
      checkStrictly: this.checkStrictly,
      defaultCheckedKeys: this.defaultCheckedKeys,
      checkDescendants: this.checkDescendants,
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
  },
}
</script>

<style>
@import './style/tree.css';
</style>
