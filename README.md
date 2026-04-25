# Stall Manager（摊位管家）

一个面向地摊与市集商户的经营管理前端项目，提供登录入口、经营看板、摊位管理、商品管理、消息中心与设置页面等界面。

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

默认开发地址为 `http://localhost:3000`。

### 生产构建

```bash
npm run build
```

### 本地预览构建结果

```bash
npm run preview
```

### 清理构建产物

```bash
npm run clean
```

## 项目结构

- `src/App.vue`：应用主入口与页面切换
- `src/screens/`：各业务页面
- `src/components/`：可复用组件
- `src/main.ts`：Vue 挂载入口

## 当前状态

当前项目已完成从旧模板向 Vue 界面的迁移，主要页面可以正常构建与运行。
