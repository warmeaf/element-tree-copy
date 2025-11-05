/**
 * 拖拽处理工具类
 * 提取拖拽相关逻辑，优化性能和代码组织
 */
import { findNearestComponent } from '../model/util'
import { addClass, removeClass } from './dom'

/**
 * 计算拖拽位置类型
 * @param {Object} options - 计算选项
 * @returns {string} 拖拽类型: 'before' | 'after' | 'inner' | 'none'
 */
function calculateDropType({
  event,
  targetPosition,
  dropPrev,
  dropInner,
  dropNext,
}) {
  const prevPercent = dropPrev
    ? dropInner
      ? 0.25
      : dropNext
      ? 0.45
      : 1
    : -1
  const nextPercent = dropNext
    ? dropInner
      ? 0.75
      : dropPrev
      ? 0.55
      : 0
    : 1

  const distance = event.clientY - targetPosition.top
  const height = targetPosition.height

  if (distance < height * prevPercent) {
    return 'before'
  } else if (distance > height * nextPercent) {
    return 'after'
  } else if (dropInner) {
    return 'inner'
  }
  return 'none'
}

/**
 * 检查拖拽限制
 * @param {Object} draggingNode - 拖拽节点
 * @param {Object} dropNode - 放置目标节点
 * @returns {Object} 允许的拖拽位置
 */
function checkDragConstraints(draggingNode, dropNode) {
  let dropPrev = true
  let dropInner = true
  let dropNext = true

  // 检查是否是相邻节点
  if (dropNode.node.nextSibling === draggingNode.node) {
    dropNext = false
  }
  if (dropNode.node.previousSibling === draggingNode.node) {
    dropPrev = false
  }

  // 检查是否包含关系
  if (dropNode.node.contains(draggingNode.node, false)) {
    dropInner = false
  }
  if (
    draggingNode.node === dropNode.node ||
    draggingNode.node.contains(dropNode.node)
  ) {
    dropPrev = false
    dropInner = false
    dropNext = false
  }

  return { dropPrev, dropInner, dropNext }
}

/**
 * 更新拖拽指示器位置
 * @param {Object} options - 更新选项
 */
function updateDropIndicator({
  dropType,
  dropNode,
  treeEl,
  dropIndicator,
  treePosition,
}) {
  if (!dropIndicator || !dropNode || !dropNode.$el || !treePosition) return

  const iconEl = dropNode.$el.querySelector('.el-tree-node__expand-icon')
  if (!iconEl) return

  try {
    const iconPosition = iconEl.getBoundingClientRect()
    let indicatorTop = -9999

    if (dropType === 'before') {
      indicatorTop = iconPosition.top - treePosition.top
    } else if (dropType === 'after') {
      indicatorTop = iconPosition.bottom - treePosition.top
    }

    if (indicatorTop !== -9999 && dropIndicator) {
      dropIndicator.style.top = `${indicatorTop}px`
      dropIndicator.style.left = `${iconPosition.right - treePosition.left}px`
    }
  } catch (error) {
    // 忽略 DOM 操作错误，避免影响拖拽功能
    console.warn('[Tree] Error updating drop indicator:', error)
  }
}

/**
 * 创建拖拽处理器
 * @param {Object} context - Vue 组件上下文
 * @returns {Object} 拖拽处理方法
 */
export function createDragHandler(context) {
  const { dragState, allowDrag, allowDrop, store, $emit, $refs, $el } = context

  /**
   * 处理拖拽开始
   */
  function handleDragStart(event, treeNode) {
    if (typeof allowDrag === 'function' && !allowDrag(treeNode.node)) {
      event.preventDefault()
      return false
    }

    event.dataTransfer.effectAllowed = 'move'

    try {
      event.dataTransfer.setData('text/plain', '')
    } catch (e) {
      // Ignore IE11 error
    }

    dragState.draggingNode = treeNode
    $emit('node-drag-start', treeNode.node, event)
  }

  /**
   * 处理拖拽经过
   */
  function handleDragOver(event) {
    const dropNode = findNearestComponent(event.target, 'ElTreeNode')
    const oldDropNode = dragState.dropNode
    const draggingNode = dragState.draggingNode

    // 清理旧节点的样式
    if (oldDropNode && oldDropNode !== dropNode && oldDropNode.$el) {
      removeClass(oldDropNode.$el, 'is-drop-inner')
    }

    // 检查必要的条件
    if (!draggingNode || !dropNode || !dropNode.$el) return

    // 检查用户自定义的 allowDrop
    let dropPrev = true
    let dropInner = true
    let dropNext = true
    let userAllowDropInner = true

    if (typeof allowDrop === 'function') {
      dropPrev = allowDrop(draggingNode.node, dropNode.node, 'prev')
      userAllowDropInner = dropInner = allowDrop(
        draggingNode.node,
        dropNode.node,
        'inner'
      )
      dropNext = allowDrop(draggingNode.node, dropNode.node, 'next')
    }

    // 检查拖拽限制
    const constraints = checkDragConstraints(draggingNode, dropNode)
    dropPrev = dropPrev && constraints.dropPrev
    dropInner = dropInner && constraints.dropInner
    dropNext = dropNext && constraints.dropNext

    event.dataTransfer.dropEffect = dropInner ? 'move' : 'none'

    // 触发拖拽进入事件
    if ((dropPrev || dropInner || dropNext) && oldDropNode !== dropNode) {
      if (oldDropNode) {
        $emit(
          'node-drag-leave',
          draggingNode.node,
          oldDropNode.node,
          event
        )
      }
      $emit('node-drag-enter', draggingNode.node, dropNode.node, event)
    }

    if (dropPrev || dropInner || dropNext) {
      dragState.dropNode = dropNode
    }

    // 计算拖拽位置（确保 dropNode.$el 和 $el 存在）
    if (!dropNode.$el || !$el) return
    
    try {
      const targetPosition = dropNode.$el.getBoundingClientRect()
      const treePosition = $el.getBoundingClientRect()
      const dropType = calculateDropType({
        event,
        targetPosition,
        dropPrev,
        dropInner,
        dropNext,
      })

      // 更新指示器
      updateDropIndicator({
        dropType,
        dropNode,
        treeEl: $el,
        dropIndicator: $refs.dropIndicator,
        treePosition,
      })

      // 更新样式
      if (dropType === 'inner') {
        addClass(dropNode.$el, 'is-drop-inner')
      } else {
        removeClass(dropNode.$el, 'is-drop-inner')
      }

      // 更新状态
      dragState.showDropIndicator = dropType === 'before' || dropType === 'after'
      dragState.allowDrop = dragState.showDropIndicator || userAllowDropInner
      dragState.dropType = dropType
    } catch (error) {
      // 捕获可能的 DOM 操作错误
      console.warn('[Tree] Error in drag over handler:', error)
      dragState.showDropIndicator = false
      dragState.allowDrop = false
      dragState.dropType = 'none'
    }

    $emit('node-drag-over', draggingNode.node, dropNode.node, event)
  }

  /**
   * 处理拖拽结束
   */
  function handleDragEnd(event) {
    const { draggingNode, dropType, dropNode } = dragState
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    if (draggingNode && dropNode) {
      const draggingNodeCopy = { data: draggingNode.node.data }

      if (dropType !== 'none') {
        draggingNode.node.remove()
      }

      // 执行节点移动
      if (dropType === 'before') {
        dropNode.node.parent.insertBefore(draggingNodeCopy, dropNode.node)
      } else if (dropType === 'after') {
        dropNode.node.parent.insertAfter(draggingNodeCopy, dropNode.node)
      } else if (dropType === 'inner') {
        dropNode.node.insertChild(draggingNodeCopy)
      }

      removeClass(dropNode.$el, 'is-drop-inner')

      $emit('node-drag-end', draggingNode.node, dropNode.node, dropType, event)
      if (dropType !== 'none') {
        $emit('node-drop', draggingNode.node, dropNode.node, dropType, event)
      }
    } else if (draggingNode && !dropNode) {
      $emit('node-drag-end', draggingNode.node, null, dropType, event)
    }

    // 重置状态
    dragState.showDropIndicator = false
    dragState.draggingNode = null
    dragState.dropNode = null
    dragState.allowDrop = true
    dragState.dropType = null
  }

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}

