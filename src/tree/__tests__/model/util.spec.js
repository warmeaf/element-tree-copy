import { describe, it, expect } from 'vitest'
import { getNodeKey } from '../../src/model/util.js'

describe('工具函数', () => {
  it('应该导出 getNodeKey 函数', () => {
    expect(getNodeKey).toBeDefined()
    expect(typeof getNodeKey).toBe('function')
  })

  it('getNodeKey 应该可以被调用', () => {
    expect(() => getNodeKey()).not.toThrow()
  })
})

