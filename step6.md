# Step 6: 实现展开收起功能

## 📋 本步目标

实现节点的展开/收起交互，增加展开收起动画效果。

## ✅ 要达到的效果

- ✅ 点击展开图标可以展开/收起子节点
- ✅ 展开收起带有流畅的动画过渡效果
- ✅ 支持 `expandOnClickNode` 配置（点击节点内容也可以展开）
- ✅ 触发 `node-expand`、`node-collapse`、`node-click` 和 `current-change` 事件

## 🎯 该做什么

### 1. 创建 DOM 工具函数

**文件路径**：`src/tree/src/utils/dom.js`

实现操作 CSS class 的工具函数，用于动画效果：

```javascript
/**
 * 添加 class
 */
export function addClass(el, cls) {
  if (!el) return
  let curClass = el.className
  const classes = (cls || '').split(' ')

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

/**
 * 移除 class
 */
export function removeClass(el, cls) {
  if (!el || !cls) return
  const classes = cls.split(' ')
  let curClass = ' ' + el.className + ' '

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = curClass.trim()
  }
}

/**
 * 判断是否有某个 class
 */
export function hasClass(el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) {
    throw new Error('className should not contain space.')
  }
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}
```

### 2. 创建折叠动画组件

**文件路径**：`src/tree/src/collapse-transition.js`

实现基于 Vue Transition 的折叠动画组件：

```javascript
import { addClass, removeClass } from './utils/dom.js'

class Transition {
  // 进入前：初始化高度为 0
  beforeEnter(el) {
    addClass(el, 'collapse-transition')
    if (!el.dataset) el.dataset = {}

    el.dataset.oldPaddingTop = el.style.paddingTop
    el.dataset.oldPaddingBottom = el.style.paddingBottom

    el.style.height = '0'
    el.style.paddingTop = 0
    el.style.paddingBottom = 0
  }

  // 进入中：设置目标高度
  enter(el) {
    el.dataset.oldOverflow = el.style.overflow
    
    // 计算实际高度：遍历直接子元素，累加它们的 offsetHeight
    let height = 0
    Array.from(el.children).forEach(child => {
      height += child.offsetHeight
    })
    
    if (height !== 0) {
      el.style.height = height + 'px'
      el.style.paddingTop = el.dataset.oldPaddingTop
      el.style.paddingBottom = el.dataset.oldPaddingBottom
    } else {
      el.style.height = ''
      el.style.paddingTop = el.dataset.oldPaddingTop
      el.style.paddingBottom = el.dataset.oldPaddingBottom
    }

    el.style.overflow = 'hidden'
  }

  // 进入后：清理样式
  afterEnter(el) {
    removeClass(el, 'collapse-transition')
    el.style.height = ''
    el.style.overflow = el.dataset.oldOverflow
  }

  // 离开前：设置当前高度
  beforeLeave(el) {
    if (!el.dataset) el.dataset = {}
    el.dataset.oldPaddingTop = el.style.paddingTop
    el.dataset.oldPaddingBottom = el.style.paddingBottom
    el.dataset.oldOverflow = el.style.overflow

    // 计算实际高度
    let height = 0
    Array.from(el.children).forEach(child => {
      height += child.offsetHeight
    })

    el.style.height = height + 'px'
    el.style.overflow = 'hidden'
  }

  // 离开中：收起到 0
  leave(el) {
    if (el.scrollHeight !== 0) {
      addClass(el, 'collapse-transition')
      el.style.height = 0
      el.style.paddingTop = 0
      el.style.paddingBottom = 0
    }
  }

  // 离开后：恢复样式
  afterLeave(el) {
    removeClass(el, 'collapse-transition')
    el.style.height = ''
    el.style.overflow = el.dataset.oldOverflow
    el.style.paddingTop = el.dataset.oldPaddingTop
    el.style.paddingBottom = el.dataset.oldPaddingBottom
  }
}

export default {
  name: 'ElCollapseTransition',
  functional: true,
  render(h, { children }) {
    const transition = new Transition()

    const data = {
      on: {
        beforeEnter: transition.beforeEnter,
        enter: transition.enter,
        afterEnter: transition.afterEnter,
        beforeLeave: transition.beforeLeave,
        leave: transition.leave,
        afterLeave: transition.afterLeave,
      },
    }

    return h('transition', data, children)
  },
}
```

**关键点**：
- 使用函数式组件（functional: true）提升性能
- 通过计算子元素的 offsetHeight 来精确控制高度动画
- 使用 dataset 保存原始样式，动画结束后恢复

### 3. 更新 tree-node.vue

#### 3.1 添加展开图标点击事件

```vue
<span
  :class="[
    { 'is-leaf': node.isLeaf, expanded: !node.isLeaf && expanded },
    'el-tree-node__expand-icon',
  ]"
  @click.stop="handleExpandIconClick"
/>
```

#### 3.2 添加节点内容点击事件

```vue
<div
  class="el-tree-node__content"
  :style="{ 'padding-left': (node.level - 1) * 18 + 'px' }"
  @click.stop="handleClick"
>
```

#### 3.3 使用折叠动画组件包裹子节点

```vue
<el-collapse-transition>
  <div v-show="expanded" class="el-tree-node__children" role="group">
    <el-tree-node
      v-for="child in node.childNodes"
      :key="getNodeKey(child)"
      :node="child"
      :props="props"
      @node-expand="handleChildNodeExpand"
    />
  </div>
</el-collapse-transition>
```

#### 3.4 引入组件并声明事件

```vue
<script>
import { getNodeKey } from './model/util'
import ElCollapseTransition from './collapse-transition.js'

export default {
  name: 'ElTreeNode',

  components: {
    ElCollapseTransition,
  },

  emits: ['node-expand'],
  
  // ...
}
</script>
```

#### 3.5 实现展开收起逻辑

```javascript
methods: {
  // 展开图标点击
  handleExpandIconClick() {
    if (this.node.isLeaf) return

    if (this.expanded) {
      this.tree.$emit('node-collapse', this.node.data, this.node, this)
      this.node.collapse()
    } else {
      this.node.expand()
      this.$emit('node-expand', this.node.data, this.node, this)
    }
  },

  // 节点内容点击
  handleClick() {
    const store = this.tree.store
    store.setCurrentNode(this.node)
    this.tree.$emit(
      'current-change',
      store.currentNode ? store.currentNode.data : null,
      store.currentNode
    )

    if (this.tree.expandOnClickNode) {
      this.handleExpandIconClick()
    }

    this.tree.$emit('node-click', this.node.data, this.node, this)
  },

  // 转发子节点展开事件
  handleChildNodeExpand(nodeData, node, instance) {
    this.$emit('node-expand', nodeData, node, instance)
  },
}
```

### 4. 更新 tree.vue

#### 4.1 添加 expandOnClickNode 配置

```javascript
props: {
  expandOnClickNode: {
    type: Boolean,
    default: true,
  },
}
```

#### 4.2 声明事件

```javascript
emits: ['node-expand', 'node-collapse', 'node-click', 'current-change']
```

#### 4.3 监听并转发子节点事件

```vue
<el-tree-node
  v-for="child in root.childNodes"
  :key="getNodeKey(child)"
  :node="child"
  :props="props"
  @node-expand="handleNodeExpand"
/>
```

```javascript
methods: {
  handleNodeExpand(nodeData, node, instance) {
    this.$emit('node-expand', nodeData, node, instance)
  },
}
```

### 5. 更新样式文件

在 `src/tree/src/style/tree.css` 中添加折叠动画样式：

```css
.collapse-transition {
  transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out,
    0.3s padding-bottom ease-in-out;
}

.el-tree-node__expand-icon {
  cursor: pointer;
  color: #c0c4cc;
  font-size: 12px;
  transform: rotate(0deg);
  transition: transform 0.3s ease-in-out;
}

.el-tree-node__expand-icon.expanded {
  transform: rotate(90deg);
}

.el-tree-node__expand-icon.is-leaf {
  color: transparent;
  cursor: default;
}

.el-tree-node__content:hover > .el-tree-node__expand-icon {
  color: #909399;
}
```

### 6. 创建示例页面

在 `src/example/index.vue` 中展示各种用法：

```vue
<template>
  <div>
    <h2>基础用法（点击展开/收起）</h2>
    <el-tree 
      :data="treeData" 
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      @node-click="handleNodeClick"
    />
    
    <h2>默认展开所有节点</h2>
    <el-tree :data="treeData" default-expand-all />
    
    <h2>禁用点击节点展开</h2>
    <el-tree :data="treeData" :expand-on-click-node="false" />
  </div>
</template>

<script>
export default {
  methods: {
    handleNodeExpand(data, node) {
      console.log('展开:', data.label)
    },
    handleNodeCollapse(data, node) {
      console.log('收起:', data.label)
    },
    handleNodeClick(data, node) {
      console.log('点击:', data.label)
    },
  },
}
</script>
```

## ❌ 不该做什么

- ❌ 不要实现手风琴模式（accordion）
- ❌ 不要实现延迟渲染（renderAfterExpand）
- ❌ 不要实现默认展开节点（defaultExpandedKeys）
- ❌ 不要实现节点拖拽功能

## 🔑 核心知识点

### 1. 函数式组件

折叠动画使用函数式组件（functional: true）：
- 没有 this 上下文，无状态
- 渲染性能更高
- 适合纯展示型组件

### 2. Vue Transition 钩子

完整的过渡生命周期：
- **beforeEnter**: 设置初始状态（高度为 0）
- **enter**: 设置目标状态（实际高度）
- **afterEnter**: 清理临时样式
- **beforeLeave**: 设置当前状态（当前高度）
- **leave**: 设置离开状态（高度为 0）
- **afterLeave**: 恢复原始样式

### 3. 高度计算策略

不使用 `scrollHeight`，而是累加子元素的 `offsetHeight`：

```javascript
let height = 0
Array.from(el.children).forEach(child => {
  height += child.offsetHeight
})
el.style.height = height + 'px'
```

**原因**：scrollHeight 在嵌套动画时可能计算不准确，导致动画闪烁。

### 4. 事件冒泡处理

使用 `@click.stop` 阻止事件冒泡：

```vue
<span @click.stop="handleExpandIconClick" />
<div @click.stop="handleClick">
```

防止点击展开图标时触发节点点击事件。

### 5. 事件转发机制

树节点采用递归组件，需要将子节点事件向上传递：

```javascript
// 子组件触发事件
this.$emit('node-expand', nodeData, node, instance)

// 父组件监听并转发
handleChildNodeExpand(nodeData, node, instance) {
  this.$emit('node-expand', nodeData, node, instance)
}
```

最终在 tree.vue 中统一向外发出。

## 🌿 分支命名

```bash
git checkout -b feature/tree-step6-expand-collapse
```

## ✔️ 验收标准

- [x] 点击展开图标可以展开/收起节点
- [x] 展开收起有流畅的动画效果（0.3s）
- [x] `expandOnClickNode` 配置生效
- [x] `node-expand` 和 `node-collapse` 事件正常触发
- [x] `node-click` 和 `current-change` 事件正常触发
- [x] 叶子节点不显示展开图标（透明处理）
- [x] 默认展开所有节点（defaultExpandAll）功能正常

## 🎨 效果预览

### 1. 基础展开收起
- 点击 `▶` 图标展开，再次点击收起
- 展开时图标旋转 90 度
- 动画流畅自然

### 2. 点击节点展开
- 默认情况下，点击节点文本也会展开/收起
- 设置 `:expand-on-click-node="false"` 可禁用

### 3. 默认展开所有
- 使用 `default-expand-all` 属性
- 所有节点初始状态为展开

## 📝 总结

本步骤完成了 Tree 组件的核心交互功能：

1. ✅ **动画组件**：实现了可复用的折叠动画组件
2. ✅ **交互逻辑**：展开图标点击、节点点击
3. ✅ **配置项**：expandOnClickNode、defaultExpandAll
4. ✅ **事件系统**：node-expand、node-collapse、node-click、current-change
5. ✅ **工具函数**：DOM 操作工具（addClass、removeClass、hasClass）

**下一步**：实现复选框功能（Step 7）

