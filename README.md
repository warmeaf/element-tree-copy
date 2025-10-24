# Element Tree 组件复刻项目

## 📊 代码差异分析

本项目当前分支相对于 `feature/tree-step2-node-model` 分支在 `src/tree/src` 文件夹下新增了重要功能。主要变化集中在 `tree-store.js` 文件中，新增了**8 个核心方法**，为树组件提供了完整的数据操作能力。

## 🎯 整体实现思路

### 核心设计理念

当前分支的改进遵循了一个非常清晰的设计思路：**将 TreeStore 从一个简单的节点管理器升级为一个功能完整的树数据操作中心**。

这个设计有三个关键特点：

1. **统一的数据入口**：所有的树操作都通过 TreeStore 进行，确保数据的一致性
2. **灵活的节点定位**：支持通过多种方式（节点对象、key 值、数据对象）来定位节点
3. **完整的 CRUD 操作**：提供了增删改查的完整功能集

### 架构设计亮点

```
TreeStore (数据管理中心)
├── 节点映射管理 (nodesMap)
├── 当前节点状态管理 (currentNode)
└── 数据操作API (新增的8个方法)
```

## 🔧 功能实现详解

### 1. 🔍 节点查找功能

**`getNode` 方法**

```javascript
getNode(data) {
  if (data instanceof Node) return data;
  const key = typeof data !== 'object' ? data : getNodeKey(this.key, data);
  return this.nodesMap[key] || null;
}
```

**设计巧思**：

- 这个方法非常聪明，它能处理三种不同类型的输入：
  - 如果传入的已经是 Node 对象，直接返回
  - 如果传入的是基本类型（字符串、数字），当作 key 来查找
  - 如果传入的是数据对象，通过 `getNodeKey` 工具函数提取 key

这种设计让其他方法的调用变得非常灵活，用户可以用任何方便的方式来指定节点。

### 2. 📝 数据更新功能

**`setData` 方法**

```javascript
setData(newVal) {
  const instanceChanged = newVal !== this.root.data;
  if (instanceChanged) {
    this.root.setData(newVal);
  }
}
```

**实现要点**：

- 只有当新数据与根节点数据不同时才进行更新
- 通过根节点的 `setData` 方法来触发整个树的数据更新
- 这种设计避免了不必要的重新渲染

### 3. ➕ 节点增加功能

#### **`append` 方法 - 追加子节点**

```javascript
append(data, parentData) {
  const parentNode = parentData ? this.getNode(parentData) : this.root;
  if (parentNode) {
    parentNode.insertChild({ data });
  }
}
```

**设计亮点**：

- 如果不指定父节点，默认添加到根节点
- 利用了前面的 `getNode` 方法来灵活定位父节点
- 通过父节点的 `insertChild` 方法来实现添加

#### **`insertBefore` 和 `insertAfter` 方法**

```javascript
insertBefore(data, refData) {
  const refNode = this.getNode(refData);
  refNode.parent.insertBefore({ data }, refNode);
}

insertAfter(data, refData) {
  const refNode = this.getNode(refData);
  refNode.parent.insertAfter({ data }, refNode);
}
```

**实现特点**：

- 都是通过参考节点的父节点来进行插入操作
- 保持了与 DOM 操作类似的 API 设计，降低学习成本

### 4. ❌ 节点删除功能

**`remove` 方法**

```javascript
remove(data) {
  const node = this.getNode(data);

  if (node && node.parent) {
    if (node === this.currentNode) {
      this.currentNode = null;
    }
    node.parent.removeChild(node);
  }
}
```

**安全性考虑**：

- 检查节点是否存在且有父节点（防止删除根节点）
- 如果删除的是当前选中节点，自动清空当前节点状态
- 通过父节点来执行删除操作，保证树结构的完整性

### 5. 🎯 当前节点管理功能

这是一组非常重要的状态管理方法：

#### **`setCurrentNode` 方法**

```javascript
setCurrentNode(currentNode) {
  const prevCurrentNode = this.currentNode;
  if (prevCurrentNode) {
    prevCurrentNode.isCurrent = false;
  }
  this.currentNode = currentNode;
  this.currentNode.isCurrent = true;
}
```

**状态管理逻辑**：

- 先清除之前节点的选中状态
- 再设置新节点为选中状态
- 确保任何时候只有一个节点处于选中状态

#### **`getCurrentNode` 和 `setCurrentNodeKey` 方法**

```javascript
getCurrentNode() {
  return this.currentNode;
}

setCurrentNodeKey(key) {
  if (key === null || key === undefined) {
    this.currentNode && (this.currentNode.isCurrent = false);
    this.currentNode = null;
    return;
  }
  const node = this.getNode(key);
  if (node) {
    this.setCurrentNode(node);
  }
}
```

**API 设计考虑**：

- `getCurrentNode` 提供简单的获取接口
- `setCurrentNodeKey` 支持通过 key 来设置当前节点，更加灵活
- 支持传入 null/undefined 来清空当前节点

## 🌟 设计模式和最佳实践

### 1. **门面模式 (Facade Pattern)**

TreeStore 作为一个门面，隐藏了底层 Node 对象的复杂操作，提供了简洁统一的 API。

### 2. **策略模式的体现**

`getNode` 方法能够处理不同类型的输入，体现了策略模式的思想。

### 3. **状态管理的最佳实践**

- 集中管理当前节点状态
- 确保状态变更的原子性
- 提供多种状态操作方式

### 4. **防御性编程**

- 在每个方法中都进行了必要的参数检查
- 避免了可能导致程序崩溃的边界情况

## 🎯 新增方法总览

这次的代码更新将 TreeStore 从一个基础的节点注册器升级为了一个功能完整的树数据管理中心。新增的 8 个方法覆盖了树操作的所有核心场景：

| 方法名              | 功能分类 | 主要作用                 |
| ------------------- | -------- | ------------------------ |
| `getNode`           | 查找     | 通过多种方式灵活定位节点 |
| `setData`           | 更新     | 更新整个树的数据         |
| `append`            | 增加     | 追加子节点到指定父节点   |
| `insertBefore`      | 增加     | 在指定节点前插入新节点   |
| `insertAfter`       | 增加     | 在指定节点后插入新节点   |
| `remove`            | 删除     | 安全删除指定节点         |
| `setCurrentNode`    | 状态管理 | 设置当前选中节点         |
| `getCurrentNode`    | 状态管理 | 获取当前选中节点         |
| `setCurrentNodeKey` | 状态管理 | 通过 key 设置当前节点    |

## 📁 项目结构

```
src/tree/src/
├── model/
│   ├── node.js          # 节点类定义
│   ├── tree-store.js    # 树数据管理中心（本次重点更新）
│   └── util.js          # 工具函数
├── tree-node.vue       # 树节点组件
└── tree.vue            # 树组件主文件
```

## 🚀 总结

这种设计不仅提供了完整的功能，还保持了 API 的简洁性和一致性，是一个非常优秀的数据管理层实现。通过这 8 个方法的添加，TreeStore 现在具备了：

- ✅ 完整的 CRUD 操作能力
- ✅ 灵活的节点定位机制
- ✅ 安全的状态管理
- ✅ 优雅的 API 设计
- ✅ 良好的扩展性

这为后续的 UI 组件开发奠定了坚实的数据层基础。
