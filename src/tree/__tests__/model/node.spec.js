import { describe, it, expect } from 'vitest'
import Node from '../../src/model/node.js'

describe('Node 节点类', () => {
  it('应该导出 Node 类', () => {
    expect(Node).toBeDefined()
    expect(typeof Node).toBe('function')
  })

  it('应该能够创建 Node 实例', () => {
    const node = new Node()
    expect(node).toBeInstanceOf(Node)
  })

  it('应该是一个类构造函数', () => {
    expect(Node.prototype.constructor).toBe(Node)
  })
})

