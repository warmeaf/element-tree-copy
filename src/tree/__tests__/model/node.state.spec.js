import { describe, it, expect, beforeEach } from 'vitest'
import Node from '../../src/model/node.js'
import TreeStore from '../../src/model/tree-store.js'

describe('Node - 状态管理', () => {
  let store

  beforeEach(() => {
    store = new TreeStore({
      key: 'id',
      data: [],
      props: {
        label: 'label',
        children: 'children'
      }
    })
  })

  // Helper function: 创建有正确层级关系的节点
  const createTestNode = (data = { id: 1, label: 'node' }) => {
    const grandParent = new Node({
      data: [],
      store: store
    })
    
    return new Node({
      data: data,
      parent: grandParent,
      store: store
    })
  }

  describe('expand 和 collapse 方法', () => {

    it('应该能够展开节点', () => {
      const node = createTestNode()

      expect(node.expanded).toBe(false)

      node.expand()

      expect(node.expanded).toBe(true)
    })

    it('应该能够收起节点', () => {
      // 创建有层级的节点，并设置为展开状态
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: { id: 1, label: 'node' },
        parent: grandParent,
        store: store,
        expanded: true
      })

      expect(node.expanded).toBe(true)

      node.collapse()

      expect(node.expanded).toBe(false)
    })

    it('应该能够连续调用 expand 和 collapse', () => {
      const node = createTestNode({ id: 1, label: 'node' })

      node.expand()
      expect(node.expanded).toBe(true)

      node.collapse()
      expect(node.expanded).toBe(false)

      node.expand()
      expect(node.expanded).toBe(true)
    })
  })

  describe('updateLeafState 方法', () => {

    it('没有子节点时应该是叶子节点', () => {
      const node = createTestNode({ id: 1, label: 'node' })

      expect(node.isLeaf).toBe(true)
    })

    it('有子节点时不应该是叶子节点', () => {
      // 创建有层级的节点，包含子节点数据
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: {
          id: 1,
          label: 'node',
          children: [{ id: 2, label: 'child' }]
        },
        parent: grandParent,
        store: store
      })

      expect(node.isLeaf).toBe(false)
    })

    it('添加子节点后应该变为非叶子节点', () => {
      const node = createTestNode({ id: 1, label: 'node' })

      expect(node.isLeaf).toBe(true)

      node.insertChild({ data: { id: 2, label: 'child' } })

      expect(node.isLeaf).toBe(false)
    })

    it('移除所有子节点后应该变为叶子节点', () => {
      // 创建有层级的节点，包含子节点数据
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: {
          id: 1,
          label: 'node',
          children: [{ id: 2, label: 'child' }]
        },
        parent: grandParent,
        store: store
      })

      expect(node.isLeaf).toBe(false)

      node.childNodes[0].remove()

      expect(node.isLeaf).toBe(true)
    })
  })

  describe('当前节点初始化 (Step 7)', () => {
    it('当节点的 key 匹配 store.currentNodeKey 时，应该自动设置为当前节点', () => {
      const store = new TreeStore({
        key: 'id',
        data: [],
        currentNodeKey: 123,
        props: {
          label: 'label',
          children: 'children'
        }
      })

      // 创建有层级的节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: { id: 123, label: 'test' },
        parent: grandParent,
        store: store
      })

      expect(store.currentNode).toBe(node)
      expect(node.isCurrent).toBe(true)
    })

    it('当节点的 key 不匹配 store.currentNodeKey 时，不应该设置为当前节点', () => {
      const store = new TreeStore({
        key: 'id',
        data: [],
        currentNodeKey: 456,
        props: {
          label: 'label',
          children: 'children'
        }
      })

      // 创建有层级的节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: { id: 123, label: 'test' },
        parent: grandParent,
        store: store
      })

      expect(node.isCurrent).toBe(false)
      expect(store.currentNode).not.toBe(node)
    })

    it('当 store.currentNodeKey 为 undefined 时，不应该设置当前节点', () => {
      const store = new TreeStore({
        key: 'id',
        data: [],
        props: {
          label: 'label',
          children: 'children'
        }
      })

      // 创建有层级的节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: { id: 123, label: 'test' },
        parent: grandParent,
        store: store
      })

      expect(node.isCurrent).toBe(false)
      expect(store.currentNode).toBeNull()
    })

    it('应该支持字符串类型的 currentNodeKey', () => {
      const store = new TreeStore({
        key: 'id',
        data: [],
        currentNodeKey: 'node-abc',
        props: {
          label: 'label',
          children: 'children'
        }
      })

      // 创建有层级的节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: { id: 'node-abc', label: 'test' },
        parent: grandParent,
        store: store
      })

      expect(store.currentNode).toBe(node)
      expect(node.isCurrent).toBe(true)
    })

    it('在树的初始化过程中，应该正确设置匹配的节点为当前节点', () => {
      const store = new TreeStore({
        key: 'id',
        data: [
          { id: 1, label: '节点1' },
          { id: 2, label: '节点2' },
          { id: 3, label: '节点3' }
        ],
        currentNodeKey: 2,
        props: {
          label: 'label',
          children: 'children'
        }
      })

      const targetNode = store.getNode(2)
      expect(store.currentNode).toBe(targetNode)
      expect(targetNode.isCurrent).toBe(true)

      // 其他节点不应该是当前节点
      const node1 = store.getNode(1)
      const node3 = store.getNode(3)
      expect(node1.isCurrent).toBe(false)
      expect(node3.isCurrent).toBe(false)
    })

    it('在嵌套树中，应该正确找到并设置深层节点为当前节点', () => {
      const store = new TreeStore({
        key: 'id',
        data: [
          {
            id: 1,
            label: '一级 1',
            children: [
              {
                id: 11,
                label: '二级 1-1',
                children: [
                  { id: 111, label: '三级 1-1-1' }
                ]
              }
            ]
          }
        ],
        currentNodeKey: 111,
        props: {
          label: 'label',
          children: 'children'
        }
      })

      const targetNode = store.getNode(111)
      expect(store.currentNode).toBe(targetNode)
      expect(targetNode.isCurrent).toBe(true)
      expect(targetNode.label).toBe('三级 1-1-1')
    })
  })
})

