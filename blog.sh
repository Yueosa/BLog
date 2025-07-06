#!/bin/bash

set -e  # 遇到错误立即退出
set -u  # 使用未定义变量时报错

BLOG_DIR="/root/BLog"
DEPLOY_DIR="/var/www/blog"
BRANCH="main"
NOW=$(date "+%Y-%m-%d %H:%M:%S")

echo "📦 [$NOW] 开始部署 Valaxy 博客..."

# === Step 1: 进入项目目录 ===
if [ ! -d "$BLOG_DIR" ]; then
    echo "❌ 项目目录不存在：$BLOG_DIR"
    exit 1
fi

cd "$BLOG_DIR"
echo "✅ 进入目录：$BLOG_DIR"

# === Step 2: 拉取最新代码 ===
echo "🔄 拉取最新代码分支 [$BRANCH]..."
git pull origin "$BRANCH" || {
    echo "❌ Git 拉取失败！"
    exit 1
}
echo "✅ 代码更新完成"

# === Step 3: 安装依赖 ===
echo "📦 安装依赖..."
pnpm install
echo "✅ 依赖安装完毕"

# === Step 4: 构建项目 ===
echo "🛠️ 构建中..."
pnpm build
echo "✅ 构建完成"

# === Step 5: 清空旧文件并部署 ===
echo "🧹 清理旧站点文件..."
rm -rf "$DEPLOY_DIR"/*
echo "📁 拷贝新构建文件到部署目录..."
cp -r dist/* "$DEPLOY_DIR"/
echo "✅ 文件部署完成"

# === Step 6: 重载 nginx ===
echo "🔁 重新加载 nginx..."
systemctl reload nginx
echo "✅ Nginx 重载完毕"

echo "🎉 [$NOW] 博客部署完成！访问地址: https://blog.yeastar.xin"

