import { describe, it, expect } from 'vitest'
import Tree from '../index.js'

describe('Tree 入口文件', () => {
  it('应该导出 Tree 组件', () => {
    expect(Tree).toBeDefined()
    expect(Tree.name).toBe('ElTree')
  })

  it('应该有 install 方法', () => {
    expect(Tree.install).toBeDefined()
    expect(typeof Tree.install).toBe('function')
  })

  it('调用 install 时应该注册组件', () => {
    const mockVue = {
      component: vi.fn(),
    }
    Tree.install(mockVue)
    expect(mockVue.component).toHaveBeenCalledWith('ElTree', Tree)
  })
})

