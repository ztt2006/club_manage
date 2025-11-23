# 社团管理系统 - 后端

基于 Node.js + Express + Prisma + MySQL 的后端服务。

## 技术栈

- **Express** - Web 框架
- **Prisma** - ORM 数据库工具
- **MySQL** - 关系型数据库
- **JWT** - 身份认证
- **Bcryptjs** - 密码加密
- **Multer** - 文件上传中间件

## 目录结构

```
back/
├── config/              # 配置文件
│   └── prisma.js       # Prisma 客户端配置
├── controllers/         # 控制器层
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── club.controller.js
│   ├── member.controller.js
│   ├── activity.controller.js
│   ├── recruitment.controller.js
│   ├── application.controller.js
│   └── statistics.controller.js
├── middleware/          # 中间件
│   ├── auth.middleware.js     # 身份认证中间件
│   └── upload.middleware.js   # 文件上传中间件
├── routes/             # 路由定义
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── club.routes.js
│   ├── member.routes.js
│   ├── activity.routes.js
│   ├── recruitment.routes.js
│   ├── application.routes.js
│   └── statistics.routes.js
├── prisma/             # Prisma 配置
│   └── schema.prisma   # 数据库模型定义
├── uploads/            # 上传文件存储目录
│   ├── avatars/
│   ├── logos/
│   └── covers/
├── .env.example        # 环境变量示例
├── .gitignore
├── package.json
├── server.js           # 应用入口
└── README.md
```

## 环境配置

复制 `.env.example` 为 `.env` 并配置以下环境变量：

```env
DATABASE_URL="mysql://root:password@localhost:3306/club_management"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=3000
NODE_ENV=development
```

## 安装依赖

```bash
npm install
```

## 数据库设置

1. 创建 MySQL 数据库：
```sql
CREATE DATABASE club_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 生成 Prisma 客户端：
```bash
npm run prisma:generate
```

3. 执行数据库迁移：
```bash
npm run prisma:migrate
```

4. （可选）打开 Prisma Studio 可视化管理数据库：
```bash
npm run prisma:studio
```

## 运行项目

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

服务器将在 http://localhost:3000 启动

## API 端点

### 认证 `/api/auth`
- `POST /register` - 注册
- `POST /login` - 登录
- `GET /profile` - 获取个人信息
- `PUT /profile` - 更新个人信息
- `PUT /change-password` - 修改密码

### 用户 `/api/users`
- `GET /` - 获取用户列表
- `GET /:id` - 获取用户详情
- `PUT /:id` - 更新用户
- `DELETE /:id` - 删除用户
- `PUT /:id/status` - 更新状态
- `PUT /:id/role` - 更新角色
- `POST /avatar` - 上传头像

### 社团 `/api/clubs`
- `GET /` - 获取社团列表
- `GET /:id` - 获取社团详情
- `POST /` - 创建社团
- `PUT /:id` - 更新社团
- `DELETE /:id` - 删除社团
- `POST /:id/logo` - 上传 Logo
- `GET /:id/members` - 获取成员列表

### 成员 `/api/members`
- `POST /` - 添加成员
- `DELETE /:id` - 移除成员
- `PUT /:id/role` - 更新角色
- `PUT /:id/status` - 更新状态
- `GET /my-clubs` - 我的社团

### 活动 `/api/activities`
- `GET /` - 获取活动列表
- `GET /:id` - 获取活动详情
- `POST /` - 创建活动
- `PUT /:id` - 更新活动
- `DELETE /:id` - 删除活动
- `POST /:id/cover` - 上传封面
- `POST /:id/register` - 报名
- `POST /:id/checkin` - 签到
- `DELETE /:id/cancel` - 取消报名
- `GET /:id/participants` - 参与者列表

### 招新 `/api/recruitments`
- `GET /` - 获取招新列表
- `GET /:id` - 获取招新详情
- `POST /` - 创建招新
- `PUT /:id` - 更新招新
- `DELETE /:id` - 删除招新
- `PUT /:id/status` - 更新状态

### 申请 `/api/applications`
- `GET /recruitment/:recruitmentId` - 按招新获取申请
- `GET /:id` - 获取申请详情
- `POST /` - 提交申请
- `PUT /:id/review` - 审核申请
- `DELETE /:id` - 删除申请

### 统计 `/api/statistics`
- `GET /overview` - 概览统计
- `GET /clubs` - 社团统计
- `GET /activities` - 活动统计
- `GET /users` - 用户统计
- `GET /recruitments` - 招新统计

## 权限说明

### 用户角色
- `SUPER_ADMIN` - 超级管理员（最高权限）
- `ADMIN` - 管理员
- `USER` - 普通用户

### 社团角色
- `PRESIDENT` - 社长
- `VICE_PRESIDENT` - 副社长
- `MANAGER` - 管理员
- `MEMBER` - 成员

## 错误处理

API 返回格式：
```json
{
  "success": true/false,
  "message": "消息内容",
  "data": {} // 成功时返回的数据
}
```

HTTP 状态码：
- `200` - 成功
- `201` - 创建成功
- `400` - 请求错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器错误

## 开发建议

1. 使用 Prisma Studio 进行数据库可视化管理
2. 定期备份数据库
3. 在生产环境中更改 JWT_SECRET
4. 配置合适的 CORS 策略
5. 使用环境变量管理敏感信息

## 数据库迁移

创建新迁移：
```bash
npx prisma migrate dev --name migration_name
```

重置数据库：
```bash
npx prisma migrate reset
```

## 许可证

MIT
