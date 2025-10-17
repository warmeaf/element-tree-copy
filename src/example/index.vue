<template>
  <div>
    <h1>tree 组件示例</h1>
    
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
    <el-tree 
      :data="customTreeData" 
      :props="customProps"
      default-expand-all
    />
    
    <h2>节点选中高亮（highlightCurrent）</h2>
    <el-tree 
      ref="highlightTree"
      :data="treeDataWithId" 
      node-key="id"
      highlight-current
      default-expand-all
      @current-change="handleCurrentChange"
    />
    <div style="margin-top: 10px;">
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
      <div style="margin-top: 5px; color: #409EFF;">
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
    
    <h2>事件日志</h2>
    <div style="background: #f5f5f5; padding: 10px; max-height: 200px; overflow-y: auto;">
      <div v-for="(log, index) in logs" :key="index" style="font-size: 12px; padding: 2px 0;">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script>
import ElTree from '../tree/index.js'

export default {
  name: 'ExampleIndex',
  components: {
    ElTree,
  },
  data() {
    return {
      logs: [],
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
    }
  },
  methods: {
    handleNodeExpand(data, node) {
      const log = `[展开] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    handleNodeCollapse(data, node) {
      const log = `[收起] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    handleNodeClick(data, node) {
      const log = `[点击] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    handleCurrentChange(data, node) {
      const log = `[当前节点变化] ${data ? data.label : '无'}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
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
      const nodeData = this.treeDataWithId[1].children[0] // 二级 2-1
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
