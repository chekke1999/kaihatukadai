#!/bin/bash
cat << EOF > /etc/profile.d/proxy.sh
export http_proxy="http://192.168.10.120:8080/"
export HTTP_PROXY=$http_proxy
export https_proxy=$http_proxy
export HTTPS_PROXY=$http_proxy
export ftp_proxy=$http_proxy
export FTP_PROXY=$http_proxy 
export rsync_proxy=$http_proxy
export RSYNC_PROXY=$http_proxy
export no_proxy="192.168.11.0/24"
EOF

source /etc/profile.d/proxy.sh

hwclock -s --localtime
timedatectl set-local-rtc true

pacman-mirrors --fasttrack && pacman -Syy
sudo pacman -Syu
pacman -S docker docker-compose
systemctl enable sshd
systemctl start sshd
systemctl enable docker
systemctl start docker
docker-compose up -d
