#!/bin/bash
#PLC側ネットワークのホスト部のIP
num = $1
if expr "$num" : "[0-9]*$" >&/dev/null; then
    echo "number:$num"
else
    read -p "PLC側ネットワークのホスト部の(IPを指定1~84の範囲):" num
    if expr "$num" : "[0-9]*$" >&/dev/null; then
        echo "number:$num"
    else
        echo "not number"
        exit
    fi
fi
if [ $num -ge 84 ] && [ $num -gt 0 ]; then
    echo "128>num>0の範囲で設定してください"
    exit
fi

#raspiconfig
raspi-config nonint do_serial 0
raspi-config nonint do_i2c 0
raspi-config nonint do_ssh 0
raspi-config nonint do_wifi_country JP
raspi-config nonint do_change_timezone Asia/Tokyo

#wifi setup
cat << EOF >> /etc/wpa_supplicant/wpa_supplicant.conf
network={
    ssid="Buffalo-G-5310"
    psk="bananabanana"
    key_mgmt=WPA-PSK
}
EOF
dhclient -r wlan0
systemctl daemon-reload
ifconfig wlan0 down
ifconfig wlan0 up
systemctl restart dhcpcd
dhclient -v wlan0

#proxy setting
cat << EOF > /etc/profile.d/proxy.sh
export http_proxy=http://192.168.10.120:8080
export https_proxy=http://192.168.10.120:8080
export no_proxy=192.168.11.0/24
EOF
source /etc/profile.d/proxy.sh

#date setting
sed -ie 's/#NTP=/NTP=192.168.10.110/' /etc/systemd/timesyncd.conf
timedatectl set-ntp true
systemctl daemon-reload
systemctl restart systemd-timesyncd.service

#pakage install
apt install isc-dhcp-server dnsmasq -y

# DHCP Server config
sed -ie 's/option domain-name "example.org";/#option domain-name "example.org";/' /etc/dhcp/dhcpd.conf
sed -ie 's/option domain-name-servers ns1.example.org, ns2.example.org;/#option domain-name-servers ns1.example.org, ns2.example.org;/' /etc/dhcp/dhcpd.conf
sed -ie 's/#authoritative;/authoritative;/' /etc/dhcp/dhcpd.conf
cat << EOF >> /etc/dhcp/dhcpd.conf
subnet 114.51.4.0 netmask 255.255.255.0 {
  range 114.51.4.2 114.51.4.199;
  option domain-name-servers 114.51.4.1;
  option broadcast-address 114.51.4.255;
}
EOF

# DHCP Server NIC config
sed -ie 's/v4=""/v4="eth0"/' /etc/default/isc-dhcp-server
sed -ie 's/INTERFACESv6/#INTERFACESv6/' /etc/default/isc-dhcp-server

# StaticIP setting
cat << EOF >> /etc/dhcpcd.conf
interface eth0
static ip_address=114.51.4.1/24

interface eth1
static ip_address=192.168.0.${num}/24
EOF

#ルーティング有効
sysctl -w net.ipv4.ip_forward=1
sed -ie 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf

#plcのhost名
plcip=$(($num+84))
echo "192.168.0.${plcip}       plcnet" >> /etc/hosts

#DHCP 10秒遅延起動
sed -ie '/touch/a\\tsleep 10' /etc/init.d/isc-dhcp-server

systemctl enable isc-dhcp-server
reboot now