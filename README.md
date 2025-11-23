# 社团管理系统

一个基于 Node.js + Vue3 的现代化社团管理系统。

## 项目简介

本系统提供完整的社团管理功能，包括用户管理、社团管理、活动管理、招新管理等核心功能，适用于学校、企业等组织的社团活动管理。

## 功能特性

### 核心功能
- ✅ **用户角色管理** - 支持超级管理员、管理员、普通用户三种角色
- ✅ **社团信息管理** - 完整的社团CRUD操作，支持分类、成员限制等
- ✅ **社团成员管理** - 成员角色管理（社长、副社长、管理员、成员）
- ✅ **活动管理** - 活动创建、报名、签到等完整流程
- ✅ **社团活动管理** - 社团专属活动管理
- ✅ **权限管理** - 基于角色和社团职位的权限控制
- ✅ **社团招新** - 招新信息发布、申请管理、审核流程
- ✅ **数据统计** - 多维度数据统计和可视化展示

### 技术特性
- 🔐 JWT 身份认证
- 🛡️ 基于角色的访问控制 (RBAC)
- 📱 响应式设计，支持多端访问
- 🎨 现代化 UI 界面
- 📊 实时数据统计
- 🖼️ 图片上传功能

## 技术栈

### 后端
- **Node.js** - JavaScript 运行环境
- **Express** - Web 应用框架
- **Prisma** - 现代化 ORM
- **MySQL** - 关系型数据库
- **JWT** - 身份认证
- **Bcrypt** - 密码加密
- **Multer** - 文件上传

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Element Plus** - UI 组件库
- **Axios** - HTTP 客户端
- **Vite** - 构建工具
- **date-fns** - 日期处理

## 项目结构

```
club_manage/
├── back/                 # 后端项目
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── middleware/      # 中间件
│   ├── routes/          # 路由
│   ├── prisma/          # Prisma 配置和迁移
│   ├── uploads/         # 上传文件目录
│   ├── package.json
│   └── server.js        # 入口文件
│
└── front/               # 前端项目
    ├── src/
    │   ├── api/         # API 接口
    │   ├── components/  # 组件
    │   ├── layouts/     # 布局
    │   ├── router/      # 路由配置
    │   ├── stores/      # 状态管理
    │   ├── utils/       # 工具函数
    │   ├── views/       # 页面视图
    │   ├── App.vue      # 根组件
    │   └── main.js      # 入口文件
    ├── package.json
    └── vite.config.js   # Vite 配置
```

## 快速开始

### 环境要求
- Node.js >= 16.x
- MySQL >= 8.0
- npm 或 yarn

### 后端安装

1. 进入后端目录
```bash
cd back
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

4. 初始化数据库
```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate
```

5. 启动后端服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

后端服务默认运行在 http://localhost:3000

### 前端安装

1. 进入前端目录
```bash
cd front
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

前端应用默认运行在 http://localhost:5173

4. 构建生产版本
```bash
npm run build
```

## 默认账号

系统需要手动注册账号。首个注册的用户可以在数据库中手动设置为 SUPER_ADMIN 角色。

## API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取个人信息
- `PUT /api/auth/profile` - 更新个人信息
- `PUT /api/auth/change-password` - 修改密码

### 用户管理
- `GET /api/users` - 获取用户列表（管理员）
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户（管理员）
- `PUT /api/users/:id/status` - 更新用户状态（管理员）
- `PUT /api/users/:id/role` - 更新用户角色（超级管理员）

### 社团管理
- `GET /api/clubs` - 获取社团列表
- `GET /api/clubs/:id` - 获取社团详情
- `POST /api/clubs` - 创建社团（管理员）
- `PUT /api/clubs/:id` - 更新社团信息
- `DELETE /api/clubs/:id` - 删除社团（管理员）

### 活动管理
- `GET /api/activities` - 获取活动列表
- `GET /api/activities/:id` - 获取活动详情
- `POST /api/activities` - 创建活动
- `PUT /api/activities/:id` - 更新活动
- `DELETE /api/activities/:id` - 删除活动
- `POST /api/activities/:id/register` - 报名活动
- `POST /api/activities/:id/checkin` - 签到
- `DELETE /api/activities/:id/cancel` - 取消报名

### 招新管理
- `GET /api/recruitments` - 获取招新列表
- `GET /api/recruitments/:id` - 获取招新详情
- `POST /api/recruitments` - 创建招新
- `PUT /api/recruitments/:id` - 更新招新
- `DELETE /api/recruitments/:id` - 删除招新

### 统计数据
- `GET /api/statistics/overview` - 概览统计
- `GET /api/statistics/clubs` - 社团统计
- `GET /api/statistics/activities` - 活动统计
- `GET /api/statistics/users` - 用户统计

## 数据库模型

系统包含以下主要数据模型：

- **User** - 用户
- **Club** - 社团
- **ClubMember** - 社团成员
- **Activity** - 活动
- **ActivityRecord** - 活动记录
- **Recruitment** - 招新
- **Application** - 申请

详细的数据库结构请查看 `back/prisma/schema.prisma`

## 开发计划

- [ ] 添加通知系统
- [ ] 实现实时聊天功能
- [ ] 移动端 App 开发
- [ ] 社团论坛功能
- [ ] 财务管理模块
- [ ] 数据可视化增强

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请提交 Issue。
