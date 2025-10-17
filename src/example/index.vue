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
  },
}
</script>
