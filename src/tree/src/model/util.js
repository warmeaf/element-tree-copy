export const NODE_KEY = '$treeNodeId';

/**
 * 标记节点数据，建立节点与数据的关联
 * @param {Node} node - 节点实例
 * @param {Object} data - 节点数据
 */
export const markNodeData = function(node, data) {
  if (!data || data[NODE_KEY]) return;
  
  Object.defineProperty(data, NODE_KEY, {
    value: node.id,
    enumerable: false,
    configurable: false,
    writable: false
  });
};

/**
 * 获取节点的 key 值
 * @param {string} key - key 字段名
 * @param {Object} data - 节点数据
 * @returns {*} 节点的 key 值
 */
export const getNodeKey = function(key, data) {
  if (!key) {
    return data ? data[NODE_KEY] : undefined;
  }
  if (data === null || data === undefined) {
    return undefined;
  }
  return data[key];
};

/**
 * 查找最近的 Vue 组件实例
 * @param {HTMLElement} element - 起始元素
 * @param {string} componentName - 组件名称
 * @returns {Object|null} Vue 组件实例或 null
 */
export const findNearestComponent = (element, componentName) => {
  if (!element || !componentName) return null;
  
  let target = element;
  
  while (target && target.tagName !== 'BODY') {
    // 检查是否有 Vue 实例
    if (target.__vue__) {
      const vueInstance = target.__vue__;
      // 检查组件名称是否匹配
      if (vueInstance.$options && vueInstance.$options.name === componentName) {
        return vueInstance;
      }
    }
    target = target.parentNode;
  }
  
  return null;
};

