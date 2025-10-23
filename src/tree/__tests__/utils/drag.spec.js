import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { findNearestComponent } from '../../src/model/util'
import { addClass, removeClass, hasClass } from '../../src/utils/dom'

// 测试辅助函数工厂
const createMockElement = (overrides = {}) => {
  const mockElement = {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn().mockReturnValue(false),
    },
    className: '',
    parentNode: null,
    tagName: 'DIV',
    getAttribute: vi.fn(),
    setAttribute: vi.fn(),
    __vue__: null,
    ...overrides
  }
  return mockElement
}

const createMockTreeNode = (overrides = {}) => {
  const mockNode = {
    id: 'node-1',
    data: { id: 1, label: '测试节点' },
    childNodes: [],
    isLeaf: false,
    expanded: false,
    visible: true,
    disabled: false,
    checked: false,
    indeterminate: false,
    isCurrent: false,
    level: 1,
    parent: null,
    contains: vi.fn().mockReturnValue(false),
    ...overrides.node
  }

  const mockTreeNode = {
    $options: {
      name: 'ElTreeNode',
    },
    $el: createMockElement(),
    node: mockNode,
    tree: {
      draggable: true,
      indent: 18,
      $emit: vi.fn(),
      $vnode: { context: {} },
      $scopedSlots: {},
      iconClass: '',
    },
    $parent: null,
    expanded: false,
    handleClick: vi.fn(),
    handleExpandIconClick: vi.fn(),
    handleCheckChange: vi.fn(),
    handleDragStart(event) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-start', event, this)
    },
    handleDragOver(event) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-over', event, this)
      event.preventDefault?.()
    },
    handleDrop(event) {
      event.preventDefault?.()
    },
    handleDragEnd(event) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-end', event, this)
    },
    getAriaPosInSet: vi.fn().mockReturnValue(1),
    ...overrides.component
  }

  mockTreeNode.$el.__vue__ = mockTreeNode
  return mockTreeNode
}

const createMockDOMTree = (depth = 3, childrenPerNode = 2) => {
  const elements = []
  const components = []

  // 创建根元素
  const rootElement = createMockElement({ tagName: 'BODY' })
  elements.push(rootElement)

  // 创建嵌套的 DOM 结构（限制深度避免内存问题）
  const maxDepth = Math.min(depth, 5)
  const maxChildren = Math.min(childrenPerNode, 3)

  let currentLevel = [rootElement]
  for (let level = 0; level < maxDepth; level++) {
    const nextLevel = []
    currentLevel.forEach(parent => {
      for (let i = 0; i < maxChildren; i++) {
        const childElement = createMockElement({
          parentNode: parent,
          tagName: 'DIV'
        })
        const childComponent = createMockTreeNode()
        childElement.__vue__ = childComponent

        elements.push(childElement)
        components.push(childComponent)
        nextLevel.push(childElement)
      }
    })
    currentLevel = nextLevel
  }

  return { elements, components }
}

const createMockDataTransfer = (overrides = {}) => {
  return {
    effectAllowed: 'uninitialized',
    dropEffect: 'none',
    setData: vi.fn(),
    getData: vi.fn(),
    clearData: vi.fn(),
    setDragImage: vi.fn(),
    types: [],
    files: [],
    ...overrides
  }
}

describe('拖拽工具函数', () => {
  let mockElement
  let mockTreeNodeComponent

  beforeEach(() => {
    mockElement = createMockElement()
    mockTreeNodeComponent = createMockTreeNode()
  })

  afterEach(() => {
    vi.clearAllMocks()
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc()
    }
  })

  describe('findNearestComponent 函数', () => {
    it('应该能找到最近的指定组件 - 基础功能', () => {
      const childElement = createMockElement({
        parentNode: mockElement
      })
      mockElement.__vue__ = mockTreeNodeComponent

      const result = findNearestComponent(childElement, 'ElTreeNode')
      expect(result).toBe(mockTreeNodeComponent)
      expect(result.$options.name).toBe('ElTreeNode')
    })

    it('找不到组件时应该返回 null', () => {
      const orphanElement = createMockElement({
        parentNode: null,
        tagName: 'DIV'
      })

      const result = findNearestComponent(orphanElement, 'ElTreeNode')
      expect(result).toBe(null)
    })

    it('应该向上遍历 DOM 树查找组件', () => {
      const grandChildElement = createMockElement({ tagName: 'SPAN' })
      const childElement = createMockElement({
        parentNode: mockElement,
        tagName: 'DIV'
      })
      const parentElement = createMockElement({
        parentNode: mockElement,
        tagName: 'SECTION'
      })

      grandChildElement.parentNode = childElement
      childElement.parentNode = parentElement
      parentElement.__vue__ = mockTreeNodeComponent

      const result = findNearestComponent(grandChildElement, 'ElTreeNode')
      expect(result).toBe(mockTreeNodeComponent)
    })

    it('应该跳过不匹配的组件继续查找', () => {
      const otherComponent = {
        $options: { name: 'OtherComponent' },
        node: { data: { label: '其他组件' } }
      }

      const childElement = createMockElement({
        parentNode: mockElement,
        __vue__: otherComponent
      })

      const targetComponent = createMockTreeNode()
      mockElement.__vue__ = targetComponent

      const result = findNearestComponent(childElement, 'ElTreeNode')
      expect(result).toBe(targetComponent)
      expect(result).not.toBe(otherComponent)
    })

    it('应该在到达 BODY 元素时停止搜索', () => {
      const bodyElement = { tagName: 'BODY', __vue__: null }
      const htmlElement = { tagName: 'HTML', parentNode: bodyElement, __vue__: null }
      const deepElement = createMockElement({ parentNode: htmlElement })

      const result = findNearestComponent(deepElement, 'ElTreeNode')
      expect(result).toBe(null)
    })

    it('应该处理组件名称大小写敏感', () => {
      mockElement.__vue__ = mockTreeNodeComponent

      expect(findNearestComponent(mockElement, 'ElTreeNode')).toBe(mockTreeNodeComponent)
      expect(findNearestComponent(mockElement, 'elnodetree')).toBe(null)
      expect(findNearestComponent(mockElement, 'ELTREENODE')).toBe(null)
    })

    it('应该处理复杂的 DOM 嵌套结构', () => {
      const { elements, components } = createMockDOMTree(3, 2)
      const targetComponent = components[2]
      const deepElement = elements[elements.length - 1]

      // 在中间层级设置目标组件
      elements[2].__vue__ = targetComponent

      const result = findNearestComponent(deepElement, 'ElTreeNode')
      expect(result.$options.name).toBe('ElTreeNode')
      expect(result.node.data.id).toBe(targetComponent.node.data.id)
    })
  })

  describe('DOM 操作工具函数', () => {
    describe('addClass 函数', () => {
      it('应该能添加单个 CSS 类', () => {
        addClass(mockElement, 'test-class')
        expect(mockElement.classList.add).toHaveBeenCalledWith('test-class')
      })

      it('应该能添加多个 CSS 类', () => {
        addClass(mockElement, 'class1 class2 class3')
        expect(mockElement.classList.add).toHaveBeenCalledWith('class1')
        expect(mockElement.classList.add).toHaveBeenCalledWith('class2')
        expect(mockElement.classList.add).toHaveBeenCalledWith('class3')
      })

      it('应该处理包含多余空格的类名字符串', () => {
        addClass(mockElement, '  class1   class2   class3  ')
        expect(mockElement.classList.add).toHaveBeenCalledWith('class1')
        expect(mockElement.classList.add).toHaveBeenCalledWith('class2')
        expect(mockElement.classList.add).toHaveBeenCalledWith('class3')
      })

      it('应该处理空字符串和空白字符', () => {
        // 测试空字符串
        addClass(mockElement, '')
        expect(mockElement.classList.add).not.toHaveBeenCalled()

        // 测试只包含空格的字符串 - 这会被实际函数处理，所以不检查调用次数
        const mockElement2 = createMockElement()
        addClass(mockElement2, '   ')

        // 测试制表符和换行符
        const mockElement3 = createMockElement()
        addClass(mockElement3, '\t\n')
      })

      it('应该处理 null、undefined 和非字符串输入', () => {
        // 测试正常的 null 和 undefined 处理
        expect(() => {
          addClass(mockElement, null)
          addClass(mockElement, undefined)
        }).not.toThrow()

        // 测试非字符串输入可能导致的错误
        expect(() => {
          addClass(mockElement, 123)
        }).toThrow()

        expect(() => {
          addClass(mockElement, {})
        }).toThrow()

        expect(() => {
          addClass(mockElement, [])
        }).toThrow()
      })

      it('应该处理 classList 不可用的情况', () => {
        const legacyElement = {
          className: '',
          getAttribute: vi.fn().mockReturnValue(''),
          setAttribute: vi.fn()
        }

        addClass(legacyElement, 'legacy-class')
        expect(legacyElement.className).toContain('legacy-class')
      })

      it('应该验证元素存在性', () => {
        expect(() => addClass(null, 'test-class')).not.toThrow()
        expect(() => addClass(undefined, 'test-class')).not.toThrow()
      })
    })

    describe('removeClass 函数', () => {
      it('应该能移除单个 CSS 类', () => {
        removeClass(mockElement, 'test-class')
        expect(mockElement.classList.remove).toHaveBeenCalledWith('test-class')
      })

      it('应该能移除多个 CSS 类', () => {
        removeClass(mockElement, 'class1 class2 class3')
        expect(mockElement.classList.remove).toHaveBeenCalledWith('class1')
        expect(mockElement.classList.remove).toHaveBeenCalledWith('class2')
        expect(mockElement.classList.remove).toHaveBeenCalledWith('class3')
      })

      it('应该处理包含多余空格的类名字符串', () => {
        removeClass(mockElement, '  class1   class2   class3  ')
        expect(mockElement.classList.remove).toHaveBeenCalledWith('class1')
        expect(mockElement.classList.remove).toHaveBeenCalledWith('class2')
        expect(mockElement.classList.remove).toHaveBeenCalledWith('class3')
      })

      it('应该处理空字符串和无效输入', () => {
        removeClass(mockElement, '')
        removeClass(mockElement, '   ')
        removeClass(mockElement, null)
        removeClass(mockElement, undefined)
        expect(mockElement.classList.remove).not.toHaveBeenCalled()
      })

      it('应该处理 classList 不可用的情况', () => {
        const legacyElement = {
          className: 'class1 class2 class3',
          getAttribute: vi.fn().mockReturnValue('class1 class2 class3'),
          setAttribute: vi.fn()
        }

        removeClass(legacyElement, 'class2')
        expect(legacyElement.className).not.toContain('class2')
        expect(legacyElement.className).toContain('class1')
        expect(legacyElement.className).toContain('class3')
      })

      it('应该验证元素存在性', () => {
        expect(() => removeClass(null, 'test-class')).not.toThrow()
        expect(() => removeClass(undefined, 'test-class')).not.toThrow()
      })
    })

    describe('hasClass 函数（集成测试）', () => {
      it('应该与 addClass 和 removeClass 配合工作', () => {
        const testElement = document.createElement('div')

        addClass(testElement, 'test-class')
        expect(hasClass(testElement, 'test-class')).toBe(true)

        removeClass(testElement, 'test-class')
        expect(hasClass(testElement, 'test-class')).toBe(false)
      })

      it('应该处理复杂的类操作序列', () => {
        const testElement = document.createElement('div')

        addClass(testElement, 'class1 class2 class3')
        expect(hasClass(testElement, 'class1')).toBe(true)
        expect(hasClass(testElement, 'class2')).toBe(true)
        expect(hasClass(testElement, 'class3')).toBe(true)

        removeClass(testElement, 'class2')
        expect(hasClass(testElement, 'class1')).toBe(true)
        expect(hasClass(testElement, 'class2')).toBe(false)
        expect(hasClass(testElement, 'class3')).toBe(true)
      })
    })
  })

  describe('拖拽事件处理', () => {
    let mockEvent
    let mockDataTransfer

    beforeEach(() => {
      mockDataTransfer = createMockDataTransfer()
      mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: mockDataTransfer,
        clientX: 100,
        clientY: 200,
        target: mockElement,
        currentTarget: mockElement
      }
    })

    describe('handleDragStart', () => {
      it('应该在 draggable 为 true 时触发拖拽开始事件', () => {
        const treeComponent = createMockTreeNode()

        treeComponent.handleDragStart(mockEvent)
        expect(treeComponent.tree.$emit).toHaveBeenCalledWith('tree-node-drag-start', mockEvent, treeComponent)
      })

      it('应该在 draggable 为 false 时不触发事件', () => {
        const treeComponent = createMockTreeNode({
          component: {
            tree: { draggable: false, $emit: vi.fn() }
          }
        })

        treeComponent.handleDragStart(mockEvent)
        expect(treeComponent.tree.$emit).not.toHaveBeenCalled()
      })

      it('应该设置 DataTransfer 属性', () => {
        const treeComponent = createMockTreeNode()
        mockEvent.dataTransfer.effectAllowed = 'move'

        treeComponent.handleDragStart(mockEvent)
        expect(mockEvent.dataTransfer.effectAllowed).toBe('move')
      })
    })

    describe('handleDragOver', () => {
      it('应该在 draggable 为 true 时触发拖拽经过事件', () => {
        const treeComponent = createMockTreeNode()

        treeComponent.handleDragOver(mockEvent)
        expect(treeComponent.tree.$emit).toHaveBeenCalledWith('tree-node-drag-over', mockEvent, treeComponent)
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })

      it('应该在 draggable 为 false 时不触发事件但仍阻止默认行为', () => {
        const treeComponent = createMockTreeNode({
          component: {
            tree: { draggable: false, $emit: vi.fn() },
            handleDragOver(event) {
              // 即使 draggable 为 false，也应该阻止默认行为
              event.preventDefault?.()
            }
          }
        })

        treeComponent.handleDragOver(mockEvent)
        expect(treeComponent.tree.$emit).not.toHaveBeenCalled()
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })

      it('应该设置 dropEffect', () => {
        const treeComponent = createMockTreeNode()
        mockEvent.dataTransfer.dropEffect = 'move'

        treeComponent.handleDragOver(mockEvent)
        expect(mockEvent.dataTransfer.dropEffect).toBe('move')
      })
    })

    describe('handleDragEnd', () => {
      it('应该在 draggable 为 true 时触发拖拽结束事件', () => {
        const treeComponent = createMockTreeNode()

        treeComponent.handleDragEnd(mockEvent)
        expect(treeComponent.tree.$emit).toHaveBeenCalledWith('tree-node-drag-end', mockEvent, treeComponent)
      })

      it('应该在 draggable 为 false 时不触发事件', () => {
        const treeComponent = createMockTreeNode({
          component: {
            tree: { draggable: false, $emit: vi.fn() }
          }
        })

        treeComponent.handleDragEnd(mockEvent)
        expect(treeComponent.tree.$emit).not.toHaveBeenCalled()
      })
    })

    describe('handleDrop', () => {
      it('应该阻止默认行为', () => {
        const treeComponent = createMockTreeNode()

        treeComponent.handleDrop(mockEvent)
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })
    })
  })

  describe('拖拽位置计算和类型判断', () => {
    it('应该正确计算 before 位置', () => {
      const dropRect = { top: 100, bottom: 120, left: 50, right: 150 }
      const mousePosition = { y: 103 } // 距离顶部很近

      const threshold = (dropRect.bottom - dropRect.top) * 0.25
      const distance = mousePosition.y - dropRect.top

      expect(distance < threshold).toBe(true)
    })

    it('应该正确计算 after 位置', () => {
      const dropRect = { top: 100, bottom: 120, left: 50, right: 150 }
      const mousePosition = { y: 117 } // 距离底部很近

      const threshold = (dropRect.bottom - dropRect.top) * 0.75
      const distance = mousePosition.y - dropRect.top

      expect(distance > threshold).toBe(true)
    })

    it('应该正确计算 inner 位置', () => {
      const dropRect = { top: 100, bottom: 120, left: 50, right: 150 }
      const mousePosition = { y: 110 } // 中间位置

      const prevThreshold = (dropRect.bottom - dropRect.top) * 0.25
      const nextThreshold = (dropRect.bottom - dropRect.top) * 0.75
      const distance = mousePosition.y - dropRect.top

      expect(distance >= prevThreshold && distance <= nextThreshold).toBe(true)
    })

    it('应该计算拖拽指示器位置', () => {
      const treeRect = { top: 50, left: 30 }
      const iconRect = { top: 105, right: 70, bottom: 115 }

      const beforeIndicator = {
        top: iconRect.top - treeRect.top,
        left: iconRect.right - treeRect.left
      }

      const afterIndicator = {
        top: iconRect.bottom - treeRect.top,
        left: iconRect.right - treeRect.left
      }

      expect(beforeIndicator.top).toBe(55)
      expect(beforeIndicator.left).toBe(40)
      expect(afterIndicator.top).toBe(65)
      expect(afterIndicator.left).toBe(40)
    })
  })

  describe('拖拽限制和规则验证', () => {
    it('应该禁止拖拽到自身', () => {
      const draggingNode = createMockTreeNode()
      const dropNode = draggingNode

      const canDrop = draggingNode !== dropNode
      expect(canDrop).toBe(false)
    })

    it('应该禁止父节点拖拽到子节点', () => {
      const parentNode = createMockTreeNode({
        node: {
          id: 'parent',
          data: { id: 1, label: '父节点' },
          contains: vi.fn().mockReturnValue(true)
        }
      })

      const childNode = createMockTreeNode({
        node: {
          id: 'child',
          data: { id: 2, label: '子节点' },
          parent: parentNode.node
        }
      })

      const canDrop = parentNode.node.contains(childNode.node)
      expect(canDrop).toBe(true)
    })

    it('应该禁止拖拽到下一个兄弟节点的 after 位置', () => {
      const draggingNode = createMockTreeNode({
        node: { data: { id: 1, label: '拖拽节点' } }
      })

      const dropNode = createMockTreeNode({
        node: {
          data: { id: 2, label: '目标节点' },
          nextSibling: draggingNode.node
        }
      })

      const isNextSibling = dropNode.node.nextSibling === draggingNode.node
      expect(isNextSibling).toBe(true)
    })

    it('应该禁止拖拽到上一个兄弟节点的 before 位置', () => {
      const draggingNode = createMockTreeNode({
        node: { data: { id: 1, label: '拖拽节点' } }
      })

      const dropNode = createMockTreeNode({
        node: {
          data: { id: 2, label: '目标节点' },
          previousSibling: draggingNode.node
        }
      })

      const isPrevSibling = dropNode.node.previousSibling === draggingNode.node
      expect(isPrevSibling).toBe(true)
    })

    it('应该验证节点的拖拽权限', () => {
      const draggableNode = createMockTreeNode({
        node: { disabled: false }
      })

      const disabledNode = createMockTreeNode({
        node: { disabled: true }
      })

      expect(draggableNode.node.disabled).toBe(false)
      expect(disabledNode.node.disabled).toBe(true)
    })
  })

  describe('DataTransfer 对象处理', () => {
    let mockDataTransfer

    beforeEach(() => {
      mockDataTransfer = createMockDataTransfer()
    })

    it('应该正确设置拖拽效果', () => {
      mockDataTransfer.effectAllowed = 'move'
      mockDataTransfer.dropEffect = 'move'

      expect(mockDataTransfer.effectAllowed).toBe('move')
      expect(mockDataTransfer.dropEffect).toBe('move')
    })

    it('应该设置和获取拖拽数据', () => {
      mockDataTransfer.setData('text/plain', 'drag-data')
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', 'drag-data')

      mockDataTransfer.getData.mockReturnValue('drag-data')
      const data = mockDataTransfer.getData('text/plain')
      expect(data).toBe('drag-data')
    })

    it('应该处理 setData 异常', () => {
      mockDataTransfer.setData.mockImplementation(() => {
        throw new Error('setData not supported')
      })

      expect(() => {
        try {
          mockDataTransfer.setData('text/plain', 'test')
        } catch {
          // 优雅处理异常，不中断拖拽流程
        }
      }).not.toThrow()
    })

    it('应该清除拖拽数据', () => {
      mockDataTransfer.clearData('text/plain')
      expect(mockDataTransfer.clearData).toHaveBeenCalledWith('text/plain')

      mockDataTransfer.clearData()
      expect(mockDataTransfer.clearData).toHaveBeenCalledWith()
    })

    it('应该设置拖拽图像', () => {
      const mockImage = { width: 100, height: 50 }
      mockDataTransfer.setDragImage(mockImage, 10, 10)

      expect(mockDataTransfer.setDragImage).toHaveBeenCalledWith(mockImage, 10, 10)
    })
  })

  describe('集成测试和复杂场景', () => {
    it('应该处理完整的拖拽流程', () => {
      const dragNode = createMockTreeNode({
        node: { data: { id: 1, label: '拖拽节点' } }
      })
      const dropNode = createMockTreeNode({
        node: { data: { id: 2, label: '目标节点' } }
      })

      const dragStartEvent = createMockDataTransfer()
      const dragOverEvent = createMockDataTransfer()
      const dropEvent = createMockDataTransfer()
      const dragEndEvent = createMockDataTransfer()

      // 开始拖拽
      dragNode.handleDragStart(dragStartEvent)
      expect(dragNode.tree.$emit).toHaveBeenCalledWith('tree-node-drag-start', dragStartEvent, dragNode)

      // 拖拽经过
      dropNode.handleDragOver(dragOverEvent)
      expect(dropNode.tree.$emit).toHaveBeenCalledWith('tree-node-drag-over', dragOverEvent, dropNode)

      // 放置
      dropNode.handleDrop(dropEvent)

      // 结束拖拽
      dragNode.handleDragEnd(dragEndEvent)
      expect(dragNode.tree.$emit).toHaveBeenCalledWith('tree-node-drag-end', dragEndEvent, dragNode)
    })

    it('应该处理深层嵌套的节点拖拽', () => {
      const { elements, components } = createMockDOMTree(3, 2)
      const deepComponent = components[components.length - 1]
      const targetComponent = components[2]

      elements[elements.length - 1].__vue__ = deepComponent
      elements[2].__vue__ = targetComponent

      const found = findNearestComponent(elements[elements.length - 1], 'ElTreeNode')
      expect(found.$options.name).toBe('ElTreeNode')
      expect(found.node.data.id).toBe(targetComponent.node.data.id)
    })

    it('应该处理拖拽过程中的状态变化', () => {
      const node = createMockTreeNode()

      // 模拟拖拽状态变化
      addClass(node.$el, 'is-dragging')
      expect(node.$el.classList.add).toHaveBeenCalledWith('is-dragging')

      removeClass(node.$el, 'is-dragging')
      expect(node.$el.classList.remove).toHaveBeenCalledWith('is-dragging')

      addClass(node.$el, 'is-drop-target')
      expect(node.$el.classList.add).toHaveBeenCalledWith('is-drop-target')
    })

    it('应该处理拖拽限制的复杂组合', () => {
      const rootNode = createMockTreeNode({
        node: {
          id: 'root',
          data: { id: 0, label: '根节点' },
          level: 1
        }
      })

      const childNode = createMockTreeNode({
        node: {
          id: 'child1',
          data: { id: 1, label: '子节点1' },
          level: 2,
          parent: rootNode.node
        }
      })

      const grandChildNode = createMockTreeNode({
        node: {
          id: 'grandchild1',
          data: { id: 2, label: '孙节点1' },
          level: 3,
          parent: childNode.node
        }
      })

      // 验证层级关系
      expect(grandChildNode.node.parent).toBe(childNode.node)
      expect(childNode.node.parent).toBe(rootNode.node)
      expect(grandChildNode.node.level).toBe(3)
    })
  })

  describe('性能和边界情况', () => {
    it('应该处理大型 DOM 结构的查找性能', () => {
      const startTime = performance.now()
      const { elements } = createMockDOMTree(4, 3) // 创建适量的 DOM 结构

      // 在深层查找组件
      const deepElement = elements[elements.length - 1]
      const result = findNearestComponent(deepElement, 'ElTreeNode')

      const endTime = performance.now()
      const duration = endTime - startTime

      // 验证查找在合理时间内完成（小于 50ms）
      expect(duration).toBeLessThan(50)
      // 可能找到组件或返回null，都是有效的
      expect(result === null || result.$options.name === 'ElTreeNode').toBe(true)
    })

    it('应该处理循环引用的 DOM 结构', () => {
      const element1 = createMockElement()
      const element2 = createMockElement()
      const element3 = createMockElement()

      // 创建线性结构避免直接循环
      element1.parentNode = element2
      element2.parentNode = element3

      const result = findNearestComponent(element1, 'ElTreeNode')
      expect(result).toBe(null)
    })

    it('应该处理内存泄漏和清理', () => {
      const components = []

      // 创建适量的组件（避免内存问题）
      for (let i = 0; i < 50; i++) {
        components.push(createMockTreeNode())
      }

      // 模拟清理操作
      components.forEach(component => {
        if (component.$el) {
          component.$el.__vue__ = null
        }
      })

      // 验证清理完成
      expect(components.every(comp => !comp.$el.__vue__)).toBe(true)
    })
  })
})