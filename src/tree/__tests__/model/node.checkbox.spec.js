import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Node, { getChildState } from '../../src/model/node.js'
import TreeStore from '../../src/model/tree-store.js'

describe('Node - 复选框功能', () => {
  describe('getChildState 函数', () => {
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

    afterEach(() => {
      store = null
    })

    it('全部子节点选中时返回 all: true', () => {
      const children = [
        new Node({ data: { id: 1, label: 'node1' }, store, checked: true }),
        new Node({ data: { id: 2, label: 'node2' }, store, checked: true }),
        new Node({ data: { id: 3, label: 'node3' }, store, checked: true })
      ]

      const state = getChildState(children)

      expect(state.all).toBe(true)
      expect(state.none).toBe(false)
      expect(state.half).toBe(false)
      expect(state.allWithoutDisable).toBe(true)
    })

    it('全部子节点未选中时返回 none: true', () => {
      const children = [
        new Node({ data: { id: 1, label: 'node1' }, store, checked: false }),
        new Node({ data: { id: 2, label: 'node2' }, store, checked: false }),
        new Node({ data: { id: 3, label: 'node3' }, store, checked: false })
      ]

      const state = getChildState(children)

      expect(state.all).toBe(false)
      expect(state.none).toBe(true)
      expect(state.half).toBe(false)
    })

    it('部分子节点选中时返回 half: true', () => {
      const children = [
        new Node({ data: { id: 1, label: 'node1' }, store, checked: true }),
        new Node({ data: { id: 2, label: 'node2' }, store, checked: false }),
        new Node({ data: { id: 3, label: 'node3' }, store, checked: false })
      ]

      const state = getChildState(children)

      expect(state.all).toBe(false)
      expect(state.none).toBe(false)
      expect(state.half).toBe(true)
    })

    it('包含禁用节点时正确计算 allWithoutDisable', () => {
      const children = [
        new Node({ data: { id: 1, label: 'node1', disabled: true }, store, checked: false }),
        new Node({ data: { id: 2, label: 'node2' }, store, checked: true }),
        new Node({ data: { id: 3, label: 'node3' }, store, checked: true })
      ]

      const state = getChildState(children)

      expect(state.all).toBe(false)
      expect(state.allWithoutDisable).toBe(true)
      expect(state.half).toBe(true)
    })

    it('处理半选状态节点', () => {
      const children = [
        new Node({ data: { id: 1, label: 'node1' }, store, checked: false, indeterminate: true }),
        new Node({ data: { id: 2, label: 'node2' }, store, checked: false })
      ]

      const state = getChildState(children)

      expect(state.all).toBe(false)
      expect(state.none).toBe(false)
      expect(state.half).toBe(true)
    })

    it('只有禁用节点未选中时 allWithoutDisable 为 true', () => {
      const children = [
        new Node({ data: { id: 1, label: 'node1', disabled: true }, store, checked: false }),
        new Node({ data: { id: 2, label: 'node2', disabled: true }, store, checked: false })
      ]

      const state = getChildState(children)

      expect(state.all).toBe(false)
      expect(state.none).toBe(true)
      expect(state.allWithoutDisable).toBe(true)
    })

    // 新增：空子节点数组的边界情况测试
    it('空子节点数组应该返回正确的初始状态', () => {
      const state = getChildState([])

      expect(state.all).toBe(true)
      expect(state.none).toBe(true)
      expect(state.half).toBe(false)
      expect(state.allWithoutDisable).toBe(true)
    })

    // 新增：混合禁用和选中状态的复杂场景
    it('复杂混合状态场景测试', () => {
      const children = [
        new Node({ data: { id: 1, label: 'node1', disabled: true }, store, checked: true }),
        new Node({ data: { id: 2, label: 'node2' }, store, checked: false }),
        new Node({ data: { id: 3, label: 'node3', disabled: true }, store, checked: false }),
        new Node({ data: { id: 4, label: 'node4' }, store, checked: true })
      ]

      const state = getChildState(children)

      expect(state.all).toBe(false)
      expect(state.none).toBe(false)
      expect(state.half).toBe(true)
      expect(state.allWithoutDisable).toBe(false) // 有非禁用节点未选中
    })

    // 新增：性能测试 - 大量子节点的状态计算
    it('大量子节点状态计算性能测试', () => {
      const startTime = performance.now()
      const children = []

      // 创建1000个子节点
      for (let i = 0; i < 1000; i++) {
        children.push(new Node({
          data: { id: i, label: `node${i}` },
          store,
          checked: i % 2 === 0
        }))
      }

      const state = getChildState(children)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(50) // 应该在50ms内完成
      expect(state.all).toBe(false)
      expect(state.none).toBe(false)
      expect(state.half).toBe(true)
    })
  })

  describe('setChecked 方法', () => {
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

    afterEach(() => {
      store = null
    })

    it('设置节点为选中状态', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store
      })

      expect(node.checked).toBe(false)

      node.setChecked(true, false)

      expect(node.checked).toBe(true)
      expect(node.indeterminate).toBe(false)
    })

    it('设置节点为未选中状态', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store,
        checked: true
      })

      expect(node.checked).toBe(true)

      node.setChecked(false, false)

      expect(node.checked).toBe(false)
      expect(node.indeterminate).toBe(false)
    })

    it('设置半选状态', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store
      })

      node.setChecked('half', false)

      expect(node.checked).toBe(false)
      expect(node.indeterminate).toBe(true)
    })

    it('deep=true 时递归设置所有子节点', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' }
        ]
      }

      const parent = new Node({ data, store })

      parent.setChecked(true, true)

      expect(parent.checked).toBe(true)
      expect(parent.childNodes[0].checked).toBe(true)
      expect(parent.childNodes[1].checked).toBe(true)
    })

    it('deep=false 时不影响子节点', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' }
        ]
      }

      const parent = new Node({ data, store })

      parent.setChecked(true, false)

      expect(parent.checked).toBe(true)
      expect(parent.childNodes[0].checked).toBe(false)
      expect(parent.childNodes[1].checked).toBe(false)
    })

    it('父节点选中时跳过禁用的子节点', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1', disabled: true },
          { id: 3, label: 'child2' }
        ]
      }

      const parent = new Node({ data, store })

      parent.setChecked(true, true)

      // 根据源码逻辑：当有禁用的未选中子节点时，父节点应该是半选状态
      // 因为 getChildState 会返回 all=false (有子节点未选中)，
      // 然后在 setChecked 中会设置 this.checked = all (false), this.indeterminate = half (true)
      expect(parent.checked).toBe(false)
      expect(parent.indeterminate).toBe(true)
      expect(parent.childNodes[0].checked).toBe(false) // 禁用节点保持未选中
      expect(parent.childNodes[1].checked).toBe(true)
    })

    it('子节点变化时自动更新父节点状态', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' }
        ]
      }

      // 让 parent 成为 store.root 的子节点，这样它的 level 就是 1
      const parent = new Node({ data, store, parent: store.root })
      store.root.childNodes.push(parent)

      // 选中所有子节点
      parent.childNodes[0].setChecked(true, false)
      parent.childNodes[1].setChecked(true, false)

      expect(parent.checked).toBe(true)
      expect(parent.indeterminate).toBe(false)
    })

    it('checkStrictly 模式下父子不关联', () => {
      store.checkStrictly = true

      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' }
        ]
      }

      const parent = new Node({ data, store })

      parent.setChecked(true, true)

      expect(parent.checked).toBe(true)
      // checkStrictly 模式下，子节点不受影响
      expect(parent.childNodes[0].checked).toBe(false)
      expect(parent.childNodes[1].checked).toBe(false)
    })

    it('选中父节点时子节点全部选中', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { 
            id: 3, 
            label: 'child2',
            children: [
              { id: 4, label: 'grandchild' }
            ]
          }
        ]
      }

      const parent = new Node({ data, store })

      parent.setChecked(true, true)

      expect(parent.checked).toBe(true)
      expect(parent.childNodes[0].checked).toBe(true)
      expect(parent.childNodes[1].checked).toBe(true)
      expect(parent.childNodes[1].childNodes[0].checked).toBe(true)
    })

    it('取消父节点时子节点全部取消', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' }
        ]
      }

      const parent = new Node({ data, store })

      // 先选中
      parent.setChecked(true, true)
      expect(parent.checked).toBe(true)

      // 再取消
      parent.setChecked(false, true)

      expect(parent.checked).toBe(false)
      expect(parent.childNodes[0].checked).toBe(false)
      expect(parent.childNodes[1].checked).toBe(false)
    })

    it('选中所有子节点时父节点自动选中', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' }
        ]
      }

      // 让 parent 成为 store.root 的子节点，这样它的 level 就是 1
      const parent = new Node({ data, store, parent: store.root })
      store.root.childNodes.push(parent)

      parent.childNodes[0].setChecked(true, false)
      expect(parent.indeterminate).toBe(true)
      expect(parent.checked).toBe(false)

      parent.childNodes[1].setChecked(true, false)
      expect(parent.checked).toBe(true)
      expect(parent.indeterminate).toBe(false)
    })

    it('取消部分子节点时父节点变为半选', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1' },
          { id: 3, label: 'child2' }
        ]
      }

      // 让 parent 成为 store.root 的子节点，这样它的 level 就是 1
      const parent = new Node({ data, store, parent: store.root })
      store.root.childNodes.push(parent)

      // 先全选
      parent.setChecked(true, true)
      expect(parent.checked).toBe(true)

      // 取消一个子节点
      parent.childNodes[0].setChecked(false, false)

      expect(parent.checked).toBe(false)
      expect(parent.indeterminate).toBe(true)
    })

    it('多层级联选择正确工作', () => {
      const data = {
        id: 1,
        label: 'root',
        children: [
          {
            id: 2,
            label: 'parent1',
            children: [
              { id: 3, label: 'child1-1' },
              { id: 4, label: 'child1-2' }
            ]
          },
          {
            id: 5,
            label: 'parent2',
            children: [
              { id: 6, label: 'child2-1' }
            ]
          }
        ]
      }

      // 让 root 成为 store.root 的子节点，这样它的 level 就是 1
      const root = new Node({ data, store, parent: store.root })
      store.root.childNodes.push(root)

      // 选中 root
      root.setChecked(true, true)

      // 验证所有节点都选中
      expect(root.checked).toBe(true)
      expect(root.childNodes[0].checked).toBe(true)
      expect(root.childNodes[0].childNodes[0].checked).toBe(true)
      expect(root.childNodes[0].childNodes[1].checked).toBe(true)
      expect(root.childNodes[1].checked).toBe(true)
      expect(root.childNodes[1].childNodes[0].checked).toBe(true)

      // 取消一个最底层节点
      root.childNodes[0].childNodes[0].setChecked(false, false)

      // 验证向上的半选状态
      expect(root.childNodes[0].childNodes[0].checked).toBe(false)
      expect(root.childNodes[0].checked).toBe(false)
      expect(root.childNodes[0].indeterminate).toBe(true)
      expect(root.checked).toBe(false)
      expect(root.indeterminate).toBe(true)
    })

    it('禁用节点不受父节点影响，但参与父节点状态计算', () => {
      const data = {
        id: 1,
        label: 'parent',
        children: [
          { id: 2, label: 'child1', disabled: true },
          { id: 3, label: 'child2' },
          { id: 4, label: 'child3' }
        ]
      }

      const parent = new Node({ data, store })

      // 设置禁用节点初始状态为选中
      parent.childNodes[0].checked = true

      // 选中父节点
      parent.setChecked(true, true)

      // 禁用节点保持原状态
      expect(parent.childNodes[0].checked).toBe(true)
      // 非禁用节点被选中
      expect(parent.childNodes[1].checked).toBe(true)
      expect(parent.childNodes[2].checked).toBe(true)

      // 取消父节点
      parent.setChecked(false, true)

      // 禁用节点保持选中状态
      expect(parent.childNodes[0].checked).toBe(true)
      // 非禁用节点被取消
      expect(parent.childNodes[1].checked).toBe(false)
      expect(parent.childNodes[2].checked).toBe(false)

      // 父节点应该是半选状态（因为有一个禁用节点选中）
      expect(parent.checked).toBe(false)
      expect(parent.indeterminate).toBe(true)
    })

    // 新增：批量操作性能测试
    it('大量节点批量操作性能测试', () => {
      const data = {
        id: 1,
        label: 'root',
        children: []
      }

      // 创建深层嵌套结构
      for (let i = 0; i < 100; i++) {
        data.children.push({
          id: i + 2,
          label: `child${i}`,
          children: []
        })
      }

      const startTime = performance.now()
      const root = new Node({ data, store })

      // 批量选中所有节点
      root.setChecked(true, true)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
      expect(root.checked).toBe(true)
      expect(root.childNodes.length).toBe(100)
      root.childNodes.forEach(child => {
        expect(child.checked).toBe(true)
      })
    })

    // 新增：错误处理测试 - 无效参数
    it('无效参数处理测试', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store
      })

      // 测试各种无效参数
      expect(() => node.setChecked(null, false)).not.toThrow()
      expect(() => node.setChecked(undefined, false)).not.toThrow()
      expect(() => node.setChecked(NaN, false)).not.toThrow()
      expect(() => node.setChecked({}, false)).not.toThrow()

      // 确保节点状态没有异常变化
      expect(node.checked).toBe(false)
      expect(node.indeterminate).toBe(false)
    })

    // 新增：多次快速操作状态一致性测试
    it('多次快速操作状态一致性测试', () => {
      const node = new Node({
        data: { id: 1, label: 'node' },
        store
      })

      // 快速连续操作
      node.setChecked(true, false)
      node.setChecked('half', false)
      node.setChecked(false, false)
      node.setChecked(true, false)

      // 最终状态应该正确
      expect(node.checked).toBe(true)
      expect(node.indeterminate).toBe(false)
    })

    // 新增：循环引用检测测试
    it('循环引用检测测试', () => {
      const data1 = { id: 1, label: 'node1' }
      const data2 = { id: 2, label: 'node2' }

      const node1 = new Node({ data: data1, store })
      const node2 = new Node({ data: data2, store, parent: node1 })

      node1.childNodes.push(node2)

      // 设置选中状态不应该导致无限循环
      expect(() => node1.setChecked(true, true)).not.toThrow()
      expect(node1.checked).toBe(true)
      expect(node2.checked).toBe(true)
    })
  })
})

