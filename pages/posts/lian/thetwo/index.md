---
title: YukiLog - 02
subTitle: 数据库建表
date: 2026-01-22
updated: 2025-01-23
cover: /cover/bapln.jpg
toc: true
categories:
  - 博客搭建
tags:
  - blog
  - PostgreSQL
---

## | 引言

这篇博客用来记录 `YukiLog` 的数据库设计!

对于一个 **CMS 系统** 来说, 利用数据库管理内容是非常重要的

本篇是 `YukiLog` 系列的第二篇开发日志，主要聊聊我为它设计的表结构：

包括支持无限层级的评论系统、多对多的标签关联，以及一些让开发变轻松的 `SQL` 小技巧

如果你也正准备动手写一个自己的博客，希望这些 `Schema` 设计能给你带来一点启发

---

## | 数据库表结构 (保存为 `init_db.sql`)

> 以下将会详细解析每一个表的设计

```sql
-- 1. 用户表 (Users)
-- 用于登录后台管理, 以及未来可能的注册用户评论
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,             -- 自增ID
  username VARCHAR(50) NOT NULL UNIQUE, -- 用户名 (用于登录)
  password_hash VARCHAR(255) NOT NULL,  -- 密码 (Argon2 哈希后的密码)
  email VARCHAR(255) UNIQUE,            -- 邮箱 (用于发送通知)
  nickname VARCHAR(50),                 -- 显示名称
  avatar_url VARCHAR(255),              -- 头像链接
  role VARCHAR(20) DEFAULT 'user',      -- 角色: admin, user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

- 关于用户表的设计, 我仅仅希望他在网站的内容发布、评论中有作用
- 所以这里做了一个最小实例, 后续使用 **增量更新** 也非常方便
- 值得注意的是, 几乎任何系统都不会直接在数据库中明文存储密码, 这里使用 `Argon2` 哈希

```sql
-- 2. 分类表 (Categories)
-- 文章的分类, 比如 "技术", "生活", "随笔"
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,             -- 自增ID
  name VARCHAR(50) NOT NULL,            -- 分类名
  slug VARCHAR(50) NOT NULL UNIQUE,     -- URL 友好名字
  description TEXT,                     -- 分类描述
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

- 分类表是博客的灵魂之一
- `slug` 允许将 **URL** 从 `posts/1` 变成 `posts/database-design`，对 **SEO** 非常友好

```sql
-- 3. 标签表 (Tags)
-- 比分类更灵活, 比如 "Rust", "Axum", "Vue"
CREATE TABLE tags (
  id BIGSERIAL PRIMARY KEY,             -- 自增ID
  name VARCHAR(50) NOT NULL,            -- 标签名
  slug VARCHAR(50) NOT NULL UNIQUE,     -- URL 友好名字
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

- 标签表的核心任务非常简单
- 绑定到文章上即可

```sql
-- 4. 文章表 (POsts)
-- 博客的核心
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,             -- 自增ID
  title VARCHAR(255) NOT NULL,          -- 标题
  sub_title VARCHAR(255),               -- 副标题
  slug VARCHAR(255) NOT NULL UNIQUE,    -- 文章路径
  summary TEXT,                         -- 摘要 (用于列表展示)
  content TEXT NOT NULL,                -- 文章正文 (Markdown 源码)
  cover_image VARCHAR(255),             -- 封面图 URL
  status VARCHAR(20) DEFAULT 'draft',   -- 状态: draft, published, archived

  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL, -- 外键关联分类
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,           -- 作者

  view_count BIGINT DEFAULT 0,          -- 阅读量
  is_pinned BOOLEAN DEFAULT FALSE,      -- 是否置顶

  published_at TIMESTAMP WITH TIME ZONE, -- 真正发布的时间（可能与创建时间不同）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

- 文章表有这么几部分需要记录:
    1. **文章元数据:** `title` `sub_title` `content` `cover_image` 等等
    2. **文章分类** 和 **作者:** 这一部分需要和其他表做联动, 而且是**一对一关系**, 非常适合外键关系
    3. **文章统计信息:** `view_count` `is_pinned`

```sql
-- 5. 文章-标签关联表 (Post_Tags)
-- 多对多关系: 一篇文章可以有多个标签
CREATE TABLE post_tags (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,  -- 文章ID
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,    -- 标签ID
  PRIMARY KEY (post_id, tag_id)
);
```

**关于关联表的设计思考**

在设计 `post_tags` 表时，有两个核心逻辑需要明确：

1. **为什么需要中间表？**
    根据数据库设计的 **第一范式（1NF）**，每一列的数据都必须是 **原子化** 的（不可再分）
    
    我们不能在 `posts` 表里用一个字段存储 `Rust, PostgreSQL, 后端` 这样的列表，这样做会导致查询极其低效且难以维护

2. **化繁为简:**  
    文章和标签本质上是 **多对多（Many-to-Many）** 关系
    
    在关系型数据库中，这种复杂关系通过引入中间表，被巧妙地拆解成了两个简单的 **一对多（One-to-Many）** 关系
    
    这样既保证了数据的原子性，又方便了后续的联表查询

```sql
-- 6. 评论表 (Comments)
-- 支持无限层级嵌套评论 (楼中楼)
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE, -- 关联哪篇文章

-- 评论内容相关
  content TEXT NOT NULL,                -- 评论内容
  files JSONB DEFAULT '[]',             -- 评论附件

-- 如果是登录用户，关联 user_id；如果是游客，存 nickname/email
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL, 
  guest_nickname VARCHAR(50),
  guest_email VARCHAR(100),
  guest_website VARCHAR(200),

-- 核心：父评论 ID 如果为空，说明是顶层评论；如果不为空，说明是回复某人的
  parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,

  is_reviewed BOOLEAN DEFAULT TRUE,     -- 是否已审核 (如果是 Admin 发的默认 True，游客发的可能要 False)

  ua VARCHAR(255),                      -- 记录 UserAgent (设备信息)
  ip VARCHAR(45),                       -- 记录 IP (防灌水)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

- 对于评论表来说最大的难度就是他受到 **用户**, **文章**, **父评论**等多表约束
- 一条评论有这么一些重要的字段需要记录:
    1. **评论元数据:** `post_id` `content` `files` `parent_id` 等等
    2. **评论关联用户:** 这里要处理没有登录的游客情况
    3. **评论用户信息:** 包含 **登录ip**, **设备信息** 等, 用于后端检测, 防低级爬虫、恶意脚本访问

```sql
-- 7. 友链表 (Links)
-- 用于存放友链信息
CREATE TABLE links (
  id BIGSERIAL PRIMARY KEY,                           -- 自增ID
  link_title VARCHAR(50) NOT NULL,                    -- 站点标题
  link_url VARCHAR(255) NOT NULL UNIQUE,              -- 站点url
  link_avatar VARCHAR(255),                           -- 站点头像
  link_desc TEXT,                                     -- 站点描述
  link_status VARCHAR(20) NOT NULL DEFAULT 'broken',  -- 站点状态 active, pending, broken
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

- 博客在我眼中是一个知识互联系统, 所以友链功能非常重要

```sql
-- 索引优化 (Rust 代码跑起来前，先把这些加上，查询飞快)
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_comments_post_id ON comments(post_id);
```

- 用于加速数据库查询的索引

##### 小恋的一些建议

很多朋友刚开始学习数据库都会觉得麻烦, 还有人可能觉得数据库必须设计的非常好 (所以会设计几十个表)

- 对于觉得数据库麻烦的人来说
    1. 记住数据库记录的是 **数据与数据之间的关系**
    2. 这一层关系本质上是抽象出来的, 他们在底层世界也许并不连续
    3. 所以说 **逻辑很重要**
- 对于想要把数据库做的很完美的人来说
    1. 早期数据库开发只需要实现基本的功能保障就够了
    2. 建议记录每一版数据库的 **表元数据**, 最简单的办法就是维护一个 `.sql` 历史文件
    3. 以后可以慢慢通过 **增量更新** 的方式添加新条目

###### `.sql` 文件简单示范

```sql
-- ===================================
-- VERSION 3.0 - 点赞功能
-- 创建时间: 2026-01-22
-- 说明: 添加点赞功能，支持按点赞数排序
-- 变更内容:
--   - 新增 love 字段，记录点赞数，默认值 0
--   - 新增 likes 表，记录点赞关系（IP + 记录ID），防止刷赞
-- ===================================

CREATE TABLE IF NOT EXISTS check_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    media_files TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    -- VERSION 2.0 新增字段
    nickname TEXT DEFAULT '用户0721',
    email TEXT,
    qq TEXT,
    url TEXT,
    avatar TEXT DEFAULT '🥰',
    -- VERSION 3.0 新增字段
    love INTEGER DEFAULT 0
);

-- 点赞记录表（防止重复点赞）
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checkin_id INTEGER NOT NULL,
    ip_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(checkin_id, ip_address),
    FOREIGN KEY (checkin_id) REFERENCES check_ins(id) ON DELETE CASCADE
);

-- 为点赞查询创建索引
CREATE INDEX IF NOT EXISTS idx_likes_checkin_ip ON likes(checkin_id, ip_address);

-- ===================================
-- 迁移说明
-- ===================================
-- 从 V1.0 迁移到 V2.0:
-- ALTER TABLE check_ins ADD COLUMN nickname TEXT DEFAULT '用户0721';
-- ALTER TABLE check_ins ADD COLUMN email TEXT;
-- ALTER TABLE check_ins ADD COLUMN qq TEXT;
-- ALTER TABLE check_ins ADD COLUMN url TEXT;
-- ALTER TABLE check_ins ADD COLUMN avatar TEXT DEFAULT '🥰';
--
-- 从 V2.0 迁移到 V3.0:
-- ALTER TABLE check_ins ADD COLUMN love INTEGER DEFAULT 0;
-- CREATE TABLE likes (...);
-- CREATE INDEX idx_likes_checkin_ip ON likes(checkin_id, ip_address);
-- ===================================

```

---

## 数据库触发器

> 如何自动更新时间戳?

在所有数据库表的设计中, 我都大量使用了 `created_at` `updated_at` 这两个字段

这是为了在审计时所有 **业务操作** 可溯源

- `created_at` 字段可以在记录插入时触发 **CURRENT_TIMESTAMP** 函数
- `updated_at` 字段需要我们手动写一个 **触发器**, 在记录更新时返回一次 **CURRENT_TIMESTAMP** 函数

#### 更新函数

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

#### 绑定触发器

```sql
-- 为 users 表绑定
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 为 categories 表绑定
CREATE TRIGGER update_categories_modtime
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 为 posts 表绑定
CREATE TRIGGER update_posts_modtime
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 为 links 表绑定
CREATE TRIGGER update_links_modtime
    BEFORE UPDATE ON links
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
```

## 部署数据库

> 如何在 `Ubuntu` 服务器安装 `PostgreSQl` 并且导入表呢?

#### (1) 配置软件源

```shell
# 添加清华源
echo "deb https://mirrors.tuna.tsinghua.edu.cn/postgresql/repos/apt/ noble-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# 导入GPG密钥
wget -qO - https://mirrors.tuna.tsinghua.edu.cn/postgresql/repos/apt/ACCC4CF8.asc | sudo apt-key add -
```

#### (2) 下载 PostgreSQl

```shell
# 更新包列表并安装
sudo apt update && sudo apt install postgresql-16 postgresql-client-16

# 启动PostgreSQL服务并设置开机自启
sudo systemctl enable --now postgresql
```

#### (3) 数据库用户和权限配置

```shell
# 切换到postgres系统用户
sudo -i -u postgres

# 进入PostgreSQL交互终端
psql
```

###### 创建数据库和超级用户

```sql
-- 1. 创建超级用户 lian (请将 '你的密码' 替换为你真实的密码)
CREATE ROLE lian WITH LOGIN SUPERUSER PASSWORD '你的密码';

-- 2. 创建数据库 yukilog
CREATE DATABASE yukilog;

-- 3. 将数据库 yukilog 的所有权赋予 lian
ALTER DATABASE yukilog OWNER TO lian;

-- 4. 退出 psql
\q
```

#### (4) 配置认证方式

```shell
# 编辑客户端认证配置文件
sudo vim /etc/postgresql/16/main/pg_hba.conf
```

```text
# 修改前：
local   all             all                                     peer
host    all             all             127.0.0.1/32            ident
host    all             all             ::1/128                 ident

# 修改后：
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**具体说明见 [数据库安全与网路配置详解](#数据库安全与网络配置详解)**

#### (5) 导入数据库

```shell
psql -U lian -d yukilog -f init_db.sql
```

```shell
psql -U lian -d yukilog
```

```sql
\dt
\df
\d posts
```

#### (6) 配置远程访问

```shell
# 编辑PostgreSQL主配置文件
sudo vim /etc/postgresql/16/main/postgresql.conf
```

```text
# 修改前：
#listen_addresses = 'localhost'

# 修改后：
listen_addresses = '*'
```

```shell
# 编辑认证配置文件，添加远程访问规则
sudo vim /etc/postgresql/16/main/pg_hba.conf
```

```text
host    all             all             0.0.0.0/0               md5
```

**具体说明见 [数据库安全与网路配置详解](#数据库安全与网络配置详解)**

#### (7) 重启服务

```shell
# 重启PostgreSQL服务
sudo systemctl restart postgresql
```

---

## 数据库安全与网络配置详解

在安装完 `PostgreSQL` 后，默认的配置通常非常保守（**仅允许本地连接且使用系统用户认证**）

为了让我们的 `YukiLog` 后端程序能够顺利连接，并支持必要的远程管理，我们需要对认证策略和监听地址进行调整

1. **配置验证方式 (`pg_hba.conf`)**

**为什么要从 `peer/ident` 修改为 `md5`？**

`PostgreSQL` 默认使用 `peer` 或 `ident` 认证：

- **Peer/Ident:** 要求你的操作系统用户名必须与数据库用户名一致, 这在自动化部署或多应用环境下非常受限
- **MD5/Password:** 允许我们通过用户名 + 密码的方式进行校验

通过将认证方式改为 `md5`，我们确保了后端程序（如 `Rust` 或 `Go` 编写的服务）可以通过配置文件中的凭据安全地访问数据库，而不必依赖特定的系统用户身份

2. **开启网络监听 (`postgresql.conf`)**

**为什么要修改 `listen_addresses`？**

默认情况下，`PostgreSQL` 仅监听 `localhost`（即 `127.0.0.1`）, 这意味着数据库只接受来自服务器自身的连接请求

将 `listen_addresses` 设置为 `'*'`，意味着数据库将监听服务器上所有网卡的请求

这是实现**远程连接**或**容器间通信**（如果你将数据库和应用部署在不同机器/容器中）的前提

- **⚠️ 安全警告与最小权限原则:** 
    PostgreSQL 默认只监听本地，这是为了遵循 **攻击面最小化 (Minimize Attack Surface)** 原则。
    将 `listen_addresses` 设为 `*` 并放行 `0.0.0.0/0` 等同于拆掉了数据库的第一道防线。在生产环境中，请严格遵循以下操作：
    - **网络层防火墙 (Security Group):** 在云服务商后台，仅放行你个人的 IP 或应用服务器的内网 IP。
    - **强密码策略:** 配合 `md5`/`scram-sha-256` 认证。
    - **最佳实践:** 如果应用和数据库在同一台服务器，**不要开启远程访问**，保持默认的 `localhost` 监听是最安全的。

3. **放行远程访问规则 (`pg_hba.conf`)**

**为什么还要加一行 `0.0.0.0/0`**

仅仅开启监听是不够的，`PostgreSQL` 还有一层“防火墙”机制（HBA, Host-Based Authentication）

添加 `host all all 0.0.0.0/0 md5` 意味着**允许任何 IP 地址**尝试连接

**安全提示:** 虽然我们设置了全局允许，但因为配合了 `md5` 强密码校验，且在实际生产中通常还会有云服务器的安全组（Security Group）拦截非授权端口，所以这是兼顾灵活性与安全性的常见做法

---

## 🎯 接下来要做什么？

虽然大家都说 `Rust` 很难，但其实只要跨过了 **所有权** 和 **错误处理** 这两座大山，你会发现它写起来极其安心

下一篇，我将分享 `YukiLog` 后端的实现逻辑

我会以入门者的视角，带大家拆解 `Rust` 那些最迷人的特性
