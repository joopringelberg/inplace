#!/usr/bin/env bash

# The purpose of this file is to copy a number of files to the public directory and then run webpack.
# This file is the value of the "build" script entry.

# Pass this script this option:
# -t : should be "production", "development" or "test"
# for example:
# build.sh -t development

while getopts r:t: flag
do
    case "${flag}" in
        t) target=${OPTARG};;
    esac
done

echo "Building for $target"

# INPLACE
cp ./src/index.html ./$target/index.html
cp ./src/file.png ./$target/file.png
cp ./src/manage.html ./$target/manage.html

# MODELS
cp ./src/models.html ./$target/models.html

# None of these is produced by Webpack in this project. However, the sharedworker is loaded, of course, so must necessarily
# be in the distribution. The same holds for the serviceworker. The pageworker is loaded on demand in Safari.
cp ./node_modules/perspectives-pageworker/dist/perspectives-pageworker.js ./$target/perspectives-pageworker.js
cp ./node_modules/perspectives-sharedworker/dist/perspectives-sharedworker.js ./$target/perspectives-sharedworker.js
cp ./node_modules/perspectives-serviceworker/dist/perspectives-serviceworker.js ./$target/perspectives-serviceworker.js

webpack --env target=$target

if [ $target == "production" ] ; then
    scp -r ./production/* joop@inplace.works:/var/www/mycontexts.com
fi

if [ $target == "remotetest" ] ; then
    scp -r ./remotetest/* joop@inplace.works:/var/www/mycontexts.com/remotetest
fi

if [ $target == "development" ] ; then
    cp ./src/testStaticScreen.html ./$target/testStaticScreen.html
fi