# Tree 组件复刻步骤

> 本文档基于 **架构 + 数据结构 + 经验** 公式，提供渐进式的 Tree 组件复刻实现路径。

---

## 复刻原则

1. **循序渐进**：从简单到复杂，每一步都有可运行的成果
2. **架构优先**：先搭建分层架构，再填充功能细节
3. **数据驱动**：先实现数据模型，再实现视图渲染
4. **测试验证**：每完成一步，必须通过功能验证

---

## Step 1: 搭建项目基础架构（数据结构 - 目录结构）

### 📋 本步目标

创建 Tree 组件的目录结构和文件骨架，建立清晰的分层架构。

### ✅ 要达到的效果

- 完成三层架构的目录划分（视图层、数据模型层、工具层）
- 所有文件创建完成，但只包含基本骨架代码
- 组件可以在页面中引入，但暂时只显示一个空的 div

### 🎯 该做什么

1. **创建目录结构**：

   ```
   tree/
   ├── index.js                    # 入口文件
   ├── src/
   │   ├── tree.vue               # 树容器组件
   │   ├── tree-node.vue          # 树节点组件
   │   └── model/
   │       ├── node.js            # Node 类
   │       ├── tree-store.js      # TreeStore 类
   │       └── util.js            # 工具函数
   ```

2. **创建 index.js**：

   ```javascript
   import Tree from './src/tree.vue'

   Tree.install = function (Vue) {
     Vue.component(Tree.name, Tree)
   }

   export default Tree
   ```

3. **创建 tree.vue 骨架**：

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

4. **创建 tree-node.vue 骨架**：

   ```vue
   <template>
     <div class="el-tree-node" role="treeitem">
       <!-- 待实现 -->
     </div>
   </template>

   <script>
   export default {
     name: 'ElTreeNode',
     props: {
       node: Object,
     },
   }
   </script>
   ```

5. **创建空的 model 文件**：

   ```javascript
   // model/node.js
   export default class Node {}

   // model/tree-store.js
   export default class TreeStore {}

   // model/util.js
   export const getNodeKey = function() {};
   ```

### ❌ 不该做什么

- ❌ 不要实现任何业务逻辑
- ❌ 不要添加样式代码
- ❌ 不要处理数据转换
- ❌ 不要考虑性能优化

### 🌿 分支命名

```bash
git checkout -b feature/tree-step1-architecture
```

### ✔️ 验收标准

- [ ] 目录结构完整，符合三层架构
- [ ] 所有文件已创建，无语法错误
- [ ] 组件可以在测试页面中引入并渲染（显示空 div）
- [ ] 代码通过 ESLint 检查

---

## Step 2: 实现 Node 数据模型（数据结构 - Node 类）

### 📋 本步目标

实现 Node 类，构建树节点的数据模型，建立父子双向引用关系。

### ✅ 要达到的效果

- Node 类可以创建节点实例
- 节点具备基本属性（id, level, data, parent, childNodes）
- 可以通过 setData 方法递归创建子节点
- 节点具备基本操作方法（expand, collapse, insertChild, remove）

### 🎯 该做什么

1. **实现 Node 类构造函数**：

   ```javascript
   let nodeIdSeed = 0

   export default class Node {
     constructor(options) {
       // 基本属性
       this.id = nodeIdSeed++
       this.text = null
       this.data = null
       this.parent = null
       this.level = 0
       this.childNodes = []

       // 状态属性（先声明，暂不实现逻辑）
       this.expanded = false
       this.visible = true
       this.checked = false
       this.indeterminate = false
       this.isCurrent = false
       this.isLeaf = false

       // 懒加载相关
       this.loaded = false
       this.loading = false

       // 复制 options 属性
       for (let name in options) {
         if (options.hasOwnProperty(name)) {
           this[name] = options[name]
         }
       }

       // 计算层级
       if (this.parent) {
         this.level = this.parent.level + 1
       }

       // 注册到 store
       const store = this.store
       if (!store) {
         throw new Error('[Node]store is required!')
       }
       store.registerNode(this)

       // 设置数据（如果不是懒加载）
       if (store.lazy !== true && this.data) {
         this.setData(this.data)
       }

       this.updateLeafState()
     }
   }
   ```

2. **实现 setData 方法**（递归创建子节点）：

   ```javascript
   setData(data) {
     this.data = data;
     this.childNodes = [];

     let children;
     if (this.level === 0 && this.data instanceof Array) {
       children = this.data;  // 根节点的 data 就是数组
     } else {
       // 从配置中获取 children 字段
       const childrenKey = this.store.props?.children || 'children';
       children = data[childrenKey] || [];
     }

     // 递归创建子节点
     for (let i = 0, j = children.length; i < j; i++) {
       this.insertChild({ data: children[i] });
     }
   }
   ```

3. **实现节点操作方法**：

   ```javascript
   // 插入子节点
   insertChild(child, index) {
     if (!child) throw new Error('insertChild error: child is required.');

     if (!(child instanceof Node)) {
       Object.assign(child, {
         parent: this,
         store: this.store
       });
       child = new Node(child);
     }

     child.level = this.level + 1;

     if (typeof index === 'undefined' || index < 0) {
       this.childNodes.push(child);
     } else {
       this.childNodes.splice(index, 0, child);
     }

     this.updateLeafState();
   }

   // 移除节点
   remove() {
     const parent = this.parent;
     if (parent) {
       parent.removeChild(this);
     }
   }

   removeChild(child) {
     const index = this.childNodes.indexOf(child);
     if (index > -1) {
       this.store && this.store.deregisterNode(child);
       child.parent = null;
       this.childNodes.splice(index, 1);
     }
     this.updateLeafState();
   }

   // 展开收起（暂时只修改状态）
   expand() {
     this.expanded = true;
   }

   collapse() {
     this.expanded = false;
   }

   // 更新叶子节点状态
   updateLeafState() {
     this.isLeaf = this.childNodes.length === 0;
   }
   ```

4. **实现动态属性 getter**：

   ```javascript
   get label() {
     const labelKey = this.store.props?.label || 'label';
     return this.data?.[labelKey];
   }

   get key() {
     const nodeKey = this.store.key;
     if (this.data) return this.data[nodeKey];
     return null;
   }
   ```

### ❌ 不该做什么

- ❌ 不要实现复选框逻辑（setChecked）
- ❌ 不要实现懒加载逻辑（loadData）
- ❌ 不要实现节点过滤功能
- ❌ 不要处理事件触发

### 🌿 分支命名

```bash
git checkout -b feature/tree-step2-node-model
```

### ✔️ 验收标准

- [ ] 可以创建 Node 实例，包含完整属性
- [ ] setData 可以递归创建子节点树
- [ ] 父子节点正确建立双向引用（parent 和 childNodes）
- [ ] 节点层级（level）计算正确
- [ ] insertChild 和 remove 方法工作正常
- [ ] 通过单元测试验证基本功能

---

## Step 3: 实现 TreeStore 状态管理（数据结构 - TreeStore 类）

### 📋 本步目标

实现 TreeStore 类，作为全局状态管理中心，管理所有节点实例。

### ✅ 要达到的效果

- TreeStore 可以接收配置参数并初始化
- 创建根节点（root），并递归创建整棵树
- 维护 nodesMap 映射表，实现快速节点查找
- 提供节点的增删改查方法

### 🎯 该做什么

1. **实现 TreeStore 构造函数**：

   ```javascript
   import Node from './node'
   import { getNodeKey } from './util'

   export default class TreeStore {
     constructor(options) {
       this.currentNode = null
       this.currentNodeKey = null

       // 复制配置
       for (let option in options) {
         if (options.hasOwnProperty(option)) {
           this[option] = options[option]
         }
       }

       // 节点映射表
       this.nodesMap = {}

       // 创建根节点
       this.root = new Node({
         data: this.data,
         store: this,
       })
     }
   }
   ```

2. **实现节点注册和注销**：

   ```javascript
   registerNode(node) {
     const key = this.key;
     if (!key || !node || !node.data) return;

     const nodeKey = node.key;
     if (nodeKey !== undefined) {
       this.nodesMap[node.key] = node;
     }
   }

   deregisterNode(node) {
     const key = this.key;
     if (!key || !node || !node.data) return;

     // 递归注销子节点
     node.childNodes.forEach(child => {
       this.deregisterNode(child);
     });

     delete this.nodesMap[node.key];
   }
   ```

3. **实现节点查找**：

   ```javascript
   getNode(data) {
     if (data instanceof Node) return data;
     const key = typeof data !== 'object' ? data : getNodeKey(this.key, data);
     return this.nodesMap[key] || null;
   }
   ```

4. **实现节点增删操作**：

   ```javascript
   append(data, parentData) {
     const parentNode = parentData ? this.getNode(parentData) : this.root;
     if (parentNode) {
       parentNode.insertChild({ data });
     }
   }

   insertBefore(data, refData) {
     const refNode = this.getNode(refData);
     refNode.parent.insertBefore({ data }, refNode);
   }

   insertAfter(data, refData) {
     const refNode = this.getNode(refData);
     refNode.parent.insertAfter({ data }, refNode);
   }

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

5. **实现数据更新**：

   ```javascript
   setData(newVal) {
     const instanceChanged = newVal !== this.root.data;
     if (instanceChanged) {
       this.root.setData(newVal);
     } else {
       this.root.updateChildren();
     }
   }
   ```

6. **实现当前节点管理**：

   ```javascript
   setCurrentNode(currentNode) {
     const prevCurrentNode = this.currentNode;
     if (prevCurrentNode) {
       prevCurrentNode.isCurrent = false;
     }
     this.currentNode = currentNode;
     this.currentNode.isCurrent = true;
   }

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

### ❌ 不该做什么

- ❌ 不要实现复选框相关方法（getCheckedNodes、setCheckedKeys）
- ❌ 不要实现过滤功能（filter）
- ❌ 不要实现懒加载逻辑
- ❌ 不要实现默认展开/选中的初始化

### 🌿 分支命名

```bash
git checkout -b feature/tree-step3-tree-store
```

### ✔️ 验收标准

- [ ] TreeStore 可以接收配置并正确初始化
- [ ] root 节点创建成功，树结构正确
- [ ] nodesMap 正确维护所有节点引用
- [ ] getNode 可以通过 key 或 data 快速查找节点（O(1) 复杂度）
- [ ] append、remove 等操作正常工作
- [ ] 通过单元测试验证数据模型完整性

---

## Step 4: 实现工具函数（数据结构 - util.js）

### 📋 本步目标

实现通用工具函数，为数据模型和视图层提供支持。

### ✅ 要达到的效果

- 节点标记功能（markNodeData）
- 节点 key 获取（getNodeKey）
- 组件查找工具（findNearestComponent）

### 🎯 该做什么

1. **实现节点标记**：

   ```javascript
   export const NODE_KEY = '$treeNodeId'

   export const markNodeData = function (node, data) {
     if (!data || data[NODE_KEY]) return
     Object.defineProperty(data, NODE_KEY, {
       value: node.id,
       enumerable: false, // 不可枚举
       configurable: false, // 不可配置
       writable: false, // 不可写
     })
   }
   ```

2. **实现 key 获取**：

   ```javascript
   export const getNodeKey = function (key, data) {
     if (!key) return data[NODE_KEY]
     return data[key]
   }
   ```

3. **实现组件查找**（用于拖拽）：

   ```javascript
   export const findNearestComponent = (element, componentName) => {
     let target = element
     while (target && target.tagName !== 'BODY') {
       if (target.__vue__ && target.__vue__.$options.name === componentName) {
         return target.__vue__
       }
       target = target.parentNode
     }
     return null
   }
   ```

4. **在 Node 构造函数中调用 markNodeData**：

   ```javascript
   // node.js
   import { markNodeData, NODE_KEY } from './util';

   constructor(options) {
     // ... 其他代码
     if (!Array.isArray(this.data)) {
       markNodeData(this, this.data);
     }
   }
   ```

### ❌ 不该做什么

- ❌ 不要添加不必要的工具函数
- ❌ 不要在工具函数中处理业务逻辑

### 🌿 分支命名

```bash
git checkout -b feature/tree-step4-utils
```

### ✔️ 验收标准

- [ ] markNodeData 正确为数据对象添加不可枚举的节点 ID
- [ ] getNodeKey 可以根据配置获取节点唯一标识
- [ ] findNearestComponent 可以查找最近的 Vue 组件实例
- [ ] 通过单元测试验证工具函数

---
