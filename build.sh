#!/usr/bin/env bash

# The purpose of this file is to copy a number of files to the public directory and then run webpack.
# This file is the value of the "build" script entry.

# Pass this script an argument that represents the url of the default repository to be used by Inplace.

if [ $1 == "https://inplace.works:5985/repository/" ] ; then
    OUTPUT="production"
else
    OUTPUT="development"
fi


cp ./src/index.html ./$OUTPUT/index.html
cp ./src/file.png ./$OUTPUT/file.png

cp ./node_modules/perspectives-pageworker/dist/perspectives-pageworker.js ./$OUTPUT/perspectives-pageworker.js
cp ./node_modules/perspectives-sharedworker/dist/perspectives-sharedworker.js ./$OUTPUT/perspectives-sharedworker.js
cp ./node_modules/perspectives-serviceworker/dist/perspectives-serviceworker.js ./$OUTPUT/perspectives-serviceworker.js

webpack --env $1

if [ $1 == "https://inplace.works:5985/repository/" ] ; then
    echo "Production build."
    scp -r ./production/* joop@inplace.works:/var/www/inplace.works
else
    echo "Development build."
fi
