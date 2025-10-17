import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TreeNode from '../src/tree-node.vue'

describe('TreeNode 节点组件', () => {
  it('应该能够渲染 tree-node 组件', () => {
    const wrapper = mount(TreeNode)
    expect(wrapper.exists()).toBe(true)
  })

  it('应该有正确的组件名称', () => {
    expect(TreeNode.name).toBe('ElTreeNode')
  })

  it('应该渲染带有 role 属性的 el-tree-node div', () => {
    const wrapper = mount(TreeNode)
    const nodeDiv = wrapper.find('.el-tree-node')
    expect(nodeDiv.exists()).toBe(true)
    expect(nodeDiv.attributes('role')).toBe('treeitem')
  })

  it('应该接受 Object 类型的 node 属性', () => {
    const nodeData = { id: 1, label: 'Test Node' }
    const wrapper = mount(TreeNode, {
      propsData: {
        node: nodeData,
      },
    })
    expect(wrapper.props('node')).toEqual(nodeData)
  })
})

