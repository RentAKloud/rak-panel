#!/bin/bash

mysql_query() {
	sql_tmp=$(mktemp)
	echo "$1" > $sql_tmp
	if [ -f '/usr/bin/mariadb' ]; then
		mariadb --defaults-file=$mycnf < "$sql_tmp" 2> /dev/null
		return_code=$?
	else
		mysql --defaults-file=$mycnf < "$sql_tmp" 2> /dev/null
		return_code=$?
	fi
	rm -f "$sql_tmp"
	return $return_code
}