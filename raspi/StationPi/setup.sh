#!/bin/bash

#date setting
date --set @`wget -q https://ntp-a1.nict.go.jp/cgi-bin/jst -O - | sed -n 4p | cut -d. -f1`
#cron setting
cat << EOF > /etc/cron.d/myscript
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/bin:/usr/bin
HOME=/

@reboot root date --set @`wget -q https://ntp-a1.nict.go.jp/cgi-bin/jst -O - | sed -n 4p | cut -d. -f1`
EOF
#proxy setting
cat << EOF > /etc/profile.d/proxy.sh
export http_proxy=http://192.168.10.120:8080
export https_proxy=$http_proxy
export no_proxy=192.168.11.0/24
EOF

#pakage install
apt install isc-dhcp-server dnsmasq -y

# DHCP Server config
sed -ie 's/option domain-name "example.org";/#option domain-name "example.org";/' /etc/dhcp/dhcpd.conf
sed -ie 's/option domain-name-servers ns1.example.org, ns2.example.org;/#option domain-name-servers ns1.example.org, ns2.example.org;/' /etc/dhcp/dhcpd.conf
sed -ie 's/#authoritative/authoritative/' /etc/dhcp/dhcpd.conf
cat << EOF >> /etc/dhcp/dhcpd.conf
subnet 114.51.4.0 netmask 255.255.255.0 {
  range 114.51.4.2 114.51.4.199;
  option domain-name-servers 114.51.4.1;
  option broadcast-address 114.51.4.255;
}
EOF

# DHCP Server NIC config
sed -ie 's/v4="";/v4="eth0";/' /etc/default/isc-dhcp-server
sed -ie 's/INTERFACESv6;/#INTERFACESv6;/' /etc/default/isc-dhcp-server

# StaticIP setting
cat << EOF >> /etc/dhcpcd.conf
interface eth0
static ip_address=114.51.4.1/24
static domain_name_servers=114.51.4.1
EOF

#DHCP 10秒遅延起動
sed -ie '/touch/a\\tsleep 10' /etc/init.d/isc-dhcp-server

#/etc/hostsにplc追加
echo "114.51.4.254    plc" >> /etc/hosts

systemctl enable isc-dhcp-server
reboot now