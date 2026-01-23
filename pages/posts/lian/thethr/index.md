---
title: YukiLog - 03
subTitle: Rust语法入门
date: 2026-01-23
updated: 2025-01-23
cover: /cover/bapln.jpg
toc: true
categories:
  - 博客搭建
tags:
  - blog
  - Rust
---

## | 引言

本篇不打算带你背厚厚的语法书

既然我们的目标是 `SeaORM` 和 `Axum`，那我们就只捞那些**在 Web 后端开发中天天打交道**的语法干货

在 `Rust` 的世界里，编译器就像是一个严厉但专业的导师：它会强迫你在写代码时就想清楚所有的“意外情况”

这是 `Rust` 的核心哲学: **“如果程序能通过编译，它通常就能正常运行”**

---

## | 必须学会的最小语法合集

#### (1) 变量 & 可变性：默认即安全

默认变量不可变（Immutable）

在 Web 开发中，大部分配置信息、数据库连接池都是不可变的

只有当你确实需要修改数据时（比如构造 SQL 查询条件），才使用 `mut`

```rust
let age = 18;          // 默认不可变
let mut count = 0;     // 使用 mut 声明可变性
count += 1;
```

#### (2) 函数：语句 vs 表达式

Rust 是一门 **基于表达式 (Expression-based)** 的语言。这不仅是“省个分号”那么简单，而是核心逻辑的区别：

*   **语句 (Statement):** 执行一个动作，不返回值（或者说返回空元组 `()`）。例如 `let x = 1;` 后面必须加分号。
*   **表达式 (Expression):** 计算并产出一个值。

函数体的最后一行如果不加分号，它就是一个表达式，其计算结果会自动作为函数的返回值抛出。

```rust
fn get_version() -> String {
    "v1.0.0".to_string() // 这是一个表达式，它的值就是函数的返回值
}
```

#### (3) 结构体 (Structs)：数据的蓝图

Struct 本质上是定义数据在 **内存中的布局 (Memory Layout)**。它将相关的字段打包在一起。

至于“变成 JSON”，那不是 Struct 原生的能力，而是我们通过 **Trait (特质/接口)** 赋予它的额外技能。

```rust
// #[derive(Serialize)] 是在告诉编译器：
// "请自动帮我实现把这个内存结构转换成 JSON 字符串的代码"
#[derive(Serialize)] 
struct Post {
    id: i64,
    title: String,
    is_published: bool,
}
```

#### (4) 类型系统下的错误处理：Option & Result

Rust 没有 `null`，也没有 `try-catch`。它选择将“错误”和“空值”显式地编码到 **类型系统** 中。

这迫使你在 **编译阶段** 就必须处理所有可能的意外，而不是等到程序跑起来了才报错（Runtime Error）。

#### Option：显式处理“空值”

```rust
let user_avatar: Option<String> = Some("https://...".to_string());

// 使用 match 强制你处理 None 的情况，再也不会有 "undefined is not a function"
match user_avatar {
    Some(url) => println!("头像地址: {}", url),
    None => println!("该用户没有设置头像"),
}
```

#### Result：处理“错”的情况 数据库操作、网络请求... 这些可能失败的操作都会返回 Result

```rust
// 返回值要么是 Ok(数据)，要么是 Err(错误说明)
fn find_user(id: i32) -> Result<User, String> {
    if id == 721 {
        Ok(User { id, name: "小恋".into() })
    } else {
        Err("用户不存在喵".into())
    }
}
```

---

## 🎯 接下来要做什么？

如果你觉得上面的语法还是有点抽象，别担心，**实践是掌握 Rust 的唯一捷径**

下一篇预告：**《YukiLog - 04: 工欲善其事，必先利其器》** 我们将正式进入实战阶段：

1. **安装 Rust 工具链:** 认识你的新伙伴 `cargo`
2. **Hello World 2.0:** 不仅是打印文字，我们要直接起一个最小化的 `Axum` 服务
3. **路由初探:** 让你的浏览器通过 URL 访问到你的 `Rust` 程序

敬请期待！
