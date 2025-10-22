<template>
  <div class="tab-panel">
    <h2>懒加载演示（异步加载数据）</h2>
    <div class="example-section">
      <div class="controls">
        <button @click="resetLazyData">
          重置懒加载数据
        </button>
      </div>

      <div class="tree-container">
        <el-tree
          ref="lazyTree"
          :data="lazyTreeData"
          :props="lazyTreeProps"
          node-key="id"
          lazy
          :load="loadNode"
          :default-expanded-keys="[1]"
          :default-checked-keys="[11, 22]"
          show-checkbox
          highlight-current
          @node-expand="handleLazyNodeExpand"
        />
      </div>
    </div>

    <h2>拖拽功能演示</h2>
    <el-tree
      :data="dragTreeData"
      node-key="id"
      draggable
      :allow-drag="allowDrag"
      :allow-drop="allowDrop"
      default-expand-all
      @node-drag-start="handleDragStart"
      @node-drag-enter="handleDragEnter"
      @node-drag-leave="handleDragLeave"
      @node-drag-over="handleDragOver"
      @node-drag-end="handleDragEnd"
      @node-drop="handleDrop"
    />
    <div style="margin-top: 6px; font-size: 12px; color: #409eff">
      拖拽日志：{{ dragLog }}
    </div>

    <h2>步骤12：节点过滤功能</h2>
    <div class="filter-section">
      <div style="margin-bottom: 10px">
        <input
          v-model="filterText"
          placeholder="输入关键字过滤节点"
          style="padding: 5px; border: 1px solid #ddd; border-radius: 4px"
          @input="handleFilter"
        >
        <button style="margin-left: 10px" @click="clearFilter">
          清除过滤
        </button>
      </div>
      <el-tree
        ref="filterTree"
        :data="treeData"
        :filter-node-method="filterNodeMethod"
        default-expand-all
      />
    </div>

    <h2>步骤12：手风琴模式（Accordion）</h2>
    <div class="accordion-section">
      <el-tree
        :data="treeData"
        accordion
        node-key="id"
        :props="{ children: 'children', label: 'label' }"
      />
      <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
        提示：展开一个节点时，其他同级节点会自动收起
      </div>
    </div>

    <h2>步骤12：自定义节点内容渲染</h2>
    <div class="custom-render-section">
      <el-tree
        :data="customRenderTreeData"
        node-key="id"
        default-expand-all
        :render-content="renderContent"
      />
      <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
        提示：使用 render-content 自定义节点内容，包含图标、标签和描述
      </div>
    </div>

    <h2>步骤12：默认插槽渲染示例</h2>
    <div class="slot-render-section">
      <el-tree :data="slotRenderTreeData" node-key="id" default-expand-all>
        <template #default="{ node, data }">
          <div class="slot-content">
            <!-- 图标根据类型显示 -->
            <span
              :class="[
                'slot-icon',
                data.type === 'folder' ? 'el-icon-folder' : 'el-icon-document',
              ]"
              :style="{
                color: data.type === 'folder' ? '#e6a23c' : '#409eff',
                marginRight: '8px',
              }"
            />

            <!-- 节点标签 -->
            <span class="slot-label">{{ node.label }}</span>

            <!-- 状态标签 -->
            <span
              v-if="data.status"
              :class="['slot-status', `slot-status--${data.status}`]"
            >
              {{ getStatusText(data.status) }}
            </span>

            <!-- 操作按钮 -->
            <div class="slot-actions">
              <button
                v-if="data.type === 'folder'"
                class="slot-btn"
                title="添加文件"
                @click.stop="handleAddFile(data)"
              >
                <i class="el-icon-plus" />
              </button>
              <button
                class="slot-btn"
                title="编辑"
                @click.stop="handleEditNode(data)"
              >
                <i class="el-icon-edit" />
              </button>
              <button
                class="slot-btn slot-btn--danger"
                title="删除"
                @click.stop="handleDeleteNode(data)"
              >
                <i class="el-icon-delete" />
              </button>
            </div>
          </div>
        </template>
      </el-tree>
      <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
        提示：使用默认插槽自定义节点内容，支持图标、状态标签和操作按钮
      </div>
      <div
        style="
          margin-top: 10px;
          padding: 10px;
          background: #f5f7fa;
          border-radius: 4px;
          font-size: 12px;
        "
      >
        <strong>操作日志：</strong>{{ slotOperationLog }}
      </div>
    </div>
  </div>
</template>

<script>
import ElTree from '../tree/index'

export default {
  name: 'AdvancedFeatures',
  components: {
    ElTree,
  },
  data() {
    return {
      // 拖拽功能演示数据
      dragTreeData: [
        {
          id: 1,
          label: '一级节点 1',
          children: [
            {
              id: 2,
              label: '二级节点 1-1',
              children: [
                {
                  id: 3,
                  label: '三级节点 1-1-1',
                },
                {
                  id: 4,
                  label: '三级节点 1-1-2',
                },
              ],
            },
            {
              id: 5,
              label: '二级节点 1-2',
            },
          ],
        },
        {
          id: 6,
          label: '一级节点 2',
          children: [
            {
              id: 7,
              label: '二级节点 2-1',
            },
            {
              id: 8,
              label: '二级节点 2-2',
              children: [
                {
                  id: 9,
                  label: '三级节点 2-2-1',
                },
              ],
            },
          ],
        },
        {
          id: 10,
          label: '一级节点 3（叶子节点）',
        },
      ],

      // 拖拽事件日志
      dragLog: '暂无拖拽操作',

      // 懒加载相关数据
      lazyTreeData: [
        { id: 1, label: '根节点 1' },
        { id: 2, label: '根节点 2' },
        { id: 3, label: '叶子根节点', isLeaf: true },
      ],
      lazyTreeProps: {
        children: 'children',
        label: 'label',
        isLeaf: 'isLeaf',
      },
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

      // 过滤功能数据
      filterText: '',

      // 自定义渲染数据
      customRenderTreeData: [
        {
          id: 1,
          label: '项目文档',
          type: 'folder',
          description: '包含所有项目相关文档',
          children: [
            {
              id: 2,
              label: 'README.md',
              type: 'file',
              description: '项目说明文档',
            },
            {
              id: 3,
              label: '开发文档',
              type: 'folder',
              description: '开发相关文档',
              children: [
                {
                  id: 4,
                  label: 'API文档',
                  type: 'file',
                  description: '接口说明文档',
                },
                {
                  id: 5,
                  label: '组件文档',
                  type: 'file',
                  description: '组件使用说明',
                },
              ],
            },
          ],
        },
        {
          id: 6,
          label: '源代码',
          type: 'folder',
          description: '项目源代码目录',
          children: [
            {
              id: 7,
              label: 'src',
              type: 'folder',
              description: '主要源代码目录',
            },
            {
              id: 8,
              label: 'tests',
              type: 'folder',
              description: '测试代码目录',
            },
          ],
        },
      ],

      // 插槽渲染数据
      slotRenderTreeData: [
        {
          id: 1,
          label: '前端项目',
          type: 'folder',
          status: 'active',
          children: [
            {
              id: 2,
              label: 'src/components',
              type: 'folder',
              status: 'active',
              children: [
                {
                  id: 3,
                  label: 'Button.vue',
                  type: 'file',
                  status: 'completed',
                },
                {
                  id: 4,
                  label: 'Table.vue',
                  type: 'file',
                  status: 'in-progress',
                },
                {
                  id: 5,
                  label: 'Form.vue',
                  type: 'file',
                  status: 'pending',
                },
              ],
            },
            {
              id: 6,
              label: 'src/utils',
              type: 'folder',
              status: 'active',
              children: [
                {
                  id: 7,
                  label: 'helpers.js',
                  type: 'file',
                  status: 'completed',
                },
                {
                  id: 8,
                  label: 'validators.js',
                  type: 'file',
                  status: 'in-progress',
                },
              ],
            },
            {
              id: 9,
              label: 'package.json',
              type: 'file',
              status: 'completed',
            },
          ],
        },
        {
          id: 10,
          label: '后端项目',
          type: 'folder',
          status: 'inactive',
          children: [
            {
              id: 11,
              label: 'controllers',
              type: 'folder',
              status: 'pending',
              children: [
                {
                  id: 12,
                  label: 'userController.js',
                  type: 'file',
                  status: 'in-progress',
                },
                {
                  id: 13,
                  label: 'authController.js',
                  type: 'file',
                  status: 'pending',
                },
              ],
            },
            {
              id: 14,
              label: 'models',
              type: 'folder',
              status: 'pending',
            },
          ],
        },
      ],

      // 插槽操作日志
      slotOperationLog: '暂无操作',
    }
  },
  methods: {
    // 懒加载节点数据的方法
    loadNode(node, resolve) {
      const log = `[懒加载] 开始加载节点 "${node.data.label}" (id: ${node.data.id}) 的子数据...`
      // eslint-disable-next-line no-console
      console.log(log)
      this.$emit('add-log', log)

      // 模拟异步请求延迟
      setTimeout(() => {
        let children = []

        // 根据节点ID生成不同的子数据
        if (node.data.id === 1) {
          children = [
            { id: 11, label: '异步加载的节点 1-1', isLeaf: false },
            { id: 12, label: '异步加载的节点 1-2' },
            { id: 13, label: '叶子节点 1-3', isLeaf: true },
          ]
        } else if (node.data.id === 2) {
          children = [
            { id: 21, label: '异步加载的节点 2-1', isLeaf: false },
            { id: 22, label: '叶子节点 2-2', isLeaf: true },
          ]
        } else if (node.data.id === 11) {
          children = [
            { id: 111, label: '三级节点 1-1-1', isLeaf: true },
            { id: 112, label: '三级节点 1-1-2', isLeaf: true },
          ]
        } else if (node.data.id === 21) {
          children = [
            { id: 211, label: '三级节点 2-1-1', isLeaf: true },
            { id: 212, label: '三级节点 2-1-2', isLeaf: true },
            { id: 213, label: '三级节点 2-1-3', isLeaf: true },
          ]
        }

        const loadedLog = `[懒加载] 节点 "${node.data.label}" 加载完成，子节点数量: ${children.length}`
        // eslint-disable-next-line no-console
        console.log(loadedLog, children)
        this.$emit('add-log', loadedLog)

        resolve(children)
      }, 1000) // 模拟1秒的网络延迟
    },

    // 懒加载节点展开事件
    handleLazyNodeExpand(nodeData, node, instance) {
      const log = `[事件] 懒加载节点展开: "${nodeData.label}" (id: ${nodeData.id})`
      // eslint-disable-next-line no-console
      console.log(log, { nodeData, node, instance })
      this.$emit('add-log', log)
    },

    // 重置懒加载数据
    resetLazyData() {
      this.lazyTreeData = [
        { id: 1, label: '根节点 1' },
        { id: 2, label: '根节点 2' },
        { id: 3, label: '叶子根节点', isLeaf: true },
      ]

      const log = '[重置] 重置了懒加载树的数据'
      // eslint-disable-next-line no-console
      console.log(log, this.lazyTreeData)
      this.$emit('add-log', log)
    },

    // 拖拽相关方法
    allowDrag(node) {
      return node && !node.disabled
    },
    allowDrop(draggingNode, dropNode, type) {
      if (!draggingNode || !dropNode) return false
      if (type === 'inner') {
        return !dropNode.isLeaf
      }
      return true
    },
    handleDragStart(node) {
      this.dragLog = `开始拖拽：${node.data?.label || ''}`
    },
    handleDragEnter(draggingNode, dropNode) {
      this.dragLog = `进入节点：${draggingNode.data?.label || ''} → ${
        dropNode.data?.label || ''
      }`
    },
    handleDragLeave(draggingNode, dropNode) {
      this.dragLog = `离开节点：${draggingNode.data?.label || ''} → ${
        dropNode.data?.label || ''
      }`
    },
    handleDragOver(draggingNode, dropNode) {
      this.dragLog = `经过节点：${draggingNode.data?.label || ''} → ${
        dropNode.data?.label || ''
      }`
    },
    handleDragEnd(draggingNode, dropNode, dropType) {
      const d = draggingNode?.data?.label
      const p = dropNode?.data?.label
      const t = dropType || 'none'
      this.dragLog = `结束拖拽：${d}${p ? ' → ' + p : ''}（${t}）`
    },
    handleDrop(draggingNode, dropNode, dropType) {
      this.dragLog = `放置成功：${draggingNode.data?.label || ''} → ${
        dropNode.data?.label || ''
      }（${dropType}）`
    },

    // 过滤功能
    handleFilter() {
      this.$refs.filterTree?.filter(this.filterText)
    },

    clearFilter() {
      this.filterText = ''
      this.$refs.filterTree?.filter('')
    },

    filterNodeMethod(value, data, node) {
      if (!value) return true
      const label = node.label
      return label.toLowerCase().includes(value.toLowerCase())
    },

    // 自定义渲染函数
    renderContent(h, { node, data, store }) {
      const iconClass =
        data.type === 'folder' ? 'el-icon-folder' : 'el-icon-document'
      return h('div', { class: 'custom-content' }, [
        h('i', {
          class: iconClass,
          style: 'margin-right: 5px; color: #409eff;',
        }),
        h(
          'span',
          { class: 'custom-label', style: 'font-weight: bold;' },
          node.label
        ),
        h(
          'span',
          {
            class: 'custom-desc',
            style: 'margin-left: 8px; color: #999; font-size: 12px;',
          },
          data.description
        ),
      ])
    },

    // 插槽相关方法
    getStatusText(status) {
      const statusMap = {
        active: '进行中',
        completed: '已完成',
        'in-progress': '开发中',
        pending: '待开始',
        inactive: '未激活',
      }
      return statusMap[status] || status
    },

    handleAddFile(nodeData) {
      this.slotOperationLog = `[添加文件] 在 "${nodeData.label}" 下添加新文件`
      // 这里可以添加实际的添加文件逻辑
    },

    handleEditNode(nodeData) {
      this.slotOperationLog = `[编辑] 编辑节点 "${nodeData.label}"`
      // 这里可以添加实际的编辑逻辑
    },

    handleDeleteNode(nodeData) {
      this.slotOperationLog = `[删除] 删除节点 "${nodeData.label}"`
      // 这里可以添加实际的删除逻辑
    },
  },
}
</script>

<style scoped>
.example-section {
  margin-bottom: 20px;
}

.controls {
  margin-bottom: 10px;
}

.tree-container {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
}

.filter-section,
.accordion-section,
.custom-render-section,
.slot-render-section {
  margin-bottom: 20px;
}

/* 插槽渲染样式 */
.slot-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.slot-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.slot-label {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slot-status {
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  margin-left: 8px;
  flex-shrink: 0;
  font-weight: 500;
}

.slot-status--active {
  background-color: #f0f9ff;
  color: #1890ff;
  border: 1px solid #b3d8ff;
}

.slot-status--completed {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.slot-status--in-progress {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.slot-status--pending {
  background-color: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

.slot-status--inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.slot-actions {
  display: flex;
  gap: 2px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.slot-content:hover .slot-actions {
  opacity: 1;
}

.slot-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #606266;
  transition: all 0.2s ease;
}

.slot-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.slot-btn--danger:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}
</style>
