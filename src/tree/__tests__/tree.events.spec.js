import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 容器组件 - 事件系统', () => {
  describe('展开收起配置', () => {
    it('expandOnClickNode 默认应该为 true', () => {
      const wrapper = mount(Tree)
      expect(wrapper.props('expandOnClickNode')).toBe(true)
    })

    it('应该支持设置 expandOnClickNode 为 false', () => {
      const wrapper = mount(Tree, {
        propsData: {
          expandOnClickNode: false,
        },
      })
      expect(wrapper.props('expandOnClickNode')).toBe(false)
    })

    it('expandOnClickNode 应该传递给 TreeNode 组件', () => {
      const data = [{ label: '节点1', children: [{ label: '子节点' }] }]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          expandOnClickNode: false,
        },
      })
      
      expect(wrapper.vm.expandOnClickNode).toBe(false)
    })
  })

  describe('事件系统', () => {
    it('应该声明所有 Step 6 事件', () => {
      expect(Tree.emits).toContain('node-expand')
      expect(Tree.emits).toContain('node-collapse')
      expect(Tree.emits).toContain('node-click')
      expect(Tree.emits).toContain('current-change')
    })

    it('应该监听子节点的 node-expand 事件', async () => {
      const data = [
        {
          label: '父节点',
          children: [{ label: '子节点' }],
        },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
        },
      })
      
      const node = wrapper.vm.root.childNodes[0]
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      
      // 模拟展开节点
      treeNode.vm.$emit('node-expand', node.data, node, treeNode.vm)
      await wrapper.vm.$nextTick()
      
      // 验证 Tree 组件转发了事件
      expect(wrapper.emitted('node-expand')).toBeTruthy()
      expect(wrapper.emitted('node-expand')[0][0]).toBe(node.data)
      expect(wrapper.emitted('node-expand')[0][1]).toBe(node)
    })

    it('node-expand 事件应该包含正确的参数', async () => {
      const data = [
        {
          id: 1,
          label: '父节点',
          children: [{ id: 2, label: '子节点' }],
        },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })
      
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      const node = wrapper.vm.root.childNodes[0]
      
      treeNode.vm.$emit('node-expand', node.data, node, treeNode.vm)
      await wrapper.vm.$nextTick()
      
      const emitted = wrapper.emitted('node-expand')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toEqual(node.data)
      expect(emitted[0][1]).toBe(node)
      expect(emitted[0][2]).toBe(treeNode.vm)
    })

    it('应该能够触发多次 node-expand 事件', async () => {
      const data = [
        {
          label: '节点1',
          children: [{ label: '子节点1' }],
        },
        {
          label: '节点2',
          children: [{ label: '子节点2' }],
        },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
        },
      })
      
      const treeNodes = wrapper.findAllComponents({ name: 'ElTreeNode' })
      const node1 = wrapper.vm.root.childNodes[0]
      const node2 = wrapper.vm.root.childNodes[1]
      
      // 只有两个根节点
      expect(treeNodes.length).toBeGreaterThanOrEqual(2)
      
      // 展开第一个节点
      treeNodes.at(0).vm.$emit('node-expand', node1.data, node1, treeNodes.at(0).vm)
      await wrapper.vm.$nextTick()
      
      // 展开第二个节点
      treeNodes.at(1).vm.$emit('node-expand', node2.data, node2, treeNodes.at(1).vm)
      await wrapper.vm.$nextTick()
      
      const emitted = wrapper.emitted('node-expand')
      expect(emitted).toBeTruthy()
      expect(emitted.length).toBe(2)
    })

    it('handleNodeExpand 方法应该正确转发事件', () => {
      const data = [{ label: '节点1' }]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
        },
      })
      
      const node = wrapper.vm.root.childNodes[0]
      const mockInstance = { mock: 'instance' }
      
      wrapper.vm.handleNodeExpand(node.data, node, mockInstance)
      
      expect(wrapper.emitted('node-expand')).toBeTruthy()
      expect(wrapper.emitted('node-expand')[0]).toEqual([node.data, node, mockInstance])
    })
  })

  describe('嵌套节点事件传递', () => {
    it('深层嵌套节点的事件应该能够冒泡到根组件', async () => {
      const data = [
        {
          label: '一级',
          children: [
            {
              label: '二级',
              children: [
                { label: '三级' },
              ],
            },
          ],
        },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          defaultExpandAll: true,
        },
      })
      
      // 获取所有节点组件
      const treeNodes = wrapper.findAllComponents({ name: 'ElTreeNode' })
      // 应该有3个节点：一级、二级、三级
      expect(treeNodes.length).toBe(3)
      
      // 找到三级节点（最后一个）
      const thirdLevelNode = treeNodes.at(2)
      const nodeData = thirdLevelNode.props('node')
      
      // 触发三级节点的展开事件
      thirdLevelNode.vm.$emit('node-expand', nodeData.data, nodeData, thirdLevelNode.vm)
      await wrapper.vm.$nextTick()
      
      // 验证事件冒泡到了根 Tree 组件
      expect(wrapper.emitted('node-expand')).toBeTruthy()
    })

    it('父节点应该转发子节点的 node-expand 事件', async () => {
      const data = [
        {
          label: '父节点',
          children: [
            {
              label: '子节点',
              children: [{ label: '孙节点' }],
            },
          ],
        },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          defaultExpandAll: true,
        },
      })
      
      const treeNodes = wrapper.findAllComponents({ name: 'ElTreeNode' })
      
      // 子节点（索引 1）
      const childNode = treeNodes.at(1)
      const nodeData = childNode.props('node')
      
      childNode.vm.$emit('node-expand', nodeData.data, nodeData, childNode.vm)
      await wrapper.vm.$nextTick()
      
      // 事件应该通过父节点冒泡到根组件
      expect(wrapper.emitted('node-expand')).toBeTruthy()
      expect(wrapper.emitted('node-expand')[0][0]).toEqual(nodeData.data)
    })
  })
})

