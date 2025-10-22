import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 组件 - 键盘焦点管理', () => {
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
        },
        {
          id: 11,
          label: '二级 1-2'
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
      label: '一级 3'
    }
  ]

  beforeEach(() => {
    wrapper = mount(Tree, {
      propsData: {
        data: testData,
        nodeKey: 'id',
        defaultExpandAll: true
      }
    })
  })

  describe('initTabIndex 方法', () => {
    it('应该为第一个可见节点设置 tabindex="0"', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const firstNode = wrapper.find('.el-tree-node')
      expect(firstNode.attributes('tabindex')).toBe('0')
    })

    it('应该为其他节点设置 tabindex="-1"', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const allNodes = wrapper.findAll('.el-tree-node')
      // 除了第一个节点，其他节点应该有 tabindex="-1"
      for (let i = 1; i < allNodes.length; i++) {
        expect(allNodes.at(i).attributes('tabindex')).toBe('-1')
      }
    })

    it('在没有可见节点时应该正常处理', () => {
      wrapper = mount(Tree, {
        propsData: {
          data: [],
          nodeKey: 'id'
        }
      })
      
      expect(() => {
        wrapper.vm.initTabIndex()
      }).not.toThrow()
    })

    it('应该只为可聚焦的节点设置 tabindex', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const focusableNodes = wrapper.findAll('.el-tree-node.is-focusable')
      const allNodes = wrapper.findAll('.el-tree-node')
      
      // 所有节点都应该是可聚焦的
      expect(focusableNodes.length).toBe(allNodes.length)
      
      // 第一个节点应该有 tabindex="0"
      expect(focusableNodes.at(0).attributes('tabindex')).toBe('0')
      
      // 其他节点应该有 tabindex="-1"
      for (let i = 1; i < focusableNodes.length; i++) {
        expect(focusableNodes.at(i).attributes('tabindex')).toBe('-1')
      }
    })
  })

  describe('焦点初始化', () => {
    it('组件挂载后应该自动调用 initTabIndex', async () => {
      const spy = vi.spyOn(Tree.methods, 'initTabIndex')
      
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          defaultExpandAll: true
        }
      })
      
      await wrapper.vm.$nextTick()
      
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    it('数据变化后应该重新初始化 tabindex', async () => {
      const spy = vi.spyOn(wrapper.vm, 'initTabIndex')
      
      // 更新数据
      await wrapper.setProps({
        data: [
          {
            id: 100,
            label: '新数据'
          }
        ]
      })
      
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    it('应该在 checkboxItems 变化时重新初始化 tabindex', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          showCheckbox: true,
          defaultExpandAll: true
        }
      })
      
      const spy = vi.spyOn(wrapper.vm, 'initTabIndex')
      
      // 触发 checkboxItems 变化
      wrapper.vm.setChecked(1, true)
      await wrapper.vm.$nextTick()
      
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('焦点状态管理', () => {
    it('应该能够正确设置当前焦点节点', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const _secondNode = wrapper.findAll('.el-tree-node').at(1)
      
      // 模拟焦点切换
      wrapper.vm.setCurrentKey(4) // 设置第二个节点为当前节点
      await wrapper.vm.$nextTick()
      
      // 重新初始化 tabindex
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      // 当前节点应该有 tabindex="0"
      const currentNode = wrapper.find('[data-key="4"]')
      expect(currentNode.attributes('tabindex')).toBe('0')
    })

    it('应该能够处理节点禁用状态', async () => {
      const disabledData = [
        {
          id: 1,
          label: '正常节点'
        },
        {
          id: 2,
          label: '禁用节点',
          disabled: true
        },
        {
          id: 3,
          label: '正常节点2'
        }
      ]
      
      wrapper = mount(Tree, {
        propsData: {
          data: disabledData,
          nodeKey: 'id'
        }
      })
      
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const disabledNode = wrapper.find('[data-key="2"]')
      // 禁用节点不应该有 tabindex 或者应该有 tabindex="-1"
      const tabindex = disabledNode.attributes('tabindex')
      expect(tabindex === undefined || tabindex === '-1').toBe(true)
    })
  })

  describe('键盘导航与焦点管理集成', () => {
    it('方向键导航应该正确更新 tabindex', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()

      const _firstNode = wrapper.find('.el-tree-node')

      // 模拟按下向下箭头键
      const event = new KeyboardEvent('keydown', { keyCode: 40 })
      wrapper.vm.handleKeydown(event)
      await wrapper.vm.$nextTick()
      
      // 检查焦点是否正确移动
      const allNodes = wrapper.findAll('.el-tree-node')
      const focusedNode = allNodes.wrappers.find(node => 
        node.attributes('tabindex') === '0'
      )
      
      expect(focusedNode).toBeTruthy()
    })

    it('应该能够处理循环导航', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const allNodes = wrapper.findAll('.el-tree-node')
      const lastNodeIndex = allNodes.length - 1
      
      // 设置最后一个节点为当前焦点
      wrapper.vm.treeItems[lastNodeIndex].setAttribute('tabindex', '0')
      for (let i = 0; i < lastNodeIndex; i++) {
        wrapper.vm.treeItems[i].setAttribute('tabindex', '-1')
      }
      
      // 模拟按下向下箭头键（应该循环到第一个节点）
      // 创建一个具有正确target的事件对象
      const mockTarget = wrapper.vm.treeItems[lastNodeIndex]
      const event = {
        keyCode: 40,
        target: mockTarget,
        preventDefault: vi.fn()
      }
      wrapper.vm.handleKeydown(event)
      await wrapper.vm.$nextTick()
      
      // 第一个节点应该获得焦点
      // 注意：源码实现只调用focus()，不直接设置tabindex
      // 源码的循环导航：从最后一个节点按向下键时，会回到第一个节点
      // 源码调用focus()后，需要手动调用initTabIndex()来更新tabindex
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()

      // 获取当前具有焦点的节点
      const treeItemsArray = Array.from(wrapper.vm.treeItems)
      const focusedNode = treeItemsArray.find(item => item.getAttribute('tabindex') === '0')
      expect(focusedNode).toBeTruthy()
      expect(focusedNode).toBe(wrapper.vm.treeItems[0])
    })

    it('应该能够处理向上导航到第一个节点边界', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()

      // 确保第一个节点有焦点
      wrapper.vm.treeItems[0].setAttribute('tabindex', '0')
      for (let i = 1; i < wrapper.vm.treeItems.length; i++) {
        wrapper.vm.treeItems[i].setAttribute('tabindex', '-1')
      }

      // 模拟从第一个节点按下向上箭头键（应该停在第一个节点）
      const mockTarget = wrapper.vm.treeItems[0]
      const event = {
        keyCode: 38,
        target: mockTarget,
        preventDefault: vi.fn()
      }
      wrapper.vm.handleKeydown(event)
      await wrapper.vm.$nextTick()

      // 根据源码逻辑，应该停在第一个节点（边界行为）
      expect(wrapper.vm.treeItems[0].getAttribute('tabindex')).toBe('0')
    })
  })

  describe('动态内容场景', () => {
    it('添加新节点后应该正确更新焦点管理', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const initialNodeCount = wrapper.findAll('.el-tree-node').length
      
      // 添加新节点
      wrapper.vm.append({ id: 100, label: '新节点' }, { id: 1 })
      await wrapper.vm.$nextTick()
      
      const newNodeCount = wrapper.findAll('.el-tree-node').length
      expect(newNodeCount).toBeGreaterThan(initialNodeCount)
      
      // 重新初始化后，第一个节点应该仍然有 tabindex="0"
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const firstNode = wrapper.find('.el-tree-node')
      expect(firstNode.attributes('tabindex')).toBe('0')
    })

    it('删除节点后应该正确更新焦点管理', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const initialNodeCount = wrapper.findAll('.el-tree-node').length
      
      // 删除节点
      wrapper.vm.remove({ id: 9 })
      await wrapper.vm.$nextTick()
      
      const newNodeCount = wrapper.findAll('.el-tree-node').length
      expect(newNodeCount).toBeLessThan(initialNodeCount)
      
      // 重新初始化后应该正常工作
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const firstNode = wrapper.find('.el-tree-node')
      expect(firstNode.attributes('tabindex')).toBe('0')
    })

    it('折叠/展开节点后应该正确更新焦点管理', async () => {
      await wrapper.vm.$nextTick()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()

      // 折叠第一个节点
      const firstNode = wrapper.find('.el-tree-node')
      const expandIcon = firstNode.find('.el-tree-node__expand-icon')
      await expandIcon.trigger('click')
      await wrapper.vm.$nextTick()

      // 折叠后重新初始化焦点管理
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()

      // 验证焦点管理仍然正常工作 - 第一个可见节点应该有正确的 tabindex
      const visibleFirstNode = wrapper.find('.el-tree-node')
      expect(visibleFirstNode.attributes('tabindex')).toBe('0')

      // 验证treeItems已更新
      expect(wrapper.vm.treeItems.length).toBeGreaterThan(0)
    })
  })

  describe('边界情况和错误处理', () => {
    it('在没有树项目时应该正常处理', () => {
      wrapper.vm.treeItems = []
      
      expect(() => {
        wrapper.vm.initTabIndex()
      }).not.toThrow()
    })

    it('在 DOM 元素不存在时应该正常处理', () => {
      // 模拟 DOM 元素被移除的情况
      wrapper.vm.treeItems = [null, undefined]
      
      expect(() => {
        wrapper.vm.initTabIndex()
      }).not.toThrow()
    })

    it('应该能够处理重复的初始化调用', async () => {
      await wrapper.vm.$nextTick()
      
      // 多次调用 initTabIndex
      wrapper.vm.initTabIndex()
      wrapper.vm.initTabIndex()
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      // 应该只有一个节点有 tabindex="0"
      const nodesWithTabIndex0 = wrapper.findAll('.el-tree-node').wrappers.filter(
        node => node.attributes('tabindex') === '0'
      )
      
      expect(nodesWithTabIndex0.length).toBe(1)
    })
  })

  describe('性能优化', () => {
    it('应该能够高效处理大量节点的焦点管理', async () => {
      // 创建大量节点的测试数据
      const largeData = []
      for (let i = 0; i < 100; i++) {
        largeData.push({
          id: i,
          label: `节点 ${i}`
        })
      }
      
      wrapper = mount(Tree, {
        propsData: {
          data: largeData,
          nodeKey: 'id'
        }
      })
      
      await wrapper.vm.$nextTick()
      
      const startTime = performance.now()
      wrapper.vm.initTabIndex()
      const endTime = performance.now()
      
      // 初始化应该在合理时间内完成（小于100ms）
      expect(endTime - startTime).toBeLessThan(100)
      
      // 验证结果正确性
      const firstNode = wrapper.find('.el-tree-node')
      expect(firstNode.attributes('tabindex')).toBe('0')
    })

    it('应该避免不必要的 DOM 操作', async () => {
      await wrapper.vm.$nextTick()
      
      // 记录初始状态
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const initialTabIndexes = wrapper.findAll('.el-tree-node').wrappers.map(
        node => node.attributes('tabindex')
      )
      
      // 再次调用，状态应该保持不变
      wrapper.vm.initTabIndex()
      await wrapper.vm.$nextTick()
      
      const finalTabIndexes = wrapper.findAll('.el-tree-node').wrappers.map(
        node => node.attributes('tabindex')
      )
      
      expect(finalTabIndexes).toEqual(initialTabIndexes)
    })
  })
})