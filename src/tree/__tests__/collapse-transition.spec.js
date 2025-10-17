import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ElCollapseTransition from '../src/collapse-transition.js'
import { addClass, removeClass } from '../src/utils/dom.js'

describe('CollapseTransition 折叠动画组件', () => {
  describe('组件基础', () => {
    it('应该是函数式组件', () => {
      expect(ElCollapseTransition.functional).toBe(true)
    })

    it('应该有正确的组件名称', () => {
      expect(ElCollapseTransition.name).toBe('ElCollapseTransition')
    })

    it('应该能够渲染包裹的子元素', () => {
      const wrapper = mount({
        template: `
          <el-collapse-transition>
            <div v-show="show" class="test-content">Test Content</div>
          </el-collapse-transition>
        `,
        components: {
          ElCollapseTransition,
        },
        data() {
          return {
            show: true,
          }
        },
      })

      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('Test Content')
    })

    it('应该渲染为 transition 元素', () => {
      const wrapper = mount({
        template: `
          <el-collapse-transition>
            <div v-show="show" class="test-content">Test Content</div>
          </el-collapse-transition>
        `,
        components: {
          ElCollapseTransition,
        },
        data() {
          return {
            show: true,
          }
        },
      })

      // 函数式组件应该渲染一个 transition
      const transition = wrapper.find('transition-stub')
      expect(transition.exists()).toBe(true)
    })
  })

  describe('集成测试', () => {
    it('应该能够处理展开和收起的状态切换', async () => {
      const wrapper = mount({
        template: `
          <div>
            <button @click="toggle">Toggle</button>
            <el-collapse-transition>
              <div v-show="show" class="test-content">Test Content</div>
            </el-collapse-transition>
          </div>
        `,
        components: {
          ElCollapseTransition,
        },
        data() {
          return {
            show: false,
          }
        },
        methods: {
          toggle() {
            this.show = !this.show
          },
        },
      })

      const button = wrapper.find('button')
      const content = wrapper.find('.test-content')

      // 初始状态
      expect(content.element.style.display).toBe('none')

      // 展开
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.show).toBe(true)

      // 收起
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.show).toBe(false)
    })
  })

  describe('工具函数支持', () => {
    it('应该使用 addClass 和 removeClass 工具函数', () => {
      const el = document.createElement('div')
      
      addClass(el, 'collapse-transition')
      expect(el.classList.contains('collapse-transition')).toBe(true)
      
      removeClass(el, 'collapse-transition')
      expect(el.classList.contains('collapse-transition')).toBe(false)
    })
  })

})

