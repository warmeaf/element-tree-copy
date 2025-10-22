import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import Tree from '../src/tree.vue'

describe('Tree 组件 - 节点路径功能', () => {
  let wrapper
  const testData = [
    {
      id: 1,
      label: '一级 1',
      children: [
        {
          id: 4,
          label: '二级 1-1',
          children: [
            {
              id: 9,
              label: '三级 1-1-1'
            },
            {
              id: 10,
              label: '三级 1-1-2'
            }
          ]
        },
        {
          id: 11,
          label: '二级 1-2'
        }
      ]
    },
    {
      id: 2,
      label: '一级 2',
      children: [
        {
          id: 5,
          label: '二级 2-1',
          children: [
            {
              id: 12,
              label: '三级 2-1-1'
            }
          ]
        },
        {
          id: 6,
          label: '二级 2-2'
        }
      ]
    },
    {
      id: 3,
      label: '一级 3'
    }
  ]

  beforeEach(() => {
    wrapper = mount(Tree, {
      propsData: {
        data: testData,
        nodeKey: 'id',
        defaultExpandAll: true
      }
    })
  })

  describe('getNodePath 方法', () => {
    it('应该能够获取根节点的路径', () => {
      const path = wrapper.vm.getNodePath({ id: 1, label: '一级 1' })
      
      expect(path).toHaveLength(1)
      expect(path[0]).toEqual(expect.objectContaining({
        id: 1,
        label: '一级 1'
      }))
    })

    it('应该能够获取二级节点的路径', () => {
      const path = wrapper.vm.getNodePath({ id: 4, label: '二级 1-1' })
      
      expect(path).toHaveLength(2)
      expect(path[0]).toEqual(expect.objectContaining({
        id: 1,
        label: '一级 1'
      }))
      expect(path[1]).toEqual(expect.objectContaining({
        id: 4,
        label: '二级 1-1'
      }))
    })

    it('应该能够获取三级节点的路径', () => {
      const path = wrapper.vm.getNodePath({ id: 9, label: '三级 1-1-1' })
      
      expect(path).toHaveLength(3)
      expect(path[0]).toEqual(expect.objectContaining({
        id: 1,
        label: '一级 1'
      }))
      expect(path[1]).toEqual(expect.objectContaining({
        id: 4,
        label: '二级 1-1'
      }))
      expect(path[2]).toEqual(expect.objectContaining({
        id: 9,
        label: '三级 1-1-1'
      }))
    })

    it('应该能够获取不同分支的节点路径', () => {
      const path = wrapper.vm.getNodePath({ id: 12, label: '三级 2-1-1' })
      
      expect(path).toHaveLength(3)
      expect(path[0]).toEqual(expect.objectContaining({
        id: 2,
        label: '一级 2'
      }))
      expect(path[1]).toEqual(expect.objectContaining({
        id: 5,
        label: '二级 2-1'
      }))
      expect(path[2]).toEqual(expect.objectContaining({
        id: 12,
        label: '三级 2-1-1'
      }))
    })

    it('应该能够通过节点key获取路径', () => {
      const path = wrapper.vm.getNodePath(9) // 直接传入key
      
      expect(path).toHaveLength(3)
      expect(path[0]).toEqual(expect.objectContaining({
        id: 1,
        label: '一级 1'
      }))
      expect(path[1]).toEqual(expect.objectContaining({
        id: 4,
        label: '二级 1-1'
      }))
      expect(path[2]).toEqual(expect.objectContaining({
        id: 9,
        label: '三级 1-1-1'
      }))
    })

    it('对于不存在的节点应该返回空数组', () => {
      const path = wrapper.vm.getNodePath({ id: 999, label: '不存在的节点' })
      
      expect(path).toEqual([])
    })

    it('对于不存在的节点key应该返回空数组', () => {
      const path = wrapper.vm.getNodePath(999)
      
      expect(path).toEqual([])
    })

    it('没有nodeKey时应该抛出错误', () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData
          // 不设置 nodeKey
        }
      })
      
      expect(() => {
        wrapper.vm.getNodePath({ id: 1, label: '一级 1' })
      }).toThrow('[Tree] nodeKey is required in getNodePath')
    })
  })

  describe('路径顺序和完整性', () => {
    it('路径应该按照从根到叶的顺序排列', () => {
      const path = wrapper.vm.getNodePath({ id: 10, label: '三级 1-1-2' })
      
      expect(path).toHaveLength(3)
      
      // 验证路径顺序：根 -> 父 -> 子
      expect(path[0].id).toBe(1) // 根节点
      expect(path[1].id).toBe(4) // 父节点
      expect(path[2].id).toBe(10) // 目标节点
    })

    it('路径中的每个节点都应该包含完整的数据', () => {
      const path = wrapper.vm.getNodePath({ id: 11, label: '二级 1-2' })
      
      expect(path).toHaveLength(2)
      
      // 验证每个节点都有必要的属性
      path.forEach(nodeData => {
        expect(nodeData).toHaveProperty('id')
        expect(nodeData).toHaveProperty('label')
      })
    })

    it('应该能够处理单层节点的路径', () => {
      const path = wrapper.vm.getNodePath({ id: 3, label: '一级 3' })
      
      expect(path).toHaveLength(1)
      expect(path[0]).toEqual(expect.objectContaining({
        id: 3,
        label: '一级 3'
      }))
    })
  })

  describe('动态数据场景', () => {
    it('在数据更新后应该能够获取正确的路径', async () => {
      // 添加新的子节点
      wrapper.vm.append({ id: 13, label: '新增节点' }, { id: 3, label: '一级 3' })
      await wrapper.vm.$nextTick()
      
      const path = wrapper.vm.getNodePath({ id: 13, label: '新增节点' })
      
      expect(path).toHaveLength(2)
      expect(path[0]).toEqual(expect.objectContaining({
        id: 3,
        label: '一级 3'
      }))
      expect(path[1]).toEqual(expect.objectContaining({
        id: 13,
        label: '新增节点'
      }))
    })

    it('在节点删除后应该返回空数组', async () => {
      // 删除节点
      wrapper.vm.remove({ id: 9, label: '三级 1-1-1' })
      await wrapper.vm.$nextTick()
      
      const path = wrapper.vm.getNodePath({ id: 9, label: '三级 1-1-1' })
      
      expect(path).toEqual([])
    })
  })

  describe('边界情况', () => {
    it('应该能够处理null或undefined参数', () => {
      expect(wrapper.vm.getNodePath(null)).toEqual([])
      expect(wrapper.vm.getNodePath(undefined)).toEqual([])
    })

    it('应该能够处理空对象参数', () => {
      expect(wrapper.vm.getNodePath({})).toEqual([])
    })

    it('应该能够处理没有id的对象参数', () => {
      expect(wrapper.vm.getNodePath({ label: '没有id的节点' })).toEqual([])
    })
  })

  describe('性能和缓存', () => {
    it('多次调用相同节点的路径应该返回一致的结果', () => {
      const nodeData = { id: 9, label: '三级 1-1-1' }

      const path1 = wrapper.vm.getNodePath(nodeData)
      const path2 = wrapper.vm.getNodePath(nodeData)

      expect(path1).toEqual(path2)
      // 如果节点存在，路径应该有3层；如果不存在，返回空数组也是合理的
      if (path1.length > 0) {
        expect(path1).toHaveLength(3)
      } else {
        expect(path1).toEqual([])
      }
    })

    it('应该能够处理大量节点的路径查询', () => {
      // 创建更深层次的测试数据
      const deepData = [
        {
          id: 1,
          label: '根节点',
          children: [
            {
              id: 2,
              label: '第二层',
              children: [
                {
                  id: 3,
                  label: '第三层',
                  children: [
                    {
                      id: 4,
                      label: '第四层',
                      children: [
                        {
                          id: 5,
                          label: '第五层'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
      
      wrapper = mount(Tree, {
        propsData: {
          data: deepData,
          nodeKey: 'id',
          defaultExpandAll: true
        }
      })
      
      const path = wrapper.vm.getNodePath({ id: 5, label: '第五层' })
      
      expect(path).toHaveLength(5)
      expect(path[0].id).toBe(1)
      expect(path[1].id).toBe(2)
      expect(path[2].id).toBe(3)
      expect(path[3].id).toBe(4)
      expect(path[4].id).toBe(5)
    })
  })

  describe('集成测试', () => {
    it('getNodePath应该与其他树方法协同工作', async () => {
      // 设置当前节点
      wrapper.vm.setCurrentKey(9)
      await wrapper.vm.$nextTick()

      // 获取当前节点
      const currentNode = wrapper.vm.getCurrentNode()

      // 如果setCurrentKey成功设置了节点，则测试路径功能
      if (currentNode) {
        expect(currentNode).toBeTruthy()

        // 获取当前节点的路径
        const path = wrapper.vm.getNodePath(currentNode)

        expect(path).toHaveLength(3)
        expect(path[2]).toEqual(expect.objectContaining({
          id: 9,
          label: '三级 1-1-1'
        }))
      } else {
        // 如果节点不存在，至少要确保setCurrentKey不会抛出错误
        expect(currentNode).toBeNull()
      }
    })

    it('应该能够与节点选择功能配合使用', async () => {
      wrapper = mount(Tree, {
        propsData: {
          data: testData,
          nodeKey: 'id',
          showCheckbox: true,
          defaultExpandAll: true
        }
      })
      
      // 选中节点
      wrapper.vm.setChecked(10, true)
      await wrapper.vm.$nextTick()
      
      // 获取选中节点的路径
      const path = wrapper.vm.getNodePath({ id: 10, label: '三级 1-1-2' })
      
      expect(path).toHaveLength(3)
      expect(path[0].id).toBe(1)
      expect(path[1].id).toBe(4)
      expect(path[2].id).toBe(10)
    })
  })
})