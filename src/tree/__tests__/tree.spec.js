import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tree from '../src/tree.vue'
import TreeStore from '../src/model/tree-store'

describe('Tree 容器组件 - Step 5 基础渲染', () => {
  describe('基础功能', () => {
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
  })

  describe('TreeStore 初始化', () => {
    it('created 钩子中应该创建 TreeStore 实例', () => {
      const data = [
        { label: '节点1' },
        { label: '节点2' },
      ]
      const wrapper = mount(Tree, {
        propsData: {
          data,
        },
      })
      
      expect(wrapper.vm.store).toBeInstanceOf(TreeStore)
      expect(wrapper.vm.root).toBeTruthy()
    })

    it('应该正确设置 isTree 标识', () => {
      const wrapper = mount(Tree)
      expect(wrapper.vm.isTree).toBe(true)
    })

    it('TreeStore 应该接收正确的配置参数', () => {
      const data = [{ label: '节点1' }]
      const props = {
        children: 'items',
        label: 'name',
      }
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
          props,
          defaultExpandAll: true,
        },
      })
      
      expect(wrapper.vm.store.key).toBe('id')
      expect(wrapper.vm.store.data).toBe(data)
      expect(wrapper.vm.store.props).toBe(props)
      expect(wrapper.vm.store.defaultExpandAll).toBe(true)
    })
  })

  describe('节点渲染', () => {
    it('应该渲染根节点的子节点', () => {
      const data = [
        { label: '节点1' },
        { label: '节点2' },
        { label: '节点3' },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
        },
      })
      
      const treeNodes = wrapper.findAllComponents({ name: 'ElTreeNode' })
      expect(treeNodes.length).toBe(3)
    })

    it('应该渲染多层级树结构', () => {
      const data = [
        {
          label: '一级 1',
          children: [
            {
              label: '二级 1-1',
              children: [
                { label: '三级 1-1-1' },
              ],
            },
          ],
        },
        {
          label: '一级 2',
          children: [
            { label: '二级 2-1' },
            { label: '二级 2-2' },
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
      // 总共 6 个节点：2个一级 + 3个二级 + 1个三级
      expect(treeNodes.length).toBe(6)
    })

    it('应该为每个节点传递正确的 node 和 props', () => {
      const data = [{ label: '节点1' }]
      const props = { children: 'items', label: 'name' }
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          props,
        },
      })
      
      const treeNode = wrapper.findComponent({ name: 'ElTreeNode' })
      expect(treeNode.exists()).toBe(true)
      expect(treeNode.props('node')).toBeTruthy()
      expect(treeNode.props('props')).toBe(props)
    })
  })

  describe('空数据处理', () => {
    it('isEmpty 计算属性应该正确判断空数据', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [],
        },
      })
      
      expect(wrapper.vm.isEmpty).toBe(true)
    })

    it('有数据时 isEmpty 应该返回 false', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ label: '节点1' }],
        },
      })
      
      expect(wrapper.vm.isEmpty).toBe(false)
    })

    it('空数据时应该显示空提示文本', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [],
        },
      })
      
      const emptyBlock = wrapper.find('.el-tree__empty-block')
      const emptyText = wrapper.find('.el-tree__empty-text')
      
      expect(emptyBlock.exists()).toBe(true)
      expect(emptyText.exists()).toBe(true)
      expect(emptyText.text()).toBe('暂无数据')
    })

    it('应该支持自定义空提示文本', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [],
          emptyText: '没有任何数据',
        },
      })
      
      const emptyText = wrapper.find('.el-tree__empty-text')
      expect(emptyText.text()).toBe('没有任何数据')
    })

    it('有数据时不应该显示空提示', () => {
      const wrapper = mount(Tree, {
        propsData: {
          data: [{ label: '节点1' }],
        },
      })
      
      const emptyBlock = wrapper.find('.el-tree__empty-block')
      expect(emptyBlock.exists()).toBe(false)
    })
  })

  describe('配置参数', () => {
    it('应该支持自定义字段名配置', () => {
      const data = [
        {
          name: '自定义节点1',
          items: [
            { name: '自定义子节点1-1' },
          ],
        },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          props: {
            children: 'items',
            label: 'name',
          },
          defaultExpandAll: true,
        },
      })
      
      const labels = wrapper.findAll('.el-tree-node__label')
      expect(labels.at(0).text()).toBe('自定义节点1')
      expect(labels.at(1).text()).toBe('自定义子节点1-1')
    })

    it('应该支持 nodeKey 配置', () => {
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
      
      expect(wrapper.vm.store.key).toBe('id')
      expect(wrapper.vm.store.nodesMap[1]).toBeTruthy()
      expect(wrapper.vm.store.nodesMap[2]).toBeTruthy()
    })

    it('应该支持 defaultExpandAll 配置', () => {
      const data = [
        {
          label: '节点1',
          children: [
            { label: '子节点1-1' },
          ],
        },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          defaultExpandAll: true,
        },
      })
      
      const firstNode = wrapper.vm.root.childNodes[0]
      expect(firstNode.expanded).toBe(true)
    })
  })

  describe('方法', () => {
    it('getNodeKey 方法应该正确获取节点 key', () => {
      const data = [
        { id: 1, label: '节点1' },
      ]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
          nodeKey: 'id',
        },
      })
      
      const node = wrapper.vm.root.childNodes[0]
      const key = wrapper.vm.getNodeKey(node)
      expect(key).toBe(1)
    })

    it('没有 nodeKey 时应该返回内部标识', () => {
      const data = [{ label: '节点1' }]
      
      const wrapper = mount(Tree, {
        propsData: {
          data,
        },
      })
      
      const node = wrapper.vm.root.childNodes[0]
      const key = wrapper.vm.getNodeKey(node)
      expect(key).toBe(node.id)
    })
  })
})

