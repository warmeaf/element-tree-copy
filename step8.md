# Step 8: 复选框功能实现

## 📋 本步目标

实现 Tree 组件的复选框功能，包括节点选择、父子级联、半选状态等核心特性。

## ✅ 完成效果

- ✅ 支持节点复选框显示和交互
- ✅ 父子节点选中状态自动关联（级联选择）
- ✅ 支持半选状态（indeterminate）
- ✅ 支持禁用节点逻辑
- ✅ 提供丰富的 API 和事件
- ✅ 支持严格模式（父子不关联）

---

## 🎯 核心实现

### 1. 新增 Checkbox 组件

**文件**：`src/tree/src/checkbox.vue`

独立的复选框组件，支持：
- `v-model` 双向绑定
- `indeterminate`（半选状态）
- `disabled`（禁用状态）
- `change` 事件

### 2. Node 类 - 选中状态管理

**文件**：`src/tree/src/model/node.js`

新增属性：
```javascript
this.checked = false          // 是否选中
this.indeterminate = false    // 是否半选
```

核心方法：
```javascript
setChecked(value, deep, recursion, passValue)
```

**功能**：设置节点选中状态，自动处理父子级联逻辑
- `value`：选中状态（true/false/'half'）
- `deep`：是否级联设置子节点
- 向下传播：设置所有子节点状态（禁用节点除外）
- 向上传播：根据子节点状态自动更新父节点

### 3. TreeStore 类 - 批量操作

**文件**：`src/tree/src/model/tree-store.js`

新增配置：
- `checkStrictly`：是否父子不关联
- `defaultCheckedKeys`：默认选中的节点
- `checkDescendants`：懒加载时是否检查后代

核心方法：
- `getCheckedNodes(leafOnly, includeHalfChecked)` - 获取选中节点
- `getCheckedKeys(leafOnly)` - 获取选中节点 keys
- `setCheckedNodes(nodes, leafOnly)` - 设置选中节点（通过节点数组）
- `setCheckedKeys(keys, leafOnly)` - 设置选中节点（通过 keys）
- `setChecked(data, checked, deep)` - 设置单个节点状态
- `getHalfCheckedNodes()` / `getHalfCheckedKeys()` - 获取半选节点

### 4. TreeNode 组件 - UI 集成

**文件**：`src/tree/src/tree-node.vue`

- 引入 ElCheckbox 组件
- 接收 `showCheckbox` prop
- 实现 `handleCheckChange` 处理复选框变化
- 监听节点状态变化，触发 `check-change` 事件

### 5. Tree 组件 - 对外 API

**文件**：`src/tree/src/tree.vue`

- 接收复选框相关 props
- 传递配置到 TreeStore
- 暴露公开方法
- 定义复选框事件

---

## 📊 核心特性

### 1. 父子级联选择（默认）

- 勾选父节点 → 自动勾选所有子节点
- 勾选所有子节点 → 自动勾选父节点
- 部分子节点选中 → 父节点显示半选状态

### 2. 半选状态

- 父节点的部分子节点被选中时，显示半选状态（横线图标）
- 可通过 `getHalfCheckedNodes()` 获取半选节点

### 3. 禁用节点

- 禁用节点状态不受父节点影响
- 父节点状态计算时会考虑禁用子节点

### 4. 严格模式

- 设置 `check-strictly` 后，父子节点完全独立
- 每个节点的选中状态互不影响

---

## 🔧 API 文档

### Props

| 属性                  | 类型    | 默认值 | 说明                           |
| --------------------- | ------- | ------ | ------------------------------ |
| `show-checkbox`       | Boolean | false  | 是否显示复选框                 |
| `check-strictly`      | Boolean | false  | 是否父子不关联                 |
| `default-checked-keys`| Array   | []     | 默认选中的节点 key 数组        |
| `check-on-click-node` | Boolean | false  | 点击节点时是否切换复选框       |
| `check-descendants`   | Boolean | false  | 懒加载时是否检查后代（待实现） |

### 方法

| 方法                    | 说明                   | 参数                                      |
| ----------------------- | ---------------------- | ----------------------------------------- |
| `getCheckedNodes`       | 获取选中的节点         | `(leafOnly, includeHalfChecked)`          |
| `getCheckedKeys`        | 获取选中的节点 keys    | `(leafOnly)`                              |
| `setCheckedNodes`       | 设置选中节点（数组）   | `(nodes, leafOnly)`                       |
| `setCheckedKeys`        | 设置选中节点（keys）   | `(keys, leafOnly)`                        |
| `setChecked`            | 设置单个节点状态       | `(data, checked, deep)`                   |
| `getHalfCheckedNodes`   | 获取半选节点           | -                                         |
| `getHalfCheckedKeys`    | 获取半选节点 keys      | -                                         |

### 事件

| 事件名         | 说明                   | 回调参数                                                      |
| -------------- | ---------------------- | ------------------------------------------------------------- |
| `check`        | 节点选中状态变化时触发 | `(data, checkedInfo)` - checkedInfo 包含选中和半选节点信息    |
| `check-change` | 节点选中状态变化时触发 | `(data, checked, indeterminate)` - 节点数据、选中、半选状态   |

---

## 💡 核心算法

### 1. 子节点状态计算（getChildState）

遍历子节点，统计：
- `all`：是否全部选中
- `none`：是否全部未选中
- `half`：是否部分选中
- `allWithoutDisable`：不含禁用节点是否全选

### 2. 父节点状态更新（reInitChecked）

根据子节点状态自动设置父节点：
- 全选 → 父节点选中
- 全不选 → 父节点取消选中
- 部分选中 → 父节点半选

然后递归向上更新祖先节点。

### 3. 批量设置（_setCheckedKeys）

策略：从深到浅排序处理节点，先清除旧状态，再设置新状态，避免父子状态冲突。

---

## 📝 使用示例

### 基础用法

```vue
<el-tree
  :data="data"
  node-key="id"
  show-checkbox
/>
```

### 默认选中

```vue
<el-tree
  :data="data"
  node-key="id"
  show-checkbox
  :default-checked-keys="[3, 6]"
/>
```

### 父子不关联

```vue
<el-tree
  :data="data"
  node-key="id"
  show-checkbox
  check-strictly
/>
```

### 监听事件

```vue
<el-tree
  :data="data"
  node-key="id"
  show-checkbox
  @check="handleCheck"
  @check-change="handleCheckChange"
/>
```

```javascript
methods: {
  handleCheck(data, checkedInfo) {
    console.log('选中节点：', checkedInfo.checkedNodes)
    console.log('半选节点：', checkedInfo.halfCheckedNodes)
  },
  
  handleCheckChange(data, checked, indeterminate) {
    console.log(`${data.label} - 选中:${checked}, 半选:${indeterminate}`)
  }
}
```

### API 调用

```javascript
// 获取选中节点
const checkedNodes = this.$refs.tree.getCheckedNodes()
const checkedKeys = this.$refs.tree.getCheckedKeys()

// 获取叶子节点
const leafNodes = this.$refs.tree.getCheckedNodes(true)

// 设置选中节点
this.$refs.tree.setCheckedKeys([1, 2, 3])

// 设置单个节点
this.$refs.tree.setChecked(nodeData, true, true)

// 获取半选节点
const halfCheckedNodes = this.$refs.tree.getHalfCheckedNodes()
```

---

## ⚠️ 注意事项

1. **必须设置 node-key**：复选框功能需要唯一标识节点
2. **禁用节点逻辑**：父节点选中不会影响禁用子节点状态
3. **事件触发时机**：`check` 事件在 `$nextTick` 后触发，确保状态已更新
4. **checkStrictly 模式**：开启后父子完全独立，但 `setChecked` 的 `deep` 参数仍有效

---

## 🧪 测试覆盖

- ✅ `node.checkbox.spec.js` - Node 类复选框逻辑测试
- ✅ `tree-store.checkbox.spec.js` - TreeStore 批量操作测试
- ✅ `tree-node.checkbox.spec.js` - TreeNode 组件交互测试
- ✅ `tree.checkbox.spec.js` - Tree 组件 API 和事件测试

---

## 📚 相关文件

- `src/tree/src/checkbox.vue` - Checkbox 组件
- `src/tree/src/model/node.js` - Node 类
- `src/tree/src/model/tree-store.js` - TreeStore 类
- `src/tree/src/tree-node.vue` - TreeNode 组件
- `src/tree/src/tree.vue` - Tree 组件

---

## 🚀 下一步

- Step 9：节点拖拽功能
- Step 10：懒加载功能
- Step 11：节点过滤功能
- Step 12：自定义节点内容
