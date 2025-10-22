import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 组件 - 键盘导航功能', () => {
  let wrapper
  const testData = [
    {
      id: 1,
      label: '一级 1',
      children: [
        {
          id: 4,
          label: '二级 1-1',
          children: [
            {
              id: 9,
              label: '三级 1-1-1'
            },
            {
              id: 10,
              label: '三级 1-1-2'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      label: '一级 2',
      children: [
        {
          id: 5,
          label: '二级 2-1'
        },
        {
          id: 6,
          label: '二级 2-2'
        }
      ]
    },
    {
      id: 3,
      label: '一级 3',
      children: [
        {
          id: 7,
          label: '二级 3-1'
        },
        {
          id: 8,
          label: '二级 3-2'
        }
      ]
    }
  ]

  beforeEach(() => {
    wrapper = mount(Tree, {
      propsData: {
        data: testData,
        nodeKey: 'id',
        defaultExpandAll: true,
        keyboardFocus: true
      }
    })
  })

  describe('方向键导航', () => {
    it('应该能够处理向下箭头键导航', async () => {
      await wrapper.vm.$nextTick()
      
      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      expect(treeNodes.length).toBeGreaterThan(0)
      
      // 模拟第一个节点获得焦点
      const firstNode = treeNodes.at(0)
      firstNode.element.focus()
      
      // 模拟按下向下箭头键
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 40, // ArrowDown
        bubbles: true
      })
      
      const spy = vi.spyOn(keydownEvent, 'preventDefault')
      firstNode.element.dispatchEvent(keydownEvent)
      
      expect(spy).toHaveBeenCalled()
    })

    it('应该能够处理向上箭头键导航', async () => {
      await wrapper.vm.$nextTick()
      
      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      
      // 模拟第二个节点获得焦点
      const secondNode = treeNodes.at(1)
      secondNode.element.focus()
      
      // 模拟按下向上箭头键
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 38, // ArrowUp
        bubbles: true
      })
      
      const spy = vi.spyOn(keydownEvent, 'preventDefault')
      secondNode.element.dispatchEvent(keydownEvent)
      
      expect(spy).toHaveBeenCalled()
    })

    it('应该在到达边界时循环导航', async () => {
      await wrapper.vm.$nextTick()

      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      const lastNode = treeNodes.at(treeNodes.length - 1)
      const firstNode = treeNodes.at(0)

      // 模拟最后一个节点获得焦点
      lastNode.element.focus()

      // 模拟焦点状态
      Object.defineProperty(document, 'activeElement', {
        value: lastNode.element,
        writable: true
      })

      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 40, // ArrowDown
        bubbles: true
      })

      // 监听焦点变化
      let _focusedElement = null
      firstNode.element.focus = vi.fn(() => {
        _focusedElement = firstNode.element
        Object.defineProperty(document, 'activeElement', {
          value: firstNode.element,
          writable: true
        })
      })

      lastNode.element.dispatchEvent(keydownEvent)
      await wrapper.vm.$nextTick()

      // 验证焦点被设置到第一个节点
      expect(firstNode.element.focus).toHaveBeenCalled()
      expect(document.activeElement).toBe(firstNode.element)
    })
  })

  describe('左右箭头键控制展开收起', () => {
    it('应该能够处理左箭头键', async () => {
      await wrapper.vm.$nextTick()
      
      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      const firstNode = treeNodes.at(0)
      
      // 模拟点击事件的spy
      const clickSpy = vi.spyOn(firstNode.element, 'click')
      
      // 模拟按下左箭头键
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 37, // ArrowLeft
        bubbles: true
      })
      
      const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault')
      firstNode.element.dispatchEvent(keydownEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该能够处理右箭头键', async () => {
      await wrapper.vm.$nextTick()
      
      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      const firstNode = treeNodes.at(0)
      
      // 模拟点击事件的spy
      const clickSpy = vi.spyOn(firstNode.element, 'click')
      
      // 模拟按下右箭头键
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 39, // ArrowRight
        bubbles: true
      })
      
      const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault')
      firstNode.element.dispatchEvent(keydownEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('Enter和Space键操作复选框', () => {
    beforeEach(() => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          defaultExpandAll: true,
          showCheckbox: true,
          keyboardFocus: true
        }
      })
    })

    it('应该能够处理Enter键操作复选框', async () => {
      await wrapper.vm.$nextTick()
      
      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      const firstNode = treeNodes.at(0)
      const checkbox = firstNode.find('input[type="checkbox"]')
      
      expect(checkbox.exists()).toBe(true)
      
      // 模拟复选框点击事件的spy
      const clickSpy = vi.spyOn(checkbox.element, 'click')
      
      // 模拟按下Enter键
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 13, // Enter
        bubbles: true
      })
      
      const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault')
      firstNode.element.dispatchEvent(keydownEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该能够处理Space键操作复选框', async () => {
      await wrapper.vm.$nextTick()
      
      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      const firstNode = treeNodes.at(0)
      const checkbox = firstNode.find('input[type="checkbox"]')
      
      expect(checkbox.exists()).toBe(true)
      
      // 模拟复选框点击事件的spy
      const clickSpy = vi.spyOn(checkbox.element, 'click')
      
      // 模拟按下Space键
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 32, // Space
        bubbles: true
      })
      
      const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault')
      firstNode.element.dispatchEvent(keydownEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })

    it('在没有复选框的节点上不应该响应Enter和Space键', async () => {
      // 重新挂载不带复选框的树
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          defaultExpandAll: true,
          showCheckbox: false,
          keyboardFocus: true
        }
      })
      
      await wrapper.vm.$nextTick()
      
      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      const firstNode = treeNodes.at(0)
      
      // 确认没有复选框
      const checkbox = firstNode.find('input[type="checkbox"]')
      expect(checkbox.exists()).toBe(false)
      
      // 模拟按下Enter键
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 13, // Enter
        bubbles: true
      })
      
      const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault')
      firstNode.element.dispatchEvent(keydownEvent)
      
      // 不应该阻止默认行为，因为没有复选框
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })

  describe('键盘事件处理器', () => {
    it('应该正确识别树节点元素', async () => {
      await wrapper.vm.$nextTick()
      
      // 模拟在非树节点元素上的键盘事件
      const nonTreeElement = document.createElement('div')
      nonTreeElement.className = 'other-element'
      
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 40,
        bubbles: true
      })
      
      Object.defineProperty(keydownEvent, 'target', {
        value: nonTreeElement,
        enumerable: true
      })
      
      const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault')
      
      // 手动调用handleKeydown方法
      wrapper.vm.handleKeydown(keydownEvent)
      
      // 不应该处理非树节点的事件
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('应该更新treeItems列表', async () => {
      await wrapper.vm.$nextTick()
      
      const initialTreeItems = wrapper.vm.treeItems
      expect(initialTreeItems).toBeTruthy()
      
      // 模拟键盘事件触发treeItems更新
      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      const firstNode = treeNodes.at(0)
      
      const keydownEvent = new KeyboardEvent('keydown', {
        keyCode: 40,
        bubbles: true
      })
      
      firstNode.element.dispatchEvent(keydownEvent)
      
      // treeItems应该被更新
      expect(wrapper.vm.treeItems).toBeTruthy()
    })
  })

  describe('键盘导航集成测试', () => {
    it('应该能够完整地进行键盘导航流程', async () => {
      await wrapper.vm.$nextTick()

      const treeNodes = wrapper.findAll('.is-focusable[role=treeitem]')
      const firstNode = treeNodes.at(0)
      const secondNode = treeNodes.at(1)

      // 1. 聚焦第一个节点
      firstNode.element.focus()

      // 模拟焦点状态
      Object.defineProperty(document, 'activeElement', {
        value: firstNode.element,
        writable: true
      })

      expect(document.activeElement).toBe(firstNode.element)

      // 2. 按向下箭头键导航到下一个节点
      const downEvent = new KeyboardEvent('keydown', {
        keyCode: 40,
        bubbles: true
      })

      // 监听第二个节点的焦点变化
      secondNode.element.focus = vi.fn(() => {
        Object.defineProperty(document, 'activeElement', {
          value: secondNode.element,
          writable: true
        })
      })

      firstNode.element.dispatchEvent(downEvent)
      await wrapper.vm.$nextTick()

      // 3. 按右箭头键展开节点
      const rightEvent = new KeyboardEvent('keydown', {
        keyCode: 39,
        bubbles: true
      })
      const clickSpy = vi.spyOn(firstNode.element, 'click')
      firstNode.element.dispatchEvent(rightEvent)

      expect(clickSpy).toHaveBeenCalled()
      expect(secondNode.element.focus).toHaveBeenCalled()
    })
  })
})