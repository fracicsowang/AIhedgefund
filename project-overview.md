# AI Hedge Fund 项目概述

## 项目简介

AI Hedge Fund是一个基于Next.js和Supabase的应用，它模拟多位投资大师的策略，为用户提供股票交易建议。项目区分免费用户和付费用户，后者通过Stripe订阅可以获得更全面的功能。

## 技术栈

- **前端框架**：Next.js (React 18, App Router)
- **样式**: Tailwind CSS, shadcn/ui
- **后端服务**：Supabase (数据库、认证)
- **数据源**：Yahoo Finance (通过 `yahoo-finance2` npm包)
- **支付系统**：Stripe (订阅管理)
- **AI集成**：OpenAI API

## 项目结构

### 核心目录

- `/agents`: 投资大师策略逻辑
  - `benGraham.ts`: 格雷厄姆价值投资策略
  - `warrenBuffett.ts`: 巴菲特投资策略
  - `riskManager.ts`: 风险管理策略
  - `portfolioManager.ts`: 投资组合管理

- `/app`: Next.js App Router
  - `/page.tsx`: 首页
  - `/stocks`: 股票列表和分析页面
  - `/api`: 后端API端点
  - `/dashboard`: 用户仪表板
  - `/login`, `/signup`: 认证页面
  - `/pricing`: 订阅计划页面

- `/components`: 可复用组件
  - `StockCard.tsx`: 股票信息卡片
  - `Navbar.tsx`: 导航栏
  - `Footer.tsx`: 页脚
  - `SubscriptionBanner.tsx`: 订阅横幅

- `/lib`: 工具函数
  - `fetchStockData.ts`: Yahoo Finance数据获取
  - `auth.tsx`: Supabase认证
  - `supabase.ts`: Supabase客户端
  - `stripe.ts`: Stripe支付集成

### 关键API端点

- `/api/stocks`: 获取热门股票列表
- `/api/stocks/[symbol]`: 获取单个股票数据
- `/api/stocks/opinion`: 使用OpenAI生成股票分析意见
- `/api/agent-decision`: 获取单个投资代理的决策
- `/api/final-decision`: 综合多个代理得到最终决策
- `/api/subscribe`: 处理Stripe订阅

## 关键功能

### 1. 股票数据获取

`fetchStockData.ts`封装了Yahoo Finance API，获取股票实时数据和关键指标。分为两个函数:
- `fetchFamousStocks()`: 获取热门股票数据（免费用户可用）
- `fetchMoreStocks()`: 获取更多股票数据（付费用户专属）

### 2. 投资策略实现

每个投资大师策略都是一个独立模块:
- `benGrahamStrategy`: 分析价值、安全边际
- `warrenBuffettStrategy`: 分析企业护城河
- 使用OpenAI API增强分析决策

### 3. 用户认证

使用Supabase Auth实现用户认证，包括:
- 邮箱注册/登录
- 会话管理
- 基于角色的访问控制

### 4. 订阅管理

通过Stripe实现订阅管理:
- 免费用户: 访问7只热门股票，有限分析
- 付费用户: 扩展股票池，全套分析功能

### 5. 页面实现

- 首页: 展示热门股票、平台特性介绍
- 股票分析页: 详细的股票分析和投资建议
- 用户仪表板: 管理订阅、查看历史分析

## 待解决问题

- `stocks/opinion/route.ts`中存在类型错误，需要修复StockData类型定义与实际使用不匹配的问题
- 需要添加更多投资大师策略实现
- 可扩展AI分析功能，加强分析深度

## 扩展方向

- 增加用户自定义投资组合
- 添加回测功能
- 添加更多市场数据源
- 集成更多AI模型，增强分析能力 