#!/bin/bash
cd /root/BLog || exit 1
git pull origin main
pnpm install
pnpm build
sudo rm -rf /var/www/blog/*
sudo cp -r dist/* /var/www/blog/
sudo systemctl reload nginx
