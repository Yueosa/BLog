---
title: YukiLog - 06
subTitle: 封装与抽象——Repository 模式实战
date: 2026-01-25
updated: 2026-01-25
cover: /cover/bapln.jpg
toc: true
categories:
  - 博客搭建
tags:
  - blog
  - Rust
  - SeaORM
  - Design Pattern
---

## 🏗️ 引言：为什么要多此一举？

在上一篇中，我们生成了 `Entity` 文件，这意味着我们可以直接在代码里调用：

```rust
//直接在 Handler 里裸写数据库查询？
let post = Posts::find_by_id(1).one(&state.db).await?;
```

这就引出了一个灵魂拷问：**既然能直接调用，为什么还要专门写一个 Repository 层？**

如果你写过复杂的业务系统，你一定遇到过这种场景：
1.  **查询逻辑分散：** 一个简单的“查询已发布文章”，可能在首页、归档页、RSS 用于生成都需要用到。如果每次都手写 `.filter(Column::Status.eq("published"))`，一旦有一天规则变了（比如加了一个 `is_deleted` 字段），你需要改十几个地方。
2.  **测试困难：** 想要测试业务逻辑，却必须连着真实的数据库。
3.  **代码耦合：** 你的业务代码（Controller/Service）与底层的 ORM 框架绑死，将来想换 ORM 或做缓存（Redis）时会非常痛苦。

所以，我们需要 **Repository Pattern（仓储模式）**。它的本质是：**把数据访问逻辑关进笼子里，只暴露干净的接口给外界调用。**

---

## 📂 目录结构设计

在 `YukiLog` 的架构中，我们将仓储层放在 `infra` (Infrastructure/基础设施) 目录下：

```text
yukilog-backend/src/infra/repository/
├── mod.rs          # 模块导出
├── posts.rs        # 文章仓储 (核心)
├── users.rs        # 用户仓储
├── comments.rs     # 评论仓储
├── ...
```

---

## 💻 实战代码：封装 PostsRepository

让我们以最核心的 **文章仓储** 为例，看看一个标准且健壮的 Rust Repository 长什么样。

### 1. 定义结构体

我们不使用复杂的 Trait 抽象（对于单体应用来说那是过度设计），直接使用 Struct 封装：

```rust
// src/infra/repository/posts.rs
use sea_orm::*;
use crate::entities::{prelude::Posts, posts};

/// 文章仓储
/// 
/// 遵循单例生命周期（通常由 Arc 或者是 Clone 传递）
#[derive(Clone)]
pub struct PostsRepository {
    db: DatabaseConnection,
}

impl PostsRepository {
    /// 构造函数
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}
```

### 2. 封装查询逻辑 (Read)

最大的好处是**语义化**。调用者不需要知道你用了什么 `filter`，只需要调用 `find_published`。

```rust
impl PostsRepository {
    /// 根据 ID 查询文章
    pub async fn find_by_id(&self, id: i64) -> Result<Option<posts::Model>, DbErr> {
        Posts::find_by_id(id).one(&self.db).await
    }

    /// 根据 Slug 查询（用于前台 URL 访问）
    pub async fn find_by_slug(&self, slug: &str) -> Result<Option<posts::Model>, DbErr> {
        Posts::find()
            .filter(posts::Column::Slug.eq(slug)) // 封装了过滤逻辑
            .one(&self.db)
            .await
    }
    
    /// 分页获取已发布文章
    /// 
    /// 返回元组：(数据列表, 总条数)
    pub async fn find_published_paginated(
        &self, 
        page: u64, 
        size: u64
    ) -> Result<(Vec<posts::Model>, u64), DbErr> {
        let paginator = Posts::find()
            .filter(posts::Column::Status.eq("published")) // 只有这里知道什么叫"已发布"
            .order_by_desc(posts::Column::PublishedAt)     // 封装排序逻辑
            .paginate(&self.db, size);

        let total = paginator.num_items().await?;
        let items = paginator.fetch_page(page - 1).await?;

        Ok((items, total))
    }
}
```

### 3. 封装写入逻辑 (Write)

写入操作接收 `ActiveModel`，这样 Service 层可以灵活控制要更新哪些字段，而 Repository 只负责“落库”。

```rust
impl PostsRepository {
    /// 创建文章
    pub async fn create(&self, post: posts::ActiveModel) -> Result<posts::Model, DbErr> {
        // 在这里，将来还可以统一加上 .insert(Log) 等审计操作
        post.insert(&self.db).await
    }

    /// 更新文章
    pub async fn update(&self, post: posts::ActiveModel) -> Result<posts::Model, DbErr> {
        post.update(&self.db).await
    }

    /// 硬删除
    pub async fn delete(&self, id: i64) -> Result<DeleteResult, DbErr> {
        Posts::delete_by_id(id).exec(&self.db).await
    }
}
```

---

## 🧐 深度思考：为什么不返回 DTO？

你可能注意到了，我的 Repository 返回的是 `Result<posts::Model, DbErr>`，也就是数据库原本的实体，而不是前端需要的 `PostDto`。

这是一个架构原则：**Repository 层只负责数据访问，不负责业务转换。**

*   **Repository 层**：返回“数据库里长什么样”。
*   **Service 层**：负责把“数据库的样子”拼装、剪裁成“业务需要的样子”（DTO）。

如果 Repository 直接返回 DTO，那么这层代码就和 UI 逻辑耦合了，一旦前端页面改版不需要某个字段，你还得改到底层数据库查询，这显然是不合理的。

---

## 🎯 接下来要做什么？

现在我们拥有了干净、语义化的 **Repository 层**，可以在这里自如地操作数据库了。

可以前往 [YukiLog Backend Repository](https://github.com/Yueosa/YukiLog/tree/main/yukilog-backend/src/infra/repository) 查看完整的代码实现。

下一篇，我们将进入逻辑的核心领域：**Service 层**。不仅是简单的 CRUD，我们要处理复杂的业务，比如：
*   “发布文章时，自动更新分类下的文章计数”
*   “更新 Slug 时，检查是否与现有的冲突”

让我们继续向上搭建！
