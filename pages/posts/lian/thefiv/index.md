---
title: YukiLog - 05
subTitle: Entity Generation
date: 2026-01-23
updated: 2026-01-23
cover: /cover/bapln.jpg
toc: true
categories:
  - 博客搭建
tags:
  - blog
  - Rust
  - SeaORM
---

## 引言

我们在 `YukiLog - 02` 中已经建好了数据库表

现在的目标是把这些 SQL 表变成 `Rust` 能看懂的 "**结构体 (Struct)**"

这就是所谓的 **Entity Generation**

---

