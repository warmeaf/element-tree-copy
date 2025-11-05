import { markNodeData } from './util';

// 计算子节点的选中状态
export const getChildState = node => {
  let all = true;
  let none = true;
  let allWithoutDisable = true;
  for (let i = 0, j = node.length; i < j; i++) {
    const n = node[i];
    if (n.checked !== true || n.indeterminate) {
      all = false;
      if (!n.disabled) {
        allWithoutDisable = false;
      }
    }
    if (n.checked !== false || n.indeterminate) {
      none = false;
    }
  }

  return { all, none, allWithoutDisable, half: !all && !none };
};

// 根据子节点状态重新初始化父节点的选中状态
const reInitChecked = function(node) {
  if (node.childNodes.length === 0 || node.loading) return;

  const { all, none, half } = getChildState(node.childNodes);
  if (all) {
    node.checked = true;
    node.indeterminate = false;
  } else if (half) {
    node.checked = false;
    node.indeterminate = true;
  } else if (none) {
    node.checked = false;
    node.indeterminate = false;
  }

  const parent = node.parent;
  if (!parent || parent.level === 0) return;

  if (!node.store.checkStrictly) {
    reInitChecked(parent);
  }
};

// 辅助函数：从节点数据中获取属性
const getPropertyFromData = function(node, prop) {
  const props = node.store.props;
  const data = node.data || {};
  const config = props && props[prop];

  if (typeof config === 'function') {
    return config(data, node);
  } else if (typeof config === 'string') {
    return data[config];
  } else if (typeof config === 'undefined') {
    const dataProp = data[prop];
    return dataProp === undefined ? '' : dataProp;
  }
  
  // 默认情况下返回空字符串
  return '';
};

let nodeIdSeed = 0;

export default class Node {
  constructor(options) {
    // 基本属性
    this.id = nodeIdSeed++;
    this.text = null;
    this.data = null;
    this.parent = null;
    this.level = 0;
    this.childNodes = [];

    // 状态属性（先声明，暂不实现复杂逻辑）
    this.expanded = false;
    this.visible = true;
    this.checked = false;
    this.indeterminate = false;
    this.isCurrent = false;
    this.isLeaf = false;

    // 懒加载相关
    this.loaded = false;
    this.loading = false;

    // 复制 options 属性
    for (let name in options) {
      if (Object.prototype.hasOwnProperty.call(options, name)) {
        this[name] = options[name];
      }
    }

    // 计算层级
    if (this.parent) {
      this.level = this.parent.level + 1;
    }

    // 注册到 store
    const store = this.store;
    if (!store) {
      throw new Error('[Node]store is required!');
    }
    store.registerNode(this);


    // 处理懒加载时的叶子节点判断
    const props = store.props;
    if (props && typeof props.isLeaf !== 'undefined') {
      const isLeaf = getPropertyFromData(this, 'isLeaf');
      if (typeof isLeaf === 'boolean') {
        this.isLeafByUser = isLeaf;
      }
    }

    // 设置数据（如果不是懒加载）
    if (store.lazy !== true && this.data) {
      this.setData(this.data);

      if (store.defaultExpandAll) {
        this.expanded = true;
      }
    } else if (this.level > 0 && store.lazy && store.defaultExpandAll) {
      this.expand();
    }

    // 标记节点数据
    if (!Array.isArray(this.data)) {
      markNodeData(this, this.data);
    }

    // 处理默认展开的节点
    if (!this.data) return;
    const defaultExpandedKeys = store.defaultExpandedKeys;
    const key = store.key;
    if (key && defaultExpandedKeys && defaultExpandedKeys.indexOf(this.key) !== -1) {
      this.expand(null, store.autoExpandParent);
    }

    // 检查是否是当前节点（需要在数据设置后检查）
    if (
      key &&
      store.currentNodeKey !== undefined &&
      this.key === store.currentNodeKey
    ) {
      store.currentNode = this;
      store.currentNode.isCurrent = true;
    }

    // 在懒加载模式下初始化默认选中节点
    if (store.lazy) {
      store._initDefaultCheckedNode(this);
    }

    this.updateLeafState();
  }

  setData(data) {
    if (!Array.isArray(data)) {
      markNodeData(this, data);
    }

    this.data = data;
    this.childNodes = [];

    let children;
    if (this.level === 0 && this.data instanceof Array) {
      children = this.data; // 根节点的 data 就是数组
    } else {
      // 从配置中获取 children 字段
      children = getPropertyFromData(this, 'children') || [];
    }

    // 递归创建子节点（使用 batch 模式避免重复同步）
    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({ data: children[i] }, undefined, true);
    }
  }

  get label() {
    return getPropertyFromData(this, 'label');
  }

  get key() {
    const nodeKey = this.store.key;
    if (this.data) return this.data[nodeKey];
    return null;
  }

  get disabled() {
    return getPropertyFromData(this, 'disabled');
  }

  get nextSibling() {
    const parent = this.parent;
    if (parent) {
      const index = parent.childNodes.indexOf(this);
      if (index > -1) {
        return parent.childNodes[index + 1] || null;
      }
    }
    return null;
  }

  get previousSibling() {
    const parent = this.parent;
    if (parent) {
      const index = parent.childNodes.indexOf(this);
      if (index > -1) {
        return index > 0 ? parent.childNodes[index - 1] : null;
      }
    }
    return null;
  }

  contains(target, deep = true) {
    if (!target) return false;
    // 节点不包含自身，只检查子节点
    if (this === target) return false;
    
    /**
     * 递归检查是否包含目标节点
     * @param {Node} parent - 父节点
     * @returns {boolean} 是否包含
     */
    const walk = (parent) => {
      const children = parent.childNodes || [];
      
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        if (child === target) {
          return true;
        }
        if (deep && walk(child)) {
          return true;
        }
      }
      
      return false;
    };

    return walk(this);
  }

  // 获取节点的子数据数组（用于数据同步）
  getChildren(forceInit = false) {
    if (this.level === 0) return this.data;
    const data = this.data;
    if (!data) return null;

    const props = this.store.props;
    let children = 'children';
    if (props) {
      children = props.children || 'children';
    }

    if (data[children] === undefined) {
      data[children] = null;
    }

    if (forceInit && !data[children]) {
      data[children] = [];
    }

    return data[children];
  }

  // 插入子节点
  insertChild(child, index, batch) {
    if (!child) {
      throw new Error('insertChild error: child is required.');
    }

    // 如果 child 不是 Node 实例，需要创建
    if (!(child instanceof Node)) {
      // 如果不是 batch 模式，需要同步更新原数据
      if (!batch) {
        const children = this.getChildren(true);
        if (children && children.indexOf(child.data) === -1) {
          const insertIndex = typeof index === 'undefined' || index < 0 
            ? children.length 
            : Math.max(0, Math.min(index, children.length));
          children.splice(insertIndex, 0, child.data);
        }
      }
      
      // 创建 Node 实例
      child = new Node({
        ...child,
        parent: this,
        store: this.store,
      });
    }

    // 设置层级
    child.level = this.level + 1;

    // 插入到指定位置
    const insertIndex = typeof index === 'undefined' || index < 0
      ? this.childNodes.length
      : Math.max(0, Math.min(index, this.childNodes.length));
    
    this.childNodes.splice(insertIndex, 0, child);

    // 更新叶子节点状态
    this.updateLeafState();
    
    return child;
  }

  // 在参考节点之前插入子节点
  insertBefore(child, ref) {
    let index;
    if (ref) {
      index = this.childNodes.indexOf(ref);
    }
    return this.insertChild(child, index);
  }

  // 在参考节点之后插入子节点
  insertAfter(child, ref) {
    let index;
    if (ref) {
      index = this.childNodes.indexOf(ref);
      if (index !== -1) index += 1;
    }
    return this.insertChild(child, index);
  }

  // 移除节点
  remove() {
    const parent = this.parent;
    if (parent) {
      parent.removeChild(this);
    }
  }

  removeChild(child) {
    // 同步删除原数据
    const children = this.getChildren() || [];
    const dataIndex = children.indexOf(child.data);
    if (dataIndex > -1) {
      children.splice(dataIndex, 1);
    }

    // 删除节点
    const index = this.childNodes.indexOf(child);
    if (index > -1) {
      this.store && this.store.deregisterNode(child);
      child.parent = null;
      this.childNodes.splice(index, 1);
    }
    this.updateLeafState();
  }

  // 根据数据删除子节点
  removeChildByData(data) {
    let targetNode = null;

    for (let i = 0; i < this.childNodes.length; i++) {
      if (this.childNodes[i].data === data) {
        targetNode = this.childNodes[i];
        break;
      }
    }

    if (targetNode) {
      this.removeChild(targetNode);
    }
  }

  // 展开
  expand(callback, expandParent) {
    const done = () => {
      if (expandParent) {
        let parent = this.parent;
        while (parent.level > 0) {
          parent.expanded = true;
          parent = parent.parent;
        }
      }
      this.expanded = true;
      if (callback) callback();
    };

    if (this.shouldLoadData()) {
      this.loadData((data) => {
        if (data instanceof Array) {
          if (this.checked) {
            this.setChecked(true, true);
          } else if (!this.store.checkStrictly) {
            reInitChecked(this);
          }
          done();
        }
      });
    } else {
      done();
    }
  }

  // 收起
  collapse() {
    this.expanded = false;
  }

  // 更新叶子节点状态
  updateLeafState() {
    if (this.store.lazy === true && this.loaded !== true && typeof this.isLeafByUser !== 'undefined') {
      this.isLeaf = this.isLeafByUser;
      return;
    }
    const childNodes = this.childNodes;
    if (!this.store.lazy || (this.store.lazy === true && this.loaded === true)) {
      this.isLeaf = !childNodes || childNodes.length === 0;
      return;
    }
    this.isLeaf = false;
  }

  // 设置节点的选中状态
  setChecked(value, deep, recursion, passValue) {
    // 处理半选状态
    this.indeterminate = value === 'half';
    this.checked = value === true;

    // 严格模式：不关联父子节点
    if (this.store.checkStrictly) return;

    // 处理子节点选中状态
    if (!(this.shouldLoadData() && !this.store.checkDescendants)) {
      const childState = getChildState(this.childNodes);
      const { all, allWithoutDisable } = childState;

      // 如果子节点不全选且没有禁用节点全选，则取消选中
      if (!this.isLeaf && !all && allWithoutDisable) {
        this.checked = false;
        value = false;
      }

      /**
       * 处理后代节点的选中状态
       */
      const handleDescendants = () => {
        if (!deep) return;
        
        const childNodes = this.childNodes;
        const childCount = childNodes.length;
        
        // 确定要传递的值
        const finalPassValue = passValue || value !== false;
        
        // 批量处理子节点
        for (let i = 0; i < childCount; i++) {
          const child = childNodes[i];
          const isCheck = child.disabled ? child.checked : finalPassValue;
          child.setChecked(isCheck, deep, true, finalPassValue);
        }
        
        // 重新计算父节点状态
        const newChildState = getChildState(childNodes);
        if (!newChildState.all) {
          this.checked = newChildState.all;
          this.indeterminate = newChildState.half;
        }
      };

      // 懒加载处理
      if (this.shouldLoadData()) {
        this.loadData(() => {
          handleDescendants();
          reInitChecked(this);
        }, {
          checked: value !== false
        });
        return;
      } else {
        handleDescendants();
      }
    }

    // 更新父节点状态
    const parent = this.parent;
    if (!parent || parent.level === 0) return;

    if (!recursion) {
      reInitChecked(parent);
    }
  }

  // 判断是否需要懒加载数据
  shouldLoadData() {
    return !!(this.store.lazy === true && this.store.load && !this.loaded);
  }

  // 懒加载数据
  loadData(callback, defaultProps = {}) {
    if (this.store.lazy === true && this.store.load && !this.loaded && (!this.loading || Object.keys(defaultProps).length)) {
      this.loading = true;

      const resolve = (children) => {
        this.childNodes = [];
        this.doCreateChildren(children, defaultProps);
        this.loaded = true;
        this.loading = false;
        this.updateLeafState();
        if (callback) {
          callback.call(this, children);
        }
      };

      this.store.load(this, resolve);
    } else {
      if (callback) {
        callback.call(this);
      }
    }
  }

  // 根据数据数组创建子节点
  doCreateChildren(array, defaultProps = {}) {
    if (!Array.isArray(array)) return;
    
    // 批量创建子节点，使用 batch 模式提高性能
    for (let i = 0, len = array.length; i < len; i++) {
      this.insertChild(
        { ...defaultProps, data: array[i] },
        undefined,
        true
      );
    }
  }
}

