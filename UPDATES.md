# 系统更新日志

## v2.0.0 - 系统功能完善 (2024)

### 🎉 新增功能

#### 1. 通知系统 📢
- **功能描述**: 完整的站内通知功能，支持多种通知类型
- **主要特性**:
  - 系统通知、活动通知、社团通知、招新通知等多种类型
  - 未读/已读状态管理
  - 批量标记已读
  - 实时未读数量提示
  - 通知历史记录
  
- **API端点**:
  - `GET /api/notifications` - 获取通知列表
  - `GET /api/notifications/unread-count` - 获取未读数量
  - `PUT /api/notifications/:id/read` - 标记为已读
  - `PUT /api/notifications/read-all` - 全部标记为已读
  - `DELETE /api/notifications/:id` - 删除通知

#### 2. 公告系统 📋
- **功能描述**: 系统公告和社团公告发布管理
- **主要特性**:
  - 支持系统公告和社团公告两种类型
  - 公告优先级设置（低、普通、高、紧急）
  - 公告置顶功能
  - 公告发布权限控制（管理员）
  - 按类型筛选公告
  
- **API端点**:
  - `GET /api/announcements` - 获取公告列表
  - `GET /api/announcements/:id` - 获取公告详情
  - `POST /api/announcements` - 创建公告（管理员）
  - `PUT /api/announcements/:id` - 更新公告（管理员）
  - `DELETE /api/announcements/:id` - 删除公告（管理员）

#### 3. 评论反馈系统 💬
- **功能描述**: 支持对活动和社团进行评论和评分
- **主要特性**:
  - 活动评论和社团评论
  - 1-5星评分系统
  - 评论回复功能（支持父子评论）
  - 平均评分计算
  - 只能修改/删除自己的评论
  
- **API端点**:
  - `GET /api/comments` - 获取评论列表
  - `GET /api/comments/rating` - 获取平均评分
  - `POST /api/comments` - 创建评论
  - `PUT /api/comments/:id` - 更新评论
  - `DELETE /api/comments/:id` - 删除评论

#### 4. 站内消息系统 ✉️
- **功能描述**: 用户之间的私信功能
- **主要特性**:
  - 收件箱和发件箱管理
  - 消息已读/未读状态
  - 消息详情查看（自动标记已读）
  - 未读消息数量提示
  - 消息删除功能
  
- **API端点**:
  - `GET /api/messages/received` - 获取收到的消息
  - `GET /api/messages/sent` - 获取发送的消息
  - `GET /api/messages/unread-count` - 获取未读数量
  - `GET /api/messages/:id` - 获取消息详情
  - `POST /api/messages` - 发送消息
  - `DELETE /api/messages/:id` - 删除消息

#### 5. 操作日志系统 📝
- **功能描述**: 记录管理员的重要操作
- **主要特性**:
  - 记录操作类型、资源、IP地址
  - 记录操作结果和状态码
  - 支持按用户、操作类型筛选
  - 可追溯历史操作记录

### 📊 数据库变更

#### 新增数据表

1. **notifications** - 通知表
   - 字段：id, userId, title, content, type, relatedId, isRead, createdAt

2. **announcements** - 公告表
   - 字段：id, title, content, type, clubId, creatorId, priority, isPinned, status, createdAt, updatedAt

3. **comments** - 评论表
   - 字段：id, content, targetType, targetId, clubId, activityId, userId, parentId, rating, createdAt, updatedAt

4. **messages** - 消息表
   - 字段：id, senderId, receiverId, subject, content, isRead, readAt, createdAt

5. **operation_logs** - 操作日志表
   - 字段：id, userId, username, action, resource, resourceId, method, path, ip, userAgent, status, message, createdAt

#### 新增枚举类型

- `NotificationType` - 通知类型（SYSTEM, ACTIVITY, CLUB, RECRUITMENT, APPLICATION, MEMBER）
- `AnnouncementType` - 公告类型（SYSTEM, CLUB）
- `Priority` - 优先级（LOW, NORMAL, HIGH, URGENT）
- `CommentTargetType` - 评论目标类型（ACTIVITY, CLUB）

### 🎨 前端新增页面

1. **通知中心** (`/notifications`)
   - 通知列表展示（时间线形式）
   - 已读/未读筛选
   - 一键全部已读
   - 通知类型标签

2. **公告列表** (`/announcements`)
   - 公告时间线展示
   - 置顶公告高亮
   - 优先级标识
   - 管理员发布公告

3. **站内消息** (`/messages`)
   - 收件箱/发件箱切换
   - 消息列表（表格形式）
   - 发送新消息
   - 消息详情查看

### 🔔 UI改进

1. **侧边栏菜单更新**
   - 新增公告通知菜单项
   - 新增我的通知菜单项（带未读数量徽章）
   - 新增站内消息菜单项（带未读数量徽章）

2. **实时数据更新**
   - 每30秒自动刷新未读数量
   - 徽章实时显示未读消息数

### 📦 依赖更新

后端无新增依赖，所有功能使用现有技术栈实现。

### 🚀 部署步骤

#### 后端

1. 更新数据库模式：
```bash
cd back
npm run prisma:generate
npm run prisma:migrate
```

2. 重启后端服务：
```bash
npm run dev
```

#### 前端

无需额外操作，重启开发服务器即可：
```bash
cd front
npm run dev
```

### ✅ 已实现功能清单

#### 核心功能（v1.0）
- ✅ 用户角色管理
- ✅ 社团信息管理
- ✅ 社团成员管理
- ✅ 活动管理
- ✅ 权限管理
- ✅ 社团招新
- ✅ 数据统计

#### 新增功能（v2.0）
- ✅ 通知系统
- ✅ 公告系统
- ✅ 评论反馈系统
- ✅ 站内消息系统
- ✅ 操作日志系统

### 📝 使用说明

#### 通知系统使用
1. 系统会自动发送相关通知（需要在各业务逻辑中集成）
2. 用户可在"我的通知"页面查看所有通知
3. 点击通知可标记为已读
4. 支持删除不需要的通知

#### 公告系统使用
1. 管理员可在"公告通知"页面发布公告
2. 支持设置公告类型、优先级和是否置顶
3. 所有用户均可查看公告
4. 置顶公告会在列表顶部高亮显示

#### 评论系统使用
1. 在活动详情页可以发表评论和评分
2. 在社团详情页可以发表评论
3. 支持对评论进行回复
4. 可以查看平均评分

#### 消息系统使用
1. 点击"站内消息"进入消息页面
2. 可查看收到的消息和发送的消息
3. 点击"发送消息"输入收件人ID、主题和内容
4. 查看消息时会自动标记为已读

### 🔮 未来规划

- [ ] 实时推送通知（WebSocket）
- [ ] 邮件通知集成
- [ ] 评论点赞功能
- [ ] 富文本编辑器
- [ ] 附件上传功能
- [ ] 消息群发功能
- [ ] 高级搜索功能
- [ ] 移动端适配

### 🐛 已知问题

暂无

### 📞 技术支持

如遇到问题请提交 Issue。

---

**更新时间**: 2024  
**版本**: v2.0.0
