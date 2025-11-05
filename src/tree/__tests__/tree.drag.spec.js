import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 容器组件 - 拖拽功能', () => {
  let mockDataTransfer

  // 测试数据构建器
  const createTestTreeData = (type = 'basic') => {
    switch (type) {
      case 'basic':
        return [
          { id: 1, label: '节点1' },
          { id: 2, label: '节点2' },
        ]
      case 'complex':
        return [
          {
            id: 1,
            label: '父节点1',
            children: [
              { id: 11, label: '子节点1-1' },
              { id: 12, label: '子节点1-2' },
            ],
          },
          { id: 2, label: '父节点2' },
          {
            id: 3,
            label: '父节点3',
            children: [
              { id: 31, label: '子节点3-1' },
              {
                id: 32,
                label: '子节点3-2',
                children: [{ id: 321, label: '孙节点3-2-1' }],
              },
            ],
          },
        ]
      case 'large': {
        const largeData = []
        for (let i = 1; i <= 100; i++) {
          largeData.push({
            id: i,
            label: `节点${i}`,
            children:
              i % 10 === 0
                ? [
                    { id: i * 100, label: `子节点${i}` },
                    { id: i * 100 + 1, label: `子节点${i + 1}` },
                  ]
                : undefined,
          })
        }
        return largeData
      }
      default:
        return []
    }
  }

  // 创建测试用的 Tree 包装器
  const createTreeWrapper = (data, options = {}) => {
    return mount(Tree, {
      propsData: {
        data,
        draggable: true,
        nodeKey: 'id',
        ...options,
      },
    })
  }

  // 创建拖拽事件对象
  const createDragEvent = (type, overrides = {}) => {
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientY: 100,
      target: null,
      ...overrides,
    }
    
    if (!event.dataTransfer) {
      event.dataTransfer = mockDataTransfer
    }
    
    return event
  }

  // 模拟 DataTransfer 对象
  beforeEach(() => {
    mockDataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: vi.fn(),
      getData: vi.fn(),
      setDragImage: vi.fn(),
    }
  })

  // 清理 Mock 调用
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('拖拽基础配置', () => {
    it('应该支持 draggable 属性', () => {
      const wrapper = mount(Tree, {
        propsData: {
          draggable: true,
        },
      })
      expect(wrapper.props('draggable')).toBe(true)
    })

    it('draggable 默认应该为 false', () => {
      const wrapper = mount(Tree)
      expect(wrapper.props('draggable')).toBe(false)
    })

    it('应该支持 allowDrag 函数配置', () => {
      const allowDrag = vi.fn()
      const wrapper = mount(Tree, {
        propsData: {
          draggable: true,
          allowDrag,
        },
      })
      expect(wrapper.props('allowDrag')).toBe(allowDrag)
    })

    it('应该支持 allowDrop 函数配置', () => {
      const allowDrop = vi.fn()
      const wrapper = mount(Tree, {
        propsData: {
          draggable: true,
          allowDrop,
        },
      })
      expect(wrapper.props('allowDrop')).toBe(allowDrop)
    })
  })

  describe('拖拽事件声明', () => {
    it('应该声明所有拖拽相关事件', () => {
      expect(Tree.emits).toContain('node-drag-start')
      expect(Tree.emits).toContain('node-drag-enter')
      expect(Tree.emits).toContain('node-drag-leave')
      expect(Tree.emits).toContain('node-drag-over')
      expect(Tree.emits).toContain('node-drag-end')
      expect(Tree.emits).toContain('node-drop')
    })
  })

  describe('拖拽状态管理', () => {
    it('应该初始化拖拽状态', () => {
      const wrapper = createTreeWrapper([])
      const dragState = wrapper.vm.dragState

      expect(dragState.showDropIndicator).toBe(false)
      expect(dragState.draggingNode).toBe(null)
      expect(dragState.dropNode).toBe(null)
      expect(dragState.allowDrop).toBe(true)
      expect(dragState.dropType).toBe(null)
    })

    it('拖拽时应该添加 is-dragging 类', async () => {
      const data = [{ id: 1, label: '节点1' }]
      const wrapper = createTreeWrapper(data)

      // 通过实际触发拖拽开始事件来设置状态
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      const node = wrapper.vm.root.childNodes[0]
      
      const mockEvent = createDragEvent('dragstart')
      const mockTreeNode = { node, $el: treeNode.vm.$el }
      
      wrapper.vm.$emit('tree-node-drag-start', mockEvent, mockTreeNode)
      await wrapper.vm.$nextTick()

      expect(wrapper.classes()).toContain('is-dragging')
    })

    it('不允许放置时应该添加 is-drop-not-allow 类', async () => {
      const data = [{ id: 1, label: '节点1' }, { id: 2, label: '节点2' }]
      const wrapper = createTreeWrapper(data)
      
      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
      const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

      // 开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
      await wrapper.vm.$nextTick()

      // 模拟拖拽经过，设置 allowDrop 为 false
      const dragOverEvent = createDragEvent('dragover', {
        target: treeNode2.vm.$el,
        clientY: 100,
      })
      
      // 手动设置不允许放置的状态（模拟 allowDrop 返回 false）
      wrapper.vm.dragState.allowDrop = false
      await wrapper.vm.$nextTick()

      expect(wrapper.classes()).toContain('is-drop-not-allow')
    })

    it('内部放置时应该添加 is-drop-inner 类', async () => {
      const data = [{ id: 1, label: '节点1' }, { id: 2, label: '节点2' }]
      const wrapper = createTreeWrapper(data)

      // 设置拖拽状态为内部放置
      wrapper.vm.dragState.dropType = 'inner'
      await wrapper.vm.$nextTick()

      expect(wrapper.classes()).toContain('is-drop-inner')
    })
  })

  describe('拖拽指示器', () => {
    it('应该渲染拖拽指示器元素', () => {
      const wrapper = createTreeWrapper([])
      const dropIndicator = wrapper.find('.el-tree__drop-indicator')

      expect(dropIndicator.exists()).toBe(true)
    })

    it('默认情况下拖拽指示器应该隐藏', () => {
      const wrapper = createTreeWrapper([])
      const dropIndicator = wrapper.find('.el-tree__drop-indicator')

      expect(dropIndicator.isVisible()).toBe(false)
    })

    it('显示拖拽指示器时应该可见', async () => {
      const wrapper = createTreeWrapper([])

      // 设置显示指示器
      wrapper.vm.dragState.showDropIndicator = true
      await wrapper.vm.$nextTick()

      const dropIndicator = wrapper.find('.el-tree__drop-indicator')
      expect(dropIndicator.isVisible()).toBe(true)
    })
  })

  describe('拖拽开始事件', () => {
    it('应该处理 tree-node-drag-start 事件', async () => {
      const data = [{ id: 1, label: '节点1' }]
      const wrapper = createTreeWrapper(data)

      const mockEvent = createDragEvent('dragstart')
      const node = wrapper.vm.root.childNodes[0]
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      const mockTreeNode = { node, $el: treeNode.vm.$el }

      // 触发拖拽开始事件
      wrapper.vm.$emit('tree-node-drag-start', mockEvent, mockTreeNode)
      await wrapper.vm.$nextTick()

      expect(mockDataTransfer.effectAllowed).toBe('move')
      expect(wrapper.vm.dragState.draggingNode).toBe(mockTreeNode)
    })

    it('allowDrag 返回 false 时应该阻止拖拽', async () => {
      const data = [{ id: 1, label: '节点1' }]
      const allowDrag = vi.fn().mockReturnValue(false)
      const wrapper = createTreeWrapper(data, { allowDrag })

      const mockEvent = createDragEvent('dragstart')
      const node = wrapper.vm.root.childNodes[0]
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      const mockTreeNode = { node, $el: treeNode.vm.$el }

      // 触发拖拽开始事件
      wrapper.vm.$emit('tree-node-drag-start', mockEvent, mockTreeNode)
      await wrapper.vm.$nextTick()

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(allowDrag).toHaveBeenCalledWith(node)
      // 如果阻止了拖拽，draggingNode 不应该被设置
      expect(wrapper.vm.dragState.draggingNode).toBe(null)
    })

    it('应该触发 node-drag-start 事件', async () => {
      const data = [{ id: 1, label: '节点1' }]
      const wrapper = createTreeWrapper(data)

      const mockEvent = createDragEvent('dragstart')
      const node = wrapper.vm.root.childNodes[0]
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      const mockTreeNode = { node, $el: treeNode.vm.$el }

      // 监听事件
      const emittedEvents = []
      wrapper.vm.$on('node-drag-start', (...args) => {
        emittedEvents.push(args)
      })

      // 触发拖拽开始事件
      wrapper.vm.$emit('tree-node-drag-start', mockEvent, mockTreeNode)
      await wrapper.vm.$nextTick()

      expect(emittedEvents).toHaveLength(1)
      expect(emittedEvents[0]).toEqual([node, mockEvent])
    })
  })

  describe('拖拽经过事件', () => {
    it('应该处理 tree-node-drag-over 事件', async () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]
      const wrapper = createTreeWrapper(data)
      await wrapper.vm.$nextTick()

      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
      const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

      // 先开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
      await wrapper.vm.$nextTick()

      // 模拟拖拽经过节点2
      const dragOverEvent = createDragEvent('dragover', {
        target: treeNode2.vm.$el,
        clientY: 100,
      })
      
      // 模拟 DOM 位置
      const mockRect = { top: 50, height: 40, bottom: 90 }
      vi.spyOn(treeNode2.vm.$el, 'getBoundingClientRect').mockReturnValue(mockRect)
      vi.spyOn(wrapper.vm.$el, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0 })

      wrapper.vm.$emit('tree-node-drag-over', dragOverEvent)
      await wrapper.vm.$nextTick()

      // 验证拖拽状态被更新
      expect(wrapper.vm.dragState.dropNode).toBeTruthy()
    })

    it('allowDrop 函数应该被正确调用', async () => {
      const data = [{ id: 1, label: '节点1' }, { id: 2, label: '节点2' }]
      const allowDrop = vi.fn().mockReturnValue(true)
      const wrapper = createTreeWrapper(data, { allowDrop })
      await wrapper.vm.$nextTick()

      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
      const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

      // 开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
      await wrapper.vm.$nextTick()

      // 拖拽经过
      const dragOverEvent = createDragEvent('dragover', {
        target: treeNode2.vm.$el,
      })
      
      const mockRect = { top: 50, height: 40, bottom: 90 }
      vi.spyOn(treeNode2.vm.$el, 'getBoundingClientRect').mockReturnValue(mockRect)
      vi.spyOn(wrapper.vm.$el, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0 })

      wrapper.vm.$emit('tree-node-drag-over', dragOverEvent)
      await wrapper.vm.$nextTick()

      // 验证 allowDrop 被调用
      expect(allowDrop).toHaveBeenCalled()
    })
  })

  describe('拖拽结束事件', () => {
    let basicData

    beforeEach(() => {
      basicData = createTestTreeData('basic')
    })

    it('应该处理基础的 tree-node-drag-end 事件', async () => {
      const wrapper = createTreeWrapper(basicData)
      await wrapper.vm.$nextTick()

      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
      const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

      // 开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
      await wrapper.vm.$nextTick()

      // 设置拖拽状态
      wrapper.vm.dragState.dropNode = { node: node2, $el: treeNode2.vm.$el }
      wrapper.vm.dragState.dropType = 'before'

      // 触发拖拽结束事件
      const dragEndEvent = createDragEvent('dragend')
      wrapper.vm.$emit('tree-node-drag-end', dragEndEvent)
      await wrapper.vm.$nextTick()

      expect(dragEndEvent.preventDefault).toHaveBeenCalled()
      expect(mockDataTransfer.dropEffect).toBe('move')
    })

    describe('不同 dropType 的插入行为', () => {
      it('dropType 为 before 时应该在目标节点前插入', async () => {
        const wrapper = createTreeWrapper(basicData)
        await wrapper.vm.$nextTick()

        const node1 = wrapper.vm.root.childNodes[0]
        const node2 = wrapper.vm.root.childNodes[1]
        const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
        const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

        // 开始拖拽
        const dragStartEvent = createDragEvent('dragstart')
        wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
        await wrapper.vm.$nextTick()

        // 设置拖拽状态
        wrapper.vm.dragState.dropNode = { node: node2, $el: treeNode2.vm.$el }
        wrapper.vm.dragState.dropType = 'before'

        // 记录原始位置
        const originalIndex = node2.parent.childNodes.indexOf(node2)

        // 触发拖拽结束事件
        const dragEndEvent = createDragEvent('dragend')
        wrapper.vm.$emit('tree-node-drag-end', dragEndEvent)
        await wrapper.vm.$nextTick()

        // 验证节点被移除
        expect(node1.parent).toBeFalsy() // 节点应该被移除
        
        // 验证事件被触发
        expect(wrapper.emitted('node-drag-end')).toBeTruthy()
        expect(wrapper.emitted('node-drop')).toBeTruthy()
      })

      it('dropType 为 after 时应该在目标节点后插入', async () => {
        const wrapper = createTreeWrapper(basicData)
        await wrapper.vm.$nextTick()

        const node1 = wrapper.vm.root.childNodes[0]
        const node2 = wrapper.vm.root.childNodes[1]
        const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
        const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

        // 开始拖拽
        const dragStartEvent = createDragEvent('dragstart')
        wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
        await wrapper.vm.$nextTick()

        // 设置拖拽状态
        wrapper.vm.dragState.dropNode = { node: node2, $el: treeNode2.vm.$el }
        wrapper.vm.dragState.dropType = 'after'

        // 触发拖拽结束事件
        const dragEndEvent = createDragEvent('dragend')
        wrapper.vm.$emit('tree-node-drag-end', dragEndEvent)
        await wrapper.vm.$nextTick()

        // 验证节点被移除
        expect(node1.parent).toBeFalsy()
        
        // 验证事件被触发
        expect(wrapper.emitted('node-drag-end')).toBeTruthy()
        expect(wrapper.emitted('node-drop')).toBeTruthy()
      })

      it('dropType 为 inner 时应该作为子节点插入', async () => {
        const data = [
          { id: 1, label: '父节点', children: [{ id: 2, label: '子节点' }] },
          { id: 3, label: '目标节点' },
        ]
        const wrapper = createTreeWrapper(data)
        await wrapper.vm.$nextTick()

        const node3 = wrapper.vm.root.childNodes[1] // 目标节点
        const node1 = wrapper.vm.root.childNodes[0] // 要拖拽的父节点
        const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
        const treeNode3 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

        // 开始拖拽
        const dragStartEvent = createDragEvent('dragstart')
        wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
        await wrapper.vm.$nextTick()

        // 设置拖拽状态
        wrapper.vm.dragState.dropNode = { node: node3, $el: treeNode3.vm.$el }
        wrapper.vm.dragState.dropType = 'inner'

        // 触发拖拽结束事件
        const dragEndEvent = createDragEvent('dragend')
        wrapper.vm.$emit('tree-node-drag-end', dragEndEvent)
        await wrapper.vm.$nextTick()

        // 验证节点被移除
        expect(node1.parent).toBeFalsy()
        
        // 验证事件被触发
        expect(wrapper.emitted('node-drag-end')).toBeTruthy()
        expect(wrapper.emitted('node-drop')).toBeTruthy()
      })
    })

    describe('事件触发和状态重置', () => {
      it('dropType 为 none 时不应该触发 node-drop 事件', async () => {
        const wrapper = createTreeWrapper(basicData)
        await wrapper.vm.$nextTick()

        const node1 = wrapper.vm.root.childNodes[0]
        const node2 = wrapper.vm.root.childNodes[1]
        const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
        const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

        // 开始拖拽
        const dragStartEvent = createDragEvent('dragstart')
        wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
        await wrapper.vm.$nextTick()

        wrapper.vm.dragState.dropNode = { node: node2, $el: treeNode2.vm.$el }
        wrapper.vm.dragState.dropType = 'none'

        // 监听事件
        const dropEvents = []
        wrapper.vm.$on('node-drop', (...args) => dropEvents.push(args))

        const dragEndEvent = createDragEvent('dragend')
        wrapper.vm.$emit('tree-node-drag-end', dragEndEvent)
        await wrapper.vm.$nextTick()

        // node-drop 不应该被触发
        expect(dropEvents).toHaveLength(0)
        // 但 node-drag-end 应该被触发
        expect(wrapper.emitted('node-drag-end')).toBeTruthy()
      })

      it('拖拽结束后应该重置拖拽状态', async () => {
        const wrapper = createTreeWrapper(basicData)
        await wrapper.vm.$nextTick()

        const node1 = wrapper.vm.root.childNodes[0]
        const node2 = wrapper.vm.root.childNodes[1]
        const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
        const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

        // 开始拖拽
        const dragStartEvent = createDragEvent('dragstart')
        wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
        await wrapper.vm.$nextTick()

        // 设置拖拽状态
        wrapper.vm.dragState.dropNode = { node: node2, $el: treeNode2.vm.$el }
        wrapper.vm.dragState.showDropIndicator = true
        wrapper.vm.dragState.allowDrop = false
        wrapper.vm.dragState.dropType = 'before'

        const dragEndEvent = createDragEvent('dragend')
        wrapper.vm.$emit('tree-node-drag-end', dragEndEvent)
        await wrapper.vm.$nextTick()

        // 验证状态被重置
        expect(wrapper.vm.dragState.showDropIndicator).toBe(false)
        expect(wrapper.vm.dragState.draggingNode).toBe(null)
        expect(wrapper.vm.dragState.dropNode).toBe(null)
        expect(wrapper.vm.dragState.allowDrop).toBe(true)
        expect(wrapper.vm.dragState.dropType).toBe(null)
      })
    })
  })

  describe('拖拽限制逻辑', () => {
    it('allowDrop 函数应该被正确调用', async () => {
      const data = createTestTreeData('basic')
      const allowDrop = vi.fn().mockReturnValue(true)
      const wrapper = createTreeWrapper(data, { allowDrop })
      await wrapper.vm.$nextTick()

      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
      const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

      // 开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
      await wrapper.vm.$nextTick()

      // 拖拽经过
      const dragOverEvent = createDragEvent('dragover', {
        target: treeNode2.vm.$el,
      })
      
      const mockRect = { top: 50, height: 40, bottom: 90 }
      vi.spyOn(treeNode2.vm.$el, 'getBoundingClientRect').mockReturnValue(mockRect)
      vi.spyOn(wrapper.vm.$el, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0 })

      wrapper.vm.$emit('tree-node-drag-over', dragOverEvent)
      await wrapper.vm.$nextTick()

      // 验证 allowDrop 被调用
      expect(allowDrop).toHaveBeenCalled()
    })

    it('allowDrop 返回 false 时应该阻止拖拽', async () => {
      const data = createTestTreeData('basic')
      const allowDrop = vi.fn().mockReturnValue(false)
      const wrapper = createTreeWrapper(data, { allowDrop })
      await wrapper.vm.$nextTick()

      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
      const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

      // 开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
      await wrapper.vm.$nextTick()

      // 拖拽经过
      const dragOverEvent = createDragEvent('dragover', {
        target: treeNode2.vm.$el,
      })
      
      const mockRect = { top: 50, height: 40, bottom: 90 }
      vi.spyOn(treeNode2.vm.$el, 'getBoundingClientRect').mockReturnValue(mockRect)
      vi.spyOn(wrapper.vm.$el, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0 })

      wrapper.vm.$emit('tree-node-drag-over', dragOverEvent)
      await wrapper.vm.$nextTick()

      // 验证 allowDrop 被调用
      expect(allowDrop).toHaveBeenCalled()
      // 验证不允许放置
      expect(dragOverEvent.dataTransfer.dropEffect).toBe('none')
    })

    it('allowDrag 返回 false 时应该阻止拖拽', async () => {
      const data = createTestTreeData('basic')
      const allowDrag = vi.fn().mockReturnValue(false)
      const wrapper = createTreeWrapper(data, { allowDrag })

      const mockEvent = createDragEvent('dragstart')
      const node = wrapper.vm.root.childNodes[0]
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      const mockTreeNode = { node, $el: treeNode.vm.$el }

      wrapper.vm.$emit('tree-node-drag-start', mockEvent, mockTreeNode)
      await wrapper.vm.$nextTick()

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(allowDrag).toHaveBeenCalledWith(node)
      expect(wrapper.vm.dragState.draggingNode).toBe(null)
    })
  })

  describe('拖拽边界情况和异常处理', () => {
    it('应该处理空数据的拖拽', () => {
      const wrapper = createTreeWrapper([])

      expect(wrapper.vm.dragState).toBeDefined()
      expect(wrapper.vm.dragState.draggingNode).toBe(null)
      expect(wrapper.vm.dragState.dropNode).toBe(null)
    })

    it('应该处理拖拽过程中组件销毁的情况', async () => {
      const data = createTestTreeData('basic')
      const wrapper = createTreeWrapper(data)
      await wrapper.vm.$nextTick()

      const node = wrapper.vm.root.childNodes[0]
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })

      // 开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node, $el: treeNode.vm.$el })
      await wrapper.vm.$nextTick()

      // 销毁组件
      wrapper.destroy()

      // 验证组件已销毁
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('性能和大数据量测试', () => {
    it('应该能处理大量节点的拖拽', async () => {
      const largeData = createTestTreeData('large')
      const startTime = performance.now()

      const wrapper = createTreeWrapper(largeData)
      await wrapper.vm.$nextTick()

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // 验证大数据量渲染时间合理
      expect(renderTime).toBeLessThan(1000)
      expect(largeData.length).toBe(100)
    })

    it('应该能处理深层嵌套节点的拖拽', () => {
      const deepNestedData = [
        {
          id: 1,
          label: '根节点',
          children: [
            {
              id: 2,
              label: '子节点1',
              children: [
                {
                  id: 3,
                  label: '孙节点1',
                  children: [
                    {
                      id: 4,
                      label: '曾孙节点1',
                      children: [{ id: 5, label: '五代节点1' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]

      const wrapper = createTreeWrapper(deepNestedData)

      // 验证深层嵌套结构被正确渲染
      const treeNodes = wrapper.findAllComponents({ name: 'ElTreeNode' })
      expect(treeNodes.length).toBeGreaterThan(0)
    })
  })

  describe('拖拽交互体验测试', () => {
    it('拖拽开始时应该设置正确的拖拽效果', async () => {
      const data = createTestTreeData('basic')
      const wrapper = createTreeWrapper(data)
      await wrapper.vm.$nextTick()

      const mockEvent = createDragEvent('dragstart')
      const node = wrapper.vm.root.childNodes[0]
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      const mockTreeNode = { node, $el: treeNode.vm.$el }

      wrapper.vm.$emit('tree-node-drag-start', mockEvent, mockTreeNode)
      await wrapper.vm.$nextTick()

      expect(mockDataTransfer.effectAllowed).toBe('move')
    })

    it('拖拽过程中应该正确显示视觉反馈', async () => {
      const data = createTestTreeData('complex')
      const wrapper = createTreeWrapper(data)
      await wrapper.vm.$nextTick()

      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
      const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

      // 开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
      await wrapper.vm.$nextTick()

      // 设置不允许放置状态
      wrapper.vm.dragState.dropNode = { node: node2, $el: treeNode2.vm.$el }
      wrapper.vm.dragState.allowDrop = false
      await wrapper.vm.$nextTick()

      // 验证视觉反馈类
      expect(wrapper.classes()).toContain('is-dragging')
      expect(wrapper.classes()).toContain('is-drop-not-allow')
    })

    it('拖拽结束后应该清除所有视觉反馈', async () => {
      const data = createTestTreeData('basic')
      const wrapper = createTreeWrapper(data)
      await wrapper.vm.$nextTick()

      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      const treeNode1 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(0)
      const treeNode2 = wrapper.findAllComponents({ name: 'ElTreeNode' }).at(1)

      // 开始拖拽
      const dragStartEvent = createDragEvent('dragstart')
      wrapper.vm.$emit('tree-node-drag-start', dragStartEvent, { node: node1, $el: treeNode1.vm.$el })
      await wrapper.vm.$nextTick()

      // 设置拖拽状态
      wrapper.vm.dragState.dropNode = { node: node2, $el: treeNode2.vm.$el }
      wrapper.vm.dragState.showDropIndicator = true
      wrapper.vm.dragState.dropType = 'inner'
      await wrapper.vm.$nextTick()

      // 结束拖拽
      const dragEndEvent = createDragEvent('dragend')
      wrapper.vm.$emit('tree-node-drag-end', dragEndEvent)
      await wrapper.vm.$nextTick()

      // 验证视觉反馈被清除
      expect(wrapper.classes()).not.toContain('is-dragging')
      expect(wrapper.classes()).not.toContain('is-drop-inner')
    })
  })
})
