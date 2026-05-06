# 摊位管家（Stall Manager）

一个面向地摊与市集商户的经营管理前端项目，提供登录入口、经营看板、摊位管理、商品管理、消息中心与设置页面等核心能力。

## 技术栈

- Vue 3
- Vite
- TypeScript
- Tailwind CSS 4
- Element Plus
- ApexCharts

## 本地开发

### 前置要求

- Node.js 18+
- npm

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

默认开发地址：`http://localhost:3000`。

### 生产构建

```bash
npm run build
```

### 本地预览

```bash
npm run preview
```

### 类型检查

```bash
npm run lint
```

## 环境变量

项目支持通过 `.env` 文件配置后端地址：

- `VITE_API_BASE_URL`：后端服务基础地址（例如 `http://127.0.0.1:8080`）。

未配置时将默认走同源 `/api` 代理。

## 项目结构

- `src/App.vue`：应用主入口与页面切换
- `src/screens/`：业务页面（登录、摊位、设置等）
- `src/components/`：可复用组件
- `src/main.ts`：Vue 挂载入口

