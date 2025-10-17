<template>
  <div>
    <h1>tree 组件示例</h1>
    
    <h2>基础用法</h2>
    <el-tree :data="treeData" />
    
    <h2>默认展开所有节点</h2>
    <el-tree :data="treeData" default-expand-all />
    
    <h2>空数据</h2>
    <el-tree :data="[]" />
    
    <h2>自定义字段名</h2>
    <el-tree 
      :data="customTreeData" 
      :props="customProps"
      default-expand-all
    />
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
}
</script>
