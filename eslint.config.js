import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  // 忽略 origin-src 文件夹
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/origin-src/**']
  },
  // JavaScript 基础配置
  js.configs.recommended,
  // Vue 推荐配置
  ...pluginVue.configs['flat/recommended'],
  // 全局配置
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: vueParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      }
    },
    rules: {
      // 自定义规则
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      // Vue 特定规则
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/html-indent': ['error', 2],
      'vue/max-attributes-per-line': ['error', {
        singleline: 3,
        multiline: 1
      }]
    }
  }
]

