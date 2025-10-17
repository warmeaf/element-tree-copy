import { describe, it, expect, beforeEach } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore 状态管理类', () => {
  describe('构造函数', () => {
    it('应该导出 TreeStore 类', () => {
      expect(TreeStore).toBeDefined()
      expect(typeof TreeStore).toBe('function')
    })

    it('应该能够创建 TreeStore 实例', () => {
      const store = new TreeStore({})
      expect(store).toBeInstanceOf(TreeStore)
    })

    it('应该是一个类构造函数', () => {
      expect(TreeStore.prototype.constructor).toBe(TreeStore)
    })

    it('应该初始化 currentNode 为 null', () => {
      const store = new TreeStore({})
      expect(store.currentNode).toBeNull()
    })

    it('应该初始化 currentNodeKey 为 null', () => {
      const store = new TreeStore({})
      expect(store.currentNodeKey).toBeNull()
    })

    it('应该初始化 nodesMap 为空对象', () => {
      const store = new TreeStore({})
      expect(store.nodesMap).toBeDefined()
      expect(typeof store.nodesMap).toBe('object')
      expect(Object.keys(store.nodesMap).length).toBe(0)
    })

    it('应该复制传入的配置选项', () => {
      const options = {
        key: 'id',
        data: [{ id: 1, label: 'test' }],
        props: { label: 'label', children: 'children' },
        lazy: false
      }
      
      const store = new TreeStore(options)
      
      expect(store.key).toBe('id')
      expect(store.data).toEqual([{ id: 1, label: 'test' }])
      expect(store.props).toEqual({ label: 'label', children: 'children' })
      expect(store.lazy).toBe(false)
    })
  })

  describe('registerNode 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: []
      })
    })

    it('应该将节点注册到 nodesMap', () => {
      const mockNode = {
        data: { id: 1, label: 'test' },
        key: 1
      }

      store.registerNode(mockNode)

      expect(store.nodesMap[1]).toBe(mockNode)
    })

    it('应该使用节点的 key 属性作为 map 的键', () => {
      const mockNode = {
        data: { id: 'abc', label: 'test' },
        key: 'abc'
      }

      store.registerNode(mockNode)

      expect(store.nodesMap['abc']).toBe(mockNode)
    })

    it('当 key 未定义时，不应该注册节点', () => {
      const mockNode = {
        data: { label: 'test' },
        key: undefined
      }

      store.registerNode(mockNode)

      expect(Object.keys(store.nodesMap).length).toBe(0)
    })

    it('当节点没有 data 时，不应该注册节点', () => {
      const mockNode = {
        data: null,
        key: 1
      }

      store.registerNode(mockNode)

      expect(Object.keys(store.nodesMap).length).toBe(0)
    })

    it('当 store 没有 key 配置时，不应该注册节点', () => {
      const storeWithoutKey = new TreeStore({})
      const mockNode = {
        data: { id: 1, label: 'test' },
        key: 1
      }

      storeWithoutKey.registerNode(mockNode)

      expect(Object.keys(storeWithoutKey.nodesMap).length).toBe(0)
    })

    it('应该能够注册多个节点', () => {
      const node1 = { data: { id: 1, label: 'test1' }, key: 1 }
      const node2 = { data: { id: 2, label: 'test2' }, key: 2 }

      store.registerNode(node1)
      store.registerNode(node2)

      expect(store.nodesMap[1]).toBe(node1)
      expect(store.nodesMap[2]).toBe(node2)
      expect(Object.keys(store.nodesMap).length).toBe(2)
    })
  })

  describe('deregisterNode 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: []
      })
    })

    it('应该从 nodesMap 中移除节点', () => {
      const mockNode = {
        data: { id: 1, label: 'test' },
        key: 1,
        childNodes: []
      }

      store.registerNode(mockNode)
      expect(store.nodesMap[1]).toBe(mockNode)

      store.deregisterNode(mockNode)
      expect(store.nodesMap[1]).toBeUndefined()
    })

    it('应该递归移除所有子节点', () => {
      const child1 = {
        data: { id: 2, label: 'child1' },
        key: 2,
        childNodes: []
      }
      const child2 = {
        data: { id: 3, label: 'child2' },
        key: 3,
        childNodes: []
      }
      const parent = {
        data: { id: 1, label: 'parent' },
        key: 1,
        childNodes: [child1, child2]
      }

      store.registerNode(parent)
      store.registerNode(child1)
      store.registerNode(child2)

      expect(Object.keys(store.nodesMap).length).toBe(3)

      store.deregisterNode(parent)

      expect(store.nodesMap[1]).toBeUndefined()
      expect(store.nodesMap[2]).toBeUndefined()
      expect(store.nodesMap[3]).toBeUndefined()
      expect(Object.keys(store.nodesMap).length).toBe(0)
    })

    it('当节点没有 data 时，不应该抛出错误', () => {
      const mockNode = {
        data: null,
        key: 1,
        childNodes: []
      }

      expect(() => store.deregisterNode(mockNode)).not.toThrow()
    })

    it('当 store 没有 key 配置时，不应该抛出错误', () => {
      const storeWithoutKey = new TreeStore({})
      const mockNode = {
        data: { id: 1 },
        key: 1,
        childNodes: []
      }

      expect(() => storeWithoutKey.deregisterNode(mockNode)).not.toThrow()
    })

    it('应该处理深层嵌套的子节点', () => {
      const grandChild = {
        data: { id: 4, label: 'grandchild' },
        key: 4,
        childNodes: []
      }
      const child = {
        data: { id: 2, label: 'child' },
        key: 2,
        childNodes: [grandChild]
      }
      const parent = {
        data: { id: 1, label: 'parent' },
        key: 1,
        childNodes: [child]
      }

      store.registerNode(parent)
      store.registerNode(child)
      store.registerNode(grandChild)

      expect(Object.keys(store.nodesMap).length).toBe(3)

      store.deregisterNode(parent)

      expect(Object.keys(store.nodesMap).length).toBe(0)
    })
  })
})

