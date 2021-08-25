#!/bin/bash -x

SRC_DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && cd .. && pwd)
BUILD_DIR=/tmp/RealityETH-build
REPO=git@github.com:RealityETH/RealityETH.github.io.git
ME=`basename "$0"`

CURR_COMMIT=`git log | head -1`

if [ ! -f "$SRC_DIR/tools/$ME" ]
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
    git checkout RealityETH.github.io
    popd
fi

pushd $BUILD_DIR
git pull
popd

rsync -avz --delete $SRC_DIR/packages/docs/html/ $BUILD_DIR/docs/html/
rsync -avz --delete $SRC_DIR/packages/dapp/assets/ $BUILD_DIR/assets/
rsync -avz --delete $SRC_DIR/packages/dapp/js/ $BUILD_DIR/js/
rsync -avz --delete $SRC_DIR/packages/template-generator/build/ $BUILD_DIR/template-generator/
cp $SRC_DIR/packages/dapp/index.html $BUILD_DIR/index.html

pushd $BUILD_DIR

git add .
git commit -m "Update to latest build to $CURR_COMMIT"
git push

popd
