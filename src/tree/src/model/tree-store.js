import Node from './node';
import { getNodeKey } from './util';

export default class TreeStore {
  constructor(options) {
    this.currentNode = null;
    this.currentNodeKey = null;

    // 复制配置
    for (let option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        this[option] = options[option];
      }
    }

    // 节点映射表
    this.nodesMap = {};

    // 创建根节点
    this.root = new Node({
      data: this.data,
      store: this
    });
  }

  // 注册节点到映射表
  registerNode(node) {
    const key = this.key;
    if (!key || !node || !node.data) return;

    const nodeKey = node.key;
    if (nodeKey !== undefined) {
      this.nodesMap[node.key] = node;
    }
  }

  // 从映射表中注销节点
  deregisterNode(node) {
    const key = this.key;
    if (!key || !node || !node.data) return;

    // 递归注销子节点
    node.childNodes.forEach(child => {
      this.deregisterNode(child);
    });

    delete this.nodesMap[node.key];
  }

  // 获取节点
  getNode(data) {
    if (data instanceof Node) return data;
    const key = typeof data !== 'object' ? data : getNodeKey(this.key, data);
    return this.nodesMap[key] || null;
  }

  // 更新数据
  setData(newVal) {
    const instanceChanged = newVal !== this.root.data;
    if (instanceChanged) {
      this.root.setData(newVal);
    }
  }

  // 追加节点
  append(data, parentData) {
    const parentNode = parentData ? this.getNode(parentData) : this.root;

    if (parentNode) {
      parentNode.insertChild({ data });
    }
  }

  // 在指定节点之前插入
  insertBefore(data, refData) {
    const refNode = this.getNode(refData);
    refNode.parent.insertBefore({ data }, refNode);
  }

  // 在指定节点之后插入
  insertAfter(data, refData) {
    const refNode = this.getNode(refData);
    refNode.parent.insertAfter({ data }, refNode);
  }

  // 删除节点
  remove(data) {
    const node = this.getNode(data);

    if (node && node.parent) {
      if (node === this.currentNode) {
        this.currentNode = null;
      }
      node.parent.removeChild(node);
    }
  }

  // 设置当前节点
  setCurrentNode(currentNode) {
    const prevCurrentNode = this.currentNode;
    if (prevCurrentNode) {
      prevCurrentNode.isCurrent = false;
    }
    this.currentNode = currentNode;
    this.currentNode.isCurrent = true;
  }

  // 获取当前节点
  getCurrentNode() {
    return this.currentNode;
  }

  // 通过 key 设置当前节点
  setCurrentNodeKey(key) {
    if (key === null || key === undefined) {
      this.currentNode && (this.currentNode.isCurrent = false);
      this.currentNode = null;
      return;
    }
    const node = this.getNode(key);
    if (node) {
      this.setCurrentNode(node);
    }
  }
}

