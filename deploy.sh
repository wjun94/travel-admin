#!/usr/bin/env bash
set -euo pipefail

# travel-admin 前端一键部署脚本
# 用法: ./deploy.sh
# 构建 dist 并部署到线上目录 /var/www/travel-admin（nginx 容器只读挂载，替换文件后即时生效）

TARGET=/var/www/travel-admin
DIST_DIR=dist

cd "$(dirname "$0")"

echo "==> [1/3] 安装依赖"
if [ ! -d node_modules ]; then
  npm install
else
  echo "    node_modules 已存在，跳过安装"
fi

echo "==> [2/3] 构建前端"
npm run build

if [ ! -f "${DIST_DIR}/index.html" ]; then
  echo "!! 构建产物缺少 index.html，部署中止" >&2
  exit 1
fi

echo "==> [3/3] 部署到 ${TARGET}"
mkdir -p "${TARGET}"
rsync -a --delete "${DIST_DIR}/" "${TARGET}/"

echo "==> 部署完成: https://cnicu.top/admin/"
