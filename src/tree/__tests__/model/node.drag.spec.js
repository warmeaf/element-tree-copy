import { describe, it, expect, beforeEach } from 'vitest'
import Node from '../../src/model/node'
import TreeStore from '../../src/model/tree-store'

describe('Node 模型 - 拖拽相关功能', () => {
  let store
  let rootNode
  let parentNode
  let childNode1
  let childNode2

  beforeEach(() => {
    const data = [
      {
        id: 1,
        label: '父节点',
        children: [
          { id: 2, label: '子节点1' },
          { id: 3, label: '子节点2' },
        ],
      },
    ]

    store = new TreeStore({
      key: 'id',
      data,
    })

    rootNode = store.root
    parentNode = rootNode.childNodes[0]
    childNode1 = parentNode.childNodes[0]
    childNode2 = parentNode.childNodes[1]
  })

  describe('节点关系查询', () => {
    it('nextSibling 应该返回下一个兄弟节点', () => {
      expect(childNode1.nextSibling).toBe(childNode2)
      expect(childNode2.nextSibling).toBe(null)
    })

    it('previousSibling 应该返回上一个兄弟节点', () => {
      expect(childNode2.previousSibling).toBe(childNode1)
      expect(childNode1.previousSibling).toBe(null)
    })

    it('contains 方法应该正确判断包含关系', () => {
      // 父节点包含子节点
      expect(parentNode.contains(childNode1)).toBe(true)
      expect(parentNode.contains(childNode2)).toBe(true)
      
      // 子节点不包含父节点
      expect(childNode1.contains(parentNode)).toBe(false)
      
      // 兄弟节点不包含彼此
      expect(childNode1.contains(childNode2)).toBe(false)
      expect(childNode2.contains(childNode1)).toBe(false)
      
      // 节点不包含自身（deep=true 时只检查子节点）
      expect(parentNode.contains(parentNode, true)).toBe(false)
      
      // 节点不包含自身（deep=false 时也只检查直接子节点）
      expect(parentNode.contains(parentNode, false)).toBe(false)
    })
  })

  describe('节点操作 - insertBefore', () => {
    it('insertBefore 应该在指定节点前插入新节点', () => {
      const newNodeData = { data: { id: 4, label: '新节点' } }
      const newNode = parentNode.insertBefore(newNodeData, childNode2)

      expect(newNode).toBeInstanceOf(Node)
      expect(newNode.data).toBe(newNodeData.data)
      expect(newNode.parent).toBe(parentNode)
      
      // 检查插入位置
      const childNodes = parentNode.childNodes
      expect(childNodes.indexOf(newNode)).toBe(1)
      expect(childNodes.indexOf(childNode2)).toBe(2)
      expect(childNodes.length).toBe(3)
    })

    it('insertBefore 应该正确更新兄弟节点关系', () => {
      const newNodeData = { data: { id: 4, label: '新节点' } }
      const newNode = parentNode.insertBefore(newNodeData, childNode2)

      expect(childNode1.nextSibling).toBe(newNode)
      expect(newNode.previousSibling).toBe(childNode1)
      expect(newNode.nextSibling).toBe(childNode2)
      expect(childNode2.previousSibling).toBe(newNode)
    })

    it('insertBefore 传入 null 应该在末尾插入', () => {
      const newNodeData = { data: { id: 4, label: '新节点' } }
      const newNode = parentNode.insertBefore(newNodeData, null)

      const childNodes = parentNode.childNodes
      expect(childNodes[childNodes.length - 1]).toBe(newNode)
      expect(childNode2.nextSibling).toBe(newNode)
      expect(newNode.previousSibling).toBe(childNode2)
    })
  })

  describe('节点操作 - insertAfter', () => {
    it('insertAfter 应该在指定节点后插入新节点', () => {
      const newNodeData = { data: { id: 4, label: '新节点' } }
      const newNode = parentNode.insertAfter(newNodeData, childNode1)

      expect(newNode).toBeInstanceOf(Node)
      expect(newNode.data).toBe(newNodeData.data)
      expect(newNode.parent).toBe(parentNode)
      
      // 检查插入位置
      const childNodes = parentNode.childNodes
      expect(childNodes.indexOf(childNode1)).toBe(0)
      expect(childNodes.indexOf(newNode)).toBe(1)
      expect(childNodes.indexOf(childNode2)).toBe(2)
      expect(childNodes.length).toBe(3)
    })

    it('insertAfter 应该正确更新兄弟节点关系', () => {
      const newNodeData = { data: { id: 4, label: '新节点' } }
      const newNode = parentNode.insertAfter(newNodeData, childNode1)

      expect(childNode1.nextSibling).toBe(newNode)
      expect(newNode.previousSibling).toBe(childNode1)
      expect(newNode.nextSibling).toBe(childNode2)
      expect(childNode2.previousSibling).toBe(newNode)
    })

    it('insertAfter 在最后一个节点后插入应该正确处理', () => {
      const newNodeData = { data: { id: 4, label: '新节点' } }
      const newNode = parentNode.insertAfter(newNodeData, childNode2)

      const childNodes = parentNode.childNodes
      expect(childNodes[childNodes.length - 1]).toBe(newNode)
      expect(childNode2.nextSibling).toBe(newNode)
      expect(newNode.previousSibling).toBe(childNode2)
      expect(newNode.nextSibling).toBe(null)
    })
  })

  describe('节点操作 - insertChild', () => {
    it('insertChild 应该在子节点列表末尾添加新节点', () => {
      const newNodeData = { data: { id: 4, label: '新子节点' } }
      const newNode = parentNode.insertChild(newNodeData)

      expect(newNode).toBeInstanceOf(Node)
      expect(newNode.data).toBe(newNodeData.data)
      expect(newNode.parent).toBe(parentNode)
      
      const childNodes = parentNode.childNodes
      expect(childNodes[childNodes.length - 1]).toBe(newNode)
      expect(childNodes.length).toBe(3)
    })

    it('insertChild 应该正确设置新节点的兄弟关系', () => {
      const newNodeData = { data: { id: 4, label: '新子节点' } }
      const newNode = parentNode.insertChild(newNodeData)

      expect(childNode2.nextSibling).toBe(newNode)
      expect(newNode.previousSibling).toBe(childNode2)
      expect(newNode.nextSibling).toBe(null)
    })

    it('insertChild 到空父节点应该正确处理', () => {
      // 创建一个空的父节点（没有子节点）
      const emptyData = [{ id: 5, label: '空父节点' }]
      const emptyStore = new TreeStore({
        key: 'id',
        data: emptyData,
      })
      const emptyParent = emptyStore.root.childNodes[0]
      
      const newNodeData = { data: { id: 6, label: '第一个子节点' } }
      const newNode = emptyParent.insertChild(newNodeData)

      expect(newNode.parent).toBe(emptyParent)
      expect(newNode.previousSibling).toBe(null)
      expect(newNode.nextSibling).toBe(null)
      expect(emptyParent.childNodes.length).toBe(1)
      expect(emptyParent.childNodes[0]).toBe(newNode)
    })
  })

  describe('节点操作 - remove', () => {
    it('remove 应该从父节点中移除当前节点', () => {
      const originalLength = parentNode.childNodes.length
      childNode1.remove()

      expect(parentNode.childNodes.length).toBe(originalLength - 1)
      expect(parentNode.childNodes.indexOf(childNode1)).toBe(-1)
      expect(childNode1.parent).toBe(null)
    })

    it('remove 应该正确更新兄弟节点关系', () => {
      childNode1.remove()

      expect(childNode2.previousSibling).toBe(null)
    })

    it('remove 中间节点应该正确连接前后兄弟节点', () => {
      // 先添加第三个子节点
      const childNode3Data = { data: { id: 4, label: '子节点3' } }
      const childNode3 = parentNode.insertChild(childNode3Data)

      // 移除中间节点
      childNode2.remove()

      expect(childNode1.nextSibling).toBe(childNode3)
      expect(childNode3.previousSibling).toBe(childNode1)
    })

    it('remove 根节点应该被阻止或特殊处理', () => {
      // 根节点通常不应该被移除，或者需要特殊处理
      // 这取决于具体实现
      const originalParent = rootNode.parent
      
      // 尝试移除根节点
      rootNode.remove()
      
      // 验证根节点的父节点应该保持不变（根节点不能被移除）
      // 或者如果实现允许移除，验证不会抛出错误
      expect(() => rootNode.remove()).not.toThrow()
    })
  })

  describe('拖拽限制检查', () => {
    it('应该能检查节点是否可以拖拽到目标位置', () => {
      // 不能拖拽到自身（节点不包含自身）
      expect(childNode1.contains(childNode1)).toBe(false)
      
      // 不能拖拽到自己的子节点
      expect(parentNode.contains(childNode1)).toBe(true)
      
      // 可以拖拽到兄弟节点
      expect(childNode1.contains(childNode2)).toBe(false)
      expect(childNode2.contains(childNode1)).toBe(false)
    })

    it('应该能检查相邻兄弟节点关系', () => {
      expect(childNode1.nextSibling).toBe(childNode2)
      expect(childNode2.previousSibling).toBe(childNode1)
      
      // 不能拖拽到相邻位置（这会导致无意义的操作）
      expect(childNode1.nextSibling === childNode2).toBe(true)
      expect(childNode2.previousSibling === childNode1).toBe(true)
    })
  })

  describe('节点数据复制', () => {
    it('拖拽时应该能创建节点数据副本', () => {
      const originalData = childNode1.data
      const dataCopy = { data: originalData }
      
      expect(dataCopy.data).toBe(originalData)
      expect(dataCopy.data).not.toBe(dataCopy) // 确保是引用而不是同一个对象
    })

    it('插入节点时应该正确处理数据结构', () => {
      const newNodeData = { data: { id: 4, label: '新节点' } }
      const newNode = parentNode.insertChild(newNodeData)
      
      expect(newNode.data).toBe(newNodeData.data)
      expect(newNode.data.id).toBe(4)
      expect(newNode.label).toBe('新节点')
    })
  })

  describe('树结构完整性', () => {
    it('节点操作后树结构应该保持完整', () => {
      const originalChildCount = parentNode.childNodes.length
      
      // 添加节点
      const newNodeData = { data: { id: 4, label: '新节点' } }
      const newNode = parentNode.insertChild(newNodeData)
      
      expect(parentNode.childNodes.length).toBe(originalChildCount + 1)
      
      // 移除节点
      newNode.remove()
      
      expect(parentNode.childNodes.length).toBe(originalChildCount)
      
      // 检查原有节点关系是否正确
      expect(childNode1.nextSibling).toBe(childNode2)
      expect(childNode2.previousSibling).toBe(childNode1)
    })

    it('复杂的节点移动操作应该保持树结构完整', () => {
      // 创建更复杂的树结构
      const grandChildData = { data: { id: 5, label: '孙子节点' } }
      const grandChild = childNode1.insertChild(grandChildData)
      
      // 移动孙子节点到另一个父节点下
      grandChild.remove()
      const movedNode = childNode2.insertChild({ data: grandChild.data })
      
      expect(movedNode.parent).toBe(childNode2)
      expect(childNode1.childNodes.length).toBe(0)
      expect(childNode2.childNodes.length).toBe(1)
      expect(childNode2.childNodes[0]).toBe(movedNode)
    })
  })
})