import { describe, it, expect } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore - 构造函数和基本结构', () => {
  describe('基本结构', () => {
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
  })

  describe('构造函数初始化', () => {
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

    it('应该创建根节点 (root)', () => {
      const data = [{ id: 1, label: 'test' }]
      const store = new TreeStore({
        key: 'id',
        data
      })

      expect(store.root).toBeDefined()
      expect(store.root.level).toBe(0)
      expect(store.root.data).toBe(data)
      expect(store.root.store).toBe(store)
    })

    it('应该通过 root 节点递归创建整棵树', () => {
      const data = [
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
        },
        {
          id: 2,
          label: '一级 2',
          children: [
            { id: 21, label: '二级 2-1' }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data,
        props: {
          label: 'label',
          children: 'children'
        }
      })

      expect(store.root.childNodes.length).toBe(2)
      expect(store.root.childNodes[0].childNodes.length).toBe(1)
      expect(store.root.childNodes[0].childNodes[0].childNodes.length).toBe(1)
      expect(Object.keys(store.nodesMap).length).toBe(5) // 所有节点应该被注册
    })
  })

  describe('构造函数 - currentNodeKey 配置 (Step 7)', () => {
    it('应该接收 currentNodeKey 配置', () => {
      const store = new TreeStore({
        key: 'id',
        data: [{ id: 1, label: '节点 1' }],
        currentNodeKey: 1,
        props: { label: 'label' }
      })

      expect(store.currentNodeKey).toBe(1)
    })

    it('初始化时应该根据 currentNodeKey 自动设置当前节点', () => {
      const store = new TreeStore({
        key: 'id',
        data: [
          { id: 1, label: '节点 1' },
          { id: 2, label: '节点 2' }
        ],
        currentNodeKey: 2,
        props: { label: 'label' }
      })

      const node = store.getNode(2)
      expect(store.currentNode).toBe(node)
      expect(node.isCurrent).toBe(true)
    })

    it('当 currentNodeKey 为 null 时，不应该设置当前节点', () => {
      const store = new TreeStore({
        key: 'id',
        data: [{ id: 1, label: '节点 1' }],
        currentNodeKey: null,
        props: { label: 'label' }
      })

      expect(store.currentNode).toBeNull()
    })

    it('当 currentNodeKey 为 undefined 时，不应该设置当前节点', () => {
      const store = new TreeStore({
        key: 'id',
        data: [{ id: 1, label: '节点 1' }],
        props: { label: 'label' }
      })

      expect(store.currentNode).toBeNull()
    })

    it('应该支持数字类型的 currentNodeKey', () => {
      const store = new TreeStore({
        key: 'id',
        data: [{ id: 123, label: '节点' }],
        currentNodeKey: 123,
        props: { label: 'label' }
      })

      expect(store.currentNode.data.id).toBe(123)
    })

    it('应该支持字符串类型的 currentNodeKey', () => {
      const store = new TreeStore({
        key: 'id',
        data: [{ id: 'abc', label: '节点' }],
        currentNodeKey: 'abc',
        props: { label: 'label' }
      })

      expect(store.currentNode.data.id).toBe('abc')
    })
  })
})

