import { describe, it, expect, beforeEach } from 'vitest'
import Node from '../../src/model/node.js'
import TreeStore from '../../src/model/tree-store.js'

describe('Node - 节点操作', () => {
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

  // Helper function: 创建有正确层级关系的parent节点
  const createParentNode = (data = { id: 1, label: 'parent' }) => {
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

  describe('insertChild 方法', () => {

    it('应该能够插入子节点', () => {
      const parent = createParentNode()

      expect(parent.childNodes.length).toBe(0)

      parent.insertChild({
        data: { id: 2, label: 'child' }
      })

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(2)
    })

    it('插入的子节点应该设置正确的 parent 引用', () => {
      const parent = createParentNode()

      parent.insertChild({
        data: { id: 2, label: 'child' }
      })

      expect(parent.childNodes[0].parent).toBe(parent)
    })

    it('插入的子节点应该计算正确的 level', () => {
      const parent = createParentNode()

      parent.insertChild({
        data: { id: 2, label: 'child' }
      })

      expect(parent.childNodes[0].level).toBe(2)
    })

    it('应该能够指定插入位置', () => {
      const parent = createParentNode()

      parent.insertChild({ data: { id: 2, label: 'child1' } })
      parent.insertChild({ data: { id: 3, label: 'child2' } })
      parent.insertChild({ data: { id: 4, label: 'child3' } }, 1) // 插入到索引 1

      expect(parent.childNodes.length).toBe(3)
      expect(parent.childNodes[0].data.id).toBe(2)
      expect(parent.childNodes[1].data.id).toBe(4) // 新插入的
      expect(parent.childNodes[2].data.id).toBe(3)
    })

    it('不指定 index 时应该添加到末尾', () => {
      const parent = createParentNode()

      parent.insertChild({ data: { id: 2, label: 'child1' } })
      parent.insertChild({ data: { id: 3, label: 'child2' } })
      parent.insertChild({ data: { id: 4, label: 'child3' } })

      expect(parent.childNodes[2].data.id).toBe(4)
    })

    it('index 为负数时应该添加到末尾', () => {
      const parent = createParentNode()

      parent.insertChild({ data: { id: 2, label: 'child1' } })
      parent.insertChild({ data: { id: 3, label: 'child2' } }, -1)

      expect(parent.childNodes[1].data.id).toBe(3)
    })

    it('child 为空时应该抛出错误', () => {
      const parent = createParentNode()

      expect(() => {
        parent.insertChild(null)
      }).toThrow('insertChild error: child is required.')
    })

    it('应该能够插入已存在的 Node 实例', () => {
      const parent = createParentNode()

      const child = new Node({
        data: { id: 2, label: 'child' },
        store: store
      })

      parent.insertChild(child)

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0]).toBe(child)
    })

    it('插入子节点后应该更新 isLeaf 状态', () => {
      const parent = createParentNode()

      expect(parent.isLeaf).toBe(true)

      parent.insertChild({ data: { id: 2, label: 'child' } })

      expect(parent.isLeaf).toBe(false)
    })
  })

  describe('insertBefore 方法', () => {
    it('应该在参考节点之前插入子节点', () => {
      const parent = createParentNode()

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
      const parent = createParentNode()

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
      const parent = createParentNode()

      parent.insertBefore({ data: { id: 2, label: 'child1' } })

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(2)
    })

    it('应该正确设置新节点的层级', () => {
      const parent = createParentNode()

      const child1 = new Node({
        data: { id: 2, label: 'child1' },
        parent: parent,
        store: store
      })

      parent.childNodes = [child1]

      parent.insertBefore({ data: { id: 3, label: 'child2' } }, child1)

      expect(parent.childNodes[0].level).toBe(2)
    })

    it('应该更新父节点的 isLeaf 状态', () => {
      const parent = createParentNode()

      expect(parent.isLeaf).toBe(true)

      parent.insertBefore({ data: { id: 2, label: 'child' } })

      expect(parent.isLeaf).toBe(false)
    })
  })

  describe('insertAfter 方法', () => {

    it('应该在参考节点之后插入子节点', () => {
      const parent = createParentNode()

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
      const parent = createParentNode()

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
      const parent = createParentNode()

      parent.insertAfter({ data: { id: 2, label: 'child1' } })

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(2)
    })

    it('应该正确设置新节点的层级', () => {
      const parent = createParentNode()

      const child1 = new Node({
        data: { id: 2, label: 'child1' },
        parent: parent,
        store: store
      })

      parent.childNodes = [child1]

      parent.insertAfter({ data: { id: 3, label: 'child2' } }, child1)

      expect(parent.childNodes[1].level).toBe(2)
    })

    it('应该更新父节点的 isLeaf 状态', () => {
      const parent = createParentNode()

      expect(parent.isLeaf).toBe(true)

      parent.insertAfter({ data: { id: 2, label: 'child' } })

      expect(parent.isLeaf).toBe(false)
    })
  })

  describe('remove 和 removeChild 方法', () => {

    it('应该能够移除子节点', () => {
      // 创建有层级的parent节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        },
        parent: grandParent,
        store: store
      })

      expect(parent.childNodes.length).toBe(2)

      const childToRemove = parent.childNodes[0]
      parent.removeChild(childToRemove)

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(3)
    })

    it('移除子节点应该清空其 parent 引用', () => {
      // 创建有层级的parent节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [{ id: 2, label: 'child' }]
        },
        parent: grandParent,
        store: store
      })

      const child = parent.childNodes[0]
      expect(child.parent).toBe(parent)

      parent.removeChild(child)

      expect(child.parent).toBeNull()
    })

    it('应该能够调用 remove 方法移除自身', () => {
      // 创建有层级的parent节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        },
        parent: grandParent,
        store: store
      })

      const child = parent.childNodes[0]
      expect(parent.childNodes.length).toBe(2)

      child.remove()

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(3)
    })

    it('移除节点后应该从 store 中注销', () => {
      // 创建有层级的parent节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [{ id: 2, label: 'child' }]
        },
        parent: grandParent,
        store: store
      })

      const child = parent.childNodes[0]
      expect(store.nodesMap[2]).toBe(child)

      child.remove()

      expect(store.nodesMap[2]).toBeUndefined()
    })

    it('移除节点后应该更新父节点的 isLeaf 状态', () => {
      // 创建有层级的parent节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [{ id: 2, label: 'child' }]
        },
        parent: grandParent,
        store: store
      })

      expect(parent.isLeaf).toBe(false)

      parent.childNodes[0].remove()

      expect(parent.isLeaf).toBe(true)
    })

    it('移除不存在的子节点不应该报错', () => {
      const parent = createParentNode()

      // 创建有层级的其他节点
      const otherGrandParent = new Node({
        data: [],
        store: store
      })
      const otherNode = new Node({
        data: { id: 999, label: 'other' },
        parent: otherGrandParent,
        store: store
      })

      expect(() => {
        parent.removeChild(otherNode)
      }).not.toThrow()
    })
  })

  describe('getChildren 方法', () => {

    it('应该返回节点的 children 数组', () => {
      // 创建有层级的parent节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        },
        parent: grandParent,
        store: store
      })

      const children = parent.getChildren()
      expect(children).toBeDefined()
      expect(children.length).toBe(2)
      expect(children[0].id).toBe(2)
      expect(children[1].id).toBe(3)
    })

    it('根节点应该返回 data 本身', () => {
      const rootData = [
        { id: 1, label: 'node1' },
        { id: 2, label: 'node2' }
      ]
      store = new TreeStore({
        key: 'id',
        data: rootData,
        props: {
          label: 'label',
          children: 'children'
        }
      })

      const children = store.root.getChildren()
      expect(children).toBe(rootData)
    })

    it('当节点没有 children 时应该返回 null', () => {
      // 创建有层级的节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: { id: 1, label: 'leaf' },
        parent: grandParent,
        store: store
      })

      const children = node.getChildren()
      expect(children).toBeNull()
    })

    it('forceInit 为 true 时应该初始化空数组', () => {
      // 创建有层级的节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: { id: 1, label: 'leaf' },
        parent: grandParent,
        store: store
      })

      const children = node.getChildren(true)
      expect(children).toEqual([])
      expect(node.data.children).toEqual([])
    })

    it('应该支持自定义 children 字段名', () => {
      store = new TreeStore({
        key: 'id',
        data: [],
        props: {
          label: 'label',
          children: 'items'
        }
      })

      // 创建有层级的节点
      const grandParent = new Node({
        data: [],
        store: store
      })
      const node = new Node({
        data: {
          id: 1,
          label: 'parent',
          items: [
            { id: 2, label: 'child1' }
          ]
        },
        parent: grandParent,
        store: store
      })

      const children = node.getChildren()
      expect(children).toBeDefined()
      expect(children.length).toBe(1)
      expect(children[0].id).toBe(2)
    })
  })

  describe('数据同步 - insertChild', () => {

    it('插入子节点应该同步更新原数据', () => {
      const parentData = { id: 1, label: 'parent' }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      parent.insertChild({
        data: { id: 2, label: 'child' }
      })

      expect(parentData.children).toBeDefined()
      expect(parentData.children.length).toBe(1)
      expect(parentData.children[0].id).toBe(2)
    })

    it('插入多个节点应该按顺序同步到原数据', () => {
      const parentData = { id: 1, label: 'parent' }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      parent.insertChild({ data: { id: 2, label: 'child1' } })
      parent.insertChild({ data: { id: 3, label: 'child2' } })

      expect(parentData.children.length).toBe(2)
      expect(parentData.children[0].id).toBe(2)
      expect(parentData.children[1].id).toBe(3)
    })

    it('指定 index 插入应该同步到原数据的正确位置', () => {
      const parentData = { id: 1, label: 'parent' }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      parent.insertChild({ data: { id: 2, label: 'child1' } })
      parent.insertChild({ data: { id: 3, label: 'child2' } })
      parent.insertChild({ data: { id: 4, label: 'child3' } }, 1)

      expect(parentData.children.length).toBe(3)
      expect(parentData.children[0].id).toBe(2)
      expect(parentData.children[1].id).toBe(4)
      expect(parentData.children[2].id).toBe(3)
    })

    it('batch 模式不应该同步到原数据', () => {
      const parentData = { id: 1, label: 'parent' }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      parent.insertChild({ data: { id: 2, label: 'child' } }, undefined, true)

      expect(parent.childNodes.length).toBe(1)
      expect(parentData.children).toBeUndefined()
    })

    it('不重复添加相同的数据对象', () => {
      const parentData = { id: 1, label: 'parent' }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })
      
      const childData = { id: 2, label: 'child' }
      parent.insertChild({ data: childData })
      parent.insertChild({ data: childData })

      expect(parentData.children.length).toBe(1)
      expect(parent.childNodes.length).toBe(2)
    })
  })

  describe('数据同步 - removeChild', () => {

    it('删除子节点应该同步更新原数据', () => {
      const parentData = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' }
        ]
      }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      expect(parentData.children.length).toBe(2)

      const childToRemove = parent.childNodes[0]
      parent.removeChild(childToRemove)

      expect(parentData.children.length).toBe(1)
      expect(parentData.children[0].id).toBe(3)
    })

    it('删除最后一个子节点应该正确同步', () => {
      const parentData = {
        id: 1,
        label: 'parent',
        children: [{ id: 2, label: 'child' }]
      }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      parent.removeChild(parent.childNodes[0])

      expect(parentData.children.length).toBe(0)
    })

    it('删除中间节点应该正确同步', () => {
      const parentData = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' },
          { id: 4, label: 'child3' }
        ]
      }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      parent.removeChild(parent.childNodes[1])

      expect(parentData.children.length).toBe(2)
      expect(parentData.children[0].id).toBe(2)
      expect(parentData.children[1].id).toBe(4)
    })
  })

  describe('removeChildByData 方法', () => {

    it('应该根据数据删除子节点', () => {
      const child1Data = { id: 2, label: 'child1' }
      const child2Data = { id: 3, label: 'child2' }
      const parentData = {
        id: 1,
        label: 'parent',
        children: [child1Data, child2Data]
      }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      parent.removeChildByData(child1Data)

      expect(parent.childNodes.length).toBe(1)
      expect(parent.childNodes[0].data.id).toBe(3)
    })

    it('当数据不存在时不应该报错', () => {
      const parentData = {
        id: 1,
        label: 'parent',
        children: [{ id: 2, label: 'child' }]
      }
      // 创建有层级的parent节点 
      const grandParent = new Node({
        data: [],
        store: store
      })
      const parent = new Node({
        data: parentData,
        parent: grandParent,
        store: store
      })

      expect(() => {
        parent.removeChildByData({ id: 999, label: 'notexist' })
      }).not.toThrow()

      expect(parent.childNodes.length).toBe(1)
    })
  })
})
