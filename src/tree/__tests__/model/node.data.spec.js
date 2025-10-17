import { describe, it, expect, beforeEach } from 'vitest'
import Node from '../../src/model/node.js'
import TreeStore from '../../src/model/tree-store.js'

describe('Node - 数据处理', () => {
  describe('setData 方法 - 递归创建子节点树', () => {
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

    it('应该能够递归创建子节点树', () => {
      const data = {
        id: 1,
        label: '节点1',
        children: [
          { id: 11, label: '节点1-1' },
          { id: 12, label: '节点1-2' }
        ]
      }

      const node = new Node({
        data: data,
        store: store
      })

      expect(node.childNodes.length).toBe(2)
      expect(node.childNodes[0].data.id).toBe(11)
      expect(node.childNodes[1].data.id).toBe(12)
    })

    it('应该正确处理多层嵌套的子节点', () => {
      const data = {
        id: 1,
        label: '节点1',
        children: [
          {
            id: 11,
            label: '节点1-1',
            children: [
              { id: 111, label: '节点1-1-1' },
              { id: 112, label: '节点1-1-2' }
            ]
          },
          { id: 12, label: '节点1-2' }
        ]
      }

      const node = new Node({
        data: data,
        store: store
      })

      expect(node.childNodes.length).toBe(2)
      expect(node.childNodes[0].childNodes.length).toBe(2)
      expect(node.childNodes[0].childNodes[0].data.id).toBe(111)
      expect(node.childNodes[0].childNodes[1].data.id).toBe(112)
    })

    it('根节点（level 0）应该将数组数据作为子节点', () => {
      const data = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' }
      ]

      const root = new Node({
        data: data,
        store: store
      })

      expect(root.level).toBe(0)
      expect(root.childNodes.length).toBe(2)
      expect(root.childNodes[0].data.id).toBe(1)
      expect(root.childNodes[1].data.id).toBe(2)
    })

    it('应该清空原有的 childNodes', () => {
      const node = new Node({
        data: { id: 1, label: '节点1', children: [] },
        store: store
      })

      // 手动添加子节点
      node.childNodes.push(new Node({
        data: { id: 999 },
        store: store
      }))

      expect(node.childNodes.length).toBe(1)

      // 调用 setData 应该清空
      node.setData({
        id: 1,
        label: '节点1',
        children: [
          { id: 2, label: '节点2' }
        ]
      })

      expect(node.childNodes.length).toBe(1)
      expect(node.childNodes[0].data.id).toBe(2)
    })

    it('没有 children 字段时，应该创建空的 childNodes', () => {
      const node = new Node({
        data: { id: 1, label: '节点1' },
        store: store
      })

      expect(node.childNodes).toEqual([])
    })

    it('应该支持自定义 children 字段名', () => {
      const customStore = new TreeStore({
        key: 'id',
        data: [],
        props: {
          label: 'label',
          children: 'items' // 自定义字段名
        }
      })

      const data = {
        id: 1,
        label: '节点1',
        items: [
          { id: 11, label: '节点1-1' },
          { id: 12, label: '节点1-2' }
        ]
      }

      const node = new Node({
        data: data,
        store: customStore
      })

      expect(node.childNodes.length).toBe(2)
    })
  })

  describe('label getter', () => {
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

    it('应该返回正确的 label 值', () => {
      const node = new Node({
        data: { id: 1, label: '测试标签' },
        store: store
      })

      expect(node.label).toBe('测试标签')
    })

    it('应该支持自定义 label 字段名', () => {
      const customStore = new TreeStore({
        key: 'id',
        data: [],
        props: {
          label: 'name', // 自定义字段名
          children: 'children'
        }
      })

      const node = new Node({
        data: { id: 1, name: '自定义名称' },
        store: customStore
      })

      expect(node.label).toBe('自定义名称')
    })

    it('label 字段不存在时应该返回 undefined', () => {
      const node = new Node({
        data: { id: 1 },
        store: store
      })

      expect(node.label).toBeUndefined()
    })
  })

  describe('key getter', () => {
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

    it('应该返回正确的 key 值', () => {
      const node = new Node({
        data: { id: 123, label: 'test' },
        store: store
      })

      expect(node.key).toBe(123)
    })

    it('应该支持字符串类型的 key', () => {
      const node = new Node({
        data: { id: 'abc123', label: 'test' },
        store: store
      })

      expect(node.key).toBe('abc123')
    })

    it('data 为空时应该返回 null', () => {
      const node = new Node({
        data: null,
        store: store
      })

      expect(node.key).toBeNull()
    })

    it('应该使用 store 中配置的 key 字段', () => {
      const customStore = new TreeStore({
        key: 'customId',
        data: [],
        props: {
          label: 'label',
          children: 'children'
        }
      })

      const node = new Node({
        data: { customId: 'custom123', label: 'test' },
        store: customStore
      })

      expect(node.key).toBe('custom123')
    })
  })
})

