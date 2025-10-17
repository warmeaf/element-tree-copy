<template>
  <div>
    <h1>tree 组件示例</h1>
    <el-tree :data="treeData" />
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
      treeData: [],
    }
  },
}
</script>
