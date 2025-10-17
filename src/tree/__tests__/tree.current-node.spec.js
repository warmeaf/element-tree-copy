import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 组件 - 当前节点功能 (Step 7)', () => {
  describe('Props - highlightCurrent', () => {
    it('应该接受 highlightCurrent 属性', () => {
      const wrapper = mount(Tree, {
        propsData: {
          highlightCurrent: true,
        },
      })

      expect(wrapper.props('highlightCurrent')).toBe(true)
    })

    it('highlightCurrent 为 true 时应该添加 el-tree--highlight-current class', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ label: '节点1' }],
          highlightCurrent: true,
        },
      })

      expect(wrapper.classes()).toContain('el-tree--highlight-current')
    })

    it('highlightCurrent 为 false 时不应该添加 el-tree--highlight-current class', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ label: '节点1' }],
          highlightCurrent: false,
        },
      })

      expect(wrapper.classes()).not.toContain('el-tree--highlight-current')
    })

    it('highlightCurrent 默认应该为 false', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ label: '节点1' }],
        },
      })

      expect(wrapper.props('highlightCurrent')).toBeFalsy()
      expect(wrapper.classes()).not.toContain('el-tree--highlight-current')
    })
  })

  describe('Props - currentNodeKey', () => {
    it('应该接受 currentNodeKey 属性', () => {
      const wrapper = mount(Tree, {
        propsData: {
          currentNodeKey: 1,
        },
      })

      expect(wrapper.props('currentNodeKey')).toBe(1)
    })

    it('应该支持 String 类型的 currentNodeKey', () => {
      const wrapper = mount(Tree, {
        propsData: {
          currentNodeKey: 'node-1',
        },
      })

      expect(wrapper.props('currentNodeKey')).toBe('node-1')
    })

    it('应该支持 Number 类型的 currentNodeKey', () => {
      const wrapper = mount(Tree, {
        propsData: {
          currentNodeKey: 123,
        },
      })

      expect(wrapper.props('currentNodeKey')).toBe(123)
    })

    it('应该将 currentNodeKey 传递给 TreeStore', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 2,
        },
      })

      expect(wrapper.vm.store.currentNodeKey).toBe(2)
    })

    it('初始化时应该自动选中 currentNodeKey 对应的节点', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
        { id: 3, label: '节点3' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 2,
        },
      })

      const node = wrapper.vm.store.getNode(2)
      expect(wrapper.vm.store.currentNode).toBe(node)
      expect(node.isCurrent).toBe(true)
    })

    it('当 currentNodeKey 对应的节点不存在时，不应该设置当前节点', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 999,
        },
      })

      expect(wrapper.vm.store.currentNode).toBeNull()
    })

    it('应该能够选中嵌套节点', () => {
      const data = [
        {
          id: 1,
          label: '一级 1',
          children: [
            { id: 11, label: '二级 1-1' },
            { id: 12, label: '二级 1-2' },
          ],
        },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 11,
        },
      })

      const node = wrapper.vm.store.getNode(11)
      expect(wrapper.vm.store.currentNode).toBe(node)
      expect(node.isCurrent).toBe(true)
    })
  })

  describe('方法 - getCurrentNode', () => {
    it('应该返回当前选中节点的数据对象', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 1,
        },
      })

      const currentNodeData = wrapper.vm.getCurrentNode()
      expect(currentNodeData).toEqual({ id: 1, label: '节点1' })
    })

    it('当没有选中节点时，应该返回 null', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ id: 1, label: '节点1' }],
          nodeKey: 'id',
        },
      })

      expect(wrapper.vm.getCurrentNode()).toBeNull()
    })

    it('应该返回数据对象，而不是 Node 实例', () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 1,
        },
      })

      const currentNodeData = wrapper.vm.getCurrentNode()
      expect(currentNodeData).toBe(data[0])
      expect(currentNodeData.id).toBe(1)
    })

    it('在用户交互后应该返回正确的当前节点', async () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      // 点击第一个节点
      const firstContent = wrapper.find('.el-tree-node__content')
      await firstContent.trigger('click')
      await wrapper.vm.$nextTick()

      const currentNodeData = wrapper.vm.getCurrentNode()
      expect(currentNodeData.id).toBe(1)
    })
  })

  describe('方法 - getCurrentKey', () => {
    it('应该返回当前选中节点的 key 值', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 1,
        },
      })

      expect(wrapper.vm.getCurrentKey()).toBe(1)
    })

    it('应该支持字符串类型的 key', () => {
      const data = [{ id: 'abc', label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 'abc',
        },
      })

      expect(wrapper.vm.getCurrentKey()).toBe('abc')
    })

    it('当没有选中节点时，应该返回 null', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ id: 1, label: '节点1' }],
          nodeKey: 'id',
        },
      })

      expect(wrapper.vm.getCurrentKey()).toBeNull()
    })

    it('没有设置 nodeKey 时，应该抛出错误', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ id: 1, label: '节点1' }],
        },
      })

      expect(() => {
        wrapper.vm.getCurrentKey()
      }).toThrow('[Tree] nodeKey is required in getCurrentKey')
    })

    it('在用户交互后应该返回正确的 key', async () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      // 点击第二个节点
      const contents = wrapper.findAll('.el-tree-node__content')
      await contents.at(1).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.getCurrentKey()).toBe(2)
    })
  })

  describe('方法 - setCurrentNode', () => {
    it('应该能够通过数据对象设置当前节点', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentNode(data[1])

      expect(wrapper.vm.getCurrentKey()).toBe(2)
      expect(wrapper.vm.store.currentNode.data).toBe(data[1])
    })

    it('应该更新节点的 isCurrent 状态', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentNode(data[0])

      const node = wrapper.vm.store.getNode(1)
      expect(node.isCurrent).toBe(true)
    })

    it('应该能够切换当前节点', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
        { id: 3, label: '节点3' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentNode(data[0])
      const node1 = wrapper.vm.store.getNode(1)
      expect(node1.isCurrent).toBe(true)

      wrapper.vm.setCurrentNode(data[1])
      const node2 = wrapper.vm.store.getNode(2)
      expect(node1.isCurrent).toBe(false)
      expect(node2.isCurrent).toBe(true)
    })

    it('没有设置 nodeKey 时，应该抛出错误', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ id: 1, label: '节点1' }],
        },
      })

      expect(() => {
        wrapper.vm.setCurrentNode({ id: 1 })
      }).toThrow('[Tree] nodeKey is required in setCurrentNode')
    })

    it('应该能够设置嵌套节点为当前节点', () => {
      const data = [
        {
          id: 1,
          label: '一级 1',
          children: [
            { id: 11, label: '二级 1-1' },
            { id: 12, label: '二级 1-2' },
          ],
        },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentNode(data[0].children[0])

      expect(wrapper.vm.getCurrentKey()).toBe(11)
      expect(wrapper.vm.store.getNode(11).isCurrent).toBe(true)
    })
  })

  describe('方法 - setCurrentKey', () => {
    it('应该能够通过 key 设置当前节点', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentKey(2)

      expect(wrapper.vm.getCurrentKey()).toBe(2)
      expect(wrapper.vm.store.getNode(2).isCurrent).toBe(true)
    })

    it('应该支持字符串类型的 key', () => {
      const data = [{ id: 'abc', label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentKey('abc')

      expect(wrapper.vm.getCurrentKey()).toBe('abc')
    })

    it('应该能够清空当前节点 (key 为 null)', () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 1,
        },
      })

      expect(wrapper.vm.getCurrentKey()).toBe(1)

      wrapper.vm.setCurrentKey(null)

      expect(wrapper.vm.getCurrentKey()).toBeNull()
      expect(wrapper.vm.store.currentNode).toBeNull()
    })

    it('应该能够清空当前节点 (key 为 undefined)', () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 1,
        },
      })

      wrapper.vm.setCurrentKey(undefined)

      expect(wrapper.vm.getCurrentKey()).toBeNull()
    })

    it('清空当前节点时应该将原节点的 isCurrent 设置为 false', () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 1,
        },
      })

      const node = wrapper.vm.store.getNode(1)
      expect(node.isCurrent).toBe(true)

      wrapper.vm.setCurrentKey(null)

      expect(node.isCurrent).toBe(false)
    })

    it('应该能够切换当前节点', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
        { id: 3, label: '节点3' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentKey(1)
      expect(wrapper.vm.store.getNode(1).isCurrent).toBe(true)

      wrapper.vm.setCurrentKey(2)
      expect(wrapper.vm.store.getNode(1).isCurrent).toBe(false)
      expect(wrapper.vm.store.getNode(2).isCurrent).toBe(true)

      wrapper.vm.setCurrentKey(3)
      expect(wrapper.vm.store.getNode(2).isCurrent).toBe(false)
      expect(wrapper.vm.store.getNode(3).isCurrent).toBe(true)
    })

    it('当 key 对应的节点不存在时，不应该设置当前节点', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ id: 1, label: '节点1' }],
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentKey(999)

      expect(wrapper.vm.getCurrentKey()).toBeNull()
    })

    it('没有设置 nodeKey 时，应该抛出错误', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ id: 1, label: '节点1' }],
        },
      })

      expect(() => {
        wrapper.vm.setCurrentKey(1)
      }).toThrow('[Tree] nodeKey is required in setCurrentKey')
    })
  })

  describe('方法 - getNode', () => {
    it('应该通过 key 获取节点实例', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      const node = wrapper.vm.getNode(1)
      expect(node).toBeDefined()
      expect(node.data.id).toBe(1)
      expect(node.data.label).toBe('节点1')
    })

    it('应该通过数据对象获取节点实例', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      const node = wrapper.vm.getNode(data[0])
      expect(node).toBeDefined()
      expect(node.data).toBe(data[0])
    })

    it('应该能够获取嵌套节点', () => {
      const data = [
        {
          id: 1,
          label: '一级 1',
          children: [
            { id: 11, label: '二级 1-1' },
            { id: 12, label: '二级 1-2' },
          ],
        },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      const node = wrapper.vm.getNode(11)
      expect(node).toBeDefined()
      expect(node.data.label).toBe('二级 1-1')
      expect(node.level).toBe(2)
    })

    it('当节点不存在时，应该返回 null', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ id: 1, label: '节点1' }],
          nodeKey: 'id',
        },
      })

      const node = wrapper.vm.getNode(999)
      expect(node).toBeNull()
    })

    it('应该返回 Node 实例而不是数据对象', () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      const node = wrapper.vm.getNode(1)
      expect(node.id).toBeDefined() // Node 实例有 id 属性（内部标识）
      expect(node.data).toBe(data[0]) // 包含数据对象
      expect(node.key).toBe(1) // 包含 key getter
    })
  })

  describe('综合场景测试', () => {
    it('highlightCurrent + currentNodeKey 配合使用', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
        { id: 3, label: '节点3' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          highlightCurrent: true,
          currentNodeKey: 2,
        },
      })

      expect(wrapper.classes()).toContain('el-tree--highlight-current')
      expect(wrapper.vm.getCurrentKey()).toBe(2)
      expect(wrapper.vm.store.getNode(2).isCurrent).toBe(true)
    })

    it('通过 setCurrentKey 切换节点后，getCurrentNode 应该返回正确的数据', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentKey(1)
      expect(wrapper.vm.getCurrentNode()).toEqual({ id: 1, label: '节点1' })

      wrapper.vm.setCurrentKey(2)
      expect(wrapper.vm.getCurrentNode()).toEqual({ id: 2, label: '节点2' })
    })

    it('通过 setCurrentNode 设置后，getCurrentKey 应该返回正确的 key', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      wrapper.vm.setCurrentNode(data[0])
      expect(wrapper.vm.getCurrentKey()).toBe(1)

      wrapper.vm.setCurrentNode(data[1])
      expect(wrapper.vm.getCurrentKey()).toBe(2)
    })

    it('点击节点后，应该能够通过 API 获取当前节点', async () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          highlightCurrent: true,
        },
      })

      const secondContent = wrapper.findAll('.el-tree-node__content').at(1)
      await secondContent.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.getCurrentKey()).toBe(2)
      expect(wrapper.vm.getCurrentNode()).toEqual({ id: 2, label: '节点2' })
      expect(wrapper.vm.getNode(2).isCurrent).toBe(true)
    })

    it('清空当前节点后，所有 API 应该返回预期的值', () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          currentNodeKey: 1,
        },
      })

      expect(wrapper.vm.getCurrentKey()).toBe(1)

      wrapper.vm.setCurrentKey(null)

      expect(wrapper.vm.getCurrentKey()).toBeNull()
      expect(wrapper.vm.getCurrentNode()).toBeNull()
      expect(wrapper.vm.store.currentNode).toBeNull()
    })

    it('在深层嵌套树中，所有 API 应该正常工作', () => {
      const data = [
        {
          id: 1,
          label: '一级 1',
          children: [
            {
              id: 11,
              label: '二级 1-1',
              children: [
                { id: 111, label: '三级 1-1-1' },
                { id: 112, label: '三级 1-1-2' },
              ],
            },
          ],
        },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          highlightCurrent: true,
        },
      })

      // 设置深层节点为当前节点
      wrapper.vm.setCurrentKey(111)
      expect(wrapper.vm.getCurrentKey()).toBe(111)

      const currentNode = wrapper.vm.getCurrentNode()
      expect(currentNode.id).toBe(111)
      expect(currentNode.label).toBe('三级 1-1-1')

      // 获取节点实例
      const node = wrapper.vm.getNode(111)
      expect(node.isCurrent).toBe(true)
      expect(node.level).toBe(3)

      // 切换到另一个深层节点
      wrapper.vm.setCurrentKey(112)
      expect(wrapper.vm.getNode(111).isCurrent).toBe(false)
      expect(wrapper.vm.getNode(112).isCurrent).toBe(true)
    })
  })

  describe('与节点点击事件的集成测试', () => {
    it('点击节点应该自动设置为当前节点', async () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      const firstContent = wrapper.find('.el-tree-node__content')
      await firstContent.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.getCurrentKey()).toBe(1)
      expect(wrapper.vm.store.getNode(1).isCurrent).toBe(true)
    })

    it('点击不同节点应该切换当前节点', async () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
        { id: 3, label: '节点3' },
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      const contents = wrapper.findAll('.el-tree-node__content')

      await contents.at(0).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.getCurrentKey()).toBe(1)

      await contents.at(1).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.getCurrentKey()).toBe(2)
      expect(wrapper.vm.store.getNode(1).isCurrent).toBe(false)

      await contents.at(2).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.getCurrentKey()).toBe(3)
      expect(wrapper.vm.store.getNode(2).isCurrent).toBe(false)
    })

    it('点击节点应该触发 current-change 事件', async () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })

      const content = wrapper.find('.el-tree-node__content')
      await content.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('current-change')).toBeTruthy()
      expect(wrapper.emitted('current-change')[0][0]).toEqual({ id: 1, label: '节点1' })
    })
  })
})

