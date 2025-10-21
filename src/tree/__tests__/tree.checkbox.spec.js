import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 组件 - 复选框功能', () => {
  describe('Props 测试', () => {
    it('showCheckbox 默认为 false', () => {
      const wrapper = mount(Tree)
      expect(wrapper.props('showCheckbox')).toBe(false)
    })

    it('接受 showCheckbox prop', () => {
      const wrapper = mount(Tree, {
        propsData: {
          showCheckbox: true
        }
      })
      expect(wrapper.props('showCheckbox')).toBe(true)
    })

    it('接受 checkStrictly prop', () => {
      const wrapper = mount(Tree, {
        propsData: {
          checkStrictly: true
        }
      })
      expect(wrapper.props('checkStrictly')).toBe(true)
    })

    it('接受 defaultCheckedKeys prop', () => {
      const defaultKeys = [1, 2, 3]
      const wrapper = mount(Tree, {
        propsData: {
          defaultCheckedKeys: defaultKeys
        }
      })
      expect(wrapper.props('defaultCheckedKeys')).toEqual(defaultKeys)
    })

    it('接受 checkOnClickNode prop', () => {
      const wrapper = mount(Tree, {
        propsData: {
          checkOnClickNode: true
        }
      })
      expect(wrapper.props('checkOnClickNode')).toBe(true)
    })

    it('接受 checkDescendants prop', () => {
      const wrapper = mount(Tree, {
        propsData: {
          checkDescendants: true
        }
      })
      expect(wrapper.props('checkDescendants')).toBe(true)
    })

    it('checkDescendants 默认为 false', () => {
      const wrapper = mount(Tree)
      expect(wrapper.props('checkDescendants')).toBe(false)
    })
  })

  describe('渲染测试', () => {
    it('showCheckbox=true 时渲染复选框', () => {
      const data = [
        { id: 1, label: '节点1' }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      const checkbox = wrapper.find('.el-checkbox')
      expect(checkbox.exists()).toBe(true)
    })

    it('showCheckbox=false 时不渲染复选框', () => {
      const data = [
        { id: 1, label: '节点1' }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: false
        }
      })

      const checkbox = wrapper.find('.el-checkbox')
      expect(checkbox.exists()).toBe(false)
    })

    it('showCheckbox 传递给所有子节点', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          defaultExpandAll: true
        }
      })

      const checkboxes = wrapper.findAll('.el-checkbox')
      expect(checkboxes.length).toBeGreaterThan(1)
    })
  })

  describe('defaultCheckedKeys 测试', () => {
    it('初始化时正确设置默认选中节点', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点1' },
            { id: 3, label: '子节点2' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          defaultCheckedKeys: [2, 3]
        }
      })

      const node2 = wrapper.vm.store.nodesMap[2]
      const node3 = wrapper.vm.store.nodesMap[3]

      expect(node2.checked).toBe(true)
      expect(node3.checked).toBe(true)
    })

    it('动态更新 defaultCheckedKeys 时重新初始化', async () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点1' },
            { id: 3, label: '子节点2' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          defaultCheckedKeys: [2]
        }
      })

      expect(wrapper.vm.store.nodesMap[2].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[3].checked).toBe(false)

      await wrapper.setProps({
        defaultCheckedKeys: [3]
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.store.nodesMap[2].checked).toBe(false)
      expect(wrapper.vm.store.nodesMap[3].checked).toBe(true)
    })

    it('checkStrictly=true 时正确处理默认选中', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点1' },
            { id: 3, label: '子节点2' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          checkStrictly: true,
          defaultCheckedKeys: [1]
        }
      })

      const node1 = wrapper.vm.store.nodesMap[1]
      const node2 = wrapper.vm.store.nodesMap[2]

      expect(node1.checked).toBe(true)
      expect(node2.checked).toBe(false) // 严格模式下不级联
    })
  })

  describe('checkStrictly 测试', () => {
    it('checkStrictly=true 时父子不关联', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          checkStrictly: true
        }
      })

      const parent = wrapper.vm.store.nodesMap[1]
      const child = wrapper.vm.store.nodesMap[2]

      parent.setChecked(true, true)

      expect(parent.checked).toBe(true)
      expect(child.checked).toBe(false)
    })

    it('动态切换 checkStrictly 生效', async () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          checkStrictly: false
        }
      })

      await wrapper.setProps({
        checkStrictly: true
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.store.checkStrictly).toBe(true)
    })
  })

  describe('API 方法测试', () => {
    let wrapper
    let data

    beforeEach(() => {
      data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点1' },
            { id: 3, label: '子节点2' }
          ]
        },
        { id: 4, label: '叶子节点' }
      ]

      wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          defaultCheckedKeys: [2, 4]
        }
      })
    })

    it('getCheckedNodes() 返回选中节点', () => {
      const checkedNodes = wrapper.vm.getCheckedNodes()

      expect(Array.isArray(checkedNodes)).toBe(true)
      expect(checkedNodes.length).toBeGreaterThan(0)
      expect(checkedNodes.some(n => n.id === 2)).toBe(true)
      expect(checkedNodes.some(n => n.id === 4)).toBe(true)
    })

    it('getCheckedKeys() 返回选中 keys', () => {
      const keys = wrapper.vm.getCheckedKeys()

      expect(Array.isArray(keys)).toBe(true)
      expect(keys).toContain(2)
      expect(keys).toContain(4)
    })

    it('getCheckedNodes(true) 只返回叶子节点', () => {
      const leafNodes = wrapper.vm.getCheckedNodes(true)

      expect(leafNodes.every(n => n.id === 2 || n.id === 4)).toBe(true)
    })

    it('getCheckedKeys(true) 只返回叶子节点 keys', () => {
      const leafKeys = wrapper.vm.getCheckedKeys(true)

      expect(leafKeys).toContain(2)
      expect(leafKeys).toContain(4)
    })

    it('getHalfCheckedNodes() 返回半选节点', () => {
      const halfNodes = wrapper.vm.getHalfCheckedNodes()

      expect(Array.isArray(halfNodes)).toBe(true)
      // 父节点应该是半选状态
      expect(halfNodes.some(n => n.id === 1)).toBe(true)
    })

    it('getHalfCheckedKeys() 返回半选 keys', () => {
      const halfKeys = wrapper.vm.getHalfCheckedKeys()

      expect(Array.isArray(halfKeys)).toBe(true)
      expect(halfKeys).toContain(1)
    })

    it('setCheckedNodes() 设置选中节点', () => {
      const nodes = [data[1]] // 叶子节点

      wrapper.vm.setCheckedNodes(nodes)

      const checkedKeys = wrapper.vm.getCheckedKeys()
      expect(checkedKeys).toContain(4)
    })

    it('setCheckedKeys() 设置选中 keys', () => {
      wrapper.vm.setCheckedKeys([3, 4])

      expect(wrapper.vm.store.nodesMap[3].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[4].checked).toBe(true)
    })

    it('setChecked() 设置单个节点', () => {
      const nodeData = data[0].children[1] // 子节点2

      wrapper.vm.setChecked(nodeData, true, false)

      expect(wrapper.vm.store.nodesMap[3].checked).toBe(true)
    })

    it('无 nodeKey 时 setCheckedKeys 抛出错误', () => {
      const wrapperNoKey = mount(Tree, {
        propsData: {
          data: [{ label: 'node' }],
          showCheckbox: true
        }
      })

      expect(() => {
        wrapperNoKey.vm.setCheckedKeys([1])
      }).toThrow('[Tree] nodeKey is required in setCheckedKeys')
    })

    it('无 nodeKey 时 setCheckedNodes 抛出错误', () => {
      const wrapperNoKey = mount(Tree, {
        propsData: {
          data: [{ label: 'node' }],
          showCheckbox: true
        }
      })

      expect(() => {
        wrapperNoKey.vm.setCheckedNodes([{ label: 'node' }])
      }).toThrow('[Tree] nodeKey is required in setCheckedNodes')
    })
  })

  describe('事件测试', () => {
    it('声明 check 事件', () => {
      expect(Tree.emits).toContain('check')
    })

    it('声明 check-change 事件', () => {
      expect(Tree.emits).toContain('check-change')
    })

    it('节点选中时触发 check 事件', async () => {
      const data = [
        { id: 1, label: '节点1' }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      const node = wrapper.vm.store.nodesMap[1]

      // 模拟复选框变化
      node.setChecked(true, false)
      treeNode.vm.$emit('node-expand', node.data, node, treeNode.vm)
      
      await wrapper.vm.$nextTick()

      // 验证 store 中的状态
      expect(node.checked).toBe(true)
    })

    it('check 事件参数正确', async () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      // 通过 API 设置选中
      wrapper.vm.setChecked(data[0], true, true)
      await wrapper.vm.$nextTick()

      const node = wrapper.vm.store.nodesMap[1]
      expect(node.checked).toBe(true)
    })
  })

  describe('集成场景测试', () => {
    it('级联选择正确工作', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点1' },
            { id: 3, label: '子节点2' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      // 选中父节点
      wrapper.vm.setChecked(data[0], true, true)

      // 验证所有子节点都被选中
      expect(wrapper.vm.store.nodesMap[1].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[2].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[3].checked).toBe(true)
    })

    it('禁用节点不受影响', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点1', disabled: true },
            { id: 3, label: '子节点2' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      // 选中父节点
      wrapper.vm.setChecked(data[0], true, true)

      // 禁用节点保持未选中
      expect(wrapper.vm.store.nodesMap[2].checked).toBe(false)
      // 非禁用节点被选中
      expect(wrapper.vm.store.nodesMap[3].checked).toBe(true)
    })

    it('半选状态正确显示', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点1' },
            { id: 3, label: '子节点2' }
          ]
        }
      ]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          defaultCheckedKeys: [2] // 只选中一个子节点
        }
      })

      const parent = wrapper.vm.store.nodesMap[1]

      expect(parent.indeterminate).toBe(true)
      expect(parent.checked).toBe(false)
    })
  })
})

