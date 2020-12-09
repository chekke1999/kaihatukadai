#!/bin/bash

#Install Package
apt update -y;apt upgrade -y;apt install nginx
#nginx setting
cp /etc/nginx/sites-available/default;/etc/nginx/sites-available/default.old
