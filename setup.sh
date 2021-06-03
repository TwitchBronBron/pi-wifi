#!/bin/bash
if [ "$(id -u)" != "0" ]; then
	echo "This script must be run as root" 1>&2
	exit 1
fi

password=romantic


#change the default password
echo -e "$password\n$password" | passwd pi

#enable SSH service on startup. 0 means enabled
raspi-config nonint do_ssh 0

#tell the PI what your wifi country code is
raspi-config nonint do_wifi_country US

# expand the root filesystem to fill SD card. This allows you to use your entire SD card
raspi-config nonint do_expand_rootfs

#change the device hostname
printf "pi-wifi" > /etc/hostname
sed -i "s/raspberrypi/pi-wifi/g" /etc/hosts

# install all of the latest updates
apt-get update -y && apt-get upgrade -y && apt-get dist-upgrade -y && apt full-upgrade -y

#force the onboard wireless to be identified as wlan2 (so we can dependably use wlan0 and wlan1 for the usb dongles)
cat > /etc/udev/rules.d/72-static-name.rules <<EOF
ACTION=="add", SUBSYSTEM=="net", DRIVERS=="brcmfmac", NAME="wlan2"
EOF

#force the other two wifi cards to be identified as wlan0 and wlan1
cat > /etc/udev/rules.d/70-persistent-net.rules <<EOF
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="28:f3:66:aa:2c:b3", KERNEL=="wlan*", NAME="wlan0"
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="28:f3:66:aa:1a:7f", KERNEL=="wlan*", NAME="wlan1"
EOF

#Installing samba to use for network shares
apt-get install samba samba-common-bin cifs-utils -y

#Creating common samba shares
printf "[global]
workgroup=Workgroup
netbios name = pi-wifi

[root]
    comment = root
    path=/
    browseable=YES
    writeable=YES
    valid users= pi, root
    only guest=no
    create mask=0777
    directory mask=07777
    public=no
    force user = root

" > /etc/samba/smb.conf

#set the samba passwords
(echo $password; echo $password) | smbpasswd -s -a root
(echo $password; echo $password) | smbpasswd -s -a pi

#restart the samba service so it picks up the new shares
service smbd restart
service nmbd restart

#install fail2ban to prevent brute force ssh attacks
apt-get install fail2ban -y

printf "
[DEFAULT]
bantime = 3600
maxretry = 5

[sshd]
enabled = true
" > /etc/fail2ban/jail.local

service fail2ban restart

#install the pip python package manager
apt-get install python-pip -y
#install the ookla speedtest cli
pip install


#download the pi-wifi project
#TODO
cd /var/pi-wifi

#install nodejs
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install 14.17.0
nvm use 14.17.0

#install node packages
npm install

#run the server on startup
sed -i "s/exit 0/cd \/var\/pi-wifi \&\& npm run serve \&\nexit 0/"

#insert a crontab entry to auto-run the web interface on boot
printf "
#set the path variable
PATH=$PATH
@reboot cd /var/pi-wifi && npm run serve > /var/log/pi-wifi.log 2>&1
" |  crontab -
#restart cron to make this job take effect
service cron restart
