#!/bin/bash

fqdn=$1

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/../lib/helpers.sh

check_args '1' "$#" 'FQDN'

# Setup APT repo keys
curl -o /etc/apt/keyrings/mariadb-keyring.pgp 'https://mariadb.org/mariadb_release_signing_key.pgp'
curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
    | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
curl https://packages.sury.org/php/apt.gpg | sudo apt-key add -

cp $DIR/../templates/sources/mariadb.sources /etc/apt/sources.list.d/
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
http://nginx.org/packages/debian `lsb_release -cs` nginx" \
    | sudo tee /etc/apt/sources.list.d/nginx.list
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" \
  | sudo tee /etc/apt/preferences.d/99nginx
echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list

# Install packages
apt update
apt upgrade
apt install nginx \
  postfix dovecot-pop3d dovecot-imapd opendkim opendkim-tools \
  php8.3-fpm php8.3-mbstring php8.3-mysql php8.3-xml php8.3-intl php8.3-curl php8.3-ldap php8.3-gd php8.3-imagick php8.3-zip \
  mariadb-server

# Copy config files with proper values
cat $DIR/../templates/main.cf | sed "s/<FQDN>/$fqdn/g" > /etc/postfix/main.cf

mkdir /etc/nginx/sites-available # This is not always created depending on the distro
cp $DIR/../templates/nginx/nginx.default.conf /etc/nginx/sites-available/default # This will also change the link in /sites-enabled

cp $DIR/../templates/nginx/nginx.conf /etc/nginx/
cp $DIR/../templates/nginx/fastcgi.conf /etc/nginx/
mkdir /etc/nginx/snippets
cp $DIR/../templates/nginx/fastcgi-php.conf /etc/nginx/snippets

cp $DIR/../templates/dovecot/dovecot.conf /etc/dovecot/
cp $DIR/../templates/dovecot/10-auth.conf /etc/dovecot/conf.d/
cp $DIR/../templates/dovecot/10-mail.conf /etc/dovecot/conf.d/
cp $DIR/../templates/dovecot/10-master.conf /etc/dovecot/conf.d/

# Setup RoundCube web mail client
echo "###  Install RoundCube  ###"
curl -L -O https://github.com/roundcube/roundcubemail/releases/download/1.6.6/roundcubemail-1.6.6-complete.tar.gz
mkdir /var/www/roundcube
tar -xf roundcubemail-1.6.6-complete.tar.gz -C /var/www/roundcube --strip-components=1
rm roundcubemail-1.6.6-complete.tar.gz

# Setup phpMyAdmin
echo "###  Installing phpMyAdmin  ###"
curl -O https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip
unzip -q phpMyAdmin-5.2.1-all-languages.zip -d /var/www/
mv /var/www/phpMyAdmin-5.2.1-all-languages /var/www/phpmyadmin
rm phpMyAdmin-5.2.1-all-languages.zip

# Set proper file permissions/ownerships
chown -R www-data:www-data /var/www/roundcube
chown -R www-data:www-data /var/www/phpmyadmin

# Add bin directory to PATH
echo "export PATH=\$PATH:$DIR/../bin" >> ~/.bashrc
source ~/.bashrc