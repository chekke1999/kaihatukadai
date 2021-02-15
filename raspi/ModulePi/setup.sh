#!/usr/bin/env bash
#raspiconfig
raspi-config nonint do_serial 0
raspi-config nonint do_i2c 0
raspi-config nonint do_ssh 0
raspi-config nonint do_wifi_country JP
raspi-config nonint do_change_timezone Asia/Tokyo

#シリアルポートを占有してるbluetooth無効か
echo "dtoverlay=disable-bt" >> /boot/config.txt

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

#static route
cat << EOF > /lib/dhcpcd/dhcpcd-hooks/40-route
ip route add 192.168.0.0/24 via 114.51.4.1 dev eth0 proto static
EOF

# pakage install
apt-get update;sudo apt-get upgrade -y
apt install -y python3-pip

#pip install
pip3 install websockets numpy scapy[basic] wiringpi netifaces

if [ $1 = "-incv2" ]; then
    #pakage install
    apt-get install -y \
        build-essential cmake git unzip pkg-config \
        libjpeg-dev libpng-dev \
        libavcodec-dev libavformat-dev libswscale-dev \
        libgtk2.0-dev libcanberra-gtk* libgtk-3-dev \
        libxvidcore-dev libx264-dev \
        python3-dev python3-numpy python3-pip \
        libtbb2 libtbb-dev libdc1394-22-dev \
        libv4l-dev v4l-utils \
        libopenblas-dev libatlas-base-dev libblas-dev \
        liblapack-dev gfortran libhdf5-dev \
        libprotobuf-dev libgoogle-glog-dev libgflags-dev \
        protobuf-compiler \
    # opencv build
    mkdir cv2; cd cv2
    wget -O opencv.zip https://github.com/opencv/opencv/archive/4.3.0.zip
    wget -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/4.3.0.zip

    unzip opencv.zip
    unzip opencv_contrib.zip

    mv opencv-4.3.0 opencv
    mv opencv_contrib-4.3.0 opencv_contrib
    cd opencv
    mkdir build
    cd build

    cmake -D CMAKE_BUILD_TYPE=RELEASE \
        -D CMAKE_INSTALL_PREFIX=/usr/local \
        -D OPENCV_EXTRA_MODULES_PATH=../opencv_contrib/modules \
        -D ENABLE_NEON=ON \
        -D WITH_FFMPEG=ON \
        -D WITH_TBB=ON \
        -D BUILD_TBB=ON \
        -D BUILD_TESTS=OFF \
        -D WITH_EIGEN=OFF \
        -D WITH_V4L=ON \
        -D WITH_LIBV4L=ON \
        -D WITH_VTK=OFF \
        -D WITH_QT=OFF \
        -D OPENCV_ENABLE_NONFREE=ON \
        -D INSTALL_C_EXAMPLES=OFF \
        -D INSTALL_PYTHON_EXAMPLES=OFF \
        -D BUILD_NEW_PYTHON_SUPPORT=ON \
        -D BUILD_opencv_python3=TRUE \
        -D OPENCV_GENERATE_PKGCONFIG=ON \
        -D BUILD_EXAMPLES=OFF ..
    make -j4
    sudo make install
    sudo ldconfig
    # cleaning (frees 300 KB)
    make clean
    sudo apt update
    #end opencv build
fi
exit

