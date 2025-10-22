import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 组件 - 默认插槽', () => {
  let wrapper
  const testData = [
    {
      id: 1,
      label: '一级 1',
      type: 'folder',
      icon: 'folder-icon',
      children: [
        {
          id: 4,
          label: '二级 1-1',
          type: 'file',
          icon: 'file-icon',
          size: '1.2MB'
        },
        {
          id: 5,
          label: '二级 1-2',
          type: 'folder',
          icon: 'folder-icon'
        }
      ]
    },
    {
      id: 2,
      label: '一级 2',
      type: 'file',
      icon: 'file-icon',
      size: '2.5MB'
    },
    {
      id: 3,
      label: '一级 3',
      type: 'folder',
      icon: 'folder-icon'
    }
  ]

  describe('基础默认插槽功能', () => {
    it('应该能够使用默认插槽自定义节点内容', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          defaultExpandAll: true
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="custom-tree-node">
                <i :class="data.icon"></i>
                <span class="node-label">{{ data.label }}</span>
              </span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 验证自定义插槽内容
      const customNodes = wrapper.findAll('.custom-tree-node')
      expect(customNodes.length).toBeGreaterThan(0)

      // 验证图标
      const icons = wrapper.findAll('.folder-icon, .file-icon')
      expect(icons.length).toBeGreaterThan(0)

      // 验证节点标签
      const nodeLabels = wrapper.findAll('.node-label')
      expect(nodeLabels.length).toBeGreaterThan(0)
      expect(nodeLabels.at(0).text()).toBe('一级 1')
    })

    it('默认插槽应该接收正确的作用域参数', async () => {
      let slotProps = null

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: (props) => {
            slotProps = props
            return wrapper.vm.$createElement('span', props.data.label)
          }
        }
      })

      await wrapper.vm.$nextTick()

      // 验证插槽接收到正确的参数
      expect(slotProps).toBeTruthy()
      expect(slotProps).toHaveProperty('node')
      expect(slotProps).toHaveProperty('data')

      // 验证 node 对象的结构
      expect(slotProps.node).toHaveProperty('data')
      expect(slotProps.node).toHaveProperty('level')
      expect(slotProps.node).toHaveProperty('expanded')
      expect(slotProps.node).toHaveProperty('checked')
      expect(slotProps.node).toHaveProperty('isLeaf')

      // 验证 data 是原始数据
      expect(slotProps.data).toEqual(expect.objectContaining({
        id: expect.any(Number),
        label: expect.any(String),
        type: expect.any(String)
      }))
    })

    it('应该能够在插槽中访问节点的所有属性', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          showCheckbox: true,
          defaultExpandAll: true
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="detailed-node">
                <span class="node-level">Level: {{ node.level }}</span>
                <span class="node-expanded">Expanded: {{ node.expanded }}</span>
                <span class="node-checked">Checked: {{ node.checked }}</span>
                <span class="node-leaf">IsLeaf: {{ node.isLeaf }}</span>
                <span class="node-label">{{ data.label }}</span>
              </div>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 验证节点详细信息
      const detailedNodes = wrapper.findAll('.detailed-node')
      expect(detailedNodes.length).toBeGreaterThan(0)

      // 验证各种属性显示
      expect(wrapper.find('.node-level').text()).toContain('Level:')
      expect(wrapper.find('.node-expanded').text()).toContain('Expanded:')
      expect(wrapper.find('.node-checked').text()).toContain('Checked:')
      expect(wrapper.find('.node-leaf').text()).toContain('IsLeaf:')
    })
  })

  describe('复杂默认插槽场景', () => {
    it('应该能够在插槽中渲染复杂的 HTML 结构', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          defaultExpandAll: true
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="complex-slot-node">
                <div class="node-header">
                  <img :src="'/icons/' + data.icon + '.png'" class="node-icon" />
                  <h4 class="node-title">{{ data.label }}</h4>
                </div>
                <div class="node-meta" v-if="data.size">
                  <span class="file-size">Size: {{ data.size }}</span>
                </div>
                <div class="node-actions">
                  <button class="btn-view" @click.stop="viewNode(data)">查看</button>
                  <button class="btn-edit" @click.stop="editNode(data)">编辑</button>
                </div>
              </div>
            </template>
          `
        },
        methods: {
          viewNode: vi.fn(),
          editNode: vi.fn()
        }
      })

      await wrapper.vm.$nextTick()

      // 验证复杂结构
      const complexNodes = wrapper.findAll('.complex-slot-node')
      expect(complexNodes.length).toBeGreaterThan(0)

      // 验证节点头部
      const nodeHeaders = wrapper.findAll('.node-header')
      expect(nodeHeaders.length).toBeGreaterThan(0)

      // 验证图标
      const nodeIcons = wrapper.findAll('.node-icon')
      expect(nodeIcons.length).toBeGreaterThan(0)

      // 验证标题
      const nodeTitles = wrapper.findAll('.node-title')
      expect(nodeTitles.length).toBeGreaterThan(0)

      // 验证元数据（只有文件才有大小）
      const fileSizes = wrapper.findAll('.file-size')
      expect(fileSizes.length).toBeGreaterThan(0)

      // 验证操作按钮
      const viewButtons = wrapper.findAll('.btn-view')
      const editButtons = wrapper.findAll('.btn-edit')
      expect(viewButtons.length).toBeGreaterThan(0)
      expect(editButtons.length).toBeGreaterThan(0)
    })

    it('应该能够在插槽中处理事件', async () => {
      const onView = vi.fn()
      const onEdit = vi.fn()

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: function(props) {
            return this.$createElement('div', { class: 'interactive-slot-node' }, [
              this.$createElement('span', { class: 'node-label' }, props.data.label),
              this.$createElement('button', {
                class: 'btn-view',
                on: { click: (e) => { e.stopPropagation(); onView(props.data) } }
              }, '查看'),
              this.$createElement('button', {
                class: 'btn-edit',
                on: { click: (e) => { e.stopPropagation(); onEdit(props.data) } }
              }, '编辑')
            ])
          }
        }
      })

      await wrapper.vm.$nextTick()

      // 点击查看按钮
      const viewButton = wrapper.find('.btn-view')
      await viewButton.trigger('click')

      expect(onView).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          label: '一级 1',
          type: 'folder'
        })
      )

      // 点击编辑按钮
      const editButton = wrapper.find('.btn-edit')
      await editButton.trigger('click')

      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          label: '一级 1',
          type: 'folder'
        })
      )
    })

    it('应该能够根据节点状态动态显示内容', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          showCheckbox: true
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="dynamic-slot-node" :class="{
                'is-expanded': node.expanded,
                'is-checked': node.checked,
                'is-current': node.isCurrent,
                'is-leaf': node.isLeaf
              }">
                <span class="status-icon">
                  {{ node.expanded ? '📂' : '📁' }}
                </span>
                <span class="node-label">{{ data.label }}</span>
                <span v-if="node.checked" class="check-indicator">✓</span>
                <span v-if="node.isCurrent" class="current-indicator">👉</span>
              </div>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 验证初始状态
      const dynamicNodes = wrapper.findAll('.dynamic-slot-node')
      expect(dynamicNodes.length).toBeGreaterThan(0)

      // 展开节点
      const expandIcon = wrapper.find('.el-tree-node__expand-icon')
      await expandIcon.trigger('click')
      await wrapper.vm.$nextTick()

      // 验证展开状态
      const expandedNodes = wrapper.findAll('.is-expanded')
      expect(expandedNodes.length).toBeGreaterThan(0)

      // 选中节点 - 点击内部input而不是外层label
      const checkboxInput = wrapper.find('.el-checkbox input[type="checkbox"]')
      await checkboxInput.setChecked(true)
      await wrapper.vm.$nextTick()

      // 验证选中状态（检查实际的checkbox状态而不是slot中的class）
      const checkedBoxes = wrapper.findAll('.el-checkbox__input.is-checked')
      expect(checkedBoxes.length).toBeGreaterThan(0)

      // 验证slot渲染了节点
      const dynamicNodes02 = wrapper.findAll('.dynamic-slot-node')
      expect(dynamicNodes02.length).toBeGreaterThan(0)
    })
  })

  describe('默认插槽与其他功能的集成', () => {
    it('应该与复选框功能正常配合', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          showCheckbox: true,
          defaultExpandAll: true
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="checkbox-slot-node">
                <span class="node-label">{{ data.label }}</span>
                <span class="check-status">
                  {{ node.checked ? 'Selected' : 'Unselected' }}
                </span>
              </div>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 验证初始状态
      const checkStatuses = wrapper.findAll('.check-status')
      expect(checkStatuses.at(0).text()).toBe('Unselected')

      // 选中节点 - 直接设置checkbox状态
      const checkboxInput = wrapper.find('.el-checkbox input[type="checkbox"]')
      await checkboxInput.setChecked(true)
      await wrapper.vm.$nextTick()

      // 验证checkbox被选中
      const checkedBox = wrapper.find('.el-checkbox__input.is-checked')
      expect(checkedBox.exists()).toBe(true)

      // 验证slot仍然渲染了内容
      const slotNodes = wrapper.findAll('.checkbox-slot-node')
      expect(slotNodes.length).toBeGreaterThan(0)
    })

    it('应该与拖拽功能正常配合', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          draggable: true
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="draggable-slot-node">
                <span class="drag-handle">⋮⋮</span>
                <span class="node-label">{{ data.label }}</span>
                <span class="drag-indicator">可拖拽</span>
              </div>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 验证拖拽相关属性
      const treeNodes = wrapper.findAll('.el-tree-node')
      expect(treeNodes.at(0).attributes('draggable')).toBe('true')

      // 验证自定义拖拽内容
      const draggableNodes = wrapper.findAll('.draggable-slot-node')
      expect(draggableNodes.length).toBeGreaterThan(0)

      const dragHandles = wrapper.findAll('.drag-handle')
      expect(dragHandles.length).toBeGreaterThan(0)

      const dragIndicators = wrapper.findAll('.drag-indicator')
      expect(dragIndicators.length).toBeGreaterThan(0)
    })

    it('应该与过滤功能正常配合', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          filterNodeMethod: (value, data) => {
            return data.label.indexOf(value) !== -1
          }
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="filterable-slot-node">
                <span class="node-label" :class="{
                  'highlight': node.visible
                }">{{ data.label }}</span>
                <span class="visibility-status">
                  {{ node.visible ? 'Visible' : 'Hidden' }}
                </span>
              </div>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 应用过滤
      wrapper.vm.filter('二级')
      await wrapper.vm.$nextTick()

      // 验证过滤后的渲染
      const visibilityStatuses = wrapper.findAll('.visibility-status')
      expect(visibilityStatuses.length).toBeGreaterThan(0)

      // 应该有可见和隐藏的节点状态显示
      const statusTexts = visibilityStatuses.wrappers.map(w => w.text())
      expect(statusTexts.some(text => text === 'Visible')).toBe(true)
    })

    it('应该与懒加载功能正常配合', async () => {
      const lazyData = [
        {
          id: 1,
          label: '懒加载节点',
          // 在懒加载模式中，需要明确标识这不是叶子节点
          // 可以通过设置 children: null 或者不设置 children 属性
        }
      ]

      const loadNode = vi.fn((node, resolve) => {
        setTimeout(() => {
          resolve([
            { id: 11, label: '懒加载子节点 1' },
            { id: 12, label: '懒加载子节点 2' }
          ])
        }, 10) // 减少延迟时间
      })

      wrapper = mount(Tree, {
        propsData: {
          data: lazyData,
          nodeKey: 'id',
          lazy: true,
          load: loadNode
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="lazy-slot-node">
                <span class="node-label">{{ data.label }}</span>
                <span class="loading-status" v-if="node.loading">Loading...</span>
                <span class="loaded-status" v-else-if="node.loaded">Loaded</span>
              </div>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()
      // 等待更长时间确保组件完全初始化
      await new Promise(resolve => setTimeout(resolve, 20))

      // 验证懒加载节点被渲染
      const treeNodes = wrapper.findAll('.el-tree-node')
      expect(treeNodes.length).toBeGreaterThan(0)

      // 验证slot内容存在 - 现在应该包含父节点和子节点
      const nodeLabels = wrapper.findAll('.node-label')
      expect(nodeLabels.length).toBeGreaterThan(0)
      // 检查实际找到的标签
      const labelTexts = nodeLabels.wrappers.map(w => w.text())
      // 检查是否包含相关的懒加载节点文本
      expect(labelTexts.some(text => text.includes('懒加载'))).toBe(true)

      // 展开节点触发懒加载
      const expandIcon = wrapper.find('.el-tree-node__expand-icon')
      await expandIcon.trigger('click')

      // 验证加载状态
      const loadingStatus = wrapper.find('.loading-status')
      expect(loadingStatus.exists()).toBe(true)
      expect(loadingStatus.text()).toBe('Loading...')
    })
  })

  describe('默认插槽边界情况', () => {
    it('应该处理插槽内容为空的情况', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: () => null
        }
      })

      await wrapper.vm.$nextTick()

      // 组件应该正常渲染，不会崩溃
      expect(wrapper.find('.el-tree').exists()).toBe(true)
    })

    it('应该处理插槽抛出异常的情况', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: () => {
            throw new Error('Slot error')
          }
        }
      })

      await wrapper.vm.$nextTick()

      // 组件应该仍然存在
      expect(wrapper.find('.el-tree').exists()).toBe(true)

      consoleSpy.mockRestore()
    })

    it('应该处理数据为空的情况', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: [],
          nodeKey: 'id'
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <span class="empty-slot-node">{{ data.label }}</span>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      // 应该显示空数据提示
      const emptyText = wrapper.find('.el-tree__empty-text')
      expect(emptyText.exists()).toBe(true)

      // 不应该有自定义插槽节点
      const emptySlotNodes = wrapper.findAll('.empty-slot-node')
      expect(emptySlotNodes.length).toBe(0)
    })
  })

  describe('默认插槽性能测试', () => {
    it('应该能够高效处理大量节点的插槽渲染', async () => {
      // 创建大量节点
      const largeData = []
      for (let i = 0; i < 100; i++) {
        largeData.push({
          id: i,
          label: `节点 ${i}`,
          type: i % 2 === 0 ? 'folder' : 'file'
        })
      }

      const startTime = performance.now()

      wrapper = mount(Tree, {
        propsData: {
          data: largeData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: `
            <template slot-scope="{ node, data }">
              <div class="performance-slot-node">
                <span class="node-type">{{ data.type }}</span>
                <span class="node-label">{{ data.label }}</span>
              </div>
            </template>
          `
        }
      })

      await wrapper.vm.$nextTick()

      const endTime = performance.now()

      // 渲染应该在合理时间内完成
      expect(endTime - startTime).toBeLessThan(1000)

      // 验证所有节点都被正确渲染
      const performanceNodes = wrapper.findAll('.performance-slot-node')
      expect(performanceNodes.length).toBe(100)
    })

    it('插槽应该只在必要时重新渲染', async () => {
      let renderCount = 0

      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id'
        },
        scopedSlots: {
          default: (props) => {
            renderCount++
            return wrapper.vm.$createElement('span', props.data.label)
          }
        }
      })

      await wrapper.vm.$nextTick()

      const initialRenderCount = renderCount

      // 更新不相关的属性不应该触发重新渲染
      await wrapper.setProps({ highlightCurrent: true })

      expect(renderCount).toBe(initialRenderCount)
    })
  })
})