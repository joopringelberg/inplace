#!/usr/bin/env bash

# Modify the version numbers of dependencies as needed. Then run ./bumpVersions.sh to create updated versions of
# * packages.dhall
# * createPerspectivesLinks.sh
# * package.json

PERSPECTIVESPROXY=v1.19.0
SHAREDWORKER=v0.14.0
PERSPECTIVESCORE=v0.24.0
PERSPECTIVESREACT=v0.24.0
PAGEWORKER=v0.14.0
PERSPECTIVESHIGHLIGHTJS=v1.3.0


sed "s/PERSPECTIVESPROXY/${PERSPECTIVESPROXY}/g;\
s/SHAREDWORKER/${SHAREDWORKER}/g;\
s/PERSPECTIVESCORE/${PERSPECTIVESCORE}/g;\
s/PERSPECTIVESREACT/${PERSPECTIVESREACT}/g;\
s/PAGEWORKER/${PAGEWORKER}/g;\
s/PERSPECTIVESHIGHLIGHTJS/${PERSPECTIVESHIGHLIGHTJS}/g;\
" package.template.json > package.json