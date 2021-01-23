#!/bin/bash

# enable invert or negative wildcards
shopt -s extglob

# remove existing blog dist files
rm -rfv $DIST_PATH/dist/!(projects)

# move created files to dist directory
mv -v $DIST_PATH/temp/dist/* $DIST_PATH/dist

# remove temp folder
rm -rfv $DIST_PATH/temp
