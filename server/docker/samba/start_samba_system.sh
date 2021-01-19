#!/bin/ash

# Create an account
adduser -D $USERNAME
echo $USERNAME':'$PASSWD | chpasswd
echo -e $PASSWD'\n'$PASSWD | pdbedit -a -u $USERNAME

# Start daemons
nmbd restart -D
smbd restart -FS </dev/null
