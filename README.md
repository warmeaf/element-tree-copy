# Element Tree 组件实现思路与流程

## 一、整体实现思路

这个树形组件采用了典型的 **模型-视图分离** 架构设计，主要包含以下几个核心部分：

1. **入口文件** (`index.js`)：负责组件的注册和导出
2. **主组件** (`tree.vue`)：负责视图渲染和用户交互
3. **数据模型** (`model/` 目录)：负责树形数据的管理和操作
   - `Node` 类：表示树中的每个节点
   - `TreeStore` 类：管理整个树的状态和节点映射
   - `util.js`：提供工具函数

这种设计的优势是 **职责分离**，视图层只负责渲染，数据层负责管理树的状态和操作逻辑，使得代码结构清晰，易于维护和扩展。

## 二、实现流程详解

### 1. 组件注册与导出

首先看入口文件 <mcfile name="index.js" path="e:\project_my\element-tree-copy\src\tree\index.js"></mcfile>：

```javascript
import Tree from './src/tree.vue'

Tree.install = function (Vue) {
  Vue.component(Tree.name, Tree)
}

export default Tree
```

这里实现了 Vue 插件的标准模式，提供了 `install` 方法用于全局注册组件，然后导出组件本身。这样用户既可以通过 `Vue.use(Tree)` 全局注册，也可以局部引入使用。

### 2. 树形数据模型 - Node 类

<mcfile name="node.js" path="e:\project_my\element-tree-copy\src\tree\src\model\node.js"></mcfile> 是整个树形组件的核心，它定义了树节点的结构和行为。

#### 节点属性

每个节点包含以下关键属性：

- `id`：唯一标识符
- `data`：节点原始数据
- `parent`：父节点引用
- `level`：节点层级
- `childNodes`：子节点数组
- `expanded`：展开状态
- `checked`：选中状态
- `isLeaf`：是否为叶子节点

#### 节点创建与初始化

```javascript
constructor(options) {
  // 基本属性初始化
  this.id = nodeIdSeed++;
  this.text = null;
  this.data = null;
  this.parent = null;
  this.level = 0;
  this.childNodes = [];

  // 状态属性
  this.expanded = false;
  this.visible = true;
  this.checked = false;
  // ...

  // 复制 options 属性
  for (let name in options) {
    if (Object.prototype.hasOwnProperty.call(options, name)) {
      this[name] = options[name];
    }
  }

  // 计算层级
  if (this.parent) {
    this.level = this.parent.level + 1;
  }

  // 注册到 store
  const store = this.store;
  if (!store) {
    throw new Error('[Node]store is required!');
  }
  store.registerNode(this);

  // 设置数据
  if (store.lazy !== true && this.data) {
    this.setData(this.data);
    if (store.defaultExpandAll) {
      this.expanded = true;
    }
  }

  // 标记节点数据
  if (!Array.isArray(this.data)) {
    markNodeData(this, this.data);
  }

  this.updateLeafState();
}
```

节点创建时会自动计算层级、注册到 store、设置数据并更新叶子节点状态。

#### 数据设置与子节点创建

```javascript
setData(data) {
  if (!Array.isArray(data)) {
    markNodeData(this, data);
  }

  this.data = data;
  this.childNodes = [];

  let children;
  if (this.level === 0 && this.data instanceof Array) {
    children = this.data; // 根节点的 data 就是数组
  } else {
    // 从配置中获取 children 字段
    children = getPropertyFromData(this, 'children') || [];
  }

  // 递归创建子节点
  for (let i = 0, j = children.length; i < j; i++) {
    this.insertChild({ data: children[i] });
  }
}
```

`setData` 方法会处理节点数据，并根据数据中的 `children` 字段递归创建子节点。

#### 节点操作方法

Node 类提供了丰富的节点操作方法：

- `insertChild`：插入子节点
- `remove`：移除当前节点
- `removeChild`：移除指定子节点
- `expand`/`collapse`：展开/收起节点
- `updateLeafState`：更新叶子节点状态

### 3. 树状态管理 - TreeStore 类

<mcfile name="tree-store.js" path="e:\project_my\element-tree-copy\src\tree\src\model\tree-store.js"></mcfile> 负责管理整个树的状态和节点映射：

```javascript
export default class TreeStore {
  constructor(options) {
    this.currentNode = null
    this.currentNodeKey = null

    for (let option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        this[option] = options[option]
      }
    }

    this.nodesMap = {}
  }

  registerNode(node) {
    const key = this.key
    if (!key || !node || !node.data) return

    const nodeKey = node.key
    if (nodeKey !== undefined) this.nodesMap[node.key] = node
  }

  deregisterNode(node) {
    const key = this.key
    if (!key || !node || !node.data) return

    node.childNodes.forEach((child) => {
      this.deregisterNode(child)
    })

    delete this.nodesMap[node.key]
  }
}
```

TreeStore 维护了一个 `nodesMap` 对象，用于快速通过 key 查找节点，同时提供了节点的注册和注销方法。

### 4. 工具函数

<mcfile name="util.js" path="e:\project_my\element-tree-copy\src\tree\src\model\util.js"></mcfile> 提供了一些实用工具函数：

```javascript
export const NODE_KEY = '$treeNodeId'

export const markNodeData = function (node, data) {
  if (!data || data[NODE_KEY]) return
  Object.defineProperty(data, NODE_KEY, {
    value: node.id,
    enumerable: false,
    configurable: false,
    writable: false,
  })
}

export const getNodeKey = function (key, data) {
  if (!key) return data[NODE_KEY]
  return data[key]
}
```

`markNodeData` 函数会在原始数据上添加一个不可枚举的 `$treeNodeId` 属性，用于建立数据与节点之间的关联。

### 5. 主组件实现

<mcfile name="tree.vue" path="e:\project_my\element-tree-copy\src\tree\src\tree.vue"></mcfile> 是组件的视图层：

```vue
<template>
  <div class="el-tree" role="tree">
    <!-- 待实现 -->
  </div>
</template>

<script>
export default {
  name: 'ElTree',
  props: {
    data: Array,
  },
  data() {
    return {
      store: null,
      root: null,
    }
  },
}
</script>
```

目前这个组件还比较简单，只定义了基本的 props 和 data，模板部分还有待实现。

## 三、总结

这个树形组件采用了清晰的架构设计：

1. **数据层**：通过 Node 类和 TreeStore 类管理树形数据和状态
2. **视图层**：通过 Vue 组件负责渲染和交互
3. **工具层**：提供辅助函数支持核心功能

这种设计使得组件具有良好的可维护性和扩展性。Node 类封装了节点的所有操作，TreeStore 负责全局状态管理，而视图组件只需要关注渲染和用户交互，实现了关注点分离。

在实际使用中，用户只需要提供树形数据，组件会自动创建节点对象、建立父子关系，并提供丰富的操作方法，如展开/收起、选中/取消选中等。
