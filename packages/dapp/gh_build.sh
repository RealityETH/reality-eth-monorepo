#!/bin/bash -x

SRC_DIR="."
BUILD_DIR=/tmp/realitio-build
REPO=git@github.com:realitio/realitio.github.io.git
ME=`basename "$0"`

CURR_COMMIT=`git log | head -1`

if [ ! -f "$SRC_DIR/$ME" ]
then
    echo "Expected files not found in $SRC_DIR"
    exit 1
fi

if [ ! -f "$SRC_DIR/LIVE" ]
then
    echo "Expected file not found in $SRC_DIR. Create a file called LIVE if you really intend to deploy from this directory"
    exit 1
fi

if [ ! -d $BUILD_DIR ]
then 
    mkdir $BUILD_DIR
    git clone $REPO $BUILD_DIR
    pushd $BUILD_DIR
    git checkout realitio.github.io
    popd
fi

pushd $BUILD_DIR
git pull
popd

rsync -avz --delete $SRC_DIR/docs/html/ $BUILD_DIR/docs/html/
rsync -avz --delete $SRC_DIR/assets/ $BUILD_DIR/assets/
rsync -avz --delete $SRC_DIR/truffle/build/ $BUILD_DIR/truffle/build/
rsync -avz --delete $SRC_DIR/cli/ $BUILD_DIR/cli/
rsync -avz --delete $SRC_DIR/js/ $BUILD_DIR/js/
rsync -avz --delete $SRC_DIR/rinkeby/ $BUILD_DIR/rinkeby/
rsync -avz --delete $SRC_DIR/v1/ $BUILD_DIR/v1/
cp $SRC_DIR/index.html $BUILD_DIR/index.html

cd $BUILD_DIR
git add .
git commit -m "Update to latest build to $CURR_COMMIT"
git push
