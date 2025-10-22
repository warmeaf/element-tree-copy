<template>
  <div class="tab-panel">
    <h2>复选框 - 基础用法（父子级联选择）</h2>
    <el-tree
      :data="checkboxTreeData"
      node-key="id"
      show-checkbox
      default-expand-all
    />
    <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
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
    <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
      提示：默认选中了 id 为 3 和 6 的节点
    </div>

    <h2>复选框 - 禁用节点逻辑</h2>
    <el-tree
      :data="checkboxTreeDataWithDisabled"
      node-key="id"
      show-checkbox
      default-expand-all
    />
    <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
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
    <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
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
    <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
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
    <div style="margin-top: 10px">
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
      <div
        v-if="checkedInfo"
        style="
          margin-top: 10px;
          background: #f5f5f5;
          padding: 10px;
          white-space: pre-wrap;
          font-size: 12px;
        "
      >
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
    <div
      v-if="checkEventLog"
      style="
        margin-top: 10px;
        background: #e6f7ff;
        padding: 10px;
        white-space: pre-wrap;
        font-size: 12px;
        color: #0050b3;
      "
    >
      {{ checkEventLog }}
    </div>
    <div style="margin-top: 5px; color: #67c23a; font-size: 12px">
      提示：check 事件在节点选中状态变化时触发；check-change
      事件也会触发，包含半选状态信息。查看"事件日志"了解详情
    </div>
  </div>
</template>

<script>
import ElTree from '../tree/index'

export default {
  name: 'CheckboxFeatures',
  components: {
    ElTree
  },
  data() {
    return {
      defaultCheckedKeys: [3, 6],
      checkedInfo: '',
      checkEventLog: '',
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
    }
  },
  methods: {
    // 复选框相关方法
    getCheckedInfo() {
      const tree = this.$refs.checkboxApiTree
      const checkedNodes = tree.getCheckedNodes()
      const checkedKeys = tree.getCheckedKeys()
      const halfCheckedNodes = tree.getHalfCheckedNodes()
      const halfCheckedKeys = tree.getHalfCheckedKeys()

      this.checkedInfo = JSON.stringify(
        {
          checkedNodes: checkedNodes.map((n) => n.label),
          checkedKeys,
          halfCheckedNodes: halfCheckedNodes.map((n) => n.label),
          halfCheckedKeys,
        },
        null,
        2
      )

      // eslint-disable-next-line no-console
      console.log('选中信息：', {
        checkedNodes,
        checkedKeys,
        halfCheckedNodes,
        halfCheckedKeys,
      })
    },
    getCheckedLeafInfo() {
      const tree = this.$refs.checkboxApiTree
      const leafNodes = tree.getCheckedNodes(true)
      const leafKeys = tree.getCheckedKeys(true)

      this.checkedInfo = JSON.stringify(
        {
          leafNodes: leafNodes.map((n) => n.label),
          leafKeys,
        },
        null,
        2
      )

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
      this.$emit('add-log', log)

      this.checkEventLog = `最后操作: ${
        data.label
      }\n选中节点: ${checkedInfo.checkedNodes.map((n) => n.label).join(', ')}`
    },
    handleCheckChange(data, checked, indeterminate) {
      const status = indeterminate ? '半选' : checked ? '选中' : '未选中'
      const log = `[check-change事件] ${data.label} → ${status}`
      // eslint-disable-next-line no-console
      console.log(log, { checked, indeterminate })
      this.$emit('add-log', log)
    },
  },
}
</script>