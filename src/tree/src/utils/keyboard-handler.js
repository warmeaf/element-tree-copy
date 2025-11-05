/**
 * 键盘导航处理工具
 * 优化键盘导航逻辑，提升性能和用户体验
 */

/**
 * 键盘按键常量
 */
export const KEY_CODES = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  ENTER: 13,
  SPACE: 32,
}

/**
 * 创建键盘处理器
 * @param {Object} context - Vue 组件上下文
 * @returns {Function} 键盘事件处理函数
 */
export function createKeyboardHandler(context) {
  const { $el } = context

  /**
   * 获取所有可聚焦的树项
   * @returns {Array} 树项数组
   */
  function getTreeItems() {
    const items = $el.querySelectorAll('.is-focusable[role=treeitem]')
    return Array.prototype.slice.call(items)
  }

  /**
   * 查找当前焦点项的索引
   * @param {HTMLElement} currentItem - 当前焦点元素
   * @param {Array} treeItemArray - 树项数组
   * @returns {number} 索引
   */
  function findCurrentIndex(currentItem, treeItemArray) {
    let currentIndex = treeItemArray.indexOf(currentItem)

    if (currentIndex === -1 && treeItemArray.length > 0) {
      // 查找当前有 tabindex="0" 的元素
      for (let i = 0; i < treeItemArray.length; i++) {
        if (treeItemArray[i].getAttribute('tabindex') === '0') {
          currentIndex = i
          break
        }
      }
      // 如果还是找不到，使用第一个元素
      if (currentIndex === -1) currentIndex = 0
    }

    return currentIndex
  }

  /**
   * 处理键盘事件
   */
  return function handleKeydown(ev) {
    const currentItem = ev.target
    if (
      !currentItem ||
      currentItem.className.indexOf('el-tree-node') === -1
    ) {
      return
    }

    const keyCode = ev.keyCode
    const treeItemArray = getTreeItems()
    const currentIndex = findCurrentIndex(currentItem, treeItemArray)

    // 上下键：导航
    if (keyCode === KEY_CODES.UP || keyCode === KEY_CODES.DOWN) {
      ev.preventDefault()
      let nextIndex

      if (keyCode === KEY_CODES.UP) {
        // 向上：如果已经是第一个，则循环到最后一个
        nextIndex =
          currentIndex !== 0 ? currentIndex - 1 : treeItemArray.length - 1
      } else {
        // 向下：如果已经是最后一个，则循环到第一个
        nextIndex =
          currentIndex < treeItemArray.length - 1 ? currentIndex + 1 : 0
      }

      if (treeItemArray[nextIndex]) {
        treeItemArray[nextIndex].focus()
      }
      return
    }

    // 左右键：展开/收起
    if (keyCode === KEY_CODES.LEFT || keyCode === KEY_CODES.RIGHT) {
      ev.preventDefault()
      currentItem.click() // 选中节点并可能触发展开
      return
    }

    // Enter 和 Space 键：处理 checkbox
    const hasInput = currentItem.querySelector('[type="checkbox"]')
    if (
      (keyCode === KEY_CODES.ENTER || keyCode === KEY_CODES.SPACE) &&
      hasInput
    ) {
      ev.preventDefault()
      hasInput.click()
      return
    }
  }
}

