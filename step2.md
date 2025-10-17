# Step 2: Node 数据模型实现

> **分支**: `feature/tree-step2-node-model`

## 📋 实现目标

实现 Node 类，构建树节点的数据模型，建立父子双向引用关系，为 Tree 组件提供底层数据结构支持。

## ✅ 完成内容

### 1. 工具函数模块 (`util.js`)

实现了三个核心工具函数：

#### `NODE_KEY` 常量
- 定义节点数据的唯一标识符键名 `'$treeNodeId'`
- 用于在原始数据对象上添加内部标记

#### `markNodeData(node, data)`
- **功能**: 在数据对象上添加不可枚举的节点 ID 标记
- **特性**:
  - 使用 `Object.defineProperty` 确保属性不可枚举、不可配置、不可写
  - 防止重复标记（已有标记的数据不会被覆盖）
  - 空值安全（对 null/undefined 数据不做处理）

#### `getNodeKey(key, data)`
- **功能**: 获取节点的 key 值
- **逻辑**:
  - 如果提供了 `key` 参数，返回 `data[key]`
  - 如果没有提供 `key`，返回内部标记 `data[NODE_KEY]`

### 2. TreeStore 基础类 (`tree-store.js`)

实现了 TreeStore 的基础结构，为节点管理提供支持：

#### 构造函数
- 初始化 `currentNode` 和 `currentNodeKey` 为 null
- 复制传入的配置选项到实例
- 创建 `nodesMap` 用于快速查找节点

#### `registerNode(node)` 方法
- **功能**: 将节点注册到 nodesMap 中
- **逻辑**:
  - 检查 store 是否有 key 配置
  - 检查节点是否有有效的 data 和 key
  - 使用节点的 key 作为索引存储到 nodesMap

#### `deregisterNode(node)` 方法
- **功能**: 从 nodesMap 中移除节点
- **特性**:
  - 递归移除所有子节点
  - 确保清理完整的节点树

### 3. Node 核心类 (`node.js`)

实现了完整的 Node 类，这是整个树结构的核心：

#### 构造函数
实现了完整的节点初始化逻辑：

**基本属性**:
- `id`: 自增的唯一 ID（使用 `nodeIdSeed` 计数器）
- `text`: 节点文本（可选）
- `data`: 节点原始数据
- `parent`: 父节点引用
- `level`: 节点层级（从 0 开始）
- `childNodes`: 子节点数组

**状态属性**:
- `expanded`: 展开状态
- `visible`: 可见性
- `checked`: 选中状态
- `indeterminate`: 半选状态
- `isCurrent`: 是否为当前节点
- `isLeaf`: 是否为叶子节点

**懒加载属性**:
- `loaded`: 是否已加载
- `loading`: 是否正在加载

**初始化流程**:
1. 初始化所有属性的默认值
2. 复制 options 中的属性（使用安全的 `Object.prototype.hasOwnProperty.call`）
3. 计算节点层级（parent.level + 1）
4. 注册到 store（调用 `store.registerNode(this)`）
5. 如果不是懒加载模式且有数据，自动调用 `setData`
6. 标记节点数据（调用 `markNodeData`）
7. 更新叶子节点状态

#### `setData(data)` 方法
实现递归创建子节点树的核心逻辑：

**功能**:
- 设置节点数据
- 清空现有子节点
- 递归创建新的子节点树

**实现细节**:
1. 标记非数组数据
2. 清空 childNodes 数组
3. 获取 children 数据：
   - 根节点（level === 0）：直接使用数组数据
   - 普通节点：从配置的 children 字段获取
4. 遍历 children，调用 `insertChild` 创建子节点

#### `insertChild(child, index)` 方法
**功能**: 插入子节点

**特性**:
- 支持插入普通对象或 Node 实例
- 自动设置子节点的 parent 和 store 引用
- 自动计算子节点的层级
- 支持指定插入位置（index）
- 自动更新叶子节点状态

#### `remove()` 和 `removeChild(child)` 方法
**功能**: 移除节点

**特性**:
- `remove()`: 从父节点中移除自己
- `removeChild(child)`: 移除指定的子节点
- 自动从 store 中注销节点
- 清空被移除节点的 parent 引用
- 自动更新父节点的叶子状态

#### `expand()` 和 `collapse()` 方法
**功能**: 控制节点展开/收起状态

**实现**: 简单修改 `expanded` 属性值（暂不涉及懒加载逻辑）

#### `updateLeafState()` 方法
**功能**: 更新节点的 isLeaf 状态

**逻辑**:
1. 懒加载模式且未加载时，使用用户指定的 `isLeafByUser`
2. 非懒加载模式或已加载，根据 childNodes 长度判断
3. 懒加载模式且未加载，默认不是叶子节点

#### 动态属性 getter

**`get label()`**:
- 使用 `getPropertyFromData` 获取节点标签
- 支持配置字段映射

**`get key()`**:
- 返回节点的唯一标识
- 使用 store.key 配置的字段名
- 如果 data 不存在返回 null

### 4. 辅助函数

#### `getPropertyFromData(node, prop)`
私有辅助函数，支持灵活的属性获取：

**支持三种配置方式**:
1. **函数配置**: `config(data, node)` - 动态计算值
2. **字符串配置**: `data[config]` - 字段名映射
3. **undefined 配置**: `data[prop]` - 使用属性名直接获取，不存在时返回空字符串

## 🎯 关键特性

### 父子双向引用
- 子节点通过 `parent` 属性引用父节点
- 父节点通过 `childNodes` 数组包含所有子节点
- 建立了完整的双向引用关系

### 层级自动计算
- 根节点 level 为 0
- 子节点 level = parent.level + 1
- 层级在节点创建时自动计算

### 递归树结构
- `setData` 方法递归处理所有子节点
- 自动构建完整的树形结构
- 支持任意深度的嵌套

### 节点注册机制
- 每个节点创建时自动注册到 store
- 使用 key 作为索引快速查找
- 移除节点时自动注销

### 数据标记
- 使用不可枚举属性标记节点数据
- 避免污染原始数据结构
- 方便内部追踪和管理

### 灵活的配置
- 支持自定义 children 字段名
- 支持自定义 label 字段名
- 支持函数式配置实现动态计算

## 📝 代码规范

### ESLint 修复
- 使用 `Object.prototype.hasOwnProperty.call()` 代替直接调用 `hasOwnProperty`
- 避免 `no-prototype-builtins` 错误
- 确保代码安全性

### 代码组织
- 使用 ES6+ 语法（class、getter、箭头函数等）
- 清晰的方法职责划分
- 良好的注释说明

## 🚀 使用示例

```javascript
import TreeStore from './tree-store.js'
import Node from './node.js'

// 创建 store
const store = new TreeStore({
  key: 'id',
  data: [],
  props: {
    label: 'label',
    children: 'children'
  }
})

// 创建节点
const root = new Node({
  data: {
    id: 1,
    label: '根节点',
    children: [
      { id: 2, label: '子节点1' },
      { id: 3, label: '子节点2' }
    ]
  },
  store: store
})

// 访问节点属性
console.log(root.label)           // '根节点'
console.log(root.level)           // 0
console.log(root.childNodes.length) // 2
console.log(root.isLeaf)          // false

// 访问子节点
const child1 = root.childNodes[0]
console.log(child1.label)         // '子节点1'
console.log(child1.level)         // 1
console.log(child1.parent === root) // true

// 动态操作
root.expand()                     // 展开节点
child1.remove()                   // 移除子节点
root.insertChild({                // 添加新子节点
  data: { id: 4, label: '新节点' }
})
```

## 📊 实现统计

- **文件数**: 3 个核心文件
- **代码行数**: 约 230 行（不含注释）
- **类数量**: 2 个（Node、TreeStore）
- **方法数量**: 10+ 个
- **支持特性**: 
  - ✅ 树形结构构建
  - ✅ 父子双向引用
  - ✅ 层级自动计算
  - ✅ 节点增删改
  - ✅ 展开/收起控制
  - ✅ 灵活的配置映射

## 🔄 后续步骤

下一步 (Step 3) 将实现：
- TreeStore 完整功能
- 根节点创建逻辑
- 节点查找和遍历
- 数据更新和同步

---

**✨ Step 2 完成！Node 数据模型已就绪，为树组件提供了坚实的数据结构基础。**

