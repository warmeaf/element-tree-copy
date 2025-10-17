import { describe, it, expect } from 'vitest'
import { getNodeKey, markNodeData, NODE_KEY } from '../../src/model/util.js'

describe('util 工具函数', () => {
  describe('NODE_KEY 常量', () => {
    it('应该导出 NODE_KEY 常量', () => {
      expect(NODE_KEY).toBeDefined()
      expect(typeof NODE_KEY).toBe('string')
      expect(NODE_KEY).toBe('$treeNodeId')
    })
  })

  describe('markNodeData 函数', () => {
    it('应该导出 markNodeData 函数', () => {
      expect(markNodeData).toBeDefined()
      expect(typeof markNodeData).toBe('function')
    })

    it('应该在数据对象上添加不可枚举的 $treeNodeId 属性', () => {
      const node = { id: 1 }
      const data = { label: 'test' }
      
      markNodeData(node, data)
      
      expect(data[NODE_KEY]).toBe(1)
      expect(Object.prototype.propertyIsEnumerable.call(data, NODE_KEY)).toBe(false)
    })

    it('应该将节点的 id 作为标记值', () => {
      const node = { id: 123 }
      const data = { label: 'test' }
      
      markNodeData(node, data)
      
      expect(data[NODE_KEY]).toBe(123)
    })

    it('如果数据为空，不应该抛出错误', () => {
      expect(() => markNodeData({ id: 1 }, null)).not.toThrow()
      expect(() => markNodeData({ id: 1 }, undefined)).not.toThrow()
    })

    it('如果数据已经被标记，不应该重复标记', () => {
      const node1 = { id: 1 }
      const node2 = { id: 2 }
      const data = { label: 'test' }
      
      markNodeData(node1, data)
      markNodeData(node2, data)
      
      // 应该保持第一次标记的值
      expect(data[NODE_KEY]).toBe(1)
    })

    it('标记的属性应该不可配置和不可写', () => {
      const node = { id: 1 }
      const data = { label: 'test' }
      
      markNodeData(node, data)
      
      const descriptor = Object.getOwnPropertyDescriptor(data, NODE_KEY)
      expect(descriptor.configurable).toBe(false)
      expect(descriptor.writable).toBe(false)
    })
  })

  describe('getNodeKey 函数', () => {
    it('应该导出 getNodeKey 函数', () => {
      expect(getNodeKey).toBeDefined()
      expect(typeof getNodeKey).toBe('function')
    })

    it('当没有提供 key 时，应该返回 $treeNodeId', () => {
      const data = {}
      data[NODE_KEY] = 123
      
      const result = getNodeKey(null, data)
      
      expect(result).toBe(123)
    })

    it('当提供了 key 时，应该返回对应的属性值', () => {
      const data = { id: 456, name: 'test' }
      
      const result = getNodeKey('id', data)
      
      expect(result).toBe(456)
    })

    it('应该能够获取自定义 key 的值', () => {
      const data = { customId: 'abc123' }
      
      const result = getNodeKey('customId', data)
      
      expect(result).toBe('abc123')
    })

    it('当 key 不存在时，应该返回 undefined', () => {
      const data = { id: 1 }
      
      const result = getNodeKey('nonExistentKey', data)
      
      expect(result).toBeUndefined()
    })
  })
})

