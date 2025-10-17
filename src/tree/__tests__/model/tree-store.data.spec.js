import { describe, it, expect, beforeEach } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore - 数据管理', () => {
  describe('setData 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [
          { id: 1, label: '旧数据 1' },
          { id: 2, label: '旧数据 2' }
        ],
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该更新树的数据', () => {
      const newData = [
        { id: 3, label: '新数据 1' },
        { id: 4, label: '新数据 2' }
      ]

      store.setData(newData)

      expect(store.root.data).toBe(newData)
      expect(store.root.childNodes.length).toBe(2)
      expect(store.getNode(3)).toBeDefined()
      expect(store.getNode(4)).toBeDefined()
    })

    it('应该清除旧节点的映射', () => {
      expect(store.getNode(1)).toBeDefined()
      expect(store.getNode(2)).toBeDefined()

      const newData = [{ id: 5, label: '新数据' }]
      store.setData(newData)

      // 旧节点应该不存在了（因为 root.setData 会清空 childNodes 并重新创建）
      expect(store.root.childNodes.length).toBe(1)
      expect(store.getNode(5)).toBeDefined()
    })

    it('应该处理嵌套数据', () => {
      const newData = [
        {
          id: 10,
          label: '一级',
          children: [
            { id: 101, label: '二级' }
          ]
        }
      ]

      store.setData(newData)

      expect(store.root.childNodes.length).toBe(1)
      expect(store.getNode(10)).toBeDefined()
      expect(store.getNode(101)).toBeDefined()
    })

    it('当数据引用相同时，不应该重新构建树', () => {
      const oldRoot = store.root
      const sameData = store.root.data

      store.setData(sameData)

      expect(store.root).toBe(oldRoot)
      // 因为是同一个引用，不会重新 setData
    })
  })
})

