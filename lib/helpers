#!/bin/bash

CHECK_RESULT_CALLBACK=""

# Return codes
OK=0
E_ARGS=1
E_INVALID=2
E_NOTEXIST=3
E_EXISTS=4
E_SUSPENDED=5
E_UNSUSPENDED=6
E_INUSE=7
E_LIMIT=8
E_PASSWORD=9
E_FORBIDEN=10
E_DISABLED=11
E_PARSING=12
E_DISK=13
E_LA=14
E_CONNECT=15
E_FTP=16
E_DB=17
E_RRD=18
E_UPDATE=19
E_RESTART=20

# Event string for logger
ARGS=("$@")
for ((I = 1; I <= $#; I++)); do
	if [[ "$HIDE" != "$I" ]]; then
		ARGUMENTS="$ARGUMENTS '${ARGS[${I} - 1]}'"
	else
		ARGUMENTS="$ARGUMENTS '******'"
	fi
done

log_event() {
  echo $1 $2
}

check_result() {
	if [ $1 -ne 0 ]; then
		local err_code="${3:-$1}"
		if [[ -n "$CHECK_RESULT_CALLBACK" && "$(type -t "$CHECK_RESULT_CALLBACK")" == 'function' ]]; then
			$CHECK_RESULT_CALLBACK "$err_code" "$2"
		else
			echo "Error: $2"
			log_event "$err_code" "$ARGUMENTS"
		fi

		exit $err_code
	fi
}

# Argument list checker
check_args() {
	if [ "$1" -gt "$2" ]; then
		echo "Usage: $(basename $0) $3"
		check_result "$E_ARGS" "not enought arguments" > /dev/null
	fi
}

is_no_new_line_format() {
	test=$(echo "$1" | head -n1)
	if [[ "$test" != "$1" ]]; then
		check_result "$E_INVALID" "invalid value :: $1"
	fi
}

# Domain format validator
is_domain_format_valid() {
	object_name=${2-domain}
	exclude="[!|@|#|$|^|&|*|(|)|+|=|{|}|:|,|<|>|?|_|/|\|\"|'|;|%|\`| ]"
	if [[ $1 =~ $exclude ]] || [[ $1 =~ ^[0-9]+$ ]] || [[ $1 =~ \.\. ]] || [[ $1 =~ $(printf '\t') ]] || [[ "$1" = "www" ]]; then
    check_result "$E_INVALID" "invalid $object_name format :: $1"
	fi
	is_no_new_line_format "$1"
}