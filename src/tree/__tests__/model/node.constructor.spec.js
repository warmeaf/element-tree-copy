import { describe, it, expect, beforeEach } from 'vitest'
import Node from '../../src/model/node.js'
import TreeStore from '../../src/model/tree-store.js'

describe('Node - 构造函数和基本结构', () => {
  describe('基本结构', () => {
  it('应该导出 Node 类', () => {
    expect(Node).toBeDefined()
    expect(typeof Node).toBe('function')
  })

    it('应该是一个类构造函数', () => {
      expect(Node.prototype.constructor).toBe(Node)
    })
  })

  describe('构造函数 - 创建节点实例', () => {
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

    it('应该能够创建 Node 实例（带完整属性）', () => {
      const node = new Node({
        data: { id: 1, label: 'test' },
        store: store
      })
      
    expect(node).toBeInstanceOf(Node)
      expect(node.id).toBeDefined()
      expect(typeof node.id).toBe('number')
    })

    it('应该包含所有基本属性', () => {
      const node = new Node({
        data: { id: 1, label: 'test' },
        store: store
      })

      // 基本属性
      expect(node.id).toBeDefined()
      expect(node.text).toBeDefined()
      expect(node.data).toBeDefined()
      expect(node.parent).toBeDefined()
      expect(node.level).toBeDefined()
      expect(node.childNodes).toBeDefined()
      
      // 状态属性
      expect(node.expanded).toBeDefined()
      expect(node.visible).toBeDefined()
      expect(node.checked).toBeDefined()
      expect(node.indeterminate).toBeDefined()
      expect(node.isCurrent).toBeDefined()
      expect(node.isLeaf).toBeDefined()
      
      // 懒加载相关
      expect(node.loaded).toBeDefined()
      expect(node.loading).toBeDefined()
    })

    it('应该初始化默认状态值', () => {
      const node = new Node({
        data: { id: 1, label: 'test' },
        store: store
      })

      expect(node.text).toBeNull()
      expect(node.parent).toBeNull()
      expect(node.level).toBe(0)
      expect(node.childNodes).toEqual([])
      expect(node.expanded).toBe(false)
      expect(node.visible).toBe(true)
      expect(node.checked).toBe(false)
      expect(node.indeterminate).toBe(false)
      expect(node.isCurrent).toBe(false)
      expect(node.isLeaf).toBe(true) // 无子节点时为叶子节点
      expect(node.loaded).toBe(false)
      expect(node.loading).toBe(false)
    })

    it('应该正确复制传入的 options 属性', () => {
      const options = {
        data: { id: 1, label: 'test' },
        store: store,
        expanded: true,
        visible: false
      }

      const node = new Node(options)

      expect(node.data).toEqual({ id: 1, label: 'test' })
      expect(node.expanded).toBe(true)
      expect(node.visible).toBe(false)
    })

    it('没有 store 时应该抛出错误', () => {
      expect(() => {
        new Node({
          data: { id: 1, label: 'test' }
        })
      }).toThrow('[Node]store is required!')
    })

    it('应该生成唯一的 id', () => {
      const node1 = new Node({ data: {}, store })
      const node2 = new Node({ data: {}, store })
      const node3 = new Node({ data: {}, store })

      expect(node1.id).not.toBe(node2.id)
      expect(node2.id).not.toBe(node3.id)
      expect(node1.id).not.toBe(node3.id)
    })

    it('应该自动注册到 store', () => {
      const nodeData = { id: 123, label: 'test' }
      const node = new Node({
        data: nodeData,
        store: store
      })

      expect(store.nodesMap[123]).toBe(node)
    })
  })

  describe('层级计算', () => {
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

    it('根节点的 level 应该为 0', () => {
      const root = new Node({
        data: { id: 1, label: 'root' },
        store: store
      })

      expect(root.level).toBe(0)
    })

    it('子节点的 level 应该为父节点 level + 1', () => {
      const parent = new Node({
        data: { id: 1, label: 'parent' },
        store: store
      })

      const child = new Node({
        data: { id: 2, label: 'child' },
        store: store,
        parent: parent
      })

      expect(child.level).toBe(1)
    })

    it('应该正确计算多层级结构', () => {
      const level0 = new Node({
        data: { id: 1 },
        store: store
      })

      const level1 = new Node({
        data: { id: 2 },
        store: store,
        parent: level0
      })

      const level2 = new Node({
        data: { id: 3 },
        store: store,
        parent: level1
      })

      const level3 = new Node({
        data: { id: 4 },
        store: store,
        parent: level2
      })

      expect(level0.level).toBe(0)
      expect(level1.level).toBe(1)
      expect(level2.level).toBe(2)
      expect(level3.level).toBe(3)
    })
  })

  describe('父子双向引用', () => {
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

    it('子节点应该正确引用父节点', () => {
      const data = {
        id: 1,
        label: '父节点',
        children: [
          { id: 11, label: '子节点1' },
          { id: 12, label: '子节点2' }
        ]
      }

      const parent = new Node({
        data: data,
        store: store
      })

      expect(parent.childNodes[0].parent).toBe(parent)
      expect(parent.childNodes[1].parent).toBe(parent)
    })

    it('父节点应该在 childNodes 中包含所有子节点', () => {
      const data = {
        id: 1,
        label: '父节点',
        children: [
          { id: 11, label: '子节点1' },
          { id: 12, label: '子节点2' },
          { id: 13, label: '子节点3' }
        ]
      }

      const parent = new Node({
        data: data,
        store: store
      })

      expect(parent.childNodes.length).toBe(3)
      expect(parent.childNodes[0].data.id).toBe(11)
      expect(parent.childNodes[1].data.id).toBe(12)
      expect(parent.childNodes[2].data.id).toBe(13)
    })

    it('多层嵌套时应该保持正确的父子引用', () => {
      const data = {
        id: 1,
        label: '根节点',
        children: [
          {
            id: 11,
            label: '节点1-1',
            children: [
              { id: 111, label: '节点1-1-1' }
            ]
          }
        ]
      }

      const root = new Node({
        data: data,
        store: store
      })

      const level1 = root.childNodes[0]
      const level2 = level1.childNodes[0]

      expect(level1.parent).toBe(root)
      expect(level2.parent).toBe(level1)
    })
  })
})

