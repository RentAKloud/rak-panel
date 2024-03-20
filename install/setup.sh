#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# Setup keys
curl -o /etc/apt/keyrings/mariadb-keyring.pgp 'https://mariadb.org/mariadb_release_signing_key.pgp'
curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
    | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null

cp $DIR/../templates/sources/mariadb.sources /etc/apt/sources.list.d/
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
http://nginx.org/packages/debian `lsb_release -cs` nginx" \
    | sudo tee /etc/apt/sources.list.d/nginx.list
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" \
  | sudo tee /etc/apt/preferences.d/99nginx

apt update
apt upgrade
apt install nginx \
  postfix dovecot-pop3d dovecot-imapd opendkim opendkim-tools \
  php8.3-fpm \
  mariadb-server

# Copy config files with proper values

# Setup RoundCube web mail client
curl -L -O https://github.com/roundcube/roundcubemail/releases/download/1.6.6/roundcubemail-1.6.6-complete.tar.gz
tar -xf roundcubemail-1.6.6-complete.tar.gz -C /var/www/roundcube -v --strip-components=1
rm roundcubemail-1.6.6-complete.tar.gz
