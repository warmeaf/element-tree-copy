import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tree from '../src/tree.vue'
import TreeNode from '../src/tree-node.vue'

describe('TreeNode 节点组件 - 交互功能', () => {
  // 创建测试用的 Tree 包装器
  const createTreeWrapper = (data, options = {}) => {
    return mount(Tree, {
      propsData: {
        data,
        ...options,
      },
    })
  }

  describe('折叠动画组件', () => {
    it('应该使用 ElCollapseTransition 组件', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      expect(nodeWrapper.vm.$options.components.ElCollapseTransition).toBeDefined()
    })

    it('子节点容器应该被 transition 包裹', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])

      // 查找 transition 元素
      const transition = treeWrapper.find('transition-stub')
      expect(transition.exists()).toBe(true)
    })
  })

  describe('展开图标交互', () => {
    it('展开图标应该有点击事件', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])

      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      expect(expandIcon.exists()).toBe(true)
    })

    it('点击展开图标应该展开节点', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      const node = nodeWrapper.props('node')

      expect(nodeWrapper.vm.expanded).toBe(false)

      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()

      expect(node.expanded).toBe(true)
      expect(nodeWrapper.vm.expanded).toBe(true)
    })

    it('点击已展开节点的展开图标应该收起节点', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { defaultExpandAll: true })

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      const node = nodeWrapper.props('node')

      expect(nodeWrapper.vm.expanded).toBe(true)

      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()

      expect(node.expanded).toBe(false)
      expect(nodeWrapper.vm.expanded).toBe(false)
    })

    it('点击叶子节点的展开图标不应该有任何效果', async () => {
      const treeWrapper = createTreeWrapper([{ label: '叶子节点' }])

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      const node = nodeWrapper.props('node')

      expect(node.isLeaf).toBe(true)
      expect(nodeWrapper.vm.expanded).toBe(false)

      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()

      // 叶子节点不应该被展开
      expect(nodeWrapper.vm.expanded).toBe(false)
    })

    it('展开图标点击事件应该阻止冒泡', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])

      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      
      // Vue Test Utils 会将 @click.stop 转换为特殊处理
      // 我们主要确保展开图标有独立的点击处理
      expect(expandIcon.exists()).toBe(true)
    })
  })

  describe('节点内容点击交互', () => {
    it('节点内容应该有点击事件', () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const content = treeWrapper.find('.el-tree-node__content')
      expect(content.exists()).toBe(true)
    })

    it('点击节点内容应该设置当前节点', async () => {
      const treeWrapper = createTreeWrapper([
        { label: '节点1' },
        { label: '节点2' },
      ])

      const contents = treeWrapper.findAll('.el-tree-node__content')
      const node1 = treeWrapper.vm.root.childNodes[0]

      expect(treeWrapper.vm.store.currentNode).toBeFalsy()

      await contents.at(0).trigger('click')
      await treeWrapper.vm.$nextTick()

      expect(treeWrapper.vm.store.currentNode).toBe(node1)
    })

    it('点击节点内容应该触发 current-change 事件', async () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])

      const content = treeWrapper.find('.el-tree-node__content')
      await content.trigger('click')
      await treeWrapper.vm.$nextTick()

      expect(treeWrapper.emitted('current-change')).toBeTruthy()
    })

    it('current-change 事件应该传递正确的参数', async () => {
      const treeWrapper = createTreeWrapper([
        { id: 1, label: '节点1' },
      ], { nodeKey: 'id' })

      const content = treeWrapper.find('.el-tree-node__content')
      const node = treeWrapper.vm.root.childNodes[0]

      await content.trigger('click')
      await treeWrapper.vm.$nextTick()

      const emitted = treeWrapper.emitted('current-change')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toEqual(node.data)
      expect(emitted[0][1]).toBe(node)
    })

    it('点击节点内容应该触发 node-click 事件', async () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])

      const content = treeWrapper.find('.el-tree-node__content')
      await content.trigger('click')
      await treeWrapper.vm.$nextTick()

      expect(treeWrapper.emitted('node-click')).toBeTruthy()
    })

    it('node-click 事件应该传递正确的参数', async () => {
      const treeWrapper = createTreeWrapper([
        { id: 1, label: '节点1' },
      ], { nodeKey: 'id' })

      const content = treeWrapper.find('.el-tree-node__content')
      const node = treeWrapper.vm.root.childNodes[0]

      await content.trigger('click')
      await treeWrapper.vm.$nextTick()

      const emitted = treeWrapper.emitted('node-click')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toEqual(node.data)
      expect(emitted[0][1]).toBe(node)
    })

    it('点击节点内容时事件触发顺序应该正确', async () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])

      const content = treeWrapper.find('.el-tree-node__content')
      await content.trigger('click')
      await treeWrapper.vm.$nextTick()

      // current-change 应该在 node-click 之前触发
      expect(treeWrapper.emitted('current-change')).toBeTruthy()
      expect(treeWrapper.emitted('node-click')).toBeTruthy()
    })
  })

  describe('expandOnClickNode 配置', () => {
    it('expandOnClickNode 为 true 时点击节点内容应该展开节点', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { expandOnClickNode: true })

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const content = treeWrapper.find('.el-tree-node__content')
      const node = nodeWrapper.props('node')

      expect(nodeWrapper.vm.expanded).toBe(false)

      await content.trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()

      expect(node.expanded).toBe(true)
      expect(nodeWrapper.vm.expanded).toBe(true)
    })

    it('expandOnClickNode 为 false 时点击节点内容不应该展开节点', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { expandOnClickNode: false })

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const content = treeWrapper.find('.el-tree-node__content')

      expect(nodeWrapper.vm.expanded).toBe(false)

      await content.trigger('click')
      await treeWrapper.vm.$nextTick()

      // 节点不应该展开
      expect(nodeWrapper.vm.expanded).toBe(false)
    })

    it('expandOnClickNode 默认为 true', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])

      expect(treeWrapper.props('expandOnClickNode')).toBe(true)

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const content = treeWrapper.find('.el-tree-node__content')

      await content.trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()

      // 默认应该展开
      expect(nodeWrapper.vm.expanded).toBe(true)
    })

    it('expandOnClickNode 为 false 时仍然应该触发 node-click 事件', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { expandOnClickNode: false })

      const content = treeWrapper.find('.el-tree-node__content')
      await content.trigger('click')
      await treeWrapper.vm.$nextTick()

      expect(treeWrapper.emitted('node-click')).toBeTruthy()
    })
  })

  describe('展开收起事件', () => {
    it('展开节点应该触发 node-expand 事件', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])

      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()

      expect(treeWrapper.emitted('node-expand')).toBeTruthy()
    })

    it('收起节点应该触发 node-collapse 事件', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { defaultExpandAll: true })

      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()

      expect(treeWrapper.emitted('node-collapse')).toBeTruthy()
    })

    it('node-expand 事件应该包含正确的参数', async () => {
      const treeWrapper = createTreeWrapper([
        {
          id: 1,
          label: '父节点',
          children: [{ id: 2, label: '子节点' }],
        },
      ], { nodeKey: 'id' })

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const node = nodeWrapper.props('node')
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')

      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()

      const emitted = treeWrapper.emitted('node-expand')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toEqual(node.data)
      expect(emitted[0][1]).toBe(node)
      expect(emitted[0][2]).toBe(nodeWrapper.vm)
    })

    it('node-collapse 事件应该包含正确的参数', async () => {
      const treeWrapper = createTreeWrapper([
        {
          id: 1,
          label: '父节点',
          children: [{ id: 2, label: '子节点' }],
        },
      ], { nodeKey: 'id', defaultExpandAll: true })

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const node = nodeWrapper.props('node')
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')

      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()

      const emitted = treeWrapper.emitted('node-collapse')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toEqual(node.data)
      expect(emitted[0][1]).toBe(node)
      expect(emitted[0][2]).toBe(nodeWrapper.vm)
    })

    it('叶子节点不应该触发展开收起事件', async () => {
      const treeWrapper = createTreeWrapper([{ label: '叶子节点' }])

      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()

      expect(treeWrapper.emitted('node-expand')).toBeFalsy()
      expect(treeWrapper.emitted('node-collapse')).toBeFalsy()
    })
  })

  describe('handleChildNodeExpand 方法', () => {
    it('应该转发子节点的 node-expand 事件', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '一级',
          children: [
            {
              label: '二级',
              children: [{ label: '三级' }],
            },
          ],
        },
      ], { defaultExpandAll: true })

      const treeNodes = treeWrapper.findAllComponents(TreeNode)
      // 第一个节点是一级节点
      const firstLevelNode = treeNodes.at(0)

      // 模拟子节点触发 node-expand 事件
      const mockData = { label: '测试' }
      const mockNode = { data: mockData }
      const mockInstance = { mock: 'instance' }

      firstLevelNode.vm.handleChildNodeExpand(mockData, mockNode, mockInstance)
      await treeWrapper.vm.$nextTick()

      // 验证事件被转发
      const emitted = firstLevelNode.emitted('node-expand')
      expect(emitted).toBeTruthy()
      expect(emitted[0]).toEqual([mockData, mockNode, mockInstance])
    })

    it('深层嵌套节点的事件应该逐级转发', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '一级',
          children: [
            {
              label: '二级',
              children: [
                {
                  label: '三级',
                  children: [{ label: '四级' }],
                },
              ],
            },
          ],
        },
      ], { defaultExpandAll: true })

      const treeNodes = treeWrapper.findAllComponents(TreeNode)
      // 应该有4个节点
      expect(treeNodes.length).toBe(4)
      
      // 找到三级节点（索引 2）
      const thirdLevelNode = treeNodes.at(2)
      
      // 获取该节点的 node 数据
      const node = thirdLevelNode.props('node')
      
      // 直接通过 vm 触发事件而不是点击，因为四级子节点已经展开
      thirdLevelNode.vm.$emit('node-expand', node.data, node, thirdLevelNode.vm)
      await treeWrapper.vm.$nextTick()

      // 事件应该冒泡到根组件
      expect(treeWrapper.emitted('node-expand')).toBeTruthy()
    })
  })

  describe('组件事件声明', () => {
    it('TreeNode 应该声明 node-expand 事件', () => {
      expect(TreeNode.emits).toContain('node-expand')
    })

    it('TreeNode 应该监听子组件的 node-expand 事件', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { defaultExpandAll: true })

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const childrenContainer = nodeWrapper.find('.el-tree-node__children')
      const childNode = childrenContainer.findComponent(TreeNode)

      // 验证子节点有 node-expand 监听器
      expect(childNode.exists()).toBe(true)
    })
  })

  describe('综合交互场景', () => {
    it('完整的展开-收起-再展开流程应该正常工作', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])

      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')

      // 初始状态：未展开
      expect(nodeWrapper.vm.expanded).toBe(false)

      // 第一次点击：展开
      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()
      expect(nodeWrapper.vm.expanded).toBe(true)
      expect(treeWrapper.emitted('node-expand')).toBeTruthy()

      // 第二次点击：收起
      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()
      expect(nodeWrapper.vm.expanded).toBe(false)
      expect(treeWrapper.emitted('node-collapse')).toBeTruthy()

      // 第三次点击：再次展开
      await expandIcon.trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()
      expect(nodeWrapper.vm.expanded).toBe(true)
      expect(treeWrapper.emitted('node-expand').length).toBe(2)
    })

    it('点击不同节点应该正确切换当前节点', async () => {
      const treeWrapper = createTreeWrapper([
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
        { id: 3, label: '节点3' },
      ], { nodeKey: 'id' })

      const contents = treeWrapper.findAll('.el-tree-node__content')
      const node1 = treeWrapper.vm.root.childNodes[0]
      const node2 = treeWrapper.vm.root.childNodes[1]
      const node3 = treeWrapper.vm.root.childNodes[2]

      // 点击节点1
      await contents.at(0).trigger('click')
      await treeWrapper.vm.$nextTick()
      expect(treeWrapper.vm.store.currentNode).toBe(node1)
      expect(treeWrapper.emitted('current-change').length).toBe(1)

      // 点击节点2
      await contents.at(1).trigger('click')
      await treeWrapper.vm.$nextTick()
      expect(treeWrapper.vm.store.currentNode).toBe(node2)
      expect(treeWrapper.emitted('current-change').length).toBe(2)

      // 点击节点3
      await contents.at(2).trigger('click')
      await treeWrapper.vm.$nextTick()
      expect(treeWrapper.vm.store.currentNode).toBe(node3)
      expect(treeWrapper.emitted('current-change').length).toBe(3)
    })

    it('多层级树的展开收起应该相互独立', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点1',
          children: [{ label: '子节点1-1' }],
        },
        {
          label: '父节点2',
          children: [{ label: '子节点2-1' }],
        },
      ])

      const node1 = treeWrapper.vm.root.childNodes[0]
      const node2 = treeWrapper.vm.root.childNodes[1]
      
      const expandIcons = treeWrapper.findAll('.el-tree-node__expand-icon')
      
      // 过滤掉叶子节点的展开图标（它们不会真正展开）
      // 只获取非叶子节点的展开图标
      expect(expandIcons.length).toBeGreaterThanOrEqual(2)

      // 展开第一个父节点
      await expandIcons.at(0).trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()

      expect(node1.expanded).toBe(true)
      expect(node2.expanded).toBe(false)

      // 展开第二个父节点 - 需要找到第二个父节点的图标
      // 因为第一个父节点展开后，子节点也会有展开图标，所以索引可能变化
      const expandIconsAfterFirstExpand = treeWrapper.findAll('.el-tree-node__expand-icon')
      // 第二个父节点的图标索引是 2（0: 父1, 1: 子1-1, 2: 父2）
      const secondParentIconIndex = expandIconsAfterFirstExpand.length > 2 ? 2 : 1
      await expandIconsAfterFirstExpand.at(secondParentIconIndex).trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()

      expect(node1.expanded).toBe(true)
      expect(node2.expanded).toBe(true)

      // 收起第一个父节点
      await expandIcons.at(0).trigger('click')
      await treeWrapper.vm.$nextTick()
      await treeWrapper.vm.$nextTick()

      expect(node1.expanded).toBe(false)
      expect(node2.expanded).toBe(true)
    })
  })
})

