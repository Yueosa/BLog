---
title: YukiLog - 04
subTitle: Rust 环境搭建与 Web 实战
date: 2026-01-23
updated: 2026-01-23
cover: /cover/bapln.jpg
toc: true
categories:
  - 博客搭建
tags:
  - blog
  - Rust
  - Axum
---

## 📚 引言

本篇将会带你完成从“安装工具链”到“跑通 Web 服务”的全过程

不用担心那些复杂的语法，我们的目标是：**先跑起来，再理解它**

---

## 🛠️ 第一步：安装 Rust 环境

Rust 的安装程序叫 `rustup`，它不仅会安装编译器（rustc），还会带上超好用的包管理器 `cargo`

### 1. 各平台安装命令

* **macOS / Linux / WSL (推荐):**
    ```shell
    curl --proto '=https' --tlsv1.2 -sSf [https://sh.rustup.rs](https://sh.rustup.rs) | sh
    ```
* **Windows:** 下载官方 [rustup-init.exe](https://rustup.rs/), 建议勾选安装 C++ 生成工具
* **Android (Termux):**

    ```shell
    pkg update && pkg install rust
    ```

### 2. 验证安装
安装完成后，新开一个终端输入：

```shell
cargo -V
```

看到版本号（如 `cargo 1.8x.x`），就说明你的“劳模”助手 `cargo` 已经就绪了!

---

## 📝 第二步：5 分钟起一个 Web 服务 (Axum)

> 或者你也可以直接克隆源代码 [Yueosa的Github](https://github.com/Yueosa/Rust-Axum-Web-Backend)

现在，我们要跨入 Web 后端的大门了

1. **配置积木 (Cargo.toml)**

修改项目根目录下的 `Cargo.toml`

我们需要引入 `Axum` 框架和 `Tokio` 异步引擎：

```toml
[package]
name = "demo"
version = "0.1.0"
edition = "2021"

[dependencies]
# axum 是我们要用的 Web 框架
axum = "0.7" 
# tokio 是异步运行时，它让程序能同时处理很多个请求
tokio = { version = "1", features = ["full"] }
```

2. **编写 Web 代码 (main.rs)**

将 `src/main.rs` 彻底替换为以下代码：

```rust
use axum::{Router, extract::RawQuery, response::IntoResponse, routing::get};
use tokio::net::TcpListener;

// 【宏：#[tokio::main]】
// 这不是魔法，而是一个“幕后导演”。
// 标准的 main 函数必须是同步的，无法执行 async 代码。
// 这个宏会在编译时把你的代码包装在一个启动了 Tokio 运行时（Runtime）的真入口函数里。
// 运行时负责调度任务、处理 I/O，让你的程序能高效处理并发。
#[tokio::main]
async fn main() {
    // 1. 定义“路由”：当用户访问哪个 URL 时，交给哪个函数处理
    let app = Router::new()
        .route("/ping", get(ping))   // 访问 /ping 走 ping 函数
        .route("/check", get(check)); // 访问 /check 走 check 函数

    // 2. 绑定端口：在本地 3000 端口开张
    let listener = TcpListener::bind("127.0.0.1:3000").await.unwrap();

    println!("🐱 喵！服务启动啦：[http://127.0.0.1:3000](http://127.0.0.1:3000)");

    // 3. 正式运行服务
    axum::serve(listener, app).await.unwrap();
}

// 最简单的返回：直接回一个字符串
async fn ping() -> String {
    "pong".to_string()
}

// 稍微复杂的返回：根据 URL 问号后面的参数给不同的反应
// RawQuery(query) 是“提取器”，能把 URL 里的 ?0516 提取出来
async fn check(RawQuery(query): RawQuery) -> impl IntoResponse {
    let correct_id = "0516";

    // 使用 match 优雅地处理用户传没传参数
    match query {
        // 情况 A：传了，且正好等于 0516
        Some(id) if id == correct_id => "✅ ID 正确喵！欢迎你～".to_string(),
        // 情况 B：传了，但不对
        Some(id) => format!("❌ ID 错误喵！你输入的是 {}", id),
        // 情况 C：压根没传
        None => "⚠️ 你什么都没传喵！用 /check?0516 试试～".to_string(),
    }
}
```

3. **运行并测试**

在终端运行:

```shell
cargo run
```

打开浏览器, 亲自测试你的成果:
- **基础测试:** [http://127.0.0.1:3000/ping](http://127.0.0.1:3000/ping)
- **挑战失败:** [http://127.0.0.1:3000/check](http://127.0.0.1:3000/check)
- **挑战成功:** [http://127.0.0.1:3000/check?0516](http://127.0.0.1:3000/check?0516)

---

## 💡 小恋的提示：透过现象看本质

刚才的代码里有很多新概念，我们不仅要会用，还要知道它们为什么存在：

### 1. 异步 (`async/.await`)：不是“等快递”，是“协作”
很多人把异步比作“等快递”，这只描述了结果。
**底层逻辑：** 这里的核心是 **协作式多任务 (Cooperative Multitasking)**。
当 CPU 执行到 `.await` 时，意味着当前任务遇到阻塞（比如网络 I/O）。此时，任务不会干等，而是**主动让出 (Yield)** CPU 的使用权。
**比喻：** 就像**“自助餐厅的厨师”**。在等待面条煮开（I/O 操作）的 3 分钟里，他不会盯着锅发呆，而是转头去切菜或给下一位顾客打饭（处理其他请求）。等水开了（数据准备好了），他再切换回来捞面。这就是 Web 服务能抗住高并发的秘密——永远不让 CPU 闲着。

### 2. `unwrap()`：开发者的契约
**底层逻辑：** Rust 的类型系统强迫我们处理所有可能的 `Option` (空值) 或 `Result` (错误)。
当我们调用 `unwrap()` 时，实际上是在跟编译器签署一份**“霸王条款”**：“我向你保证，这里一定有值。如果运行时候发现并没有（出错了），请立刻让程序崩溃 (Panic) 并打印堆栈信息。”
**场景：** 在 `main` 函数启动时，如果端口被占用，我们确实希望程序直接崩溃报错，而不是带着病运行。但在业务逻辑中，请尽量少用它。

当你亲手跑起这个 Web 服务时，你已经跨过了 Rust 最难的“入门墙”。

---

## 🎯 接下来要做什么？

既然已经会写简单的 Web 接口了，那我们要怎么把第二篇设计的 PostgreSQL 数据库 给连上呢？

下一篇：**《YukiLog - 05：ORM 魔法——用 SeaORM 让数据库说话》**

我们将把 SQL 转换成 Rust 的“实体”，实现真正的增删改查！
