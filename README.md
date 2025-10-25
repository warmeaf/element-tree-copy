# Tree 组件复刻步骤

> 本文档基于 **架构 + 数据结构 + 经验** 公式，提供渐进式的 Tree 组件复刻实现路径。

---

## 复刻原则

1. **循序渐进**：从简单到复杂，每一步都有可运行的成果
2. **架构优先**：先搭建分层架构，再填充功能细节
3. **数据驱动**：先实现数据模型，再实现视图渲染
4. **测试验证**：每完成一步，写单测，必须通过功能验证

---

## 整体思路

考虑到 Tree 组件的复杂性，我们采用分层架构来降低实现难度：视图层（组件化设计）、数据模型层（数据结构、类抽象与状态管理）和工具层。

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

---
