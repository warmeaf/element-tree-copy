<template>
  <div>
    <h1>tree 组件示例</h1>

    <!-- Tab 切换 -->
    <div class="tab-container">
      <div class="tab-buttons">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['tab-button', { active: activeTab === index }]"
          @click="activeTab = index"
        >
          {{ tab.title }}
        </button>
      </div>

      <!-- Tab 内容 -->
      <div class="tab-content">
        <!-- 基础功能 Tab -->
        <BasicFeatures v-if="activeTab === 0" :logs="logs" @add-log="addLog" />

        <!-- 复选框功能 Tab -->
        <CheckboxFeatures v-if="activeTab === 1" @add-log="addLog" />

        <!-- 高级功能 Tab -->
        <AdvancedFeatures v-if="activeTab === 2" @add-log="addLog" />

        <!-- 操作功能 Tab -->
        <OperationFeatures
          v-if="activeTab === 3"
          :logs="logs"
          @add-log="addLog"
        />
      </div>
    </div>
  </div>
</template>

<script>
import BasicFeatures from './BasicFeatures.vue'
import CheckboxFeatures from './CheckboxFeatures.vue'
import AdvancedFeatures from './AdvancedFeatures.vue'
import OperationFeatures from './OperationFeatures.vue'

export default {
  name: 'ExampleIndex',
  components: {
    BasicFeatures,
    CheckboxFeatures,
    AdvancedFeatures,
    OperationFeatures,
  },
  data() {
    return {
      // Tab 切换相关
      activeTab: 0,
      tabs: [
        { title: '基础功能' },
        { title: '复选框功能' },
        { title: '高级功能' },
        { title: '操作功能' },
      ],

      // 事件日志
      logs: [],
    }
  },
  methods: {
    // 添加日志
    addLog(log) {
      this.logs.unshift(log)
      if (this.logs.length > 20) this.logs.pop()
    },
  },
}
</script>

<style>
/* Tab 样式 */
.tab-container {
  margin-top: 20px;
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-button:hover {
  background: #e6f7ff;
}

.tab-button.active {
  background: #fff;
  border-bottom-color: #409eff;
  color: #409eff;
}

.tab-content {
  background: #fff;
}

.tab-panel {
  padding: 20px 0;
}
</style>
