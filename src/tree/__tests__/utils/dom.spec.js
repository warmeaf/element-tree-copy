import { describe, it, expect, beforeEach } from 'vitest'
import { addClass, removeClass, hasClass } from '../../src/utils/dom'

describe('DOM 工具函数', () => {
  let el

  beforeEach(() => {
    el = document.createElement('div')
  })

  describe('hasClass', () => {
    it('应该正确判断元素是否包含某个类', () => {
      el.className = 'foo bar'
      expect(hasClass(el, 'foo')).toBe(true)
      expect(hasClass(el, 'bar')).toBe(true)
      expect(hasClass(el, 'baz')).toBe(false)
    })

    it('没有元素时应该返回 false', () => {
      expect(hasClass(null, 'foo')).toBe(false)
    })

    it('没有类名时应该返回 false', () => {
      expect(hasClass(el, '')).toBe(false)
      expect(hasClass(el, null)).toBe(false)
    })

    it('类名包含空格时应该抛出错误', () => {
      expect(() => hasClass(el, 'foo bar')).toThrow('className should not contain space.')
    })

    it('应该能够处理只有一个类的情况', () => {
      el.className = 'single'
      expect(hasClass(el, 'single')).toBe(true)
      expect(hasClass(el, 'other')).toBe(false)
    })

    it('应该能够处理类名前后有空格的情况', () => {
      el.className = '  foo  bar  '
      expect(hasClass(el, 'foo')).toBe(true)
      expect(hasClass(el, 'bar')).toBe(true)
    })

    it('不应该误判部分匹配的类名', () => {
      el.className = 'foobar'
      expect(hasClass(el, 'foo')).toBe(false)
      expect(hasClass(el, 'bar')).toBe(false)
      expect(hasClass(el, 'foobar')).toBe(true)
    })
  })

  describe('addClass', () => {
    it('应该能够添加单个类', () => {
      addClass(el, 'foo')
      expect(el.className).toBe('foo')
    })

    it('应该能够添加多个类（空格分隔）', () => {
      addClass(el, 'foo bar baz')
      expect(hasClass(el, 'foo')).toBe(true)
      expect(hasClass(el, 'bar')).toBe(true)
      expect(hasClass(el, 'baz')).toBe(true)
    })

    it('不应该重复添加已存在的类', () => {
      el.className = 'foo'
      addClass(el, 'foo')
      expect(el.className).toBe('foo')
    })

    it('应该能够向已有类的元素添加新类', () => {
      el.className = 'foo'
      addClass(el, 'bar')
      expect(hasClass(el, 'foo')).toBe(true)
      expect(hasClass(el, 'bar')).toBe(true)
    })

    it('没有元素时不应该报错', () => {
      expect(() => addClass(null, 'foo')).not.toThrow()
    })

    it('类名为空时应该忽略', () => {
      el.className = 'foo'
      addClass(el, '')
      expect(el.className).toBe('foo')
    })

    it('应该能够处理包含空字符串的类名列表', () => {
      addClass(el, 'foo  bar')
      expect(hasClass(el, 'foo')).toBe(true)
      expect(hasClass(el, 'bar')).toBe(true)
    })

    it('classList 不可用时应该降级使用 className', () => {
      // 模拟不支持 classList 的环境
      const oldClassList = el.classList
      Object.defineProperty(el, 'classList', {
        value: undefined,
        configurable: true,
      })

      addClass(el, 'foo')
      addClass(el, 'bar')
      expect(el.className.includes('foo')).toBe(true)
      expect(el.className.includes('bar')).toBe(true)

      // 恢复
      Object.defineProperty(el, 'classList', {
        value: oldClassList,
        configurable: true,
      })
    })
  })

  describe('removeClass', () => {
    it('应该能够移除单个类', () => {
      el.className = 'foo bar'
      removeClass(el, 'foo')
      expect(hasClass(el, 'foo')).toBe(false)
      expect(hasClass(el, 'bar')).toBe(true)
    })

    it('应该能够移除多个类（空格分隔）', () => {
      el.className = 'foo bar baz'
      removeClass(el, 'foo bar')
      expect(hasClass(el, 'foo')).toBe(false)
      expect(hasClass(el, 'bar')).toBe(false)
      expect(hasClass(el, 'baz')).toBe(true)
    })

    it('移除不存在的类不应该报错', () => {
      el.className = 'foo'
      expect(() => removeClass(el, 'bar')).not.toThrow()
      expect(el.className).toBe('foo')
    })

    it('应该能够移除所有类', () => {
      el.className = 'foo bar'
      removeClass(el, 'foo')
      removeClass(el, 'bar')
      expect(el.className.trim()).toBe('')
    })

    it('没有元素时不应该报错', () => {
      expect(() => removeClass(null, 'foo')).not.toThrow()
    })

    it('没有类名时不应该报错', () => {
      el.className = 'foo'
      removeClass(el, '')
      removeClass(el, null)
      expect(el.className).toBe('foo')
    })

    it('应该正确处理类名前后的空格', () => {
      el.className = '  foo  bar  baz  '
      removeClass(el, 'bar')
      expect(hasClass(el, 'foo')).toBe(true)
      expect(hasClass(el, 'bar')).toBe(false)
      expect(hasClass(el, 'baz')).toBe(true)
    })

    it('classList 不可用时应该降级使用 className', () => {
      // 模拟不支持 classList 的环境
      const oldClassList = el.classList
      Object.defineProperty(el, 'classList', {
        value: undefined,
        configurable: true,
      })

      el.className = 'foo bar baz'
      removeClass(el, 'bar')
      expect(el.className.includes('bar')).toBe(false)
      expect(el.className.includes('foo')).toBe(true)
      expect(el.className.includes('baz')).toBe(true)

      // 恢复
      Object.defineProperty(el, 'classList', {
        value: oldClassList,
        configurable: true,
      })
    })

    it('应该正确清理移除后的空格', () => {
      el.className = 'foo bar baz'
      removeClass(el, 'bar')
      // 确保没有多余的空格
      expect(el.className.includes('  ')).toBe(false)
    })
  })

  describe('综合测试', () => {
    it('addClass 和 removeClass 应该能够配合使用', () => {
      addClass(el, 'foo')
      expect(hasClass(el, 'foo')).toBe(true)

      addClass(el, 'bar')
      expect(hasClass(el, 'bar')).toBe(true)

      removeClass(el, 'foo')
      expect(hasClass(el, 'foo')).toBe(false)
      expect(hasClass(el, 'bar')).toBe(true)
    })

    it('应该能够处理复杂的类操作场景', () => {
      addClass(el, 'class-1 class-2')
      addClass(el, 'class-3')
      expect(hasClass(el, 'class-1')).toBe(true)
      expect(hasClass(el, 'class-2')).toBe(true)
      expect(hasClass(el, 'class-3')).toBe(true)

      removeClass(el, 'class-1 class-3')
      expect(hasClass(el, 'class-1')).toBe(false)
      expect(hasClass(el, 'class-2')).toBe(true)
      expect(hasClass(el, 'class-3')).toBe(false)

      addClass(el, 'class-1')
      expect(hasClass(el, 'class-1')).toBe(true)
      expect(hasClass(el, 'class-2')).toBe(true)
    })
  })
})

