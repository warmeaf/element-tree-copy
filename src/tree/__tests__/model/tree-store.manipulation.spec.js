import { describe, it, expect, beforeEach } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore - 节点操作', () => {
  describe('append 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [
          {
            id: 1,
            label: '一级 1',
            children: [
              { id: 11, label: '二级 1-1' }
            ]
          }
        ],
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该在根节点追加子节点', () => {
      store.append({ id: 2, label: '一级 2' })

      expect(store.root.childNodes.length).toBe(2)
      expect(store.getNode(2)).toBeDefined()
      expect(store.getNode(2).label).toBe('一级 2')
    })

    it('应该在指定节点追加子节点', () => {
      store.append({ id: 12, label: '二级 1-2' }, { id: 1 })

      const parentNode = store.getNode(1)
      expect(parentNode.childNodes.length).toBe(2)
      expect(store.getNode(12)).toBeDefined()
      expect(store.getNode(12).parent).toBe(parentNode)
    })

    it('应该正确设置新节点的层级', () => {
      store.append({ id: 12, label: '二级 1-2' }, { id: 1 })

      const newNode = store.getNode(12)
      expect(newNode.level).toBe(2)
    })

    it('应该将新节点注册到 nodesMap', () => {
      const beforeCount = Object.keys(store.nodesMap).length

      store.append({ id: 2, label: '一级 2' })

      expect(Object.keys(store.nodesMap).length).toBe(beforeCount + 1)
      expect(store.nodesMap[2]).toBeDefined()
    })

    it('当父节点不存在时，不应该抛出错误', () => {
      expect(() => {
        store.append({ id: 99, label: 'test' }, { id: 999 })
      }).not.toThrow()
    })

    it('应该支持通过 key 指定父节点', () => {
      store.append({ id: 12, label: '二级 1-2' }, 1)

      expect(store.getNode(12)).toBeDefined()
      expect(store.getNode(12).parent.data.id).toBe(1)
    })
  })

  describe('insertBefore 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [
          {
            id: 1,
            label: '一级 1',
            children: [
              { id: 11, label: '二级 1-1' },
              { id: 12, label: '二级 1-2' }
            ]
          }
        ],
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该在指定节点之前插入', () => {
      store.insertBefore({ id: 13, label: '二级 1-3' }, { id: 12 })

      const parentNode = store.getNode(1)
      const childLabels = parentNode.childNodes.map(n => n.label)

      expect(childLabels).toEqual(['二级 1-1', '二级 1-3', '二级 1-2'])
    })

    it('应该在第一个节点之前插入', () => {
      store.insertBefore({ id: 10, label: '二级 1-0' }, { id: 11 })

      const parentNode = store.getNode(1)
      expect(parentNode.childNodes[0].data.id).toBe(10)
    })

    it('应该正确设置新节点的层级', () => {
      store.insertBefore({ id: 13, label: '二级 1-3' }, { id: 12 })

      const newNode = store.getNode(13)
      expect(newNode.level).toBe(2)
    })

    it('应该将新节点注册到 nodesMap', () => {
      store.insertBefore({ id: 13, label: '二级 1-3' }, { id: 12 })

      expect(store.nodesMap[13]).toBeDefined()
    })

    it('应该支持通过 key 指定参考节点', () => {
      store.insertBefore({ id: 13, label: '二级 1-3' }, 12)

      const parentNode = store.getNode(1)
      const childIds = parentNode.childNodes.map(n => n.data.id)

      expect(childIds).toEqual([11, 13, 12])
    })
  })

  describe('insertAfter 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [
          {
            id: 1,
            label: '一级 1',
            children: [
              { id: 11, label: '二级 1-1' },
              { id: 12, label: '二级 1-2' }
            ]
          }
        ],
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该在指定节点之后插入', () => {
      store.insertAfter({ id: 13, label: '二级 1-3' }, { id: 11 })

      const parentNode = store.getNode(1)
      const childLabels = parentNode.childNodes.map(n => n.label)

      expect(childLabels).toEqual(['二级 1-1', '二级 1-3', '二级 1-2'])
    })

    it('应该在最后一个节点之后插入', () => {
      store.insertAfter({ id: 13, label: '二级 1-3' }, { id: 12 })

      const parentNode = store.getNode(1)
      expect(parentNode.childNodes[2].data.id).toBe(13)
    })

    it('应该正确设置新节点的层级', () => {
      store.insertAfter({ id: 13, label: '二级 1-3' }, { id: 11 })

      const newNode = store.getNode(13)
      expect(newNode.level).toBe(2)
    })

    it('应该将新节点注册到 nodesMap', () => {
      store.insertAfter({ id: 13, label: '二级 1-3' }, { id: 11 })

      expect(store.nodesMap[13]).toBeDefined()
    })

    it('应该支持通过 key 指定参考节点', () => {
      store.insertAfter({ id: 13, label: '二级 1-3' }, 11)

      const parentNode = store.getNode(1)
      const childIds = parentNode.childNodes.map(n => n.data.id)

      expect(childIds).toEqual([11, 13, 12])
    })
  })

  describe('remove 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [
          {
            id: 1,
            label: '一级 1',
            children: [
              { id: 11, label: '二级 1-1' },
              { id: 12, label: '二级 1-2' }
            ]
          },
          { id: 2, label: '一级 2' }
        ],
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该删除指定节点', () => {
      store.remove({ id: 2 })

      expect(store.getNode(2)).toBeNull()
      expect(store.root.childNodes.length).toBe(1)
    })

    it('应该从父节点的 childNodes 中移除', () => {
      const parentNode = store.getNode(1)
      const beforeCount = parentNode.childNodes.length

      store.remove({ id: 11 })

      expect(parentNode.childNodes.length).toBe(beforeCount - 1)
      expect(parentNode.childNodes.find(n => n.data.id === 11)).toBeUndefined()
    })

    it('应该从 nodesMap 中移除节点', () => {
      store.remove({ id: 11 })

      expect(store.nodesMap[11]).toBeUndefined()
    })

    it('应该递归删除所有子节点', () => {
      // 节点 1 有两个子节点 11 和 12
      expect(store.getNode(11)).toBeDefined()
      expect(store.getNode(12)).toBeDefined()

      store.remove({ id: 1 })

      expect(store.getNode(1)).toBeNull()
      expect(store.getNode(11)).toBeNull()
      expect(store.getNode(12)).toBeNull()
    })

    it('当删除的是当前节点时，应该清空 currentNode', () => {
      store.setCurrentNodeKey(1)
      expect(store.currentNode).not.toBeNull()

      store.remove({ id: 1 })

      expect(store.currentNode).toBeNull()
    })

    it('应该支持通过 key 删除节点', () => {
      store.remove(2)

      expect(store.getNode(2)).toBeNull()
    })

    it('当节点没有父节点时，不应该抛出错误', () => {
      // root 节点没有 parent
      expect(() => {
        store.remove(store.root.data)
      }).not.toThrow()
    })

    it('当节点不存在时，不应该抛出错误', () => {
      expect(() => {
        store.remove({ id: 999 })
      }).not.toThrow()
    })
  })

  describe('updateChildren 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [
          {
            id: 1,
            label: '一级 1',
            children: [
              { id: 11, label: '二级 1-1' },
              { id: 12, label: '二级 1-2' }
            ]
          }
        ],
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该更新指定节点的子节点列表', () => {
      const newChildren = [
        { id: 13, label: '新二级 1-3' },
        { id: 14, label: '新二级 1-4' }
      ]

      store.updateChildren(1, newChildren)

      const parentNode = store.getNode(1)
      expect(parentNode.childNodes.length).toBe(2)
      expect(store.getNode(13)).toBeDefined()
      expect(store.getNode(14)).toBeDefined()
    })

    it('应该删除旧的子节点', () => {
      const newChildren = [
        { id: 13, label: '新二级 1-3' }
      ]

      expect(store.getNode(11)).toBeDefined()
      expect(store.getNode(12)).toBeDefined()

      store.updateChildren(1, newChildren)

      expect(store.getNode(11)).toBeNull()
      expect(store.getNode(12)).toBeNull()
    })

    it('应该注销旧子节点的所有后代', () => {
      // 给节点 11 添加子节点
      store.append({ id: 111, label: '三级 1-1-1' }, { id: 11 })
      expect(store.getNode(111)).toBeDefined()

      const newChildren = [
        { id: 13, label: '新二级 1-3' }
      ]

      store.updateChildren(1, newChildren)

      // 节点 11 的子节点也应该被删除
      expect(store.getNode(111)).toBeNull()
    })

    it('应该正确设置新子节点的层级', () => {
      const newChildren = [
        { id: 13, label: '新二级 1-3' }
      ]

      store.updateChildren(1, newChildren)

      const newNode = store.getNode(13)
      expect(newNode.level).toBe(2)
    })

    it('当节点不存在时不应该抛出错误', () => {
      expect(() => {
        store.updateChildren(999, [{ id: 100, label: 'test' }])
      }).not.toThrow()
    })

    it('应该支持空数组（清空子节点）', () => {
      store.updateChildren(1, [])

      const parentNode = store.getNode(1)
      expect(parentNode.childNodes.length).toBe(0)
      expect(parentNode.isLeaf).toBe(true)
    })

    it('应该同步更新原始数据', () => {
      const parentData = store.getNode(1).data
      
      const newChildren = [
        { id: 13, label: '新二级 1-3' },
        { id: 14, label: '新二级 1-4' }
      ]

      store.updateChildren(1, newChildren)

      expect(parentData.children.length).toBe(2)
      expect(parentData.children[0].id).toBe(13)
      expect(parentData.children[1].id).toBe(14)
    })
  })
})
