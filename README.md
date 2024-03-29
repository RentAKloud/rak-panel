
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