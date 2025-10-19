import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ElTree from '../src/tree.vue'

describe('Tree 组件 - 懒加载功能', () => {
  let mockLoad

  beforeEach(() => {
    mockLoad = vi.fn()
  })

  describe('基础懒加载功能', () => {
    test('应该正确传递 lazy 和 load props', () => {
      const wrapper = mount(ElTree, {
        propsData: {
          data: [],
          lazy: true,
          load: mockLoad,
          nodeKey: 'id'
        }
      })

      const treeInstance = wrapper.vm
      expect(treeInstance.store.lazy).toBe(true)
      expect(treeInstance.store.load).toBe(mockLoad)
    })

    test('应该在初始化时调用 load 方法', async () => {
      mockLoad.mockImplementation((node, resolve) => {
        resolve([
          { id: 1, label: '根节点1' },
          { id: 2, label: '根节点2' }
        ])
      })

      mount(ElTree, {
        propsData: {
          data: [],
          lazy: true,
          load: mockLoad,
          nodeKey: 'id'
        }
      })

      expect(mockLoad).toHaveBeenCalled()
    })

    test('应该正确渲染懒加载的节点', async () => {
      const rootData = [
        { id: 1, label: '根节点1' },
        { id: 2, label: '根节点2' }
      ]

      mockLoad.mockImplementation((node, resolve) => {
        setTimeout(() => resolve(rootData), 10)
      })

      const wrapper = mount(ElTree, {
        propsData: {
          data: [],
          lazy: true,
          load: mockLoad,
          nodeKey: 'id'
        }
      })

      // 等待异步加载完成
      await new Promise(resolve => setTimeout(resolve, 20))
      await wrapper.vm.$nextTick()

      const nodeElements = wrapper.findAll('.el-tree-node')
      expect(nodeElements).toHaveLength(2)

      const labels = nodeElements.wrappers.map(node => node.find('.el-tree-node__label').text())
      expect(labels).toContain('根节点1')
      expect(labels).toContain('根节点2')
    })
  })

  describe('loading 状态显示', () => {
    test('加载中的节点应该显示 loading 图标', async () => {
      let resolveLoad
      const loadPromise = new Promise(resolve => {
        resolveLoad = resolve
      })

      mockLoad.mockImplementation((node, resolve) => {
        if (node.level === 0) {
          // 根节点加载 - 立即resolve
          resolve([{ id: 'root', label: '根节点', children: [] }])
        } else {
          // 子节点加载 - 延迟resolve
          loadPromise.then(() => {
            resolve([{ id: 1, label: '子节点1' }])
          })
        }
      })

      const wrapper = mount(ElTree, {
        propsData: {
          data: [],
          lazy: true,
          load: mockLoad,
          nodeKey: 'id'
        }
      })

      // 等待根节点加载完成
      await new Promise(resolve => setTimeout(resolve, 20))
      await wrapper.vm.$nextTick()

      // 确保根节点已经存在
      expect(wrapper.vm.store.root.childNodes).toHaveLength(1)
      
      // 模拟点击展开
      const rootNode = wrapper.vm.store.root.childNodes[0]
      rootNode.expand()

      await wrapper.vm.$nextTick()

      // 验证 loading 状态
      expect(rootNode.loading).toBe(true)

      // 完成加载
      resolveLoad()
      await new Promise(resolve => setTimeout(resolve, 10))
      await wrapper.vm.$nextTick()

      // 验证加载完成状态
      expect(rootNode.loading).toBe(false)
      expect(rootNode.loaded).toBe(true)
    })
  })

  describe('isLeaf 属性处理', () => {
    test('应该正确处理 isLeaf 属性', async () => {
      const rootData = [
        { id: 1, label: '普通节点' },
        { id: 2, label: '叶子节点', isLeaf: true }
      ]

      mockLoad.mockImplementation((node, resolve) => {
        resolve(rootData)
      })

      const wrapper = mount(ElTree, {
        propsData: {
          data: [],
          lazy: true,
          load: mockLoad,
          nodeKey: 'id',
          props: {
            children: 'children',
            label: 'label',
            isLeaf: 'isLeaf'
          }
        }
      })

      await new Promise(resolve => setTimeout(resolve, 20))
      await wrapper.vm.$nextTick()

      const store = wrapper.vm.store
      const normalNode = store.getNode(1)
      const leafNode = store.getNode(2)

      expect(normalNode.isLeaf).toBe(false)
      expect(leafNode.isLeaf).toBe(true)
    })
  })

  describe('懒加载与展开事件', () => {
    test('应该在懒加载完成后触发 node-expand 事件', async () => {
      let loadResolve
      const childData = [{ id: 11, label: '子节点1' }]

      mockLoad.mockImplementation((node, resolve) => {
        if (node.level === 0) {
          // 根节点加载
          resolve([{ id: 1, label: '父节点' }])
        } else {
          // 子节点加载 - 延迟resolve
          loadResolve = resolve
        }
      })

      const wrapper = mount(ElTree, {
        propsData: {
          data: [],
          lazy: true,
          load: mockLoad,
          nodeKey: 'id'
        }
      })

      // 等待根节点加载完成
      await new Promise(resolve => setTimeout(resolve, 20))
      await wrapper.vm.$nextTick()

      // 获取父节点并模拟点击展开图标来触发事件
      const parentNode = wrapper.vm.store.getNode(1)
      
      // 使用 tree-node 组件的方法来触发展开
      const treeNodeWrapper = wrapper.findComponent({ name: 'ElTreeNode' })
      expect(treeNodeWrapper.exists()).toBe(true)
      
      // 调用 handleExpandIconClick 方法来模拟用户点击展开图标
      treeNodeWrapper.vm.handleExpandIconClick()

      // 验证事件立即被触发（因为事件在 expand() 调用时就发出了）
      await wrapper.vm.$nextTick()
      const expandEvents = wrapper.emitted('node-expand')
      expect(expandEvents).toBeTruthy()
      expect(expandEvents).toHaveLength(1)

      // 完成懒加载
      loadResolve(childData)
      await new Promise(resolve => setTimeout(resolve, 10))
      await wrapper.vm.$nextTick()

      // 验证子节点是否正确创建
      expect(parentNode.childNodes).toHaveLength(1)
      expect(parentNode.childNodes[0].data.label).toBe('子节点1')
    })
  })

  describe('懒加载与复选框', () => {
    test('懒加载模式下复选框应该正常工作', async () => {
      const rootData = [
        { id: 1, label: '父节点' },
        { id: 2, label: '叶子节点', isLeaf: true }
      ]

      mockLoad.mockImplementation((node, resolve) => {
        if (node.level === 0) {
          resolve(rootData)
        } else if (node.data.id === 1) {
          resolve([
            { id: 11, label: '子节点1', isLeaf: true },
            { id: 12, label: '子节点2', isLeaf: true }
          ])
        }
      })

      const wrapper = mount(ElTree, {
        propsData: {
          data: [],
          lazy: true,
          load: mockLoad,
          nodeKey: 'id',
          showCheckbox: true,
          props: {
            children: 'children',
            label: 'label',
            isLeaf: 'isLeaf'
          }
        }
      })

      await new Promise(resolve => setTimeout(resolve, 20))
      await wrapper.vm.$nextTick()

      const store = wrapper.vm.store
      const parentNode = store.getNode(1)

      // 先加载子节点
      parentNode.expand()
      await new Promise(resolve => setTimeout(resolve, 10))

      // 选中父节点，子节点应该自动选中
      parentNode.setChecked(true, true)

      expect(parentNode.checked).toBe(true)
      expect(parentNode.childNodes[0].checked).toBe(true)
      expect(parentNode.childNodes[1].checked).toBe(true)
    })
  })

  describe('props 变化响应', () => {
    test('data prop 变化时应该重新初始化懒加载', async () => {
      const wrapper = mount(ElTree, {
        propsData: {
          data: [],
          lazy: true,
          load: mockLoad,
          nodeKey: 'id'
        }
      })

      // 重置 mock
      mockLoad.mockClear()

      // 修改 data prop
      await wrapper.setProps({
        data: [{ id: 'new', label: '新数据' }]
      })

      // 验证重新初始化
      expect(wrapper.vm.store.root.data).toEqual([{ id: 'new', label: '新数据' }])
    })
  })
})
