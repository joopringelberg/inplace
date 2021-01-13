#!/usr/bin/env bash

# The purpose of this file is to copy a number of files to the public directory and then run webpack.
# This file is the value of the "build" script entry.

cp ./src/importModule.js ./public/importModule.js
cp ./src/index.html ./public/index.html
cp ./src/couchdbconfig.js ./public/couchdbconfig.js
cp ./src/file.png ./public/file.png
webpack
