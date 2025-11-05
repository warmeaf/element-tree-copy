/**
 * DOM 工具函数
 */

/**
 * 添加 class
 * @param {HTMLElement} el - DOM 元素
 * @param {string} cls - 要添加的 class 名称（支持多个，用空格分隔）
 */
export function addClass(el, cls) {
  if (!el || !cls) return
  
  const classes = (cls || '').trim().split(/\s+/).filter(Boolean)
  if (classes.length === 0) return

  if (el.classList) {
    // 现代浏览器使用 classList API
    classes.forEach(clsName => {
      if (clsName) el.classList.add(clsName)
    })
  } else {
    // 兼容旧浏览器
    let curClass = ' ' + (el.className || '') + ' '
    classes.forEach(clsName => {
      if (clsName && curClass.indexOf(' ' + clsName + ' ') === -1) {
        curClass += clsName + ' '
      }
    })
    el.className = curClass.trim()
  }
}

/**
 * 移除 class
 * @param {HTMLElement} el - DOM 元素
 * @param {string} cls - 要移除的 class 名称（支持多个，用空格分隔）
 */
export function removeClass(el, cls) {
  if (!el || !cls) return
  
  const classes = (cls || '').trim().split(/\s+/).filter(Boolean)
  if (classes.length === 0) return

  if (el.classList) {
    // 现代浏览器使用 classList API
    classes.forEach(clsName => {
      if (clsName) el.classList.remove(clsName)
    })
  } else {
    // 兼容旧浏览器
    let curClass = ' ' + (el.className || '') + ' '
    classes.forEach(clsName => {
      if (clsName) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ')
      }
    })
    el.className = curClass.trim()
  }
}

/**
 * 判断是否有某个 class
 */
export function hasClass(el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) {
    throw new Error('className should not contain space.')
  }
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

