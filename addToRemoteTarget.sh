#!/usr/bin/env bash

# The purpose of this file is to copy a number of files to the MyContexts server.
# If target is "development" or "production", the files are copied to the root of the site.
# If target is "remotetest", the files are copied to the remotetest subdirectory of the site.

# Pass this script this option --target: should be "production", "development" or "remotetest"
# Example usage: ./postWebpack.sh --target remotetest
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --target) target="$2"; shift ;;
    *) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

if [ -z "$target" ]; then
  echo "Error: --target parameter is required"
  exit 1
fi

# Remotetest is a special case. It is a subdirectory of the production site.
if [ $target == "remotetest" ] ; then
    # Copy the files.
    scp -r ./remotetest/* joop@inplace.works:/var/www/mycontexts.com/remotetest
fi

# Development and production are the same. Both are the root of the site.
if [ $target == "development" ] ; then
    scp -r ./development/* joop@inplace.works:/var/www/mycontexts.com
    fi

if [ $target == "production" ] ; then
scp -r ./production/* joop@inplace.works:/var/www/mycontexts.com
fi