import { describe, test, expect, vi, beforeEach } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore - 懒加载功能', () => {
  let mockLoad

  beforeEach(() => {
    mockLoad = vi.fn()
  })

  describe('懒加载初始化', () => {
    test('启用懒加载时应该调用 load 方法加载根节点数据', async () => {
      const rootData = [
        { id: 1, label: '根节点1' },
        { id: 2, label: '根节点2' }
      ]

      mockLoad.mockImplementation((node, resolve) => {
        setTimeout(() => resolve(rootData), 10)
      })

      const store = new TreeStore({
        lazy: true,
        load: mockLoad,
        data: []
      })

      // 验证 load 方法被调用
      expect(mockLoad).toHaveBeenCalledWith(store.root, expect.any(Function))

      // 等待异步完成
      await new Promise(resolve => setTimeout(resolve, 20))

      // 验证根节点创建了子节点
      expect(store.root.childNodes).toHaveLength(2)
      expect(store.root.childNodes[0].data.label).toBe('根节点1')
      expect(store.root.childNodes[1].data.label).toBe('根节点2')
    })

    test('不启用懒加载时不应该调用 load 方法', () => {
      const store = new TreeStore({
        lazy: false,
        load: mockLoad,
        data: [
          { id: 1, label: '节点1' },
          { id: 2, label: '节点2' }
        ]
      })

      expect(mockLoad).not.toHaveBeenCalled()
      expect(store.root.childNodes).toHaveLength(2)
    })

    test('没有 load 方法时不应该触发懒加载', () => {
      const store = new TreeStore({
        lazy: true,
        data: []
      })

      expect(store.root.childNodes).toHaveLength(0)
    })
  })

  describe('懒加载配置传递', () => {
    test('应该正确传递 lazy 配置到节点', () => {
      const store = new TreeStore({
        lazy: true,
        load: mockLoad,
        data: []
      })

      expect(store.lazy).toBe(true)
      expect(store.load).toBe(mockLoad)

      // 创建新节点时应该能访问 store 的懒加载配置
      const rootNode = store.root
      expect(rootNode.store.lazy).toBe(true)
      expect(rootNode.store.load).toBe(mockLoad)
    })

    test('应该正确传递 props 配置包含 isLeaf', () => {
      const props = {
        children: 'children',
        label: 'label',
        isLeaf: 'leaf'
      }

      const store = new TreeStore({
        lazy: true,
        load: mockLoad,
        props,
        data: []
      })

      expect(store.props).toEqual(props)
      expect(store.props.isLeaf).toBe('leaf')
    })
  })

  describe('懒加载与节点操作结合', () => {
    test('append 操作在懒加载模式下正常工作', async () => {
      // 模拟根节点加载完成
      mockLoad.mockImplementation((node, resolve) => {
        setTimeout(() => resolve([{ id: 1, label: '根节点1' }]), 5)
      })

      const store = new TreeStore({
        lazy: true,
        load: mockLoad,
        nodeKey: 'id',
        data: []
      })

      await new Promise(resolve => setTimeout(resolve, 10))

      // 在根节点下添加子节点
      const newNodeData = { id: 11, label: '新子节点' }
      store.append(newNodeData, { id: 1, label: '根节点1' })

      const rootChild = store.root.childNodes[0]
      expect(rootChild.childNodes).toHaveLength(1)
      expect(rootChild.childNodes[0].data.label).toBe('新子节点')
    })

    test('remove 操作在懒加载模式下正常工作', async () => {
      // 模拟根节点加载完成
      mockLoad.mockImplementation((node, resolve) => {
        setTimeout(() => resolve([
          { id: 1, label: '根节点1' },
          { id: 2, label: '根节点2' }
        ]), 5)
      })

      const store = new TreeStore({
        lazy: true,
        load: mockLoad,
        nodeKey: 'id',
        data: []
      })

      await new Promise(resolve => setTimeout(resolve, 10))

      // 删除节点
      store.remove({ id: 1, label: '根节点1' })

      expect(store.root.childNodes).toHaveLength(1)
      expect(store.root.childNodes[0].data.label).toBe('根节点2')
    })
  })

  describe('懒加载与节点查找', () => {
    test('getNode 应该能在懒加载模式下正常查找节点', async () => {
      const rootData = [
        { id: 1, label: '根节点1' },
        { id: 2, label: '根节点2' }
      ]

      mockLoad.mockImplementation((node, resolve) => {
        setTimeout(() => resolve(rootData), 5)
      })

      const store = new TreeStore({
        lazy: true,
        load: mockLoad,
        key: 'id',
        data: []
      })

      await new Promise(resolve => setTimeout(resolve, 10))

      const node1 = store.getNode(1)
      const node2 = store.getNode({ id: 2, label: '根节点2' })

      expect(node1).toBeTruthy()
      expect(node1.data.label).toBe('根节点1')
      expect(node2).toBeTruthy()
      expect(node2.data.label).toBe('根节点2')
    })
  })
})
