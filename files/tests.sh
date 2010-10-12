#!/bin/bash

# parse arguments
until [ -z "$1" ]; do
	if [ "${1:1:2}" -eq "--" ]; then; cur = "${1:3}"; args.$cur = ( 0 )
	else; if [ -n $cur ]; then; args.$cur[${args.$cur[0]}] = "$1"; fi; fi
shift; done

cfg.parser () {
    IFS=$'\n' && ini=( $(<$1) )              # convert to line-array
    ini=( ${ini[*]//;*/} )                   # remove comments
    ini=( ${ini[*]/#[/\}$'\n'cfg.section.} ) # set section prefix
    ini=( ${ini[*]/%]/ \(} )                 # convert text2function (1)
    ini=( ${ini[*]/=/=\( } )                 # convert item to array
    ini=( ${ini[*]/%/ \)} )                  # close array parenthesis
    ini=( ${ini[*]/%\( \)/\(\) \{} )         # convert text2function (2)
    ini=( ${ini[*]/%\} \)/\}} )              # remove extra parenthesis
    ini[0]=''                                # remove first element
    ini[${#ini[*]} + 1]='}'                  # add the last brace
    eval "$(echo "${ini[*]}")"               # eval the result
}

# parse input ini file if exists
ini = $($2 + $1)
if [ -f $ini ]; then
	cfg.parser $ini
else
	echo "Config file not found"
	exit 1
fi