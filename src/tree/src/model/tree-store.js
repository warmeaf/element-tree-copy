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

    // 处理懒加载模式的初始化
    if (this.lazy && this.load) {
      const loadFn = this.load;
      loadFn(this.root, (data) => {
        this.root.doCreateChildren(data);
        this._initDefaultCheckedNodes();
      });
    } else {
      // 初始化默认选中的节点
      this._initDefaultCheckedNodes();
    }
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

  // 更新指定节点的子节点列表
  updateChildren(key, data) {
    const node = this.nodesMap[key];
    if (!node) return;
    
    const childNodes = node.childNodes;
    const dataLength = data ? data.length : 0;
    
    // 先删除所有旧子节点（从后往前删除，避免索引问题）
    for (let i = childNodes.length - 1; i >= 0; i--) {
      this.remove(childNodes[i].data);
    }
    
    // 添加新子节点
    for (let i = 0; i < dataLength; i++) {
      this.append(data[i], node.data);
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

  // 通过用户数据对象设置当前节点
  setUserCurrentNode(node) {
    const key = node[this.key];
    const currNode = this.nodesMap[key];
    this.setCurrentNode(currNode);
  }

  // 初始化默认选中的节点
  _initDefaultCheckedNodes() {
    const defaultCheckedKeys = this.defaultCheckedKeys || [];
    const nodesMap = this.nodesMap;

    defaultCheckedKeys.forEach((checkedKey) => {
      const node = nodesMap[checkedKey];

      if (node) {
        node.setChecked(true, !this.checkStrictly);
      }
    });
  }

  // 初始化单个默认选中节点（用于懒加载场景）
  _initDefaultCheckedNode(node) {
    const defaultCheckedKeys = this.defaultCheckedKeys || [];

    if (defaultCheckedKeys.indexOf(node.key) !== -1) {
      node.setChecked(true, !this.checkStrictly);
    }
  }

  // 设置默认选中的 keys
  setDefaultCheckedKey(newVal) {
    if (newVal !== this.defaultCheckedKeys && Array.isArray(newVal)) {
      this.defaultCheckedKeys = newVal;
      // 清除所有旧的选中状态，然后设置新的选中状态
      const key = this.key;
      const checkedKeys = {};
      newVal.forEach((key) => {
        checkedKeys[key] = true;
      });
      this._setCheckedKeys(key, false, checkedKeys);
    }
  }

  // 获取所有选中的节点
  getCheckedNodes(leafOnly = false, includeHalfChecked = false) {
    const checkedNodes = [];
    
    /**
     * 递归遍历节点
     * @param {Node} node - 当前节点
     */
    const traverse = (node) => {
      const childNodes = node.root ? node.root.childNodes : node.childNodes;

      for (let i = 0, len = childNodes.length; i < len; i++) {
        const child = childNodes[i];
        
        // 检查是否应该包含此节点
        const shouldInclude =
          (child.checked || (includeHalfChecked && child.indeterminate)) &&
          (!leafOnly || (leafOnly && child.isLeaf));
        
        if (shouldInclude) {
          checkedNodes.push(child.data);
        }

        // 递归处理子节点
        traverse(child);
      }
    };

    traverse(this);

    return checkedNodes;
  }

  // 获取所有选中节点的 key
  getCheckedKeys(leafOnly = false) {
    return this.getCheckedNodes(leafOnly).map((data) => (data || {})[this.key]);
  }

  // 获取所有半选状态的节点
  getHalfCheckedNodes() {
    const nodes = [];
    
    /**
     * 递归遍历节点
     * @param {Node} node - 当前节点
     */
    const traverse = (node) => {
      const childNodes = node.root ? node.root.childNodes : node.childNodes;

      for (let i = 0, len = childNodes.length; i < len; i++) {
        const child = childNodes[i];
        
        if (child.indeterminate) {
          nodes.push(child.data);
        }

        traverse(child);
      }
    };

    traverse(this);

    return nodes;
  }

  // 获取所有半选状态节点的 key
  getHalfCheckedKeys() {
    return this.getHalfCheckedNodes().map((data) => (data || {})[this.key]);
  }

  // 获取所有节点（内部方法）
  _getAllNodes() {
    const allNodes = [];
    const nodesMap = this.nodesMap;
    
    // 使用 Object.values 或 for...in 遍历
    for (const nodeKey in nodesMap) {
      if (Object.prototype.hasOwnProperty.call(nodesMap, nodeKey)) {
        allNodes.push(nodesMap[nodeKey]);
      }
    }

    return allNodes;
  }

  // 设置选中的 keys（内部方法）
  _setCheckedKeys(key, leafOnly = false, checkedKeys) {
    const allNodes = this._getAllNodes().sort((a, b) => b.level - a.level);
    const cache = Object.create(null);
    const keys = Object.keys(checkedKeys);
    allNodes.forEach(node => node.setChecked(false, false));
    for (let i = 0, j = allNodes.length; i < j; i++) {
      const node = allNodes[i];
      const nodeKey = node.data[key].toString();
      let checked = keys.indexOf(nodeKey) > -1;
      if (!checked) {
        if (node.checked && !cache[nodeKey]) {
          node.setChecked(false, false);
        }
        continue;
      }

      let parent = node.parent;
      while (parent && parent.level > 0) {
        cache[parent.data[key]] = true;
        parent = parent.parent;
      }

      if (node.isLeaf || this.checkStrictly) {
        node.setChecked(true, false);
        continue;
      }
      node.setChecked(true, true);

      if (leafOnly) {
        node.setChecked(false, false);
        const traverse = function(node) {
          const childNodes = node.childNodes;
          childNodes.forEach((child) => {
            if (!child.isLeaf) {
              child.setChecked(false, false);
            }
            traverse(child);
          });
        };
        traverse(node);
      }
    }
  }

  // 设置选中的节点（通过节点数组）
  setCheckedNodes(array, leafOnly = false) {
    const key = this.key;
    const checkedKeys = {};
    array.forEach((item) => {
      checkedKeys[(item || {})[key]] = true;
    });

    this._setCheckedKeys(key, leafOnly, checkedKeys);
  }

  // 设置选中的节点（通过 key 数组）
  setCheckedKeys(keys, leafOnly = false) {
    this.defaultCheckedKeys = keys;
    const key = this.key;
    const checkedKeys = {};
    keys.forEach((key) => {
      checkedKeys[key] = true;
    });

    this._setCheckedKeys(key, leafOnly, checkedKeys);
  }

  // 设置单个节点的选中状态
  setChecked(data, checked, deep) {
    const node = this.getNode(data);

    if (node) {
      node.setChecked(!!checked, deep);
    }
  }

  // 设置默认展开的节点keys
  setDefaultExpandedKeys(keys) {
    keys = keys || [];
    this.defaultExpandedKeys = keys;

    keys.forEach((key) => {
      const node = this.getNode(key);
      if (node) {
        node.expand(null, this.autoExpandParent);
      }
    });
  }

  // 过滤节点
  filter(value) {
    const filterNodeMethod = this.filterNodeMethod;
    const lazy = this.lazy;
    
    if (!filterNodeMethod) {
      throw new Error('[Tree] filterNodeMethod is required when filter');
    }

    /**
     * 检查子节点是否有可见的
     * @param {Node} node - 节点
     * @returns {boolean} 是否有可见子节点
     */
    const hasVisibleChild = (node) => {
      const childNodes = node.root ? node.root.childNodes : node.childNodes;
      
      for (let i = 0, len = childNodes.length; i < len; i++) {
        const child = childNodes[i];
        if (child.visible || hasVisibleChild(child)) {
          return true;
        }
      }
      
      return false;
    };

    /**
     * 递归遍历节点进行过滤
     * @param {Node} node - 当前节点
     */
    const traverse = (node) => {
      const childNodes = node.root ? node.root.childNodes : node.childNodes;
      
      for (let i = 0, len = childNodes.length; i < len; i++) {
        const child = childNodes[i];
        
        // 应用过滤方法
        child.visible = filterNodeMethod.call(child, value, child.data, child);

        // 如果当前节点不可见，检查其子节点是否有可见的
        if (!child.visible && hasVisibleChild(child)) {
          child.visible = true;
        }

        // 递归处理子节点
        traverse(child);
      }
    };

    // 从根节点开始遍历
    traverse(this);

    // 如果是懒加载模式，需要处理未加载的节点
    if (lazy) {
      const allNodes = this._getAllNodes();
      
      for (let i = 0, len = allNodes.length; i < len; i++) {
        const node = allNodes[i];
        
        if (!node.visible && node.loaded && node.childNodes.length > 0) {
          if (hasVisibleChild(node)) {
            node.visible = true;
          }
        }
      }
    }
  }
}


