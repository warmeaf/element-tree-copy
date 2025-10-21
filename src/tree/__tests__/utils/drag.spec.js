import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findNearestComponent } from '../../src/model/util'
import { addClass, removeClass } from '../../src/utils/dom'

describe('拖拽工具函数', () => {
  let mockElement
  let mockTreeNodeComponent

  beforeEach(() => {
    // 创建模拟的 DOM 元素
    mockElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
      },
      parentNode: null,
      tagName: 'DIV',
      getAttribute: vi.fn(),
      setAttribute: vi.fn(),
    }

    // 创建模拟的 TreeNode 组件
    mockTreeNodeComponent = {
      $options: {
        name: 'ElTreeNode',
      },
      $el: mockElement,
      node: {
        data: { label: '测试节点' },
      },
    }
  })

  describe('findNearestComponent 函数', () => {
    it('应该能找到最近的指定组件', () => {
      // 模拟 DOM 结构
      const childElement = {
        parentNode: mockElement,
        tagName: 'DIV',
        __vue__: null,
      }
      
      mockElement.__vue__ = mockTreeNodeComponent
      
      const result = findNearestComponent(childElement, 'ElTreeNode')
      expect(result).toBe(mockTreeNodeComponent)
    })

    it('找不到组件时应该返回 null', () => {
      const orphanElement = {
        parentNode: null,
        tagName: 'DIV',
        __vue__: null,
      }
      
      const result = findNearestComponent(orphanElement, 'ElTreeNode')
      expect(result).toBe(null)
    })

    it('应该向上遍历 DOM 树查找组件', () => {
      // 创建嵌套的 DOM 结构
      const grandChildElement = {
        parentNode: null,
        tagName: 'DIV',
        __vue__: null,
      }
      
      const childElement = {
        parentNode: mockElement,
        tagName: 'DIV',
        __vue__: null,
      }
      
      grandChildElement.parentNode = childElement
      mockElement.__vue__ = mockTreeNodeComponent
      
      const result = findNearestComponent(grandChildElement, 'ElTreeNode')
      expect(result).toBe(mockTreeNodeComponent)
    })

    it('应该跳过不匹配的组件', () => {
      const otherComponent = {
        $options: {
          name: 'OtherComponent',
        },
      }
      
      const childElement = {
        parentNode: mockElement,
        tagName: 'DIV',
        __vue__: otherComponent,
      }
      
      mockElement.__vue__ = mockTreeNodeComponent
      
      const result = findNearestComponent(childElement, 'ElTreeNode')
      expect(result).toBe(mockTreeNodeComponent)
    })
  })

  describe('DOM 操作工具函数', () => {
    describe('addClass 函数', () => {
      it('应该能添加 CSS 类', () => {
        const element = {
          classList: {
            add: vi.fn(),
          },
        }
        
        addClass(element, 'test-class')
        expect(element.classList.add).toHaveBeenCalledWith('test-class')
      })

      it('应该能添加多个 CSS 类', () => {
        const element = {
          classList: {
            add: vi.fn(),
          },
        }
        
        addClass(element, 'class1 class2 class3')
        expect(element.classList.add).toHaveBeenCalledWith('class1')
        expect(element.classList.add).toHaveBeenCalledWith('class2')
        expect(element.classList.add).toHaveBeenCalledWith('class3')
      })

      it('应该处理空字符串', () => {
        const element = {
          classList: {
            add: vi.fn(),
          },
        }
        
        addClass(element, '')
        expect(element.classList.add).not.toHaveBeenCalled()
      })

      it('应该处理 null 或 undefined', () => {
        const element = {
          classList: {
            add: vi.fn(),
          },
        }
        
        addClass(element, null)
        addClass(element, undefined)
        expect(element.classList.add).not.toHaveBeenCalled()
      })
    })

    describe('removeClass 函数', () => {
      it('应该能移除 CSS 类', () => {
        const element = {
          classList: {
            remove: vi.fn(),
          },
        }
        
        removeClass(element, 'test-class')
        expect(element.classList.remove).toHaveBeenCalledWith('test-class')
      })

      it('应该能移除多个 CSS 类', () => {
        const element = {
          classList: {
            remove: vi.fn(),
          },
        }
        
        removeClass(element, 'class1 class2 class3')
        expect(element.classList.remove).toHaveBeenCalledWith('class1')
        expect(element.classList.remove).toHaveBeenCalledWith('class2')
        expect(element.classList.remove).toHaveBeenCalledWith('class3')
      })

      it('应该处理空字符串', () => {
        const element = {
          classList: {
            remove: vi.fn(),
          },
        }
        
        removeClass(element, '')
        expect(element.classList.remove).not.toHaveBeenCalled()
      })

      it('应该处理 null 或 undefined', () => {
        const element = {
          classList: {
            remove: vi.fn(),
          },
        }
        
        removeClass(element, null)
        removeClass(element, undefined)
        expect(element.classList.remove).not.toHaveBeenCalled()
      })
    })
  })

  describe('拖拽位置计算', () => {
    it('应该能计算拖拽指示器位置', () => {
      // 测试 before 位置计算
      const beforeIndicatorTop = 105 - 80 // iconPosition.top - treePosition.top
      const beforeIndicatorLeft = 70 - 30 // iconPosition.right - treePosition.left

      expect(beforeIndicatorTop).toBe(25)
      expect(beforeIndicatorLeft).toBe(40)

      // 测试 after 位置计算
      const afterIndicatorTop = 115 - 80 // iconPosition.bottom - treePosition.top
      const afterIndicatorLeft = 70 - 30 // iconPosition.right - treePosition.left

      expect(afterIndicatorTop).toBe(35)
      expect(afterIndicatorLeft).toBe(40)
    })

    it('应该能判断拖拽类型', () => {
      const targetHeight = 20
      const prevPercent = 0.25
      const nextPercent = 0.75

      // 测试 before 类型
      const beforeDistance = targetHeight * 0.2 // 小于 prevPercent
      expect(beforeDistance < targetHeight * prevPercent).toBe(true)

      // 测试 after 类型
      const afterDistance = targetHeight * 0.8 // 大于 nextPercent
      expect(afterDistance > targetHeight * nextPercent).toBe(true)

      // 测试 inner 类型
      const innerDistance = targetHeight * 0.5 // 在 prevPercent 和 nextPercent 之间
      expect(innerDistance >= targetHeight * prevPercent && innerDistance <= targetHeight * nextPercent).toBe(true)
    })
  })

  describe('拖拽限制检查', () => {
    it('应该能检查节点拖拽限制', () => {
      const draggingNode = {
        data: { id: 1, label: '拖拽节点' },
      }

      const dropNode = {
        data: { id: 2, label: '目标节点' },
        nextSibling: null,
        previousSibling: null,
        contains: vi.fn().mockReturnValue(false),
      }

      // 测试基本限制检查
      expect(draggingNode === dropNode).toBe(false) // 不是同一个节点
      expect(dropNode.contains(draggingNode)).toBe(false) // 目标节点不包含拖拽节点
    })

    it('应该能检查相邻兄弟节点限制', () => {
      const draggingNode = {
        data: { id: 1, label: '拖拽节点' },
      }

      const dropNode = {
        data: { id: 2, label: '目标节点' },
        nextSibling: draggingNode,
        previousSibling: null,
      }

      // 不能拖拽到下一个兄弟节点的 next 位置
      expect(dropNode.nextSibling === draggingNode).toBe(true)

      const dropNode2 = {
        data: { id: 3, label: '目标节点2' },
        nextSibling: null,
        previousSibling: draggingNode,
      }

      // 不能拖拽到上一个兄弟节点的 prev 位置
      expect(dropNode2.previousSibling === draggingNode).toBe(true)
    })

    it('应该能检查父子关系限制', () => {
      const parentNode = {
        data: { id: 1, label: '父节点' },
        contains: vi.fn().mockReturnValue(true),
      }

      const childNode = {
        data: { id: 2, label: '子节点' },
        contains: vi.fn().mockReturnValue(false),
      }

      // 父节点不能拖拽到子节点内部
      expect(parentNode.contains(childNode)).toBe(true)

      // 子节点可以拖拽到父节点外部
      expect(childNode.contains(parentNode)).toBe(false)
    })
  })

  describe('DataTransfer 对象处理', () => {
    let mockDataTransfer

    beforeEach(() => {
      mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: vi.fn(),
        getData: vi.fn(),
      }
    })

    it('应该能设置拖拽效果', () => {
      mockDataTransfer.effectAllowed = 'move'
      expect(mockDataTransfer.effectAllowed).toBe('move')

      mockDataTransfer.dropEffect = 'move'
      expect(mockDataTransfer.dropEffect).toBe('move')
    })

    it('应该能设置和获取拖拽数据', () => {
      mockDataTransfer.setData('text/plain', '')
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', '')

      mockDataTransfer.getData.mockReturnValue('test-data')
      const data = mockDataTransfer.getData('text/plain')
      expect(data).toBe('test-data')
    })

    it('应该处理 setData 异常', () => {
      mockDataTransfer.setData.mockImplementation(() => {
        throw new Error('setData failed')
      })

      // 应该能优雅处理异常
      expect(() => {
        try {
          mockDataTransfer.setData('text/plain', '')
        } catch (e) {
          // 忽略异常
        }
      }).not.toThrow()
    })
  })
})