#!/usr/bin/env bash

cd node_modules

rm -R perspectives-proxy
rm -R perspectives-react
rm -R perspectives-core

ln -s ../../perspectives-proxy perspectives-proxy
ln -s ../../perspectives-react perspectives-react
ln -s ../../perspectives-core perspectives-core

ln -s ../../perspectives-workers perspectives-workers

cd ..

cd docs
ln -sf ../../perspectives-workers/dist/perspectives-serviceWorker.js perspectives-serviceWorker.js
ln -sf ../../perspectives-workers/dist/perspectives-sharedWorker.js perspectives-sharedWorker.js
