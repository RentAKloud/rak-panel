
## Transferring a WordPress site

1. Copy all WordPress files to public_html of your domain.
2. Create a database user and a database. Set the info in wp-config.php
3. To export source database, use `mysqldump <database-name > out.sql`
4. To import the dump,

```
mysql -u <username> -p
```

Enter you password, then

```
use <database-name>;
source out.sql;
```

## Useful Commands

```
openssl s_client -connect localhost:25 -servername <DOMAIN> -starttls smtp
```

## Troubleshooting

### mysqli::real_connect(): (HY000/2054): Server sent charset (0) unknown to the client. Please, report to the developers

This error occurs in some versions of mariadb. To fix, comment out the following line in `/etc/mysql/mariadb.conf.d/50-server.cnf`

```
character-set-collations = utf8mb4=uca1400_ai_ci
```