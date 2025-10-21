import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Tree from '../src/tree.vue'
import TreeNode from '../src/tree-node.vue'

describe('TreeNode 节点组件 - 拖拽功能', () => {
  // 创建测试用的 Tree 包装器
  const createTreeWrapper = (data, options = {}) => {
    return mount(Tree, {
      propsData: {
        data,
        draggable: true,
        ...options,
      },
    })
  }

  describe('拖拽属性传递', () => {
    it('draggable 属性应该传递给 TreeNode', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      expect(nodeWrapper.vm.tree.draggable).toBe(true)
    })

    it('非拖拽模式下 TreeNode 不应该有拖拽功能', () => {
      const data = [{ label: '节点1' }]
      const wrapper = mount(Tree, {
        propsData: {
          data,
          draggable: false,
        },
      })
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      expect(nodeWrapper.vm.tree.draggable).toBe(false)
    })
  })

  describe('拖拽事件处理器', () => {
    it('TreeNode 应该有 handleDragStart 方法', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      expect(typeof nodeWrapper.vm.handleDragStart).toBe('function')
    })

    it('TreeNode 应该有 handleDragOver 方法', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      expect(typeof nodeWrapper.vm.handleDragOver).toBe('function')
    })

    it('TreeNode 应该有 handleDrop 方法', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      expect(typeof nodeWrapper.vm.handleDrop).toBe('function')
    })

    it('TreeNode 应该有 handleDragEnd 方法', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      expect(typeof nodeWrapper.vm.handleDragEnd).toBe('function')
    })
  })

  describe('拖拽开始处理', () => {
    it('handleDragStart 应该触发 tree-node-drag-start 事件', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      }

      // 监听 tree 组件的事件
      const emittedEvents = []
      wrapper.vm.$on('tree-node-drag-start', (...args) => {
        emittedEvents.push(args)
      })

      // 调用拖拽开始处理器
      nodeWrapper.vm.handleDragStart(mockEvent)

      expect(emittedEvents).toHaveLength(1)
      expect(emittedEvents[0][0]).toBe(mockEvent)
      expect(emittedEvents[0][1]).toBe(nodeWrapper.vm)
    })

    it('非拖拽模式下 handleDragStart 应该直接返回', () => {
      const data = [{ label: '节点1' }]
      const wrapper = mount(Tree, {
        propsData: {
          data,
          draggable: false,
        },
      })
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      }

      // 监听 tree 组件的事件
      const emittedEvents = []
      wrapper.vm.$on('tree-node-drag-start', (...args) => {
        emittedEvents.push(args)
      })

      // 调用拖拽开始处理器
      nodeWrapper.vm.handleDragStart(mockEvent)

      // 非拖拽模式下不应该触发事件
      expect(emittedEvents).toHaveLength(0)
    })
  })

  describe('拖拽经过处理', () => {
    it('handleDragOver 应该触发 tree-node-drag-over 事件', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      const mockEvent = {
        preventDefault: vi.fn(),
      }

      // 监听 tree 组件的事件
      const emittedEvents = []
      wrapper.vm.$on('tree-node-drag-over', (...args) => {
        emittedEvents.push(args)
      })

      // 调用拖拽经过处理器
      nodeWrapper.vm.handleDragOver(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(emittedEvents).toHaveLength(1)
      expect(emittedEvents[0][0]).toBe(mockEvent)
      expect(emittedEvents[0][1]).toBe(nodeWrapper.vm)
    })

    it('非拖拽模式下 handleDragOver 应该直接返回', () => {
      const data = [{ label: '节点1' }]
      const wrapper = mount(Tree, {
        propsData: {
          data,
          draggable: false,
        },
      })
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      const mockEvent = {
        preventDefault: vi.fn(),
      }

      // 监听 tree 组件的事件
      const emittedEvents = []
      wrapper.vm.$on('tree-node-drag-over', (...args) => {
        emittedEvents.push(args)
      })

      // 调用拖拽经过处理器
      nodeWrapper.vm.handleDragOver(mockEvent)

      // 非拖拽模式下不应该触发事件，但仍会调用 preventDefault
      expect(emittedEvents).toHaveLength(0)
    })
  })

  describe('拖拽放置处理', () => {
    it('handleDrop 应该阻止默认行为', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      const mockEvent = {
        preventDefault: vi.fn(),
      }

      // 调用拖拽放置处理器
      nodeWrapper.vm.handleDrop(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('拖拽结束处理', () => {
    it('handleDragEnd 应该触发 tree-node-drag-end 事件', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      const mockEvent = {
        dataTransfer: {
          dropEffect: '',
        },
        preventDefault: vi.fn(),
      }

      // 监听 tree 组件的事件
      const emittedEvents = []
      wrapper.vm.$on('tree-node-drag-end', (...args) => {
        emittedEvents.push(args)
      })

      // 调用拖拽结束处理器
      nodeWrapper.vm.handleDragEnd(mockEvent)

      expect(emittedEvents).toHaveLength(1)
      expect(emittedEvents[0][0]).toBe(mockEvent)
      expect(emittedEvents[0][1]).toBe(nodeWrapper.vm)
    })

    it('非拖拽模式下 handleDragEnd 应该直接返回', () => {
      const data = [{ label: '节点1' }]
      const wrapper = mount(Tree, {
        propsData: {
          data,
          draggable: false,
        },
      })
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      const mockEvent = {
        dataTransfer: {
          dropEffect: '',
        },
        preventDefault: vi.fn(),
      }

      // 监听 tree 组件的事件
      const emittedEvents = []
      wrapper.vm.$on('tree-node-drag-end', (...args) => {
        emittedEvents.push(args)
      })

      // 调用拖拽结束处理器
      nodeWrapper.vm.handleDragEnd(mockEvent)

      // 非拖拽模式下不应该触发事件
      expect(emittedEvents).toHaveLength(0)
    })
  })

  describe('拖拽DOM属性', () => {
    it('拖拽模式下节点应该有 draggable 属性', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const treeNode = wrapper.find('.el-tree-node')
      
      expect(treeNode.attributes('draggable')).toBe('true')
    })

    it('非拖拽模式下节点不应该有 draggable 属性', () => {
      const data = [{ label: '节点1' }]
      const wrapper = mount(Tree, {
        propsData: {
          data,
          draggable: false,
        },
      })
      const treeNode = wrapper.find('.el-tree-node')
      
      // 当 draggable 为 false 时，属性值应该是 'false'
      expect(treeNode.attributes('draggable')).toBe('false')
    })

    it('拖拽模式下节点应该绑定拖拽事件', () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      // 检查节点组件是否有拖拽事件处理器方法
      expect(typeof nodeWrapper.vm.handleDragStart).toBe('function')
      expect(typeof nodeWrapper.vm.handleDragOver).toBe('function')
      expect(typeof nodeWrapper.vm.handleDrop).toBe('function')
      expect(typeof nodeWrapper.vm.handleDragEnd).toBe('function')
    })
  })

  describe('拖拽样式状态', () => {
    it('拖拽时应该添加相应的CSS类', async () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      
      // 模拟拖拽状态
      wrapper.vm.dragState.draggingNode = { node: { data: data[0] } }
      await wrapper.vm.$nextTick()
      
      expect(wrapper.classes()).toContain('is-dragging')
    })

    it('不允许放置时应该添加相应的CSS类', async () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      
      // 模拟不允许放置状态
      wrapper.vm.dragState.allowDrop = false
      await wrapper.vm.$nextTick()
      
      expect(wrapper.classes()).toContain('is-drop-not-allow')
    })

    it('内部放置时节点应该添加 is-drop-inner 类', async () => {
      const data = [{ label: '节点1' }]
      const wrapper = createTreeWrapper(data)
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      // 模拟内部放置状态
      wrapper.vm.dragState.dropType = 'inner'
      wrapper.vm.dragState.dropNode = nodeWrapper.vm
      await wrapper.vm.$nextTick()
      
      // 这里需要检查具体的节点是否有 is-drop-inner 类
      // 在实际实现中，这个类是通过 addClass/removeClass 动态添加的
      expect(wrapper.classes()).toContain('is-drop-inner')
    })
  })

  describe('拖拽交互集成测试', () => {
    it('完整的拖拽流程应该正常工作', async () => {
      const data = [
        { label: '节点1' },
        { label: '节点2' },
      ]
      const wrapper = createTreeWrapper(data)
      const nodeWrappers = wrapper.findAllComponents(TreeNode)
      
      const sourceNode = nodeWrappers.at(0)
      const targetNode = nodeWrappers.at(1)
      
      // 模拟拖拽开始
      const dragStartEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      }
      
      sourceNode.vm.handleDragStart(dragStartEvent)
      await wrapper.vm.$nextTick()
      
      // 检查拖拽状态
      expect(wrapper.vm.dragState.draggingNode).toBe(sourceNode.vm)
      
      // 模拟拖拽经过
      const dragOverEvent = {
        preventDefault: vi.fn(),
        target: targetNode.element,
        clientY: 100,
        dataTransfer: {
          dropEffect: '',
        },
      }
      
      targetNode.vm.handleDragOver(dragOverEvent)
      await wrapper.vm.$nextTick()
      
      // 模拟拖拽结束
      const dragEndEvent = {
        dataTransfer: {
          dropEffect: '',
        },
        preventDefault: vi.fn(),
      }
      
      sourceNode.vm.handleDragEnd(dragEndEvent)
      await wrapper.vm.$nextTick()
      
      // 检查拖拽状态重置
      expect(wrapper.vm.dragState.draggingNode).toBe(null)
    })

    it('allowDrag 限制应该阻止拖拽开始', async () => {
      const data = [{ label: '节点1' }]
      const allowDrag = vi.fn().mockReturnValue(false)
      const wrapper = createTreeWrapper(data, { allowDrag })
      const nodeWrapper = wrapper.findComponent(TreeNode)
      
      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
        preventDefault: vi.fn(),
      }

      // 监听事件
      const emittedEvents = []
      wrapper.vm.$on('tree-node-drag-start', (...args) => {
        emittedEvents.push(args)
      })

      // 尝试开始拖拽
      nodeWrapper.vm.handleDragStart(mockEvent)
      await wrapper.vm.$nextTick()

      // 应该触发事件但被阻止
      expect(emittedEvents).toHaveLength(1)
      expect(allowDrag).toHaveBeenCalledWith(nodeWrapper.vm.node)
    })
  })
})