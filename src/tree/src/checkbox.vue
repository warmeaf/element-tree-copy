<template>
  <label
    class="el-checkbox"
    :class="{
      'is-disabled': disabled,
      'is-checked': isChecked,
      'is-indeterminate': indeterminate
    }"
  >
    <span 
      class="el-checkbox__input"
      :class="{
        'is-disabled': disabled,
        'is-checked': isChecked,
        'is-indeterminate': indeterminate,
        'is-focus': focus
      }"
      :tabindex="indeterminate ? 0 : false"
      :role="indeterminate ? 'checkbox' : false"
      :aria-checked="indeterminate ? 'mixed' : false"
    >
      <span class="el-checkbox__inner"></span>
      <!-- 当有 trueLabel 或 falseLabel 时，使用这个 input -->
      <input
        v-if="trueLabel || falseLabel"
        class="el-checkbox__original"
        type="checkbox"
        :aria-hidden="indeterminate ? 'true' : 'false'"
        :name="name"
        :disabled="disabled"
        :true-value="trueLabel"
        :false-value="falseLabel"
        v-model="model"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false"
      />
      <!-- 默认情况使用这个 input -->
      <input
        v-else
        class="el-checkbox__original"
        type="checkbox"
        :aria-hidden="indeterminate ? 'true' : 'false'"
        :disabled="disabled"
        :value="label"
        :name="name"
        v-model="model"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false"
      />
    </span>
    <span class="el-checkbox__label" v-if="$slots.default || label">
      <slot></slot>
      <template v-if="!$slots.default">{{ label }}</template>
    </span>
  </label>
</template>

<script>
export default {
  name: 'ElCheckbox',
  
  props: {
    value: {},  // 支持任意类型：Boolean, String, Number 等
    label: {},  // checkbox 的值，用于 group 场景（虽然我们不用 group，但保留接口一致性）
    indeterminate: Boolean,
    disabled: Boolean,
    checked: Boolean,  // 初始是否选中
    name: String,  // 原生 name 属性
    trueLabel: [String, Number],  // 选中时的值
    falseLabel: [String, Number]  // 未选中时的值
  },

  data() {
    return {
      selfModel: false,  // 内部状态，当没有传入 value prop 时使用
      focus: false
    }
  },

  computed: {
    // model 计算属性：处理 v-model 的 get/set
    model: {
      get() {
        // 如果传入了 value prop，使用外部的值
        // 否则使用内部的 selfModel
        return this.value !== undefined ? this.value : this.selfModel
      },

      set(val) {
        // 触发 input 事件，用于 v-model
        this.$emit('input', val)
        // 更新内部状态
        this.selfModel = val
      }
    },

    isChecked() {
      // 根据不同的值类型判断是否选中
      if ({}.toString.call(this.model) === '[object Boolean]') {
        // Boolean 类型：直接返回值
        return this.model
      } else if (this.model !== null && this.model !== undefined) {
        // 其他类型：与 trueLabel 比较
        return this.model === this.trueLabel
      }
      return false
    }
  },

  methods: {
    addToStore() {
      // 初始化选中状态
      // 如果有 trueLabel，使用 trueLabel，否则使用 true
      this.model = this.trueLabel || true
    },

    handleChange(ev) {
      // 根据选中状态确定要 emit 的值
      let value
      if (ev.target.checked) {
        value = this.trueLabel === undefined ? true : this.trueLabel
      } else {
        value = this.falseLabel === undefined ? false : this.falseLabel
      }
      // 触发 change 事件
      this.$emit('change', value, ev)
    }
  },

  created() {
    // 如果传入了 checked prop 且为 true，初始化为选中状态
    this.checked && this.addToStore()
  }
}
</script>

<style>
.el-checkbox {
  color: #606266;
  font-weight: 500;
  font-size: 14px;
  position: relative;
  cursor: pointer;
  display: inline-block;
  white-space: nowrap;
  user-select: none;
  margin-right: 8px;
}

.el-checkbox__input {
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  display: inline-block;
  line-height: 1;
  position: relative;
  vertical-align: middle;
}

.el-checkbox__inner {
  display: inline-block;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  box-sizing: border-box;
  width: 14px;
  height: 14px;
  background-color: #fff;
  z-index: 1;
  transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46),
    background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
}

.el-checkbox__inner::after {
  box-sizing: content-box;
  content: "";
  border: 1px solid #fff;
  border-left: 0;
  border-top: 0;
  height: 7px;
  left: 4px;
  position: absolute;
  top: 1px;
  transform: rotate(45deg) scaleY(0);
  width: 3px;
  transition: transform 0.15s ease-in 0.05s;
  transform-origin: center;
}

.el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff;
}

.el-checkbox__input.is-checked .el-checkbox__inner::after {
  transform: rotate(45deg) scaleY(1);
}

.el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
  content: "";
  position: absolute;
  display: block;
  background-color: #fff;
  height: 2px;
  transform: scale(0.5);
  left: 0;
  right: 0;
  top: 5px;
}

.el-checkbox__input.is-indeterminate .el-checkbox__inner::after {
  display: none;
}

.el-checkbox__input.is-focus .el-checkbox__inner {
  border-color: #409eff;
}

.el-checkbox__input.is-disabled {
  cursor: not-allowed;
}

.el-checkbox__input.is-disabled .el-checkbox__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
}

.el-checkbox__input.is-disabled .el-checkbox__inner::after {
  cursor: not-allowed;
  border-color: #c0c4cc;
}

.el-checkbox__input.is-disabled + .el-checkbox__label {
  cursor: not-allowed;
}

.el-checkbox__original {
  opacity: 0;
  outline: none;
  position: absolute;
  margin: 0;
  width: 0;
  height: 0;
  z-index: -1;
}
</style>

