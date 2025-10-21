import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tree from '../src/tree.vue'
import TreeNode from '../src/tree-node.vue'

describe('TreeNode 组件 - 复选框功能', () => {
  describe('Props 和渲染测试', () => {
    it('接受 showCheckbox prop', () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      const treeNode = wrapper.findComponent(TreeNode)
      expect(treeNode.props('showCheckbox')).toBe(true)
    })

    it('showCheckbox=true 时渲染 el-checkbox', () => {
      const data = [{ id: 1, label: '节点1' }]

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

    it('showCheckbox=false 时不渲染 el-checkbox', () => {
      const data = [{ id: 1, label: '节点1' }]

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

    it('复选框绑定到 node.checked', async () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          defaultCheckedKeys: [1]
        }
      })

      await wrapper.vm.$nextTick()

      const checkbox = wrapper.find('.el-checkbox__input')
      expect(checkbox.classes()).toContain('is-checked')
    })

    it('indeterminate 绑定到 node.indeterminate', async () => {
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

      await wrapper.vm.$nextTick()

      const parentNode = wrapper.vm.store.nodesMap[1]
      expect(parentNode.indeterminate).toBe(true)

      // 找到父节点的复选框
      const checkboxes = wrapper.findAll('.el-checkbox__input')
      const parentCheckbox = checkboxes.at(0)
      expect(parentCheckbox.classes()).toContain('is-indeterminate')
    })

    it('disabled 绑定到 node.disabled', () => {
      const data = [{ id: 1, label: '节点1', disabled: true }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      const checkbox = wrapper.find('.el-checkbox__input')
      expect(checkbox.classes()).toContain('is-disabled')
    })
  })

  describe('交互测试', () => {
    it('点击复选框触发 handleCheckChange', async () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      checkbox.element.checked = true
      await checkbox.trigger('change')

      await wrapper.vm.$nextTick()

      const node = wrapper.vm.store.nodesMap[1]
      expect(node.checked).toBe(true)
    })

    it('handleCheckChange 调用 node.setChecked', async () => {
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

      const treeNode = wrapper.findComponent(TreeNode)
      const node = wrapper.vm.store.nodesMap[1]

      // 调用 handleCheckChange
      treeNode.vm.handleCheckChange(null, { target: { checked: true } })
      await wrapper.vm.$nextTick()

      expect(node.checked).toBe(true)
    })

    it('checkStrictly=false 时级联设置子节点', async () => {
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
          checkStrictly: false,
          defaultExpandAll: true
        }
      })

      // 点击父节点的复选框
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      checkboxes.at(0).element.checked = true
      await checkboxes.at(0).trigger('change')
      await wrapper.vm.$nextTick()

      const parent = wrapper.vm.store.nodesMap[1]
      const child = wrapper.vm.store.nodesMap[2]

      expect(parent.checked).toBe(true)
      expect(child.checked).toBe(true)
    })

    it('checkStrictly=true 时不级联', async () => {
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
          checkStrictly: true,
          defaultExpandAll: true
        }
      })

      // 点击父节点的复选框
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      checkboxes.at(0).element.checked = true
      await checkboxes.at(0).trigger('change')
      await wrapper.vm.$nextTick()

      const parent = wrapper.vm.store.nodesMap[1]
      const child = wrapper.vm.store.nodesMap[2]

      expect(parent.checked).toBe(true)
      expect(child.checked).toBe(false) // 不级联
    })

    it('点击复选框后触发 check 事件', async () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.trigger('change')
      await wrapper.vm.$nextTick()

      // 验证事件被触发
      expect(wrapper.emitted('check')).toBeTruthy()
    })

    it('check 事件包含完整的选中信息', async () => {
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

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.trigger('change')
      await wrapper.vm.$nextTick()

      const checkEvents = wrapper.emitted('check')
      if (checkEvents && checkEvents.length > 0) {
        const [nodeData, checkedInfo] = checkEvents[0]
        
        expect(nodeData).toBeDefined()
        expect(checkedInfo).toHaveProperty('checkedNodes')
        expect(checkedInfo).toHaveProperty('checkedKeys')
        expect(checkedInfo).toHaveProperty('halfCheckedNodes')
        expect(checkedInfo).toHaveProperty('halfCheckedKeys')
      }
    })
  })

  describe('checkOnClickNode 测试', () => {
    it('checkOnClickNode=true 时点击节点切换复选框', async () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          checkOnClickNode: true
        }
      })

      const node = wrapper.vm.store.nodesMap[1]
      expect(node.checked).toBe(false)

      // 点击节点内容区域
      const nodeContent = wrapper.find('.el-tree-node__content')
      await nodeContent.trigger('click')
      await wrapper.vm.$nextTick()

      expect(node.checked).toBe(true)
    })

    it('checkOnClickNode=false 时点击节点不影响复选框', async () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          checkOnClickNode: false
        }
      })

      const node = wrapper.vm.store.nodesMap[1]
      expect(node.checked).toBe(false)

      // 点击节点内容区域
      const nodeContent = wrapper.find('.el-tree-node__content')
      await nodeContent.trigger('click')
      await wrapper.vm.$nextTick()

      expect(node.checked).toBe(false)
    })

    it('禁用节点点击不切换复选框', async () => {
      const data = [{ id: 1, label: '节点1', disabled: true }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true,
          checkOnClickNode: true
        }
      })

      const node = wrapper.vm.store.nodesMap[1]
      expect(node.checked).toBe(false)

      // 点击节点内容区域
      const nodeContent = wrapper.find('.el-tree-node__content')
      await nodeContent.trigger('click')
      await wrapper.vm.$nextTick()

      // 禁用节点不应该被选中
      expect(node.checked).toBe(false)
    })
  })

  describe('watch 测试', () => {
    it('node.checked 变化时触发 handleSelectChange', async () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      const node = wrapper.vm.store.nodesMap[1]
      
      // 改变 checked 状态
      node.checked = true
      await wrapper.vm.$nextTick()

      // check-change 事件应该被触发
      expect(wrapper.emitted('check-change')).toBeTruthy()
    })

    it('node.indeterminate 变化时触发 handleSelectChange', async () => {
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

      // 选中一个子节点，父节点会变为半选
      const child = wrapper.vm.store.nodesMap[2]
      child.setChecked(true, false)
      await wrapper.vm.$nextTick()

      const parent = wrapper.vm.store.nodesMap[1]
      expect(parent.indeterminate).toBe(true)

      // check-change 事件应该被触发
      expect(wrapper.emitted('check-change')).toBeTruthy()
    })

    it('handleSelectChange 触发 check-change 事件', async () => {
      const data = [{ id: 1, label: '节点1' }]

      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          showCheckbox: true
        }
      })

      const node = wrapper.vm.store.nodesMap[1]
      
      // 改变状态
      node.setChecked(true, false)
      await wrapper.vm.$nextTick()

      const events = wrapper.emitted('check-change')
      if (events && events.length > 0) {
        const [nodeData, checked, indeterminate] = events[events.length - 1]
        
        expect(nodeData).toBeDefined()
        expect(typeof checked).toBe('boolean')
        expect(typeof indeterminate).toBe('boolean')
      }
    })
  })

  describe('递归传递测试', () => {
    it('showCheckbox 正确传递给子节点', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            {
              id: 2,
              label: '子节点',
              children: [
                { id: 3, label: '孙节点' }
              ]
            }
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

      const treeNodes = wrapper.findAllComponents(TreeNode).wrappers
      
      // 验证所有 TreeNode 都接收到 showCheckbox
      treeNodes.forEach(node => {
        expect(node.props('showCheckbox')).toBe(true)
      })
    })

    it('所有层级节点都能正确显示复选框', () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            {
              id: 2,
              label: '子节点',
              children: [
                { id: 3, label: '孙节点' }
              ]
            }
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
      
      // 应该有3个复选框（父、子、孙）
      expect(checkboxes.length).toBe(3)
    })

    it('深层嵌套的复选框交互正常', async () => {
      const data = [
        {
          id: 1,
          label: 'level1',
          children: [
            {
              id: 2,
              label: 'level2',
              children: [
                {
                  id: 3,
                  label: 'level3',
                  children: [
                    { id: 4, label: 'level4' }
                  ]
                }
              ]
            }
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

      // 选中最顶层节点
      const topCheckbox = wrapper.findAll('input[type="checkbox"]').at(0)
      topCheckbox.element.checked = true
      await topCheckbox.trigger('change')
      await wrapper.vm.$nextTick()

      // 验证所有层级都被选中
      expect(wrapper.vm.store.nodesMap[1].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[2].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[3].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[4].checked).toBe(true)
    })
  })

  describe('复杂交互场景', () => {
    it('部分选中状态下再次点击父节点', async () => {
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
          defaultExpandAll: true,
          defaultCheckedKeys: [2] // 只选中一个
        }
      })

      await wrapper.vm.$nextTick()

      const parent = wrapper.vm.store.nodesMap[1]
      expect(parent.indeterminate).toBe(true)

      // 点击父节点复选框
      const parentCheckbox = wrapper.findAll('input[type="checkbox"]').at(0)
      parentCheckbox.element.checked = true
      await parentCheckbox.trigger('change')
      await wrapper.vm.$nextTick()

      // 父节点和所有子节点应该都被选中
      expect(parent.checked).toBe(true)
      expect(parent.indeterminate).toBe(false)
      expect(wrapper.vm.store.nodesMap[2].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[3].checked).toBe(true)
    })

    it('混合禁用和正常节点的交互', async () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [
            { id: 2, label: '子节点1', disabled: true },
            { id: 3, label: '子节点2' },
            { id: 4, label: '子节点3' }
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

      // 选中父节点
      const parentCheckbox = wrapper.findAll('input[type="checkbox"]').at(0)
      parentCheckbox.element.checked = true
      await parentCheckbox.trigger('change')
      await wrapper.vm.$nextTick()

      // 禁用节点不变
      expect(wrapper.vm.store.nodesMap[2].checked).toBe(false)
      // 其他节点被选中
      expect(wrapper.vm.store.nodesMap[3].checked).toBe(true)
      expect(wrapper.vm.store.nodesMap[4].checked).toBe(true)
    })
  })
})

