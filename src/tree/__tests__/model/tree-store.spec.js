import { describe, it, expect } from 'vitest'
import TreeStore from '../../src/model/tree-store.js'

describe('TreeStore 状态管理类', () => {
  it('应该导出 TreeStore 类', () => {
    expect(TreeStore).toBeDefined()
    expect(typeof TreeStore).toBe('function')
  })

  it('应该能够创建 TreeStore 实例', () => {
    const store = new TreeStore()
    expect(store).toBeInstanceOf(TreeStore)
  })

  it('应该是一个类构造函数', () => {
    expect(TreeStore.prototype.constructor).toBe(TreeStore)
  })
})

