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

赶时间小技巧

```shell
# 安装服务快速启动并且开机自启的方法, 以nginx为例
yum install nginx -y && systemctl start --now && systemctl status nginx
```

### | 前期准备 |

#### |-> 开启 SSH 功能 (可选)

> 编辑 sshd 配置文件, 允许 root 用户登录, 端口 22

```ini
# vim /etc/ssh/sshd_config
Port 22 # 端口号
PermitRootLogin yes
PrintLastLog no # 关闭ssh日志 (可选)
MaxAuthTries 3 # 最大尝试数
AllowUsers user01 # 允许用户
LoginGraceTIme 1m # 超时时间

# 日志配置
SyslogFacility local0

# vim /etc/rsyslog

local0.* /var/log/ssh.log

# vim /etc/hosts.allow
sshd: insideCli #允许登录
# vim /etc/hosts.deny
sshd: ALL #禁止登录
```

> 重启 sshd 服务

```shell
systemctl restart sshd && systemctl restart rsyslog
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

# setenforce 0
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
baseurl=file:///media/cdrom
enabled=1
gpgcheck=0

[localyum]
name=CentOS Local Yum
baseurl=file:///mnt
enabled=1
gpgcheck=0

echo "/dev/sr0 /mnt iso9660 defaults 0 0" >> /etc/fstab # 永久挂载
mount -a
```

> yum 更新缓存

```shell
yum clean all
yum makecache
```

## | 服务部署 |

#### |-> DHCP SERVER

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

# 为特定设备指定IP地址
host insidecli {
  hardware ethernet [MAC];
  fixed-address [IP];
}
```

> 重启服务

```shell
systemctl restart isc-dhcp-server
```

#### |-> DHCP RELAY

```shell
apt install isc-dhcp-relay

vim /etc/default/isc-dhcp-relay

# dhcrelay 192.168.100.100

SERVERS = "dhcp-server-ip"
INTERFACES="代理网卡, 空格分割"
```

#### | -> Disk

```shell
lsblk -l # 查看

apt-get install mdadm -y # 安装mdadm服务

mdadm -C -n 3 -l 5 -a yes -x 1 /dev/md0 /dev/sd{b,c,d,e} # 进行配置
```

#### | -> DNS

主从 DNS(必有) + CHROOT(可能) + 根域

Server01
```shell
yum -y install bind bind-utils

# vim etc/named.conf
127.0.0.1/localhost >> any

forwarders {ip;}; # 向更高层转发
dnssec-* no

systemctl restart named

# vim etc/named.efc1912.zones
Zone "域" IN {
  type master;
  file "1";
  allow-update { none; };
}

反向解析
Zone "反网络号.in-addr-arpa" IN {
  type master;
  file "2";
  allow-update { none; };
}

cd /var/named
cp -a named.loop* 2
cp -a named.local* 1

# vim 1
serial 0 > 2

www A ip

# vim 2
201/254 PTR 域名

named-checkconf -z
systemctl restart named

# 地址解析
nslookup www.sdskills.net
```

---

# | 锐捷设备配置命令

## 基础网络配置

1. 根据要求完成网络设备名称、接口、远程登陆等配置；
2. 根据要求完成设备软件版本更新，设备密码恢复等；
3. 完成网络测试和验证

## 有线网络配置

1. 按照需求配置 VLAN、生成树、端口安全等；
2. 按照需求配置 DHCP 服务、DHCP 中继与 DHCP 防御等 ；
3. 按照网络规划配置静态、RIP、OSPF、BGP 等路由技术；
4. 按照需求配置 IPv6 地址、IPv6 路由及各种隧道；
5. 按照需求配置链路聚合、DLDP、设备虚拟化、MSTP+VRRP 等；
6. 按照数据分流需求配置策略路由、路由策略等

> 配置命令示例

#### |-> 基础配置

**VLAN**

```bash
# 创建VLAN
vlan [NUMBER]
  name [NAME]

# 配置VLAN接口
interface vlan [NUMBER]
  ip address [IP] [MASK]
  ipv6 enable
  ipv6 address [IP]/[MASK]
  exit
```

**SSH**

```bash
# 启用ssh服务
enable service ssh-server
ip ssh version 2

# 创建用户和密码
username [NAME] privilege 15 password [LOGIN_PASSWORD]
enable password [ENABLE_PASSWORD]

# 配置vty线路
line vty 0 4
  transport input ssh
  login local
  exit

# 生成rsa密钥
crypto key generate rsa
  2048
```

**SNMPv3**

```bash
# 启用snmp服务
enable service snmp-agent

# 创建snmp组和用户
snmp-server group test v3 priv read default write default
snmp-server user Admin!@# test v3 auth sha Test!@# priv aes128 Test\$#@!

# 配置trap目标
snmp-server host [IP] traps version 3 priv Admin!@#
snmp-server enable traps
```

#### |-> 有线网络配置

**静态路由**

```bash
# 默认路由
ip route 0.0.0.0 0.0.0.0 [下一跳地址]

# 静态路由
ip route [目标网络] [子网掩码] [下一跳地址]
ip route [目标网络] [子网掩码] [出接口]

# 浮动静态路由（管理距离）
ip route 0.0.0.0 0.0.0.0 [下一跳地址] 10
```

**RSTP**

```bash
# 启用RSTP模式
spanning-tree mode rstp

# 主根桥
spanning-tree mst 0 priority 0

# 备份根桥
spanning-tree mst 0 priority 0

# 全局启用生成树
spanning-tree
```

**环路检测 端口保护**

```bash
# 配置端口保护
interface [Port]
  sw protected
  #  sw = switchport
  storm-control broadcast level 10
  storm-control action shutdown
  exit

# 启用arp检查
  interface [Port]
  arp-check
  exit
```

**链路聚合**

```bash
# 创建端口组
interface range [Port Group]
  port-group 1 mode active
  exit

# 配置居合接口
interface aggregatePort 1
  sw mode trunk
  sw trunk allowed vlan only [VLAN],[VLAN]
  #  sw = switchport
  exit
```

**DHCP**

```bash
# 启用DHCP服务
service dhcp

# 创建DHCP地址池
ip dhcp pool vlan[NUMBER]
  network [IP] [MASK] # 网络地址
  default-router [DEFAULT_IP] # 网关/起始地址
  dns-server 8.8.8.8
  exit
```

**DHCP**

```bash
# 启用DHCP中继
service dhcp

# 接口配置DHCP中继
interface [接口名称]
 ip helper-address [DHCP服务器地址]

# 全局DHCP中继
ip dhcp relay information option
```

**DHCP安全**

```bash
# 启用
ip dhcp snooping

# 配置信任端口
interface [Port]
  ip dhcp snooping trust
  exit

# 配置非信任端口
interface [Port]
  sw protected
  #  sw = switchport
  ip verify source port-security
  ipv6 verify source port-security
  exit
```

**RIP**

```bash
# 启用RIP
router rip
 version 2
 network [网络地址]
 no auto-summary

# 重分布其他路由
redistribute connected
redistribute static
redistribute ospf [进程号] metric [跳数]
```

**BGP**

```bash
# BGP基本配置
router bgp [AS号]
 bgp router-id [路由器ID]
 neighbor [邻居IP] remote-as [AS号]
 neighbor [邻居IP] update-source [接口]
 
# IPv4地址族
address-family ipv4
 neighbor [邻居IP] activate
 network [网络地址] mask [子网掩码]
 exit-address-family

# VPNv4地址族（MP-BGP）
address-family vpnv4 unicast
 neighbor [邻居IP] activate
 neighbor [邻居IP] send-community extended
 exit-address-family
```

**OSPF**

```bash
# 启用OSPF进程
router ospf 10

# 宣告网络
  network 56.1.1.1 0.0.0.0 area 0
  network 20.10.10.5 0.0.0.0 area 0

# 重分布直连路由
redistribute connected metric-type 1 subnets
 exit
```

**GRE**

```bash
# 创建隧道接口
interface tunnel 0
 ip address 10.5.1.1 255.255.255.0
 tunnel source gigabitEthernet 0/2    # 根据实际接口调整
 tunnel destination 25.1.1.1          # 根据对端地址调整
 tunnel mode gre ip
 exit
```

**路由过滤**

```bash
# 创建前缀列表
ip prefix-list filter seq 5 permit 172.16.0.0/22 le 24
ip prefix-list filter seq 10 permit 20.20.10.0/24

# 应用分布列表
router ospf 12
 distribute-list prefix filter in
 exit
```

**IPv6**

```bash
# 启用IPv6路由
ipv6 unicast-routing

# 配置IPv6地址
interface vlan 20
 ipv6 enable
 ipv6 address 2002:1101:102::254/64
 no ipv6 nd suppress-ra
 exit

# 配置OSPFv3
ipv6 router ospf 11
 router-id 10.10.10.100
 redistribute connected metric-type 1
 exit

interface vlan 20
 ipv6 ospf 11 area 0
 exit
```

#### |-> 关键配置项目

**三层交换机**

```bash
# S1/S2配置示例
interface GigabitEthernet 0/24
 no switchport                    # 启用三层功能
 ip address 10.1.0.1 255.255.255.252
 mpls ip                         # MPLS标签交换

# VRF配置
ip vrf [VRF名称]
 rd [RD值]
 route-target both [RT值]
```

**OSPF多线程**

```bash
# 骨干区域OSPF
router ospf 10
 router-id [路由器ID]
 network [网络] [反掩码] area 0

# VRF OSPF
router ospf [进程号] vrf [VRF名称]
 router-id [路由器ID]
 redistribute bgp subnets
 network [网络] [反掩码] area 0
```

## 无线网络配置

1. 完成无线网络规划、设计 AP 点位图、输出热图；
