import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tree from '../src/tree.vue'
import TreeNode from '../src/tree-node.vue'
import Node from '../src/model/node'

describe('TreeNode 节点组件 - 基础渲染', () => {
  // 创建测试用的 Tree 包装器
  const createTreeWrapper = (data, options = {}) => {
    return mount(Tree, {
      propsData: {
        data,
        ...options,
      },
    })
  }

  describe('基础功能', () => {
  it('应该能够渲染 tree-node 组件', () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      expect(nodeWrapper.exists()).toBe(true)
  })

  it('应该有正确的组件名称', () => {
    expect(TreeNode.name).toBe('ElTreeNode')
  })

  it('应该渲染带有 role 属性的 el-tree-node div', () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const nodeDiv = treeWrapper.find('.el-tree-node')
    expect(nodeDiv.exists()).toBe(true)
    expect(nodeDiv.attributes('role')).toBe('treeitem')
  })

  it('应该接受 Object 类型的 node 属性', () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      expect(nodeWrapper.props('node')).toBeInstanceOf(Node)
    })
  })

  describe('节点内容渲染', () => {
    it('应该渲染节点内容区域', () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const content = treeWrapper.find('.el-tree-node__content')
      expect(content.exists()).toBe(true)
    })

    it('应该渲染展开图标', () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      expect(expandIcon.exists()).toBe(true)
    })

    it('应该渲染节点标签', () => {
      const treeWrapper = createTreeWrapper([{ label: '测试节点' }])
      const label = treeWrapper.find('.el-tree-node__label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('测试节点')
    })

    it('叶子节点的展开图标应该有 is-leaf 类', () => {
      const treeWrapper = createTreeWrapper([{ label: '叶子节点' }])
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      expect(expandIcon.classes()).toContain('is-leaf')
    })

    it('非叶子节点的展开图标不应该有 is-leaf 类', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      expect(expandIcon.classes()).not.toContain('is-leaf')
    })
  })

  describe('层级缩进', () => {
    it('一级节点应该没有左侧缩进', () => {
      const treeWrapper = createTreeWrapper([{ label: '一级节点' }])
      const content = treeWrapper.find('.el-tree-node__content')
      expect(content.attributes('style')).toContain('padding-left: 0px')
    })

    it('二级节点应该有 18px 缩进', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '一级',
          children: [{ label: '二级' }],
        },
      ], { defaultExpandAll: true })
      
      const contents = treeWrapper.findAll('.el-tree-node__content')
      expect(contents.at(1).attributes('style')).toContain('padding-left: 18px')
    })

    it('三级节点应该有 36px 缩进', () => {
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
      
      const contents = treeWrapper.findAll('.el-tree-node__content')
      expect(contents.at(2).attributes('style')).toContain('padding-left: 36px')
    })
  })

  describe('递归渲染', () => {
    it('应该递归渲染子节点', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [
            { label: '子节点1' },
            { label: '子节点2' },
          ],
        },
      ], { defaultExpandAll: true })
      
      const labels = treeWrapper.findAll('.el-tree-node__label')
      expect(labels.length).toBe(3)
      expect(labels.at(0).text()).toBe('父节点')
      expect(labels.at(1).text()).toBe('子节点1')
      expect(labels.at(2).text()).toBe('子节点2')
    })

    it('应该渲染子节点容器', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])
      
      const childrenContainer = treeWrapper.find('.el-tree-node__children')
      expect(childrenContainer.exists()).toBe(true)
      expect(childrenContainer.attributes('role')).toBe('group')
    })

    it('子节点容器应该包含子节点组件', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { defaultExpandAll: true })
      
      const childrenContainer = treeWrapper.find('.el-tree-node__children')
      const childNodes = childrenContainer.findAllComponents(TreeNode)
      expect(childNodes.length).toBe(1)
    })
  })

  describe('展开状态', () => {
    it('未展开时子节点容器应该隐藏', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])
      
      const childrenContainer = treeWrapper.find('.el-tree-node__children')
      expect(childrenContainer.element.style.display).toBe('none')
    })

    it('展开时子节点容器应该显示', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { defaultExpandAll: true })
      
      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      expect(nodeWrapper.vm.expanded).toBe(true)
      
      const childrenContainer = treeWrapper.find('.el-tree-node__children')
      expect(childrenContainer.element.style.display).not.toBe('none')
    })

    it('展开的节点应该有 is-expanded 类', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { defaultExpandAll: true })
      
      const nodeDiv = treeWrapper.find('.el-tree-node')
      expect(nodeDiv.classes()).toContain('is-expanded')
    })

    it('展开图标应该有 expanded 类', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { defaultExpandAll: true })
      
      const expandIcon = treeWrapper.find('.el-tree-node__expand-icon')
      expect(expandIcon.classes()).toContain('expanded')
    })

    it('应该监听 node.expanded 的变化', async () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ])
      
      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const node = nodeWrapper.props('node')
      
      expect(nodeWrapper.vm.expanded).toBe(false)
      
      // 修改 node.expanded
      node.expanded = true
      await nodeWrapper.vm.$nextTick()
      await nodeWrapper.vm.$nextTick()
      
      expect(nodeWrapper.vm.expanded).toBe(true)
    })
  })

  describe('tree 组件引用', () => {
    it('created 时应该找到根 tree 组件', () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      
      expect(nodeWrapper.vm.tree).toBeTruthy()
      expect(nodeWrapper.vm.tree.isTree).toBe(true)
    })

    it('子节点应该通过父节点找到根 tree 组件', () => {
      const treeWrapper = createTreeWrapper([
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ], { defaultExpandAll: true })
      
      const nodeWrappers = treeWrapper.findAllComponents(TreeNode)
      const childNodeWrapper = nodeWrappers.at(1)
      
      expect(childNodeWrapper.vm.tree).toBeTruthy()
      expect(childNodeWrapper.vm.tree.isTree).toBe(true)
    })
  })

  describe('节点可见性', () => {
    it('visible 为 true 的节点应该显示', () => {
      const treeWrapper = createTreeWrapper([{ label: '可见节点' }])
      const node = treeWrapper.vm.root.childNodes[0]
      
      expect(node.visible).toBe(true)
      
      const nodeDiv = treeWrapper.find('.el-tree-node')
      expect(nodeDiv.element.style.display).not.toBe('none')
    })

    it('应该根据 visible 属性控制节点显示', async () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const node = treeWrapper.vm.root.childNodes[0]
      
      // visible 为 false 时应该隐藏
      node.visible = false
      await treeWrapper.vm.$nextTick()
      
      const nodeDiv = treeWrapper.find('.el-tree-node')
      expect(nodeDiv.element.style.display).toBe('none')
    })

    it('隐藏的节点应该有 is-hidden 类', async () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const node = treeWrapper.vm.root.childNodes[0]
      
      node.visible = false
      await treeWrapper.vm.$nextTick()
      
      const nodeDiv = treeWrapper.find('.el-tree-node')
      expect(nodeDiv.classes()).toContain('is-hidden')
    })
  })

  describe('节点状态类', () => {
    it('当前节点应该有 is-current 类', async () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const node = treeWrapper.vm.root.childNodes[0]
      
      node.isCurrent = true
      await treeWrapper.vm.$nextTick()
      
      const nodeDiv = treeWrapper.find('.el-tree-node')
      expect(nodeDiv.classes()).toContain('is-current')
    })

    it('非当前节点不应该有 is-current 类', () => {
      const treeWrapper = createTreeWrapper([{ label: '节点1' }])
      const nodeDiv = treeWrapper.find('.el-tree-node')
      expect(nodeDiv.classes()).not.toContain('is-current')
    })
  })

  describe('getNodeKey 方法', () => {
    it('应该能够获取节点的 key', () => {
      const treeWrapper = createTreeWrapper([
        { id: 1, label: '节点1' },
      ], { nodeKey: 'id' })
      
      const nodeWrapper = treeWrapper.findComponent(TreeNode)
      const node = nodeWrapper.props('node')
      const key = nodeWrapper.vm.getNodeKey(node)
      
      expect(key).toBe(1)
    })
  })
})

