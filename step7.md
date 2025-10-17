# Step 7: 节点选中高亮功能

## ✅ 已完成功能

### 1. tree.vue 新增功能

- **新增 Props**：
  - `highlightCurrent`: Boolean 类型，控制是否高亮当前选中节点
  - `currentNodeKey`: [String, Number] 类型，设置默认选中的节点 key

- **新增 Data**：
  - `currentNode`: 保存当前选中的节点实例

- **新增 Class 绑定**：
  - `el-tree--highlight-current`: 当 highlightCurrent 为 true 时添加此 class

- **新增 API 方法**：
  - `getCurrentNode()`: 获取当前选中节点的数据对象
  - `getCurrentKey()`: 获取当前选中节点的 key 值
  - `setCurrentNode(node)`: 通过数据对象设置当前选中节点
  - `setCurrentKey(key)`: 通过 key 值设置当前选中节点
  - `getNode(data)`: 根据数据或 key 获取节点实例

- **传递配置**：
  - 在创建 TreeStore 时传递 `currentNodeKey` 配置

### 2. tree-node.vue 已有功能

- `handleClick` 方法中已经实现了节点点击选中的逻辑：
  - 调用 `store.setCurrentNode(this.node)` 设置当前节点
  - 触发 `current-change` 事件
  - 触发 `node-click` 事件
  
- 节点的 class 绑定中已经包含 `is-current` 状态

### 3. TreeStore 新增功能

- **构造函数**：
  - 接收 `currentNodeKey` 配置参数

- **新增方法**：
  - `setUserCurrentNode(node)`: 通过用户数据对象设置当前节点
    - 从数据对象中获取 key
    - 从 nodesMap 中查找对应的节点实例
    - 调用 setCurrentNode 设置为当前节点

### 4. Node 类新增功能

- **构造函数中初始化当前节点**：
  - 检查节点的 key 是否等于 `store.currentNodeKey`
  - 如果匹配，设置 `store.currentNode = this` 并设置 `isCurrent = true`
  - 这样在组件创建时就会自动选中指定的节点

## 🎯 功能特性

### 点击选中
- 点击任意节点时，该节点会被设置为当前节点
- 之前选中的节点会取消选中状态
- 触发 `current-change` 事件，传递当前节点数据和节点实例

### 高亮显示
- 当 `highlightCurrent` 为 true 时，选中的节点会添加 `is-current` class
- 通过 CSS 样式可以实现背景色高亮效果

### 默认选中
- 通过 `currentNodeKey` prop 可以设置默认选中的节点
- 在 Node 构造函数中会自动初始化这个节点为当前节点

### API 操作
- `getCurrentNode()` 和 `getCurrentKey()` 可以获取当前选中节点的信息
- `setCurrentNode()` 和 `setCurrentKey()` 可以编程式地设置当前节点
- 设置 `key` 为 `null` 可以清除当前选中状态

## 📝 使用示例

```vue
<template>
  <el-tree
    ref="tree"
    :data="data"
    node-key="id"
    highlight-current
    :current-node-key="defaultNodeKey"
    @current-change="handleCurrentChange"
  />
</template>

<script>
export default {
  data() {
    return {
      defaultNodeKey: 2,
      data: [
        {
          id: 1,
          label: '节点 1',
          children: [
            { id: 2, label: '节点 1-1' },
            { id: 3, label: '节点 1-2' },
          ],
        },
      ],
    }
  },
  methods: {
    handleCurrentChange(data, node) {
      console.log('当前节点：', data, node)
    },
    
    // 获取当前节点
    getCurrent() {
      const node = this.$refs.tree.getCurrentNode()
      const key = this.$refs.tree.getCurrentKey()
      console.log(node, key)
    },
    
    // 设置当前节点
    setCurrent() {
      this.$refs.tree.setCurrentKey(3)
      // 或
      this.$refs.tree.setCurrentNode(this.data[0].children[1])
    },
    
    // 清除选中
    clearCurrent() {
      this.$refs.tree.setCurrentKey(null)
    },
  },
}
</script>
```

## ✅ 验收标准

- [x] 点击节点可以选中并高亮
- [x] `highlightCurrent` 配置生效
- [x] `currentNodeKey` 可以设置默认选中节点
- [x] `current-change` 和 `node-click` 事件正常触发
- [x] `setCurrentKey`、`getCurrentKey` 等 API 工作正常
- [x] 可以通过 API 清除当前选中状态
- [x] 通过数据对象也能设置当前节点（setCurrentNode）

## 🔍 关键实现细节

### 1. 节点选中的状态管理
- `TreeStore` 维护全局的 `currentNode` 引用
- `Node` 实例通过 `isCurrent` 属性标记是否为当前节点
- 选中新节点时，先取消旧节点的 `isCurrent`，再设置新节点

### 2. 默认选中的初始化时机
- 在 Node 构造函数中，节点注册到 store 后立即检查
- 这样可以在数据初始化阶段就完成默认选中

### 3. API 设计
- `getCurrentNode` 返回数据对象，`getCurrentKey` 返回 key 值
- `setCurrentNode` 接收数据对象，`setCurrentKey` 接收 key 值
- 通过 `setUserCurrentNode` 桥接数据对象到节点实例的转换

### 4. 与 expandOnClickNode 的协作
- 点击节点时先设置当前节点，再判断是否需要展开
- 这样保证了选中和展开的顺序正确

## 🎨 样式支持

CSS 中需要定义以下样式来实现高亮效果：

```css
.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  background-color: #f0f7ff;
}
```

这个样式已经在 `src/tree/src/style/tree.css` 中定义。

## 🧪 测试验证

已在 `src/example/index.vue` 中添加了完整的测试示例：

1. **节点选中高亮测试**：
   - 展示 highlightCurrent 配置的效果
   - 提供按钮测试各个 API 方法
   - 实时显示当前选中的节点信息

2. **默认选中节点测试**：
   - 展示 currentNodeKey 配置的效果
   - 验证页面加载时自动选中指定节点

3. **事件监听测试**：
   - 监听 current-change 事件
   - 在事件日志中显示选中节点的变化

可以通过 `npm run dev` 启动开发服务器查看效果。

