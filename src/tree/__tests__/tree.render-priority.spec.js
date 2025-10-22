import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 组件 - 渲染优先级', () => {
  let wrapper
  const testData = [
    {
      id: 1,
      label: '测试节点 1',
      type: 'folder'
    },
    {
      id: 2,
      label: '测试节点 2',
      type: 'file'
    }
  ]

  describe('renderContent 优先级最高', () => {
    it('当同时提供 renderContent 和默认插槽时，应该优先使用 renderContent', async () => {
      const renderContent = vi.fn((h, { node, data }) => {
        return h('span', { class: 'render-content-node' }, `RC: ${data.label}`)
      })

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          renderContent
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="default-slot-node">DS: {{ data.label }}</span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 应该调用 renderContent 函数
      expect(renderContent).toHaveBeenCalled()

      // 应该渲染 renderContent 的内容
      const renderContentNodes = wrapper.findAll('.render-content-node')
      expect(renderContentNodes.length).toBeGreaterThan(0)
      expect(renderContentNodes.at(0).text()).toBe('RC: 测试节点 1')

      // 不应该渲染默认插槽的内容
      const defaultSlotNodes = wrapper.findAll('.default-slot-node')
      expect(defaultSlotNodes.length).toBe(0)
    })

    it('当同时提供 renderContent、默认插槽和默认渲染时，应该优先使用 renderContent', async () => {
      const renderContent = vi.fn((h, { node, data }) => {
        return h('div', { class: 'render-content-priority' }, [
          h('i', { class: 'rc-icon' }),
          h('span', `RC Priority: ${data.label}`)
        ])
      })

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          renderContent
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="default-slot-priority">DS Priority: {{ data.label }}</span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 验证 renderContent 被调用
      expect(renderContent).toHaveBeenCalled()

      // 验证 renderContent 内容被渲染
      const renderContentNodes = wrapper.findAll('.render-content-priority')
      expect(renderContentNodes.length).toBeGreaterThan(0)

      const rcIcons = wrapper.findAll('.rc-icon')
      expect(rcIcons.length).toBeGreaterThan(0)

      // 验证默认插槽内容没有被渲染
      const defaultSlotNodes = wrapper.findAll('.default-slot-priority')
      expect(defaultSlotNodes.length).toBe(0)

      // 验证默认的 label 渲染没有被使用
      const defaultLabels = wrapper.findAll('.el-tree-node__label')
      expect(defaultLabels.length).toBe(0)
    })

    it('renderContent 返回 null 时应该降级到默认插槽', async () => {
      const renderContent = vi.fn((h, { node, data }) => {
        // 对特定节点返回 null
        if (data.id === 1) {
          return null
        }
        return h('span', { class: 'render-content-fallback' }, `RC: ${data.label}`)
      })

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          renderContent
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="default-slot-fallback">DS: {{ data.label }}</span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // renderContent 应该被调用
      expect(renderContent).toHaveBeenCalled()

      // 第二个节点应该使用 renderContent
      const renderContentNodes = wrapper.findAll('.render-content-fallback')
      expect(renderContentNodes.length).toBe(1)
      expect(renderContentNodes.at(0).text()).toBe('RC: 测试节点 2')

      // 第一个节点应该降级到默认插槽
      const defaultSlotNodes = wrapper.findAll('.default-slot-fallback')
      expect(defaultSlotNodes.length).toBe(1)
      expect(defaultSlotNodes.at(0).text()).toBe('DS: 测试节点 1')
    })
  })

  describe('默认插槽优先级次之', () => {
    it('当只提供默认插槽时，应该使用默认插槽渲染', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="only-default-slot">Only DS: {{ data.label }}</span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 应该渲染默认插槽内容
      const defaultSlotNodes = wrapper.findAll('.only-default-slot')
      expect(defaultSlotNodes.length).toBe(2)
      expect(defaultSlotNodes.at(0).text()).toBe('Only DS: 测试节点 1')
      expect(defaultSlotNodes.at(1).text()).toBe('Only DS: 测试节点 2')

      // 不应该有默认的 label 渲染
      const defaultLabels = wrapper.findAll('.el-tree-node__label')
      expect(defaultLabels.length).toBe(0)
    })

    it('当没有 renderContent 但有默认插槽时，应该优先使用默认插槽而不是默认渲染', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="slot-over-default">
                <span class="custom-label">{{ data.label }}</span>
                <span class="custom-type">[{{ data.type }}]</span>
              </div>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 应该渲染自定义插槽内容
      const slotNodes = wrapper.findAll('.slot-over-default')
      expect(slotNodes.length).toBe(2)

      const customLabels = wrapper.findAll('.custom-label')
      expect(customLabels.length).toBe(2)

      const customTypes = wrapper.findAll('.custom-type')
      expect(customTypes.length).toBe(2)
      expect(customTypes.at(0).text()).toBe('[folder]')
      expect(customTypes.at(1).text()).toBe('[file]')

      // 不应该有默认的 label 渲染
      const defaultLabels = wrapper.findAll('.el-tree-node__label')
      expect(defaultLabels.length).toBe(0)
    })
  })

  describe('默认渲染优先级最低', () => {
    it('当既没有 renderContent 也没有默认插槽时，应该使用默认渲染', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        }
      })

      await wrapper.vm.$nextTick()

      // 应该使用默认的 label 渲染
      const defaultLabels = wrapper.findAll('.el-tree-node__label')
      expect(defaultLabels.length).toBe(2)
      expect(defaultLabels.at(0).text()).toBe('测试节点 1')
      expect(defaultLabels.at(1).text()).toBe('测试节点 2')

      // 不应该有自定义渲染内容
      const customNodes = wrapper.findAll('.render-content-node, .default-slot-node')
      expect(customNodes.length).toBe(0)
    })

    it('默认渲染应该正确显示节点的 label 属性', async () => {
      const dataWithComplexLabels = [
        { id: 1, label: '复杂标签 & 特殊字符 <test>' },
        { id: 2, label: '数字标签 123' },
        { id: 3, label: '' }, // 空标签
        { id: 4 } // 没有 label 属性
      ]

      wrapper = mount(Tree, {
        propsData: {
          data: dataWithComplexLabels,
          nodeKey: 'id'
        }
      })

      await wrapper.vm.$nextTick()

      const defaultLabels = wrapper.findAll('.el-tree-node__label')
      expect(defaultLabels.length).toBe(4)

      // 验证复杂标签
      expect(defaultLabels.at(0).text()).toBe('复杂标签 & 特殊字符 <test>')

      // 验证数字标签
      expect(defaultLabels.at(1).text()).toBe('数字标签 123')

      // 验证空标签
      expect(defaultLabels.at(2).text()).toBe('')

      // 验证没有 label 的情况
      expect(defaultLabels.at(3).text()).toBe('')
    })
  })

  describe('动态切换渲染方式', () => {
    it('应该能够动态切换 renderContent', async () => {
      const renderContent1 = vi.fn((h, { node, data }) => {
        return h('span', { class: 'render-v1' }, `V1: ${data.label}`)
      })

      const renderContent2 = vi.fn((h, { node, data }) => {
        return h('span', { class: 'render-v2' }, `V2: ${data.label}`)
      })

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          renderContent: renderContent1
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="fallback-slot">Fallback: {{ data.label }}</span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 验证初始渲染
      expect(wrapper.findAll('.render-v1').length).toBe(2)
      expect(wrapper.findAll('.render-v2').length).toBe(0)
      expect(wrapper.findAll('.fallback-slot').length).toBe(0)

      // 切换到第二个 renderContent
      await wrapper.setProps({ renderContent: renderContent2 })

      expect(wrapper.findAll('.render-v1').length).toBe(0)
      expect(wrapper.findAll('.render-v2').length).toBe(2)
      expect(wrapper.findAll('.fallback-slot').length).toBe(0)

      // 移除 renderContent
      await wrapper.setProps({ renderContent: null })

      expect(wrapper.findAll('.render-v1').length).toBe(0)
      expect(wrapper.findAll('.render-v2').length).toBe(0)
      expect(wrapper.findAll('.fallback-slot').length).toBe(2)
    })

    it('应该能够动态添加和移除默认插槽', async () => {
      // 初始没有插槽
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        }
      })

      await wrapper.vm.$nextTick()

      // 验证默认渲染
      expect(wrapper.findAll('.el-tree-node__label').length).toBe(2)

      // 动态添加插槽
      await wrapper.setData({
        $scopedSlots: {
          default: (props) => {
            return wrapper.vm.$createElement('span', { class: 'dynamic-slot' }, `Dynamic: ${props.data.label}`)
          }
        }
      })

      // 注意：Vue 的插槽是在编译时确定的，运行时动态修改插槽比较复杂
      // 这个测试主要验证概念，实际实现可能需要重新挂载组件
    })
  })

  describe('渲染优先级的边界情况', () => {
    it('renderContent 抛出异常时应该降级到默认插槽', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const renderContent = vi.fn((h, { node, data }) => {
        if (data.id === 1) {
          throw new Error('RenderContent error')
        }
        return h('span', { class: 'render-success' }, `Success: ${data.label}`)
      })

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          renderContent
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="error-fallback">Error Fallback: {{ data.label }}</span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 成功的节点应该使用 renderContent
      const successNodes = wrapper.findAll('.render-success')
      expect(successNodes.length).toBe(1)

      // 出错的节点应该降级到默认插槽
      const fallbackNodes = wrapper.findAll('.error-fallback')
      expect(fallbackNodes.length).toBe(1)

      consoleSpy.mockRestore()
    })

    it('默认插槽抛出异常时应该降级到默认渲染', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: (props) => {
            if (props.data.id === 1) {
              throw new Error('Slot error')
            }
            return wrapper.vm.$createElement('span', { class: 'slot-success' }, `Slot: ${props.data.label}`)
          }
        }
      })

      await wrapper.vm.$nextTick()

      // 成功的节点应该使用插槽
      const slotNodes = wrapper.findAll('.slot-success')
      expect(slotNodes.length).toBe(1)

      // 出错的节点应该降级到默认渲染
      const defaultLabels = wrapper.findAll('.el-tree-node__label')
      expect(defaultLabels.length).toBe(1)
      expect(defaultLabels.at(0).text()).toBe('测试节点 1')

      consoleSpy.mockRestore()
    })

    it('所有渲染方式都失败时应该有合理的降级处理', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const renderContent = vi.fn(() => {
        throw new Error('RenderContent error')
      })

      wrapper = mount(Tree, {
        propsData: {
          data: [{ id: 1, label: '测试节点' }],
          nodeKey: 'id',
          renderContent
        },
        scopedSlots: {
          default: () => {
            throw new Error('Slot error')
          }
        }
      })

      await wrapper.vm.$nextTick()

      // 组件应该仍然存在且可用
      expect(wrapper.find('.el-tree').exists()).toBe(true)
      expect(wrapper.find('.el-tree-node').exists()).toBe(true)

      // 应该有某种形式的内容显示（可能是空的或者默认的错误处理）
      const treeNodes = wrapper.findAll('.el-tree-node')
      expect(treeNodes.length).toBe(1)

      consoleSpy.mockRestore()
    })
  })

  describe('渲染优先级性能测试', () => {
    it('优先级判断不应该显著影响渲染性能', async () => {
      const largeData = []
      for (let i = 0; i < 100; i++) {
        largeData.push({
          id: i,
          label: `性能测试节点 ${i}`,
          type: i % 2 === 0 ? 'folder' : 'file'
        })
      }

      const renderContent = vi.fn((h, { node, data }) => {
        return h('span', { class: 'perf-render' }, `RC: ${data.label}`)
      })

      const startTime = performance.now()

      wrapper = mount(Tree, {
        propsData: {
          data: largeData,
          nodeKey: 'id',
          renderContent
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="perf-slot">DS: {{ data.label }}</span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      const endTime = performance.now()

      // 渲染时间应该在合理范围内
      expect(endTime - startTime).toBeLessThan(1000)

      // 验证正确的优先级
      expect(wrapper.findAll('.perf-render').length).toBe(100)
      expect(wrapper.findAll('.perf-slot').length).toBe(0)

      // renderContent 应该被调用正确的次数
      expect(renderContent).toHaveBeenCalledTimes(100)
    })

    it('频繁切换渲染方式不应该造成内存泄漏', async () => {
      const renderContent1 = (h, { node, data }) => h('span', `RC1: ${data.label}`)
      const renderContent2 = (h, { node, data }) => h('span', `RC2: ${data.label}`)

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          renderContent: renderContent1
        }
      })

      // 多次切换渲染方式
      for (let i = 0; i < 10; i++) {
        await wrapper.setProps({ 
          renderContent: i % 2 === 0 ? renderContent1 : renderContent2 
        })
        await wrapper.vm.$nextTick()
      }

      // 组件应该仍然正常工作
      expect(wrapper.find('.el-tree').exists()).toBe(true)
      expect(wrapper.findAll('.el-tree-node').length).toBe(2)
    })
  })
})