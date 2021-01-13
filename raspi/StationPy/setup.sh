#!/bin/bash

cat << EOF > /etc/environment
export http_proxy="http://192.168.10.120:8080"
export https_proxy="https://192.168.10.120:8080"
export ftp_proxy="ftp://192.168.10.120:8080"
export no_proxy="192.168.11.0/24,localhost,127.0.0.1"
export HTTP_PROXY=$http_proxy
export HTTPS_PROXY=$https_proxy
export FTP_PROXY=$ftp_proxy
export NO_PROXY=$no_proxy
EOF

source /etc/environment

apt update;apt upgrade -y
apt install ibus-mozc chromium-l10n isc-dhcp-server -y

cat <<EOF > /etc/cron.d/myscript
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/bin:/usr/bin
HOME=/

@reboot root date --set @`wget -q https://ntp-a1.nict.go.jp/cgi-bin/jst -O - | sed -n 4p | cut -d. -f1`
EOF

sed -e 's/option domain-name/#option domain-name/' /etc/dhcp/dhcpd.conf
sed -e 's/option domain-name-servers/#option domain-name-servers/' /etc/dhcp/dhcpd.conf
sed -e 's/#authoritative/authoritative/' /etc/dhcp/dhcpd.conf
cat << EOF >>isc /etc/dhcp/dhcpd.conf
subnet 192.168.100.0 netmask 255.255.255.0 {
 range 192.168.100.2 192.168.100.10;
 option routers 192.168.100.1;
 option domain-name-servers 192.168.100.1;
 option broadcast-address 192.168.100.255;
 ignore declines;
}
EOF