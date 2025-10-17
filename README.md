# Vue 2 + Vite + Vitest

这是一个基于 Vite 的 Vue 2 项目模板，集成了 Vitest 进行单元测试。

## 技术栈

- **Vue 2.7** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vitest** - 基于 Vite 的单元测试框架
- **@vue/test-utils** - Vue 组件测试工具

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 测试

### 运行测试（监听模式）

```bash
pnpm test
```

### 运行测试（单次运行）

```bash
pnpm test:run
```

### 测试 UI 界面

```bash
pnpm test:ui
```

## 项目结构

```
element-tree-copy/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── __tests__/       # 组件测试文件
│   │   └── HelloWorld.vue
│   ├── utils/               # 工具函数
│   │   ├── __tests__/       # 工具函数测试
│   │   └── helpers.js
│   ├── test/                # 测试配置
│   │   └── setup.js         # 测试设置文件
│   ├── App.vue              # 根组件
│   ├── main.js              # 入口文件
│   └── style.css            # 全局样式
├── public/                  # 静态资源
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
└── package.json             # 项目配置
```

## 编写测试

### 组件测试示例

```javascript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from '../MyComponent.vue'

describe('MyComponent.vue', () => {
  it('renders props correctly', () => {
    const wrapper = mount(MyComponent, {
      propsData: { msg: 'Hello' }
    })
    expect(wrapper.text()).toContain('Hello')
  })
})
```

### 工具函数测试示例

```javascript
import { describe, it, expect } from 'vitest'
import { myFunction } from '../helpers'

describe('myFunction', () => {
  it('returns correct value', () => {
    expect(myFunction(1, 2)).toBe(3)
  })
})
```

## 测试配置

测试配置位于 `vite.config.js` 中：

```javascript
export default defineConfig({
  test: {
    globals: true,        // 全局注册测试 API
    environment: 'jsdom', // 使用 jsdom 模拟浏览器环境
    setupFiles: './src/test/setup.js', // 测试设置文件
  },
})
```

## 了解更多

- [Vue 2 文档](https://v2.vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Vitest 文档](https://vitest.dev/)
- [@vue/test-utils 文档](https://v1.test-utils.vuejs.org/)
