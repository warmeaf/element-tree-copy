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
