---
title: 基于 Valaxy 的博客搭建
subTitle: 正在更新中
date: 2025-07-08
updated: 2025-07-08
cover: /cover/thestart/cover01.png
categories:
  - 学习
tags:
  - valaxy
  - blog
---

> **一切奇迹的起点**
>
> 那天在 `ArchLinux` 执行 `sudo pacman -Syu` 时出了从来没见过的问题，查资料时点进了一篇博客，被他的风格深深吸引
>
> 我留言感谢，没想到作者真的回复了我，给了建议
>
> 于是，“我也要搭建一个博客” 的想法出生了

本文记录了本人从零认识 `valaxy` 到搭建出个人博客 **[BLog YukiKoi](https://blog.yeastar.xin)** 的所有过程，遇到的问题，以及解决方式

由于本人之前对前端的了解仅限于 `HTML`、`CSS`、 `JavaScript`，对 `vue` 学习尚浅，所以文章中有遗漏，错误的地方欢迎在评论区指出批评

![blog](./blog.png)

> 本博客使用的主题是 `valaxy-theme-sakura`，地址为 [Valaxy Theme Sakura](https://sakura.valaxy.site/)(点击跳转)
>
> `Valaxy` 的其他主题： [Valaxy Themes Gallery](https://valaxy.site/themes/gallery)（点击跳转）

## 🎈 认识 与 安装 `nodejs`、`pnpm`、`valaxy`

在开始搭建博客之前，需要先对使用的工具有所了解：`Node.js`、`pnpm`、`Valaxy`

### 🟢 Node.js

> `Node.js` 是运行 `JavaScript` 的环境，用于在 浏览器 之外 执行 JS 程序

- 它的核心是 `V8引擎`（Google Chrome 也用它来运行 JS）

- 通过 `npm`、`pnpm` 等包管理器可以安装各种开发工具和前端框架

- `Valaxy`、`Vue`、`Vite` 等现代框架都依赖 Node.js 执行

#### 官网地址 [Node.js](https://nodejs.org/)（点击跳转）

安装完成后验证

```bash
node -v # 检查nodejs
npm -v # 检查npm包管理器

```

### 🟡 pnpm

> `pnpm` 是比 `npm`、`yarn` 更快，更节约空间的包管理器

安装 与 检查

```bash
npm install -g pnpm
pnpm -v # 检查pnpm
```

### 🌸 Valaxy

> 下一代静态博客框架

#### 官网地址 [Valaxy](https://valaxy.site/)（点击跳转）

在这里可以查看 Valaxy 相关的配置文档、API、主题、组件库等信息

## 🏗️ `valaxy` 项目初始化 与 主体接入

### 📥 新建项目

完成 `Node.js` 和 `pnpm` 的安装后，就可以开始构建博客项目，Valaxy 提供了非常简单的初始化流程，一条命令就能完成创建

```bash
mkdir my-blog # 创建一个目录来放置博客项目
cd my-blog # 进入目录
pnpm create valaxy # 创建valaxy项目
```

之后会出现一些引导，帮助你初始化项目：

在 `Select a type` 中选择 `Blog`

在 `Choose the agent` 中选择 `pnpm`

```bash
╰─ pnpm create valaxy
.../197e9042afb-d0e9                     |  +28 +++
.../197e9042afb-d0e9                     | Progress: resolved 28, reused 27, downloaded 1, added 28, done

  🌌 Valaxy  v0.23.6

✔ Select a type: › Blog - For Most Users
✔ Project name: … valaxy-blog
  📁 /home/Lian/Documents/my-blog/valaxy-blog

  Scaffolding project in valaxy-blog ...
  Done.

✔ Install and start it now? … yes
✔ Choose the agent › pnpm
```

创建完成后，你应该会看到类似以下输出

```bash
  🌌 Valaxy  v0.23.6

  🪐 theme   > yun (v0.23.6)
  📁 /home/Lian/Documents/my-blog/valaxy-blog

  Preview    > http://localhost:4859/
  Network    > http://192.168.28.131:4859/

  shortcuts  > restart | open | qr | edit
```

访问 `Preview` 或 `Network` 地址，就能在浏览器看到页面了

下次启动时，也只需要来到这个目录下，执行

```bash
pnpm dev
```

### 📚 项目结构介绍

进入 `valaxy-blog`，会看到很多文件，这里简单介绍一下比较基础的部分

![valaxy-blog](./valaxy-blog.png)

> 对于熟悉 `Vue` 的选手来说，应该对这样的结构不陌生

| 路径/文件          | 说明                                                          |
| ------------------ | ------------------------------------------------------------- |
| `valaxy.config.ts` | 🧠 博客的核心配置文件，主题、菜单、组件等都在这里设置         |
| `site.config.ts`   | 🏷️ 存放站点的基础信息，比如站点名称、作者信息等               |
| `pages/`           | 📝 用来写页面的地方，博客文章则存放在其中的 `/pages/posts` 下 |
| `public/`          | 📂 用于放置资源，比如配置网站、文章中引用的图片、视频等       |
| `package.json`     | 📜 项目元信息 + 脚本命令列表。你可以在这里添加插件、定义命令  |

### 🚀 下载主题示例、查看主题文档

#### 以 `valaxy-theme-sakura` 主题为例

安装主题

```bash
pnpm add valaxy-theme-sakura
```

配置项目使用这个主题，编辑 `valaxy.config.ts`：

```ts
import { defineValaxyConfig } from "valaxy";

export default defineValaxyConfig({
  theme: "sakura", // ✅ 使用 sakura 主题
});
```

> 修改或新建 `theme` 参数，将值设置为主题名就行

再次运行项目就能看到主题变化

```bash
pnpm dev
```

> 如果没有对应主题页面，可以尝试在 f12 中停用缓存，或者直接使用无痕窗口打开

#### 前往 `github` 下载该主题的示例作为参考

| 正在施工

## 配置 BLog

### `valaxy.config.ts` 配置

| 正在施工

#### 电脑端菜单 `navbar`

| 正在施工

#### 手机端侧边栏 `sidebar`

| 正在施工

#### `Waline` 评论区 配置

| 正在施工

#### `Meting` 网易云歌单 接入

| 正在施工

#### `Bangumi` BiliBili 番剧列表 获取

| 正在施工

### `site-config` 配置

| 正在施工

### `/pages/posts` 简单说明

| 正在施工

### 基于 `VPS` 的 部署方案

| 正在施工

---
