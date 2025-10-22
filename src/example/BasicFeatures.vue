<template>
  <div class="tab-panel">
    <h2>基础用法（点击展开/收起）</h2>
    <el-tree
      :data="treeData"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      @node-click="handleNodeClick"
    />

    <h2>默认展开所有节点</h2>
    <el-tree :data="treeData" default-expand-all />

    <h2>禁用点击节点展开</h2>
    <el-tree :data="treeData" :expand-on-click-node="false" />

    <h2>空数据</h2>
    <el-tree :data="[]" />

    <h2>自定义字段名</h2>
    <el-tree :data="customTreeData" :props="customProps" default-expand-all />

    <h2>节点选中高亮（highlightCurrent）</h2>
    <el-tree
      ref="highlightTree"
      :data="treeDataWithId"
      node-key="id"
      highlight-current
      default-expand-all
      @current-change="handleCurrentChange"
    />
    <div style="margin-top: 10px">
      <button @click="getCurrentInfo">
        获取当前节点
      </button>
      <button @click="setCurrentByKey">
        设置当前节点为 id=3
      </button>
      <button @click="setCurrentByData">
        通过数据设置当前节点
      </button>
      <button @click="clearCurrent">
        清除当前节点
      </button>
      <div style="margin-top: 5px; color: #409eff">
        当前选中节点：{{ currentNodeInfo }}
      </div>
    </div>

    <h2>默认选中节点（currentNodeKey）</h2>
    <el-tree
      :data="treeDataWithId"
      node-key="id"
      highlight-current
      :current-node-key="5"
      default-expand-all
    />

    <h2>自定义缩进和图标</h2>
    <el-tree
      :data="treeData"
      :indent="32"
      icon-class="custom-arrow-right"
      default-expand-all
    />
  </div>
</template>

<script>
import ElTree from '../tree/index'

export default {
  name: 'BasicFeatures',
  components: {
    ElTree
  },
  props: {
    logs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentNodeInfo: '未选中',
      treeData: [
        {
          label: '一级 1',
          children: [
            {
              label: '二级 1-1',
              children: [
                {
                  label: '三级 1-1-1',
                },
              ],
            },
          ],
        },
        {
          label: '一级 2',
          children: [
            {
              label: '二级 2-1',
              children: [
                {
                  label: '三级 2-1-1',
                },
              ],
            },
            {
              label: '二级 2-2',
              children: [
                {
                  label: '三级 2-2-1',
                },
              ],
            },
          ],
        },
        {
          label: '一级 3',
          children: [
            {
              label: '二级 3-1',
              children: [
                {
                  label: '三级 3-1-1',
                },
              ],
            },
            {
              label: '二级 3-2',
              children: [
                {
                  label: '三级 3-2-1',
                },
              ],
            },
          ],
        },
      ],
      customTreeData: [
        {
          name: '自定义节点 1',
          items: [
            {
              name: '自定义子节点 1-1',
              items: [
                {
                  name: '自定义孙节点 1-1-1',
                },
              ],
            },
          ],
        },
        {
          name: '自定义节点 2',
          items: [
            {
              name: '自定义子节点 2-1',
            },
          ],
        },
      ],
      customProps: {
        children: 'items',
        label: 'name',
      },
      treeDataWithId: [
        {
          id: 1,
          label: '一级 1',
          children: [
            {
              id: 2,
              label: '二级 1-1',
              children: [
                {
                  id: 3,
                  label: '三级 1-1-1',
                },
              ],
            },
            {
              id: 4,
              label: '一级 2',
              children: [
                {
                  id: 5,
                  label: '二级 2-1',
                  children: [
                    {
                      id: 6,
                      label: '三级 2-1-1',
                    },
                  ],
                },
                {
                  id: 7,
                  label: '二级 2-2',
                  children: [
                    {
                      id: 8,
                      label: '三级 2-2-1',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
  },
  methods: {
    handleNodeExpand(data, node) {
      const log = `[展开] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.$emit('add-log', log)
    },
    handleNodeCollapse(data, node) {
      const log = `[收起] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.$emit('add-log', log)
    },
    handleNodeClick(data, node) {
      const log = `[点击] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.$emit('add-log', log)
    },
    handleCurrentChange(data, node) {
      const log = `[当前节点变化] ${data ? data.label : '无'}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.$emit('add-log', log)
    },
    getCurrentInfo() {
      const tree = this.$refs.highlightTree
      const currentNode = tree.getCurrentNode()
      const currentKey = tree.getCurrentKey()
      this.currentNodeInfo = currentNode
        ? `label: ${currentNode.label}, id: ${currentKey}`
        : '未选中'
      // eslint-disable-next-line no-console
      console.log('当前节点：', currentNode, '当前key：', currentKey)
    },
    setCurrentByKey() {
      const tree = this.$refs.highlightTree
      tree.setCurrentKey(3)
      this.getCurrentInfo()
    },
    setCurrentByData() {
      const tree = this.$refs.highlightTree
      const nodeData = this.treeDataWithId[0].children[1].children[0] // 二级 2-1 (id: 5)
      tree.setCurrentNode(nodeData)
      this.getCurrentInfo()
    },
    clearCurrent() {
      const tree = this.$refs.highlightTree
      tree.setCurrentKey(null)
      this.currentNodeInfo = '未选中'
    },
  },
}
</script>

<style>
/* 自定义箭头图标 */
.custom-arrow-right {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  position: relative;
  transition: transform 0.3s ease;
  transform: rotate(45deg);
}

.custom-arrow-right::before {
  content: '';
  width: 4px;
  height: 4px;
  border-top: 2px solid #606266;
  border-right: 2px solid #606266;
}

/* 展开状态下的箭头旋转 */
.el-tree-node__expand-icon.expanded.custom-arrow-right {
  transform: rotate(135deg);
}

/* 悬停效果 */
.el-tree-node__expand-icon:hover.custom-arrow-right::before {
  border-color: #409eff;
}

/* 叶子节点不显示箭头 */
.el-tree-node__expand-icon.is-leaf.custom-arrow-right {
  opacity: 0;
}
</style>