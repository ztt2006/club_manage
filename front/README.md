# 社团管理系统 - 前端

基于 Vue 3 + Element Plus 的现代化前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 官方路由管理器
- **Pinia** - 轻量级状态管理
- **Element Plus** - Vue 3 UI 组件库
- **Axios** - HTTP 客户端
- **Vite** - 下一代前端构建工具
- **date-fns** - 现代化日期处理库

## 项目结构

```
front/
├── src/
│   ├── api/                # API 接口封装
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── club.js
│   │   ├── member.js
│   │   ├── activity.js
│   │   ├── recruitment.js
│   │   ├── application.js
│   │   └── statistics.js
│   ├── layouts/            # 布局组件
│   │   └── MainLayout.vue
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── stores/            # Pinia 状态管理
│   │   └── user.js
│   ├── utils/             # 工具函数
│   │   └── request.js     # Axios 封装
│   ├── views/             # 页面组件
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Dashboard.vue
│   │   ├── Profile.vue
│   │   ├── Users.vue
│   │   ├── Clubs.vue
│   │   ├── ClubDetail.vue
│   │   ├── MyClubs.vue
│   │   ├── Activities.vue
│   │   ├── ActivityDetail.vue
│   │   ├── Recruitments.vue
│   │   ├── RecruitmentDetail.vue
│   │   └── Statistics.vue
│   ├── App.vue            # 根组件
│   └── main.js            # 应用入口
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
├── package.json
└── README.md
```

## 安装依赖

```bash
npm install
```

## 开发

启动开发服务器（带热重载）：
```bash
npm run dev
```

应用将在 http://localhost:5173 启动

## 构建

构建生产版本：
```bash
npm run build
```

构建产物将生成在 `dist` 目录

预览生产构建：
```bash
npm run preview
```

## 功能模块

### 用户认证
- 用户登录
- 用户注册
- 个人信息管理
- 密码修改

### 社团管理
- 社团列表浏览
- 社团详情查看
- 社团创建（管理员）
- 社团信息编辑
- 我的社团

### 活动管理
- 活动列表浏览
- 活动详情查看
- 活动创建
- 活动报名
- 活动签到
- 取消报名

### 招新管理
- 招新信息浏览
- 招新详情查看
- 招新申请提交
- 申请审核（管理员）

### 用户管理（管理员）
- 用户列表管理
- 用户状态管理
- 角色权限管理

### 数据统计（管理员）
- 用户统计
- 社团统计
- 活动统计
- 招新统计

## 路由配置

```
/login              - 登录页
/register           - 注册页
/                   - 主布局
  /dashboard        - 首页仪表盘
  /profile          - 个人中心
  /users            - 用户管理（管理员）
  /clubs            - 社团列表
  /clubs/:id        - 社团详情
  /my-clubs         - 我的社团
  /activities       - 活动列表
  /activities/:id   - 活动详情
  /recruitments     - 招新列表
  /recruitments/:id - 招新详情
  /statistics       - 数据统计（管理员）
```

## 状态管理

使用 Pinia 进行状态管理，主要 store：

### User Store
- `token` - 用户令牌
- `user` - 用户信息
- `login()` - 登录方法
- `logout()` - 登出方法
- `fetchProfile()` - 获取用户信息

## API 配置

API 请求通过 Axios 封装，配置在 `src/utils/request.js`：
- 自动添加认证 token
- 统一错误处理
- 请求/响应拦截器

开发环境 API 代理配置在 `vite.config.js`：
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

## 组件库

使用 Element Plus UI 组件库：
- 中文语言包
- 自动导入图标组件
- 响应式设计
- 主题定制

## 开发建议

1. 遵循 Vue 3 Composition API 规范
2. 使用 `<script setup>` 语法糖
3. 合理使用 Element Plus 组件
4. 注意路由权限控制
5. 及时处理错误信息
6. 保持代码风格一致

## 环境变量

在项目根目录创建 `.env.local` 文件：
```
VITE_API_BASE_URL=http://localhost:3000
```

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 构建优化

- 按需加载路由组件
- 静态资源压缩
- Tree-shaking
- 代码分割

## 许可证

MIT
