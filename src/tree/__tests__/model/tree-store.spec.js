import { describe, it, expect, beforeEach } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore 状态管理类', () => {
  describe('构造函数', () => {
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

  describe('setCurrentNode 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [
          { id: 1, label: '节点 1' },
          { id: 2, label: '节点 2' }
        ],
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该设置当前节点', () => {
      const node = store.getNode(1)
      store.setCurrentNode(node)

      expect(store.currentNode).toBe(node)
    })

    it('应该将新节点的 isCurrent 设置为 true', () => {
      const node = store.getNode(1)
      store.setCurrentNode(node)

      expect(node.isCurrent).toBe(true)
    })

    it('应该将上一个节点的 isCurrent 设置为 false', () => {
      const node1 = store.getNode(1)
      const node2 = store.getNode(2)

      store.setCurrentNode(node1)
      expect(node1.isCurrent).toBe(true)

      store.setCurrentNode(node2)
      expect(node1.isCurrent).toBe(false)
      expect(node2.isCurrent).toBe(true)
    })

    it('当之前没有当前节点时，不应该抛出错误', () => {
      expect(store.currentNode).toBeNull()

      const node = store.getNode(1)
      expect(() => {
        store.setCurrentNode(node)
      }).not.toThrow()
    })
  })

  describe('getCurrentNode 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [{ id: 1, label: '节点 1' }],
        props: { label: 'label' }
      })
    })

    it('应该返回当前节点', () => {
      const node = store.getNode(1)
      store.setCurrentNode(node)

      expect(store.getCurrentNode()).toBe(node)
    })

    it('当没有当前节点时，应该返回 null', () => {
      expect(store.getCurrentNode()).toBeNull()
    })
  })

  describe('setCurrentNodeKey 方法', () => {
    let store

    beforeEach(() => {
      store = new TreeStore({
        key: 'id',
        data: [
          { id: 1, label: '节点 1' },
          { id: 2, label: '节点 2' }
        ],
        props: {
          label: 'label',
          children: 'children'
        }
      })
    })

    it('应该通过 key 设置当前节点', () => {
      store.setCurrentNodeKey(1)

      const node = store.getNode(1)
      expect(store.currentNode).toBe(node)
      expect(node.isCurrent).toBe(true)
    })

    it('应该支持字符串类型的 key', () => {
      const store2 = new TreeStore({
        key: 'id',
        data: [{ id: 'abc', label: '节点' }],
        props: { label: 'label' }
      })

      store2.setCurrentNodeKey('abc')

      expect(store2.currentNode.data.id).toBe('abc')
    })

    it('当 key 为 null 时，应该清空当前节点', () => {
      store.setCurrentNodeKey(1)
      expect(store.currentNode).not.toBeNull()

      store.setCurrentNodeKey(null)

      expect(store.currentNode).toBeNull()
    })

    it('当 key 为 undefined 时，应该清空当前节点', () => {
      store.setCurrentNodeKey(1)
      expect(store.currentNode).not.toBeNull()

      store.setCurrentNodeKey(undefined)

      expect(store.currentNode).toBeNull()
    })

    it('清空当前节点时，应该将原节点的 isCurrent 设置为 false', () => {
      store.setCurrentNodeKey(1)
      const node = store.getNode(1)
      expect(node.isCurrent).toBe(true)

      store.setCurrentNodeKey(null)

      expect(node.isCurrent).toBe(false)
    })

    it('当节点不存在时，不应该设置当前节点', () => {
      store.setCurrentNodeKey(999)

      expect(store.currentNode).toBeNull()
    })

    it('应该正确切换当前节点', () => {
      const node1 = store.getNode(1)
      const node2 = store.getNode(2)

      store.setCurrentNodeKey(1)
      expect(node1.isCurrent).toBe(true)

      store.setCurrentNodeKey(2)
      expect(node1.isCurrent).toBe(false)
      expect(node2.isCurrent).toBe(true)
      expect(store.currentNode).toBe(node2)
    })
  })
})

