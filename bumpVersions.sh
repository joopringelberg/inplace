#!/usr/bin/env bash

# Modify the version numbers of dependencies as needed. Then run ./bumpVersions.sh to create updated versions of
# * packages.dhall
# * createPerspectivesLinks.sh
# * package.json

PERSPECTIVESPROXY=v1.21.4
SHAREDWORKER=v0.16.5
PERSPECTIVESCORE=v0.26.5
PERSPECTIVESREACT=v0.26.3
PAGEWORKER=v0.16.5
PERSPECTIVESHIGHLIGHTJS=v1.3.1


sed "s/PERSPECTIVESPROXY/${PERSPECTIVESPROXY}/g;\
s/SHAREDWORKER/${SHAREDWORKER}/g;\
s/PERSPECTIVESCORE/${PERSPECTIVESCORE}/g;\
s/PERSPECTIVESREACT/${PERSPECTIVESREACT}/g;\
s/PAGEWORKER/${PAGEWORKER}/g;\
s/PERSPECTIVESHIGHLIGHTJS/${PERSPECTIVESHIGHLIGHTJS}/g;\
" package.template.json > package.json