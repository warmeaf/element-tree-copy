import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 容器组件', () => {
  it('应该能够渲染 tree 组件', () => {
    const wrapper = mount(Tree)
    expect(wrapper.exists()).toBe(true)
  })

  it('应该有正确的组件名称', () => {
    expect(Tree.name).toBe('ElTree')
  })

  it('应该渲染带有 role 属性的 el-tree div', () => {
    const wrapper = mount(Tree)
    const treeDiv = wrapper.find('.el-tree')
    expect(treeDiv.exists()).toBe(true)
    expect(treeDiv.attributes('role')).toBe('tree')
  })

  it('应该接受 Array 类型的 data 属性', () => {
    const wrapper = mount(Tree, {
      propsData: {
        data: [],
      },
    })
    expect(wrapper.props('data')).toEqual([])
  })

  it('data 中应该包含 store 和 root', () => {
    const wrapper = mount(Tree)
    expect(wrapper.vm.store).toBe(null)
    expect(wrapper.vm.root).toBe(null)
  })
})

