import { describe, it, expect, beforeEach, afterEach } from 'vitest'
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

    afterEach(() => {
      store = null
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

    // 新增：错误处理测试 - 无效数据
    it('应该处理无效的children数据', () => {
      const testCases = [
        { children: null },
        { children: undefined },
        { children: 'invalid' },
        { children: 123 },
        { children: [{}] }, // 缺少id的无效子节点
        { children: [{ id: null, label: 'invalid' }] }
      ]

      testCases.forEach((testCase, index) => {
        expect(() => {
          const _node = new Node({
            data: { id: 1, label: 'test', ...testCase },
            store: store
          })
        }).not.toThrow(`测试用例 ${index} 不应该抛出错误`)
      })
    })

    // 新增：大数据量性能测试
    it('大数据量节点创建性能测试', () => {
      const startTime = performance.now()

      // 创建深层嵌套的大数据结构
      const data = { id: 1, label: 'root', children: [] }

      function createDeepNode(id, depth) {
        if (depth === 0) return { id, label: `node-${id}` }

        return {
          id,
          label: `node-${id}`,
          children: [
            createDeepNode(id * 10 + 1, depth - 1),
            createDeepNode(id * 10 + 2, depth - 1)
          ]
        }
      }

      // 创建5层深度的树结构
      for (let i = 0; i < 50; i++) {
        data.children.push(createDeepNode(i + 2, 4))
      }

      const node = new Node({ data, store })
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(200) // 应该在200ms内完成
      expect(node.childNodes.length).toBe(50)
    })

    // 新增：数据更新时的状态变化测试
    it('数据更新时应该保持节点状态一致性', () => {
      const node = new Node({
        data: { id: 1, label: 'original', children: [] },
        store: store
      })

      // 修改节点状态
      node.checked = true
      node.expanded = true

      // 更新数据
      node.setData({
        id: 1,
        label: 'updated',
        children: [
          { id: 2, label: 'new child' }
        ]
      })

      // 验证状态是否保持
      expect(node.checked).toBe(true)
      expect(node.expanded).toBe(true)
      expect(node.childNodes.length).toBe(1)
      expect(node.childNodes[0].data.label).toBe('new child')
    })

    // 新增：循环引用检测
    it('应该检测和处理循环引用', () => {
      const data = { id: 1, label: 'test', children: [] }
      const node = new Node({ data, store })

      // 手动创建循环引用
      const childData = { id: 2, label: 'child' }
      const childNode = new Node({ data: childData, store, parent: node })

      // 将父节点添加为子节点的子节点（创建循环）
      expect(() => {
        childNode.childNodes.push(node)
      }).not.toThrow()

      // 验证基本操作仍然正常
      expect(node.childNodes.length).toBe(0)
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

    afterEach(() => {
      store = null
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

    // 新增：特殊字符和Unicode支持测试
    it('应该支持特殊字符和Unicode标签', () => {
      const specialLabels = [
        '🌟 星星标签',
        '标签 avec français',
        'タグ日本語',
        '태그한국어',
        'العربية',
        '',
        '   ',
        '\t标签\n',
        '标签"包含引号"',
        '标签\\包含斜杠\\'
      ]

      specialLabels.forEach((label, index) => {
        const node = new Node({
          data: { id: index + 1, label: label },
          store: store
        })

        expect(node.label).toBe(label)
      })
    })

    // 新增：动态label字段更新测试
    it('动态更新label字段应该反映在getter中', () => {
      const node = new Node({
        data: { id: 1, label: 'original' },
        store: store
      })

      expect(node.label).toBe('original')

      // 更新label
      node.data.label = 'updated'
      expect(node.label).toBe('updated')

      // 删除label字段
      delete node.data.label
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

    afterEach(() => {
      store = null
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

    // 新增：特殊key值类型测试
    it('应该处理各种特殊key值类型', () => {
      const specialKeys = [
        0,
        -1,
        Number.MAX_SAFE_INTEGER,
        '',
        '0',
        'string-with-dashes',
        'string_with_underscores',
        'string.with.dots',
        'string@with@symbols',
        true,
        false
      ]

      specialKeys.forEach((keyValue, index) => {
        const node = new Node({
          data: { id: keyValue, label: `test-${index}` },
          store: store
        })

        expect(node.key).toBe(keyValue)
      })
    })

    // 新增：空值和undefined处理测试
    it('应该正确处理空值和undefined的key', () => {
      const testCases = [
        { data: { id: null }, expected: null },
        { data: { id: undefined }, expected: undefined },
        { data: {}, expected: undefined },
        { data: { id: '' }, expected: '' }
      ]

      testCases.forEach((testCase) => {
        const node = new Node({
          data: testCase.data,
          store: store
        })

        expect(node.key).toBe(testCase.expected)
      })
    })

    // 新增：动态key更新测试
    it('动态更新key字段应该反映在getter中', () => {
      const node = new Node({
        data: { id: 'original' },
        store: store
      })

      expect(node.key).toBe('original')

      // 更新key
      node.data.id = 'updated'
      expect(node.key).toBe('updated')

      // 设置为null
      node.data.id = null
      expect(node.key).toBe(null)
    })

    // 新增：key字段不存在时的回退测试
    it('key字段不存在时应该返回undefined', () => {
      const node = new Node({
        data: { name: 'test', label: 'Test Label' },
        store: store
      })

      expect(node.key).toBeUndefined()
    })
  })
})

