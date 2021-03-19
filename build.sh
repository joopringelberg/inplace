#!/usr/bin/env bash

# The purpose of this file is to copy a number of files to the public directory and then run webpack.
# This file is the value of the "build" script entry.

# Pass this script two options:
# -r : represents the url of the default repository to be used by Inplace;
# -t : should be "production", "development" or "test"
# for example:
# build.sh -r https://localhost:5984/repository -t development

while getopts r:t: flag
do
    case "${flag}" in
        r) repo=${OPTARG};;
        t) target=${OPTARG};;
    esac
done

echo "Building for $target"

cp ./src/index.html ./$target/index.html
cp ./src/file.png ./$target/file.png

cp ./node_modules/perspectives-pageworker/dist/perspectives-pageworker.js ./$target/perspectives-pageworker.js
cp ./node_modules/perspectives-sharedworker/dist/perspectives-sharedworker.js ./$target/perspectives-sharedworker.js
cp ./node_modules/perspectives-serviceworker/dist/perspectives-serviceworker.js ./$target/perspectives-serviceworker.js

webpack --env target=$target repo=$repo

if [ $target == "production" ] ; then
    scp -r ./production/* joop@inplace.works:/var/www/inplace.works
fi
