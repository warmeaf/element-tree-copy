import { describe, it, expect } from 'vitest'
import { getNodeKey, markNodeData, NODE_KEY, findNearestComponent } from '../../src/model/util.js'

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

  describe('findNearestComponent 函数', () => {
    it('应该导出 findNearestComponent 函数', () => {
      expect(findNearestComponent).toBeDefined()
      expect(typeof findNearestComponent).toBe('function')
    })

    it('应该找到最近的父级组件实例', () => {
      // 创建模拟的 DOM 结构
      const grandparent = document.createElement('div')
      const parent = document.createElement('div')
      const child = document.createElement('div')
      
      grandparent.appendChild(parent)
      parent.appendChild(child)
      document.body.appendChild(grandparent)
      
      // 模拟 Vue 组件实例
      const vueInstance = {
        $options: { name: 'TestComponent' }
      }
      parent.__vue__ = vueInstance
      
      const result = findNearestComponent(child, 'TestComponent')
      
      expect(result).toBe(vueInstance)
      
      // 清理 DOM
      document.body.removeChild(grandparent)
    })

    it('如果没有找到组件，应该返回 null', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)
      
      const result = findNearestComponent(element, 'NonExistentComponent')
      
      expect(result).toBeNull()
      
      // 清理 DOM
      document.body.removeChild(element)
    })

    it('应该在到达 BODY 标签时停止查找', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)
      
      // 给 body 添加 Vue 实例（不应该被找到，因为会在 BODY 之前停止）
      const bodyVueInstance = {
        $options: { name: 'TestComponent' }
      }
      document.body.__vue__ = bodyVueInstance
      
      const result = findNearestComponent(element, 'TestComponent')
      
      // 应该返回 null，因为在 BODY 之前就停止了
      expect(result).toBeNull()
      
      // 清理
      delete document.body.__vue__
      document.body.removeChild(element)
    })

    it('应该跳过没有 __vue__ 属性的元素', () => {
      const grandparent = document.createElement('div')
      const parent = document.createElement('div')
      const child = document.createElement('div')
      
      grandparent.appendChild(parent)
      parent.appendChild(child)
      document.body.appendChild(grandparent)
      
      // 只在 grandparent 上设置 Vue 实例
      const vueInstance = {
        $options: { name: 'TestComponent' }
      }
      grandparent.__vue__ = vueInstance
      
      // 从 child 开始查找，应该跳过 parent（没有 __vue__），找到 grandparent
      const result = findNearestComponent(child, 'TestComponent')
      
      expect(result).toBe(vueInstance)
      
      // 清理 DOM
      document.body.removeChild(grandparent)
    })

    it('应该根据组件名称匹配正确的组件', () => {
      const parent = document.createElement('div')
      const child = document.createElement('div')
      
      parent.appendChild(child)
      document.body.appendChild(parent)
      
      // 设置不同名称的 Vue 实例
      const wrongVueInstance = {
        $options: { name: 'WrongComponent' }
      }
      parent.__vue__ = wrongVueInstance
      
      const result = findNearestComponent(child, 'TestComponent')
      
      // 应该返回 null，因为组件名称不匹配
      expect(result).toBeNull()
      
      // 清理 DOM
      document.body.removeChild(parent)
    })

    it('应该返回第一个匹配的组件（最近的）', () => {
      const grandparent = document.createElement('div')
      const parent = document.createElement('div')
      const child = document.createElement('div')
      
      grandparent.appendChild(parent)
      parent.appendChild(child)
      document.body.appendChild(grandparent)
      
      // 在两个层级都设置相同名称的组件
      const parentVueInstance = {
        $options: { name: 'TestComponent' }
      }
      const grandparentVueInstance = {
        $options: { name: 'TestComponent' }
      }
      parent.__vue__ = parentVueInstance
      grandparent.__vue__ = grandparentVueInstance
      
      const result = findNearestComponent(child, 'TestComponent')
      
      // 应该返回更近的 parent 实例
      expect(result).toBe(parentVueInstance)
      
      // 清理 DOM
      document.body.removeChild(grandparent)
    })

    it('从元素自身开始查找', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)
      
      const vueInstance = {
        $options: { name: 'TestComponent' }
      }
      element.__vue__ = vueInstance
      
      const result = findNearestComponent(element, 'TestComponent')
      
      expect(result).toBe(vueInstance)
      
      // 清理 DOM
      document.body.removeChild(element)
    })
  })
})

