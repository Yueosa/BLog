---
title: 网络赛项学习笔记
subtitle: Linux系统运维
date: 2025-09-15
updated: 2025-09-22
cover: /cover/kmyz/cover-wlsx.jpg
toc: true
password: kmyz-wlsx
categories:
  - 学习笔记
  - 网络管理
tags:
  - 计算机网络
  - Linux 
---

# 练习笔记

## | 网卡信息

| 设备 | 网卡 | 地址 |
|-|-|-|
| ISPSRV | ens33 | 81.6.63.128 |
| APPSrv | ens33 | 192.168.100.128 |
| STOPRAGFSRV | ens33 | 192.168.100.129 |
| ROUTERSRV | ens33 | 192.168.100.130 |
| INSIDECLI | ens33 | 192.168.0.128 |
| OUTSIDECLI | ens33 | 81.6.63.129 |

## | Linux 运维

#### |-> 开启SSH功能 (可选)

```ini
# vim /etc/ssh/sshd_config
Port 22
PermitRootLogin yes
```
> 编辑sshd配置文件, 允许root用户登录, 端口22

```shell
systemctl restart sshd
```
> 重启sshd服务

#### |-> 改主机名, 写登录脚本

```shell
hostnamectl hostname [NAME] # CentOS
hostnamectl set-hostname [NAME] # UOS
```
> 修改主机名称

```bash
# vim /etc/profile.d/login.sh

#!bin/bash

title="ChinaSkills 2025 -CBK"
module="MOdule C Linux"
name=$(hostname)
time=$(date)
# cat /etc/os-release
version="CentOS Stream 10"

echo "*********************************"
echo "${title}"
echo "${module}"
echo ""
echo ">>${name}<<"
echo ">>${verison}<<"
echo ">>${time}<<"
echo "*********************************"
```
> 登录脚本

若开启了`ssh`, 也可以使用 `scp login.sh root@[IP]:/etc/profile.d/` 批量上传脚本到服务器

#### |-> 配置本地源


```shell
mount /dev/sr0 /media/cdrom
```

```ini
# vim /etc/apt/sources.list
deb [trusted=yes] file:///media/cdrom fou main
deb [trustes=yes] file:///mnt/packs ./
```

```ini
# /etc/yum.repos.d/yum.repo
[localrepo]
name=CentOS Local Repo
metalink=file://
gpgcheck=1

[localyum]
name=CentOS Local Yum
metalink=file://
gpgcheck=1
```
