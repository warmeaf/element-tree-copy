# Step 9: 实现节点增删改（架构 - CRUD 操作）

### 📋 本步目标

实现节点的增删改查操作，支持动态修改树结构，包含完整的数据同步机制。

### ✅ 要达到的效果

- 支持添加子节点（append）
- 支持在指定节点前后插入（insertBefore、insertAfter）
- 支持删除节点（remove）
- 支持更新节点子列表（updateKeyChildren）
- 数据变化时自动更新视图
- 操作会同步更新原始数据对象，保持数据一致性

### 🎯 该做什么

#### 1. **Node 类 - 增强节点操作方法**

- **完善 insertChild 方法**：支持数据同步，增加 `batch` 参数控制
- **新增 insertBefore/insertAfter 方法**：在指定节点前后插入
- **完善 removeChild 方法**：同步删除原始数据
- **新增 removeChildByData 方法**：根据数据删除节点
- **新增 getChildren 方法**：获取子数据数组，支持强制初始化

#### 2. **TreeStore 类 - 实现 CRUD 操作方法**

- **append(data, parentData)**：追加子节点到指定父节点或根节点
- **insertBefore/insertAfter(data, refData)**：在参考节点前后插入
- **remove(data)**：删除节点，自动处理当前节点状态
- **updateChildren(key, data)**：批量更新指定节点的所有子节点

#### 3. **Tree.vue - 暴露 CRUD API**

在组件的 `methods` 中暴露公开 API：
- `remove(data)` - 删除节点
- `append(data, parentNode)` - 添加子节点
- `insertBefore/insertAfter(data, refNode)` - 插入节点
- `updateKeyChildren(key, data)` - 更新子节点列表

#### 4. **编写完整的单元测试**

**Node 操作测试**（涵盖所有节点操作和数据同步）：
- insertChild 方法的各种情况
- insertBefore/insertAfter 的位置插入逻辑
- removeChild/removeChildByData 的删除逻辑
- 数据同步机制验证

**TreeStore 操作测试**（涵盖所有 CRUD 方法）：
- append 在根节点和指定节点的添加
- insertBefore/insertAfter 的位置控制
- remove 的递归删除和状态管理
- updateChildren 的批量更新机制

#### 5. **完善示例页面**

在 `example/index.vue` 中添加交互式的 CRUD 操作演示，包含：
- 添加子节点按钮
- 前后插入按钮
- 删除节点按钮
- 批量更新子节点按钮
- 重置数据按钮

### 🔑 关键技术点

#### 1. **数据双向同步机制**
- Tree 操作 → TreeStore → Node → 原始数据对象
- `batch` 参数控制是否同步原数据
- 递归处理删除时的子节点数据

#### 2. **节点注册管理**
- 新增节点自动注册到 `nodesMap`
- 删除节点时递归注销
- 通过 `getNode(data|key)` 实现快速查找

#### 3. **状态维护**
- 自动计算新节点的 `level`
- 增删后自动更新 `isLeaf` 状态  
- 删除当前选中节点时自动清空 `currentNode`

#### 4. **错误处理**
- 操作不存在的节点不抛出错误
- 参数校验和边界情况处理

### ❌ 不该做什么

- ❌ 不要实现节点拖拽排序（后续步骤）
- ❌ 不要实现撤销/重做功能
- ❌ 不要实现批量操作API
- ❌ 不要处理节点编辑功能

### 🌿 分支命名

```bash
git checkout -b feature/tree-step9-crud
```

### ✔️ 验收标准

- [ ] **基础操作**：append、insertBefore、insertAfter、remove 方法正常工作
- [ ] **数据同步**：所有操作会同步更新原始数据对象
- [ ] **节点管理**：nodesMap 正确维护，节点注册/注销正常
- [ ] **状态维护**：层级、叶子状态、当前节点状态正确更新
- [ ] **API 完整**：Tree 组件暴露完整的 CRUD 公开 API
- [ ] **错误处理**：边界情况和错误参数不会导致程序崩溃
- [ ] **单元测试**：所有 CRUD 功能通过完整的单元测试验证
- [ ] **示例演示**：example 页面提供完整的交互式 CRUD 操作演示

### 📝 使用示例

```javascript
const tree = this.$refs.tree

// 添加子节点
tree.append({ id: 10, label: '新节点' }, parentNodeData)

// 在指定位置插入
tree.insertBefore({ id: 11, label: '前插入' }, refNodeData)
tree.insertAfter({ id: 12, label: '后插入' }, refNodeData)

// 删除节点
tree.remove(nodeData)

// 批量更新子节点
tree.updateKeyChildren(parentKey, [
  { id: 13, label: '新子节点1' },
  { id: 14, label: '新子节点2' }
])
```

---

**下一步**：[Step 10: 实现节点拖拽功能](step10.md)
