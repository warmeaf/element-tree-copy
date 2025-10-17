import { markNodeData } from './util';

// 辅助函数：从节点数据中获取属性
const getPropertyFromData = function(node, prop) {
  const props = node.store.props;
  const data = node.data || {};
  const config = props?.[prop];

  if (typeof config === 'function') {
    return config(data, node);
  } else if (typeof config === 'string') {
    return data[config];
  } else if (typeof config === 'undefined') {
    const dataProp = data[prop];
    return dataProp === undefined ? '' : dataProp;
  }
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

    // 设置数据（如果不是懒加载）
    if (store.lazy !== true && this.data) {
      this.setData(this.data);

      if (store.defaultExpandAll) {
        this.expanded = true;
      }
    }

    // 标记节点数据
    if (!Array.isArray(this.data)) {
      markNodeData(this, this.data);
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

    // 递归创建子节点
    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({ data: children[i] });
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

  // 插入子节点
  insertChild(child, index) {
    if (!child) throw new Error('insertChild error: child is required.');

    if (!(child instanceof Node)) {
      Object.assign(child, {
        parent: this,
        store: this.store
      });
      child = new Node(child);
    }

    child.level = this.level + 1;

    if (typeof index === 'undefined' || index < 0) {
      this.childNodes.push(child);
    } else {
      this.childNodes.splice(index, 0, child);
    }

    this.updateLeafState();
  }

  // 在参考节点之前插入子节点
  insertBefore(child, ref) {
    let index;
    if (ref) {
      index = this.childNodes.indexOf(ref);
    }
    this.insertChild(child, index);
  }

  // 在参考节点之后插入子节点
  insertAfter(child, ref) {
    let index;
    if (ref) {
      index = this.childNodes.indexOf(ref);
      if (index !== -1) index += 1;
    }
    this.insertChild(child, index);
  }

  // 移除节点
  remove() {
    const parent = this.parent;
    if (parent) {
      parent.removeChild(this);
    }
  }

  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index > -1) {
      this.store && this.store.deregisterNode(child);
      child.parent = null;
      this.childNodes.splice(index, 1);
    }
    this.updateLeafState();
  }

  // 展开（暂时只修改状态）
  expand() {
    this.expanded = true;
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
}

