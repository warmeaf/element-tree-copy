<template>
  <div>
    <h1>tree 组件示例</h1>
    
    <h2>基础用法（点击展开/收起）</h2>
    <el-tree 
      :data="treeData" 
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      @node-click="handleNodeClick"
    />
    
    <h2>默认展开所有节点</h2>
    <el-tree :data="treeData" default-expand-all />
    
    <h2>禁用点击节点展开</h2>
    <el-tree :data="treeData" :expand-on-click-node="false" />
    
    <h2>空数据</h2>
    <el-tree :data="[]" />
    
    <h2>自定义字段名</h2>
    <el-tree 
      :data="customTreeData" 
      :props="customProps"
      default-expand-all
    />
    
    <h2>节点选中高亮（highlightCurrent）</h2>
    <el-tree 
      ref="highlightTree"
      :data="treeDataWithId" 
      node-key="id"
      highlight-current
      default-expand-all
      @current-change="handleCurrentChange"
    />
    <div style="margin-top: 10px;">
      <button @click="getCurrentInfo">
        获取当前节点
      </button>
      <button @click="setCurrentByKey">
        设置当前节点为 id=3
      </button>
      <button @click="setCurrentByData">
        通过数据设置当前节点
      </button>
      <button @click="clearCurrent">
        清除当前节点
      </button>
      <div style="margin-top: 5px; color: #409EFF;">
        当前选中节点：{{ currentNodeInfo }}
      </div>
    </div>
    
    <h2>默认选中节点（currentNodeKey）</h2>
    <el-tree 
      :data="treeDataWithId" 
      node-key="id"
      highlight-current
      :current-node-key="5"
      default-expand-all
    />
    
    <h2>自定义缩进和图标</h2>
    <el-tree 
      :data="treeData" 
      :indent="32"
      icon-class="el-icon-arrow-right"
      default-expand-all
    />
    
    <h2>复选框 - 基础用法（父子级联选择）</h2>
    <el-tree 
      :data="checkboxTreeData" 
      node-key="id"
      show-checkbox
      default-expand-all
    />
    <div style="margin-top: 5px; color: #67C23A; font-size: 12px;">
      提示：勾选父节点会自动勾选所有子节点；勾选所有子节点会自动勾选父节点；部分子节点勾选时，父节点显示半选状态
    </div>
    
    <h2>复选框 - 默认选中节点（defaultCheckedKeys）</h2>
    <el-tree 
      :data="checkboxTreeData" 
      node-key="id"
      show-checkbox
      :default-checked-keys="defaultCheckedKeys"
      default-expand-all
    />
    <div style="margin-top: 5px; color: #67C23A; font-size: 12px;">
      提示：默认选中了 id 为 3 和 6 的节点
    </div>
    
    <h2>复选框 - 禁用节点逻辑</h2>
    <el-tree 
      :data="checkboxTreeDataWithDisabled" 
      node-key="id"
      show-checkbox
      default-expand-all
    />
    <div style="margin-top: 5px; color: #67C23A; font-size: 12px;">
      提示：禁用的节点不会因为父节点选中而改变状态；父节点状态计算时会考虑禁用子节点
    </div>
    
    <h2>复选框 - checkStrictly 模式（父子不关联）</h2>
    <el-tree 
      :data="checkboxTreeData" 
      node-key="id"
      show-checkbox
      check-strictly
      default-expand-all
    />
    <div style="margin-top: 5px; color: #67C23A; font-size: 12px;">
      提示：父子节点选中状态互不影响
    </div>
    
    <h2>复选框 - checkOnClickNode（点击节点切换复选框）</h2>
    <el-tree 
      :data="checkboxTreeData" 
      node-key="id"
      show-checkbox
      check-on-click-node
      default-expand-all
    />
    <div style="margin-top: 5px; color: #67C23A; font-size: 12px;">
      提示：点击节点标签即可切换复选框状态
    </div>
    
    <h2>复选框 - API 演示</h2>
    <el-tree 
      ref="checkboxApiTree"
      :data="checkboxTreeData" 
      node-key="id"
      show-checkbox
      default-expand-all
    />
    <div style="margin-top: 10px;">
      <button @click="getCheckedInfo">
        获取选中节点
      </button>
      <button @click="getCheckedLeafInfo">
        获取选中的叶子节点
      </button>
      <button @click="setCheckedByKeys">
        设置选中节点（通过keys: [2,6,9]）
      </button>
      <button @click="setCheckedByNodes">
        设置选中节点（通过nodes）
      </button>
      <button @click="setNodeChecked">
        设置单个节点选中（二级1-2）
      </button>
      <button @click="clearChecked">
        清空选中
      </button>
      <div v-if="checkedInfo" style="margin-top: 10px; background: #f5f5f5; padding: 10px; white-space: pre-wrap; font-size: 12px;">
        {{ checkedInfo }}
      </div>
    </div>
    
    <h2>复选框 - 事件演示</h2>
    <el-tree 
      :data="checkboxTreeData" 
      node-key="id"
      show-checkbox
      default-expand-all
      @check="handleCheck"
      @check-change="handleCheckChange"
    />
    <div v-if="checkEventLog" style="margin-top: 10px; background: #E6F7FF; padding: 10px; white-space: pre-wrap; font-size: 12px; color: #0050B3;">
      {{ checkEventLog }}
    </div>
    <div style="margin-top: 5px; color: #67C23A; font-size: 12px;">
      提示：check 事件在节点选中状态变化时触发；check-change 事件也会触发，包含半选状态信息。查看"事件日志"了解详情
    </div>
    
    <h2>事件日志</h2>
    <div style="background: #f5f5f5; padding: 10px; max-height: 200px; overflow-y: auto;">
      <div v-for="(log, index) in logs" :key="index" style="font-size: 12px; padding: 2px 0;">
        {{ log }}
      </div>
    </div>
    
    <h2>CRUD 操作演示（节点增删改）</h2>
    <el-tree 
      ref="crudTree"
      :data="crudTreeData" 
      node-key="id"
      default-expand-all
    />
    <div style="margin-top: 10px;">
      <button @click="appendNode">
        添加子节点（在"一级 1" id=1 下添加）
      </button>
      <button @click="insertBeforeNode">
        在"二级 1-1" id=2 前插入节点
      </button>
      <button @click="insertAfterNode">
        在"二级 1-1" id=2 后插入节点
      </button>
      <button @click="removeNode">
        删除"二级 1-1" id=2 节点
      </button>
      <button @click="updateChildren">
        更新"一级 1" id=1 的子节点列表
      </button>
      <button @click="resetCrudData">
        重置数据
      </button>
    </div>
    <div style="margin-top: 5px; color: #E6A23C; font-size: 12px;">
      提示：CRUD 操作通过节点 ID 查找目标节点，会同时更新树结构和原始数据。如果目标节点不存在（已被删除），操作会被忽略并在控制台输出提示
    </div>
  </div>
</template>

<script>
import ElTree from '../tree/index.js'

export default {
  name: 'ExampleIndex',
  components: {
    ElTree,
  },
  data() {
    return {
      logs: [],
      currentNodeInfo: '未选中',
      treeData: [
        {
          label: '一级 1',
          children: [
            {
              label: '二级 1-1',
              children: [
                {
                  label: '三级 1-1-1',
                },
              ],
            },
          ],
        },
        {
          label: '一级 2',
          children: [
            {
              label: '二级 2-1',
              children: [
                {
                  label: '三级 2-1-1',
                },
              ],
            },
            {
              label: '二级 2-2',
              children: [
                {
                  label: '三级 2-2-1',
                },
              ],
            },
          ],
        },
        {
          label: '一级 3',
          children: [
            {
              label: '二级 3-1',
              children: [
                {
                  label: '三级 3-1-1',
                },
              ],
            },
            {
              label: '二级 3-2',
              children: [
                {
                  label: '三级 3-2-1',
                },
              ],
            },
          ],
        },
      ],
      customTreeData: [
        {
          name: '自定义节点 1',
          items: [
            {
              name: '自定义子节点 1-1',
              items: [
                {
                  name: '自定义孙节点 1-1-1',
                },
              ],
            },
          ],
        },
        {
          name: '自定义节点 2',
          items: [
            {
              name: '自定义子节点 2-1',
            },
          ],
        },
      ],
      customProps: {
        children: 'items',
        label: 'name',
      },
      treeDataWithId: [
        {
          id: 1,
          label: '一级 1',
          children: [
            {
              id: 2,
              label: '二级 1-1',
              children: [
                {
                  id: 3,
                  label: '三级 1-1-1',
                },
              ],
            },
          ],
        },
        {
          id: 4,
          label: '一级 2',
          children: [
            {
              id: 5,
              label: '二级 2-1',
              children: [
                {
                  id: 6,
                  label: '三级 2-1-1',
                },
              ],
            },
            {
              id: 7,
              label: '二级 2-2',
              children: [
                {
                  id: 8,
                  label: '三级 2-2-1',
                },
              ],
            },
          ],
        },
      ],
      // 复选框示例数据
      checkboxTreeData: [
        {
          id: 1,
          label: '一级 1',
          children: [
            {
              id: 2,
              label: '二级 1-1',
              children: [
                {
                  id: 3,
                  label: '三级 1-1-1',
                },
                {
                  id: 4,
                  label: '三级 1-1-2',
                },
              ],
            },
            {
              id: 5,
              label: '二级 1-2',
              children: [
                {
                  id: 6,
                  label: '三级 1-2-1',
                },
              ],
            },
          ],
        },
        {
          id: 7,
          label: '一级 2',
          children: [
            {
              id: 8,
              label: '二级 2-1',
              children: [
                {
                  id: 9,
                  label: '三级 2-1-1',
                },
              ],
            },
          ],
        },
      ],
      checkboxTreeDataWithDisabled: [
        {
          id: 1,
          label: '一级 1',
          children: [
            {
              id: 2,
              label: '二级 1-1（禁用）',
              disabled: true,
              children: [
                {
                  id: 3,
                  label: '三级 1-1-1',
                },
              ],
            },
            {
              id: 4,
              label: '二级 1-2',
              children: [
                {
                  id: 5,
                  label: '三级 1-2-1（禁用）',
                  disabled: true,
                },
                {
                  id: 6,
                  label: '三级 1-2-2',
                },
              ],
            },
          ],
        },
      ],
      defaultCheckedKeys: [3, 6],
      checkedInfo: '',
      checkEventLog: '',
      crudTreeData: [
        {
          id: 1,
          label: '一级 1',
          children: [
            {
              id: 2,
              label: '二级 1-1',
              children: [
                {
                  id: 3,
                  label: '三级 1-1-1',
                },
              ],
            },
            {
              id: 4,
              label: '二级 1-2',
            },
          ],
        },
        {
          id: 5,
          label: '一级 2',
          children: [
            {
              id: 6,
              label: '二级 2-1',
            },
          ],
        },
      ],
      nodeIdCounter: 10, // 用于生成新节点的id
    }
  },
  methods: {
    handleNodeExpand(data, node) {
      const log = `[展开] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    handleNodeCollapse(data, node) {
      const log = `[收起] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    handleNodeClick(data, node) {
      const log = `[点击] ${data.label || data.name}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    handleCurrentChange(data, node) {
      const log = `[当前节点变化] ${data ? data.label : '无'}`
      // eslint-disable-next-line no-console
      console.log(log, node)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    getCurrentInfo() {
      const tree = this.$refs.highlightTree
      const currentNode = tree.getCurrentNode()
      const currentKey = tree.getCurrentKey()
      this.currentNodeInfo = currentNode
        ? `label: ${currentNode.label}, id: ${currentKey}`
        : '未选中'
      // eslint-disable-next-line no-console
      console.log('当前节点：', currentNode, '当前key：', currentKey)
    },
    setCurrentByKey() {
      const tree = this.$refs.highlightTree
      tree.setCurrentKey(3)
      this.getCurrentInfo()
    },
    setCurrentByData() {
      const tree = this.$refs.highlightTree
      const nodeData = this.treeDataWithId[1].children[0] // 二级 2-1
      tree.setCurrentNode(nodeData)
      this.getCurrentInfo()
    },
    clearCurrent() {
      const tree = this.$refs.highlightTree
      tree.setCurrentKey(null)
      this.currentNodeInfo = '未选中'
    },
    // 复选框相关方法
    getCheckedInfo() {
      const tree = this.$refs.checkboxApiTree
      const checkedNodes = tree.getCheckedNodes()
      const checkedKeys = tree.getCheckedKeys()
      const halfCheckedNodes = tree.getHalfCheckedNodes()
      const halfCheckedKeys = tree.getHalfCheckedKeys()
      
      this.checkedInfo = JSON.stringify({
        checkedNodes: checkedNodes.map(n => n.label),
        checkedKeys,
        halfCheckedNodes: halfCheckedNodes.map(n => n.label),
        halfCheckedKeys,
      }, null, 2)
      
      // eslint-disable-next-line no-console
      console.log('选中信息：', { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys })
    },
    getCheckedLeafInfo() {
      const tree = this.$refs.checkboxApiTree
      const leafNodes = tree.getCheckedNodes(true)
      const leafKeys = tree.getCheckedKeys(true)
      
      this.checkedInfo = JSON.stringify({
        leafNodes: leafNodes.map(n => n.label),
        leafKeys,
      }, null, 2)
      
      // eslint-disable-next-line no-console
      console.log('选中的叶子节点：', { leafNodes, leafKeys })
    },
    setCheckedByKeys() {
      const tree = this.$refs.checkboxApiTree
      tree.setCheckedKeys([2, 6, 9])
      this.getCheckedInfo()
    },
    setCheckedByNodes() {
      const tree = this.$refs.checkboxApiTree
      const nodes = [
        this.checkboxTreeData[0].children[0], // 二级 1-1
        this.checkboxTreeData[1], // 一级 2
      ]
      tree.setCheckedNodes(nodes)
      this.getCheckedInfo()
    },
    setNodeChecked() {
      const tree = this.$refs.checkboxApiTree
      const nodeData = this.checkboxTreeData[0].children[1] // 二级 1-2
      tree.setChecked(nodeData, true, true)
      this.getCheckedInfo()
    },
    clearChecked() {
      const tree = this.$refs.checkboxApiTree
      tree.setCheckedKeys([])
      this.checkedInfo = ''
    },
    handleCheck(data, checkedInfo) {
      const log = `[check事件] ${data.label} | 选中: ${checkedInfo.checkedKeys.length}个, 半选: ${checkedInfo.halfCheckedKeys.length}个`
      // eslint-disable-next-line no-console
      console.log(log, checkedInfo)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
      
      this.checkEventLog = `最后操作: ${data.label}\n选中节点: ${checkedInfo.checkedNodes.map(n => n.label).join(', ')}`
    },
    handleCheckChange(data, checked, indeterminate) {
      const status = indeterminate ? '半选' : (checked ? '选中' : '未选中')
      const log = `[check-change事件] ${data.label} → ${status}`
      // eslint-disable-next-line no-console
      console.log(log, { checked, indeterminate })
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    // 辅助方法：根据 ID 查找节点
    findNodeById(nodes, id) {
      for (const node of nodes) {
        if (node.id === id) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = this.findNodeById(node.children, id)
          if (found) return found
        }
      }
      return null
    },
    
    // CRUD 操作方法
    appendNode() {
      const tree = this.$refs.crudTree
      const newId = ++this.nodeIdCounter
      const newNode = {
        id: newId,
        label: `新增节点 ${newId}`,
      }
      // 在"一级 1"（id=1）下添加子节点
      const parentData = this.findNodeById(this.crudTreeData, 1)
      if (parentData) {
        tree.append(newNode, parentData)
        
        const log = `[添加节点] 在"${parentData.label}"下添加了"${newNode.label}"`
        // eslint-disable-next-line no-console
        console.log(log, this.crudTreeData)
        this.logs.unshift(log)
        if (this.logs.length > 20) this.logs.pop()
      } else {
        // eslint-disable-next-line no-console
        console.log('未找到父节点（一级 1）')
      }
    },
    insertBeforeNode() {
      const tree = this.$refs.crudTree
      const newId = ++this.nodeIdCounter
      const newNode = {
        id: newId,
        label: `插入节点 ${newId}`,
      }
      // 在"二级 1-1"（id=2）前插入
      const refData = this.findNodeById(this.crudTreeData, 2)
      if (refData) {
        tree.insertBefore(newNode, refData)
        
        const log = `[插入节点] 在"${refData.label}"前插入了"${newNode.label}"`
        // eslint-disable-next-line no-console
        console.log(log, this.crudTreeData)
        this.logs.unshift(log)
        if (this.logs.length > 20) this.logs.pop()
      } else {
        // eslint-disable-next-line no-console
        console.log('未找到参考节点（二级 1-1）')
      }
    },
    insertAfterNode() {
      const tree = this.$refs.crudTree
      const newId = ++this.nodeIdCounter
      const newNode = {
        id: newId,
        label: `插入节点 ${newId}`,
      }
      // 在"二级 1-1"（id=2）后插入
      const refData = this.findNodeById(this.crudTreeData, 2)
      if (refData) {
        tree.insertAfter(newNode, refData)
        
        const log = `[插入节点] 在"${refData.label}"后插入了"${newNode.label}"`
        // eslint-disable-next-line no-console
        console.log(log, this.crudTreeData)
        this.logs.unshift(log)
        if (this.logs.length > 20) this.logs.pop()
      } else {
        // eslint-disable-next-line no-console
        console.log('未找到参考节点（二级 1-1）')
      }
    },
    removeNode() {
      const tree = this.$refs.crudTree
      // 删除"二级 1-1"（id=2）
      const nodeData = this.findNodeById(this.crudTreeData, 2)
      if (nodeData) {
        tree.remove(nodeData)
        
        const log = `[删除节点] 删除了"${nodeData.label}"`
        // eslint-disable-next-line no-console
        console.log(log, this.crudTreeData)
        this.logs.unshift(log)
        if (this.logs.length > 20) this.logs.pop()
      } else {
        // eslint-disable-next-line no-console
        console.log('未找到要删除的节点（二级 1-1）')
      }
    },
    updateChildren() {
      const tree = this.$refs.crudTree
      // 更新"一级 1"（id=1）的子节点列表
      const newChildren = [
        {
          id: ++this.nodeIdCounter,
          label: `更新后的节点 ${this.nodeIdCounter}`,
        },
        {
          id: ++this.nodeIdCounter,
          label: `更新后的节点 ${this.nodeIdCounter}`,
        },
      ]
      tree.updateKeyChildren(1, newChildren)
      
      const log = '[更新子节点] 更新了"一级 1"的所有子节点'
      // eslint-disable-next-line no-console
      console.log(log, this.crudTreeData)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
    resetCrudData() {
      // 重置 nodeIdCounter
      this.nodeIdCounter = 10
      
      // 重置数据
      this.crudTreeData = [
        {
          id: 1,
          label: '一级 1',
          children: [
            {
              id: 2,
              label: '二级 1-1',
              children: [
                {
                  id: 3,
                  label: '三级 1-1-1',
                },
              ],
            },
            {
              id: 4,
              label: '二级 1-2',
            },
          ],
        },
        {
          id: 5,
          label: '一级 2',
          children: [
            {
              id: 6,
              label: '二级 2-1',
            },
          ],
        },
      ]
      
      const log = '[重置] 重置了 CRUD 树的数据和计数器'
      // eslint-disable-next-line no-console
      console.log(log, this.crudTreeData)
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
  },
}
</script>
