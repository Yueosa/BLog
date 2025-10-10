---
title: 网络赛项学习笔记
subtitle: Linux系统运维
date: 2025-09-15
updated: 2025-09-22
cover: /cover/kmyz/cover-wlsx.jpg
toc: true
password: kmyz-wlsx
categories:
  - 学习
  - 网络管理
tags:
  - 计算机网络
  - Linux
---

## | 网卡信息

| 设备        | 网卡  | 地址            |
| ----------- | ----- | --------------- |
| ISPSRV      | ens33 | 81.6.63.128     |
| APPSrv      | ens33 | 192.168.100.128 |
| STOPRAGFSRV | ens33 | 192.168.100.129 |
| ROUTERSRV   | ens33 | 192.168.100.130 |
| INSIDECLI   | ens33 | 192.168.0.128   |
| OUTSIDECLI  | ens33 | 81.6.63.129     |

# | Linux 运维

### | 前期准备 |

#### |-> 开启 SSH 功能 (可选)

> 编辑 sshd 配置文件, 允许 root 用户登录, 端口 22

```ini
# vim /etc/ssh/sshd_config
Port 22
PermitRootLogin yes
PrintLastLog no # 关闭ssh日志 (可选)
```

> 重启 sshd 服务

```shell
systemctl restart sshd
```

#### |-> 改主机名, 写登录脚本

> 修改主机名称

```shell
hostnamectl hostname [NAME] # CentOS
hostnamectl set-hostname [NAME] # UOS
```

> 登录脚本

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

若开启了`ssh`, 也可以使用 `scp login.sh root@[IP]:/etc/profile.d/` 批量上传脚本到服务器

#### |-> 修改时区

```shell
timedatectl list-timezones | grep Asia/Shanghai # 检查系统是否有 Asia/Shanghai 时区
timedatectl set-timezone Asia/Shanghai # 将时区设置为 Asia/Shanghai
timedatectl | grep "Time zone" # 显示当前时区
```

#### |-> 配置本地 DNS

```bash
# vim /etc/hosts
IP 完全限定域名 主机名
```

#### |-> 关闭防火墙与 SELinux

```shell
sudo systemctl stop firewalld && sudo systemctl disable firewalld
# sudo vi /etc/selinux/config
SELINUX=disabled
```

#### |-> 配置本地源

> 若有 ISO 挂载

```shell
mkdir /media/cdrom
mount /dev/sr0 /media/cdrom
```

> apt 包管理器

```ini
# vim /etc/apt/sources.list
deb [trusted=yes] file:///media/cdrom fou main
deb [trustes=yes] file:///mnt/packs ./
```

> apt 更新缓存

```shell
apt clean
apt update
```

> yum 包管理器

```ini
# /etc/yum.repos.d/yum.repo
[localrepo]
name=CentOS Local Repo
metalink=file:///media/cdrom
enabled=1
gpgcheck=0

[localyum]
name=CentOS Local Yum
metalink=file:///mnt
enabled=1
gpgcheck=0
```

> yum 更新缓存

```shell
yum clean all
yum makecache
```

## | 服务部署 |

#### [ ISP ]-> DHCP

> 安装 DHCP 服务包

```shell
apt-get install -y isc-dhcp-server
```

> 配置监听网卡

```ini
# vim /etc/default/isc-dhcp-server
INTERFACESv4="ens33"
```

> 配置 DHCP 基本信息

```ini
# vim /etc/dhcp/dhcpd.conf
subnet 81.6.63.0 netmask 255.255.255.0 {
  range 81.6.63.110 81.6.63.190;
  option domain-name-servers 81.6.63.100;
  option domain-name "chinaskills.cn";
  default-lease-time 600;
  max-lease-time 7200
}
```

---

# | 锐捷设备配置命令

## 比赛要求

#### 基础网络配置

1. 根据要求完成网络设备名称、接口、远程登陆等配置；
2. 根据要求完成设备软件版本更新，设备密码恢复等；
3. 完成网络测试和验证

#### 有线网络配置

1. 按照需求配置 VLAN、生成树、端口安全等；
2. 按照需求配置 DHCP 服务、DHCP 中继与 DHCP 防御等 ；
3. 按照网络规划配置静态、RIP、OSPF、BGP 等路由技术；
4. 按照需求配置 IPv� 地址、IPv� 路由及各种隧道；
5. 按照需求配置链路聚合、DLDP、设备虚拟化、MSTP+VRRP 等；
6. 按照需求配置 L�MPLS，L�MPLS 等 VPN 技术；
7. 按照数据分流需求配置策略路由、路由策略等

#### 无线网络配置

1. 完成无线网络规划、设计 AP 点位图、输出热图；
2. 按照需求配置 SSID、转发模式、冗余模式等；
3. 按照需求配置 AP 隔离、流量限制、身份认证等

#### 出口网络配置

1. 按照需求配置网络地址转换；
2. 按照需求配置出口认证、流量控制等；
3. 按照需求配置 L�TP、GRE、IPsec 等技术
