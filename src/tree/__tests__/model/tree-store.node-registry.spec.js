import { describe, it, expect, beforeEach } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore - 节点注册管理', () => {
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

  describe('getNode 方法', () => {
    let store

    beforeEach(() => {
      const data = [
        {
          id: 1,
          label: '一级 1',
          children: [
            { id: 11, label: '二级 1-1' }
          ]
        },
        { id: 2, label: '一级 2' }
      ]

      store = new TreeStore({
        key: 'id',
        data,
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该通过 key 查找节点', () => {
      const node = store.getNode(1)
      expect(node).toBeDefined()
      expect(node.data.label).toBe('一级 1')
    })

    it('应该通过 data 对象查找节点', () => {
      const data = { id: 2, label: '一级 2' }
      const node = store.getNode(data)
      expect(node).toBeDefined()
      expect(node.data.id).toBe(2)
    })

    it('应该能查找子节点', () => {
      const node = store.getNode(11)
      expect(node).toBeDefined()
      expect(node.data.label).toBe('二级 1-1')
      expect(node.level).toBe(2)
    })

    it('如果传入的是 Node 实例，应该直接返回', () => {
      const node1 = store.getNode(1)
      const node2 = store.getNode(node1)
      expect(node2).toBe(node1)
    })

    it('查找不存在的节点应该返回 null', () => {
      const node = store.getNode(999)
      expect(node).toBeNull()
    })

    it('应该支持字符串类型的 key', () => {
      const data = [{ id: 'abc', label: 'test' }]
      const store2 = new TreeStore({
        key: 'id',
        data,
        props: { label: 'label' }
      })

      const node = store2.getNode('abc')
      expect(node).toBeDefined()
      expect(node.data.label).toBe('test')
    })
  })
})

