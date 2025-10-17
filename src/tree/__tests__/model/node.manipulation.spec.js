import { describe, it, expect, beforeEach } from 'vitest'
import Node from '../../src/model/node.js'
import TreeStore from '../../src/model/tree-store.js'

describe('Node - 节点操作', () => {
  describe('insertChild 方法', () => {
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

    it('应该能够插入子节点', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      expect(parent.childNodes.length).toBe(0)

      parent.insertChild({
        data: { id: 2, label: 'child' }
      })

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(2)
    })

    it('插入的子节点应该设置正确的 parent 引用', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      parent.insertChild({
        data: { id: 2, label: 'child' }
      })

      expect(parent.childNodes[0].parent).toBe(parent)
    })

    it('插入的子节点应该计算正确的 level', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      parent.insertChild({
        data: { id: 2, label: 'child' }
      })

      expect(parent.childNodes[0].level).toBe(1)
    })

    it('应该能够指定插入位置', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      parent.insertChild({ data: { id: 2, label: 'child1' } })
      parent.insertChild({ data: { id: 3, label: 'child2' } })
      parent.insertChild({ data: { id: 4, label: 'child3' } }, 1) // 插入到索引 1

      expect(parent.childNodes.length).toBe(3)
      expect(parent.childNodes[0].data.id).toBe(2)
      expect(parent.childNodes[1].data.id).toBe(4) // 新插入的
      expect(parent.childNodes[2].data.id).toBe(3)
    })

    it('不指定 index 时应该添加到末尾', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      parent.insertChild({ data: { id: 2, label: 'child1' } })
      parent.insertChild({ data: { id: 3, label: 'child2' } })
      parent.insertChild({ data: { id: 4, label: 'child3' } })

      expect(parent.childNodes[2].data.id).toBe(4)
    })

    it('index 为负数时应该添加到末尾', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      parent.insertChild({ data: { id: 2, label: 'child1' } })
      parent.insertChild({ data: { id: 3, label: 'child2' } }, -1)

      expect(parent.childNodes[1].data.id).toBe(3)
    })

    it('child 为空时应该抛出错误', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      expect(() => {
        parent.insertChild(null)
      }).toThrow('insertChild error: child is required.')
    })

    it('应该能够插入已存在的 Node 实例', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const child = new Node({
        data: { id: 2, label: 'child' },
        store: store
      })

      parent.insertChild(child)

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0]).toBe(child)
    })

    it('插入子节点后应该更新 isLeaf 状态', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      expect(parent.isLeaf).toBe(true)

      parent.insertChild({ data: { id: 2, label: 'child' } })

      expect(parent.isLeaf).toBe(false)
    })
  })

  describe('insertBefore 方法', () => {
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

    it('应该在参考节点之前插入子节点', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const child1 = new Node({
        data: { id: 2, label: 'child1' },
        parent: parent,
        store: store
      })

      const child2 = new Node({
        data: { id: 3, label: 'child2' },
        parent: parent,
        store: store
      })

      parent.childNodes = [child1, child2]

      parent.insertBefore({ data: { id: 4, label: 'child3' } }, child2)

      expect(parent.childNodes.length).toBe(3)
      expect(parent.childNodes[0].data.id).toBe(2)
      expect(parent.childNodes[1].data.id).toBe(4)
      expect(parent.childNodes[2].data.id).toBe(3)
    })

    it('应该能在第一个节点之前插入', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const child1 = new Node({
        data: { id: 2, label: 'child1' },
        parent: parent,
        store: store
      })

      parent.childNodes = [child1]

      parent.insertBefore({ data: { id: 3, label: 'child2' } }, child1)

      expect(parent.childNodes[0].data.id).toBe(3)
      expect(parent.childNodes[1].data.id).toBe(2)
    })

    it('当 ref 为空时，应该使用默认插入行为', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      parent.insertBefore({ data: { id: 2, label: 'child1' } })

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(2)
    })

    it('应该正确设置新节点的层级', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const child1 = new Node({
        data: { id: 2, label: 'child1' },
        parent: parent,
        store: store
      })

      parent.childNodes = [child1]

      parent.insertBefore({ data: { id: 3, label: 'child2' } }, child1)

      expect(parent.childNodes[0].level).toBe(1)
    })

    it('应该更新父节点的 isLeaf 状态', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      expect(parent.isLeaf).toBe(true)

      parent.insertBefore({ data: { id: 2, label: 'child' } })

      expect(parent.isLeaf).toBe(false)
    })
  })

  describe('insertAfter 方法', () => {
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

    it('应该在参考节点之后插入子节点', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const child1 = new Node({
        data: { id: 2, label: 'child1' },
        parent: parent,
        store: store
      })

      const child2 = new Node({
        data: { id: 3, label: 'child2' },
        parent: parent,
        store: store
      })

      parent.childNodes = [child1, child2]

      parent.insertAfter({ data: { id: 4, label: 'child3' } }, child1)

      expect(parent.childNodes.length).toBe(3)
      expect(parent.childNodes[0].data.id).toBe(2)
      expect(parent.childNodes[1].data.id).toBe(4)
      expect(parent.childNodes[2].data.id).toBe(3)
    })

    it('应该能在最后一个节点之后插入', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const child1 = new Node({
        data: { id: 2, label: 'child1' },
        parent: parent,
        store: store
      })

      parent.childNodes = [child1]

      parent.insertAfter({ data: { id: 3, label: 'child2' } }, child1)

      expect(parent.childNodes[0].data.id).toBe(2)
      expect(parent.childNodes[1].data.id).toBe(3)
    })

    it('当 ref 为空时，应该使用默认插入行为', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      parent.insertAfter({ data: { id: 2, label: 'child1' } })

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(2)
    })

    it('应该正确设置新节点的层级', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const child1 = new Node({
        data: { id: 2, label: 'child1' },
        parent: parent,
        store: store
      })

      parent.childNodes = [child1]

      parent.insertAfter({ data: { id: 3, label: 'child2' } }, child1)

      expect(parent.childNodes[1].level).toBe(1)
    })

    it('应该更新父节点的 isLeaf 状态', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      expect(parent.isLeaf).toBe(true)

      parent.insertAfter({ data: { id: 2, label: 'child' } })

      expect(parent.isLeaf).toBe(false)
    })
  })

  describe('remove 和 removeChild 方法', () => {
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

    it('应该能够移除子节点', () => {
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        },
        store: store
      })

      expect(parent.childNodes.length).toBe(2)

      const childToRemove = parent.childNodes[0]
      parent.removeChild(childToRemove)

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(3)
    })

    it('移除子节点应该清空其 parent 引用', () => {
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [{ id: 2, label: 'child' }]
        },
        store: store
      })

      const child = parent.childNodes[0]
      expect(child.parent).toBe(parent)

      parent.removeChild(child)

      expect(child.parent).toBeNull()
    })

    it('应该能够调用 remove 方法移除自身', () => {
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        },
        store: store
      })

      const child = parent.childNodes[0]
      expect(parent.childNodes.length).toBe(2)

      child.remove()

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(3)
    })

    it('移除节点后应该从 store 中注销', () => {
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [{ id: 2, label: 'child' }]
        },
        store: store
      })

      const child = parent.childNodes[0]
      expect(store.nodesMap[2]).toBe(child)

      child.remove()

      expect(store.nodesMap[2]).toBeUndefined()
    })

    it('移除节点后应该更新父节点的 isLeaf 状态', () => {
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [{ id: 2, label: 'child' }]
        },
        store: store
      })

      expect(parent.isLeaf).toBe(false)

      parent.childNodes[0].remove()

      expect(parent.isLeaf).toBe(true)
    })

    it('移除不存在的子节点不应该报错', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const otherNode = new Node({
        data: { id: 999, label: 'other' },
        store: store
      })

      expect(() => {
        parent.removeChild(otherNode)
      }).not.toThrow()
    })
  })
})

