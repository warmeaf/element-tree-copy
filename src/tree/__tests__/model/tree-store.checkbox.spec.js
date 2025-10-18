import { describe, it, expect, beforeEach } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore - 复选框功能', () => {
  describe('初始化测试', () => {
    it('_initDefaultCheckedNodes 正确初始化默认选中节点', () => {
      const data = [
        {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data,
        defaultCheckedKeys: [2, 3]
      })

      const child1 = store.nodesMap[2]
      const child2 = store.nodesMap[3]

      expect(child1.checked).toBe(true)
      expect(child2.checked).toBe(true)
    })

    it('defaultCheckedKeys 为空时不报错', () => {
      const data = [{ id: 1, label: 'node' }]

      expect(() => {
        new TreeStore({
          key: 'id',
          data,
          defaultCheckedKeys: []
        })
      }).not.toThrow()
    })

    it('defaultCheckedKeys 包含不存在的 key 时不报错', () => {
      const data = [{ id: 1, label: 'node' }]

      expect(() => {
        new TreeStore({
          key: 'id',
          data,
          defaultCheckedKeys: [999]
        })
      }).not.toThrow()
    })

    it('defaultCheckedKeys 级联选择子节点', () => {
      const data = [
        {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data,
        defaultCheckedKeys: [1]
      })

      const parent = store.nodesMap[1]
      const child1 = store.nodesMap[2]
      const child2 = store.nodesMap[3]

      expect(parent.checked).toBe(true)
      expect(child1.checked).toBe(true)
      expect(child2.checked).toBe(true)
    })

    it('checkStrictly 模式下 defaultCheckedKeys 不级联', () => {
      const data = [
        {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data,
        checkStrictly: true,
        defaultCheckedKeys: [1]
      })

      const parent = store.nodesMap[1]
      const child1 = store.nodesMap[2]
      const child2 = store.nodesMap[3]

      expect(parent.checked).toBe(true)
      expect(child1.checked).toBe(false)
      expect(child2.checked).toBe(false)
    })
  })

  describe('获取选中节点测试', () => {
    let store

    beforeEach(() => {
      const data = [
        {
          id: 1,
          label: 'parent1',
          children: [
            { id: 2, label: 'child1-1' },
            { id: 3, label: 'child1-2' }
          ]
        },
        {
          id: 4,
          label: 'parent2',
          children: [
            { id: 5, label: 'child2-1' }
          ]
        }
      ]

      store = new TreeStore({
        key: 'id',
        data,
        defaultCheckedKeys: [2, 5]
      })
    })

    it('getCheckedNodes() 返回所有选中节点', () => {
      const checkedNodes = store.getCheckedNodes()

      // 2个叶子节点 + 1个完全选中的父节点（parent2的所有子节点都选中）
      // parent1是半选状态（indeterminate），不包含在checked nodes中
      expect(checkedNodes).toHaveLength(3)
      expect(checkedNodes.map(n => n.label)).toContain('child1-1')
      expect(checkedNodes.map(n => n.label)).toContain('child2-1')
      expect(checkedNodes.map(n => n.label)).toContain('parent2')
    })

    it('getCheckedNodes(true) 只返回叶子节点', () => {
      const leafNodes = store.getCheckedNodes(true)

      expect(leafNodes).toHaveLength(2)
      expect(leafNodes.map(n => n.label)).toEqual(['child1-1', 'child2-1'])
    })

    it('getCheckedNodes(false, true) 包含半选节点', () => {
      const nodes = store.getCheckedNodes(false, true)

      // 包含选中的节点和半选的节点
      expect(nodes.length).toBeGreaterThan(0)
      
      const labels = nodes.map(n => n.label)
      expect(labels).toContain('parent1') // 半选节点
    })

    it('getCheckedKeys() 返回选中节点的 key 数组', () => {
      const keys = store.getCheckedKeys()

      // parent1 (key=1) 是半选状态，不包含在checked keys中
      expect(keys).toHaveLength(3)
      expect(keys).toContain(2)
      expect(keys).toContain(4)
      expect(keys).toContain(5)
    })

    it('getCheckedKeys(true) 只返回叶子节点的 key', () => {
      const leafKeys = store.getCheckedKeys(true)

      expect(leafKeys).toHaveLength(2)
      expect(leafKeys).toEqual([2, 5])
    })
  })

  describe('获取半选节点测试', () => {
    let store

    beforeEach(() => {
      const data = [
        {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        }
      ]

      store = new TreeStore({
        key: 'id',
        data,
        defaultCheckedKeys: [2] // 只选中一个子节点，父节点会变半选
      })
    })

    it('getHalfCheckedNodes() 返回所有半选节点', () => {
      const halfNodes = store.getHalfCheckedNodes()

      expect(halfNodes).toHaveLength(1)
      expect(halfNodes[0].label).toBe('parent')
    })

    it('getHalfCheckedKeys() 返回半选节点的 key 数组', () => {
      const halfKeys = store.getHalfCheckedKeys()

      expect(halfKeys).toHaveLength(1)
      expect(halfKeys[0]).toBe(1)
    })

    it('无半选节点时返回空数组', () => {
      // 选中所有子节点，父节点就不是半选了
      store.setCheckedKeys([1, 2, 3])

      const halfNodes = store.getHalfCheckedNodes()
      const halfKeys = store.getHalfCheckedKeys()

      expect(halfNodes).toHaveLength(0)
      expect(halfKeys).toHaveLength(0)
    })
  })

  describe('设置选中节点测试', () => {
    let store

    beforeEach(() => {
      const data = [
        {
          id: 1,
          label: 'parent1',
          children: [
            { id: 2, label: 'child1-1' },
            { id: 3, label: 'child1-2' }
          ]
        },
        {
          id: 4,
          label: 'parent2',
          children: [
            { id: 5, label: 'child2-1' }
          ]
        }
      ]

      store = new TreeStore({
        key: 'id',
        data
      })
    })

    it('setCheckedKeys([keys]) 设置选中节点', () => {
      store.setCheckedKeys([2, 5])

      expect(store.nodesMap[2].checked).toBe(true)
      expect(store.nodesMap[5].checked).toBe(true)
    })

    it('setCheckedKeys 级联选择子节点', () => {
      store.setCheckedKeys([1])

      expect(store.nodesMap[1].checked).toBe(true)
      expect(store.nodesMap[2].checked).toBe(true)
      expect(store.nodesMap[3].checked).toBe(true)
    })

    it('setCheckedNodes([nodes]) 通过节点数组设置', () => {
      const nodes = [
        store.nodesMap[2].data,
        store.nodesMap[5].data
      ]

      store.setCheckedNodes(nodes)

      expect(store.nodesMap[2].checked).toBe(true)
      expect(store.nodesMap[5].checked).toBe(true)
    })

    it('setChecked(data, true, true) 设置单个节点及子节点', () => {
      const parentData = store.nodesMap[1].data

      store.setChecked(parentData, true, true)

      expect(store.nodesMap[1].checked).toBe(true)
      expect(store.nodesMap[2].checked).toBe(true)
      expect(store.nodesMap[3].checked).toBe(true)
    })

    it('setChecked(data, true, false) 只设置单个节点', () => {
      const parentData = store.nodesMap[1].data

      store.setChecked(parentData, true, false)

      expect(store.nodesMap[1].checked).toBe(true)
      expect(store.nodesMap[2].checked).toBe(false)
      expect(store.nodesMap[3].checked).toBe(false)
    })

    it('setDefaultCheckedKey() 更新默认选中 keys', () => {
      store.setDefaultCheckedKey([2, 5])

      expect(store.nodesMap[2].checked).toBe(true)
      expect(store.nodesMap[5].checked).toBe(true)
    })

    it('setCheckedKeys 清空之前的选中状态', () => {
      // 先选中一些节点
      store.setCheckedKeys([2, 3])
      expect(store.nodesMap[2].checked).toBe(true)

      // 设置新的选中节点
      store.setCheckedKeys([5])

      expect(store.nodesMap[2].checked).toBe(false)
      expect(store.nodesMap[3].checked).toBe(false)
      expect(store.nodesMap[5].checked).toBe(true)
    })

    it('leafOnly 参数只选中叶子节点', () => {
      store.setCheckedKeys([1], true)

      // 父节点不应该选中
      expect(store.nodesMap[1].checked).toBe(false)
      // 叶子节点应该选中
      expect(store.nodesMap[2].checked).toBe(true)
      expect(store.nodesMap[3].checked).toBe(true)
    })
  })

  describe('checkStrictly 模式测试', () => {
    it('checkStrictly 模式下父子不关联', () => {
      const data = [
        {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data,
        checkStrictly: true
      })

      store.setCheckedKeys([1])

      expect(store.nodesMap[1].checked).toBe(true)
      expect(store.nodesMap[2].checked).toBe(false)
      expect(store.nodesMap[3].checked).toBe(false)
    })

    it('checkStrictly 模式下子节点不影响父节点', () => {
      const data = [
        {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data,
        checkStrictly: true
      })

      store.setCheckedKeys([2, 3])

      expect(store.nodesMap[2].checked).toBe(true)
      expect(store.nodesMap[3].checked).toBe(true)
      expect(store.nodesMap[1].checked).toBe(false)
    })
  })

  describe('_getAllNodes 测试', () => {
    it('返回所有节点数组', () => {
      const data = [
        {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1' },
            { id: 3, label: 'child2' }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data
      })

      const allNodes = store._getAllNodes()

      expect(allNodes).toHaveLength(3)
      // 检查节点的key而不是id，因为node.id是内部自增的
      expect(allNodes.map(n => n.key)).toContain(1)
      expect(allNodes.map(n => n.key)).toContain(2)
      expect(allNodes.map(n => n.key)).toContain(3)
    })

    it('空树返回空数组', () => {
      const store = new TreeStore({
        key: 'id',
        data: []
      })

      const allNodes = store._getAllNodes()

      expect(allNodes).toHaveLength(0)
    })
  })

  describe('复杂场景测试', () => {
    it('处理深层嵌套的树结构', () => {
      const data = [
        {
          id: 1,
          label: 'level1',
          children: [
            {
              id: 2,
              label: 'level2',
              children: [
                {
                  id: 3,
                  label: 'level3',
                  children: [
                    { id: 4, label: 'level4' }
                  ]
                }
              ]
            }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data
      })

      store.setCheckedKeys([4])

      // 最底层节点选中
      expect(store.nodesMap[4].checked).toBe(true)
      // 由于每个父节点只有一个子节点，当唯一的子节点被选中时，
      // 父节点也会被选中（所有子节点都选中 = 父节点checked=true）
      expect(store.nodesMap[3].checked).toBe(true)
      expect(store.nodesMap[3].indeterminate).toBe(false)
      expect(store.nodesMap[2].checked).toBe(true)
      expect(store.nodesMap[2].indeterminate).toBe(false)
      expect(store.nodesMap[1].checked).toBe(true)
      expect(store.nodesMap[1].indeterminate).toBe(false)
    })

    it('禁用节点场景', () => {
      const data = [
        {
          id: 1,
          label: 'parent',
          children: [
            { id: 2, label: 'child1', disabled: true },
            { id: 3, label: 'child2' }
          ]
        }
      ]

      const store = new TreeStore({
        key: 'id',
        data
      })

      // 设置禁用节点为选中
      store.nodesMap[2].checked = true

      // 选中父节点
      store.setChecked(store.nodesMap[1].data, true, true)

      // 禁用节点保持原状
      expect(store.nodesMap[2].checked).toBe(true)
      // 非禁用节点被选中
      expect(store.nodesMap[3].checked).toBe(true)
    })
  })
})

