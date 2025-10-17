import { describe, it, expect, beforeEach } from 'vitest'
import Node from '../../src/model/node.js'
import TreeStore from '../../src/model/tree-store.js'

describe('Node 节点类', () => {
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

  describe('expand 和 collapse 方法', () => {
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

    it('应该能够展开节点', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store: store
      })

      expect(node.expanded).toBe(false)

      node.expand()

      expect(node.expanded).toBe(true)
    })

    it('应该能够收起节点', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store: store,
        expanded: true
      })

      expect(node.expanded).toBe(true)

      node.collapse()

      expect(node.expanded).toBe(false)
    })

    it('应该能够连续调用 expand 和 collapse', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store: store
      })

      node.expand()
      expect(node.expanded).toBe(true)

      node.collapse()
      expect(node.expanded).toBe(false)

      node.expand()
      expect(node.expanded).toBe(true)
    })
  })

  describe('updateLeafState 方法', () => {
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

    it('没有子节点时应该是叶子节点', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store: store
      })

      expect(node.isLeaf).toBe(true)
    })

    it('有子节点时不应该是叶子节点', () => {
      const node = new Node({
        data: {
          id: 1,
          label: 'node',
          children: [{ id: 2, label: 'child' }]
        },
        store: store
      })

      expect(node.isLeaf).toBe(false)
    })

    it('添加子节点后应该变为非叶子节点', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store: store
      })

      expect(node.isLeaf).toBe(true)

      node.insertChild({ data: { id: 2, label: 'child' } })

      expect(node.isLeaf).toBe(false)
    })

    it('移除所有子节点后应该变为叶子节点', () => {
      const node = new Node({
        data: {
          id: 1,
          label: 'node',
          children: [{ id: 2, label: 'child' }]
        },
        store: store
      })

      expect(node.isLeaf).toBe(false)

      node.childNodes[0].remove()

      expect(node.isLeaf).toBe(true)
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

