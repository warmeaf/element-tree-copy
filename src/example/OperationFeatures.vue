<template>
  <div class="tab-panel">
    <h2>CRUD 操作演示（节点增删改）</h2>
    <el-tree
      ref="crudTree"
      :data="crudTreeData"
      node-key="id"
      default-expand-all
    />
    <div style="margin-top: 10px">
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
    <div style="margin-top: 5px; color: #e6a23c; font-size: 12px">
      提示：CRUD 操作通过节点 ID
      查找目标节点，会同时更新树结构和原始数据。如果目标节点不存在（已被删除），操作会被忽略并在控制台输出提示
    </div>

    <h2>步骤12：键盘导航功能</h2>
    <div class="keyboard-section">
      <el-tree
        ref="keyboardTree"
        :data="treeDataWithId"
        node-key="id"
        highlight-current
        default-expand-all
        show-checkbox
      />
      <div style="margin-top: 10px; font-size: 12px; color: #409eff">
        <strong>键盘导航说明：</strong><br>
        • ↑↓：在节点间上下移动焦点<br>
        • ←→：收起/展开节点<br>
        • Enter/Space：选中/勾选节点<br>
        • Tab：进入/离开树组件
      </div>
    </div>

    <h2>步骤12：获取节点路径功能</h2>
    <div class="path-section">
      <div style="margin-bottom: 10px">
        <button @click="showNodePath">
          显示选中节点路径
        </button>
        <button @click="clearPath">
          清除路径
        </button>
      </div>
      <el-tree
        ref="pathTree"
        :data="treeDataWithId"
        node-key="id"
        highlight-current
        default-expand-all
        @node-click="handlePathNodeClick"
      />
      <div
        v-if="currentNodePath.length > 0"
        style="
          margin-top: 10px;
          padding: 10px;
          background: #f5f5f5;
          font-size: 12px;
        "
      >
        <strong>节点路径：</strong>
        {{ currentNodePath.map((node) => node.label).join(" → ") }}
      </div>
    </div>

    <h2>步骤12：键盘导航焦点样式控制</h2>
    <div class="keyboard-focus-section">
      <div style="margin-bottom: 10px">
        <label>
          <input v-model="keyboardFocusEnabled" type="checkbox">
          启用键盘导航焦点样式（keyboardFocus）
        </label>
      </div>
      <el-tree
        :data="treeDataWithId"
        node-key="id"
        highlight-current
        :keyboard-focus="keyboardFocusEnabled"
        default-expand-all
        show-checkbox
      />
      <div style="margin-top: 10px; font-size: 12px; color: #409eff">
        <strong>测试说明：</strong><br>
        • 使用 Tab 键聚焦到树组件<br>
        • 使用 ↑↓ 键在节点间导航<br>
        • 开启焦点样式时会显示蓝色轮廓<br>
        • 关闭焦点样式时不显示轮廓效果
      </div>
    </div>

    <h2>事件日志</h2>
    <div
      style="
        background: #f5f5f5;
        padding: 10px;
        max-height: 200px;
        overflow-y: auto;
      "
    >
      <div
        v-for="(log, index) in logs"
        :key="index"
        style="font-size: 12px; padding: 2px 0"
      >
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script>
import ElTree from '../tree/index'

export default {
  name: 'OperationFeatures',
  components: {
    ElTree
  },
  props: {
    logs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
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

      // 节点路径相关
      currentNodePath: [],

      // 键盘焦点样式控制
      keyboardFocusEnabled: false,

      // 树数据
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
        },
      ],
    }
  },
  methods: {
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
        this.$emit('add-log', log)
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
        this.$emit('add-log', log)
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
        this.$emit('add-log', log)
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
        this.$emit('add-log', log)
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
      this.$emit('add-log', log)
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
      this.$emit('add-log', log)
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

    // 路径功能
    showNodePath() {
      const tree = this.$refs.pathTree
      const currentNode = tree.getCurrentNode()
      if (currentNode) {
        this.currentNodePath = tree.getNodePath(currentNode)
      } else {
        this.currentNodePath = []
      }
    },

    clearPath() {
      this.currentNodePath = []
    },

    handlePathNodeClick(data, node) {
      this.showNodePath()
    },
  },
}
</script>

<style scoped>
.keyboard-section,
.path-section,
.keyboard-focus-section {
  margin-bottom: 20px;
}
</style>