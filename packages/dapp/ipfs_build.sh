#!/bin/bash -x

SRC_DIR="."
BUILD_DIR=/tmp/realitio-build-ipfs
REPO1=git@github.com:realitio/realitio-website.git
REPO2=git@github.com:realitio/realitio-dapp.git
ME=`basename "$0"`
DAPP=app

DAPP_DIR="$BUILD_DIR/webroot/$DAPP"

CURR_COMMIT=`git log | head -1`

# Set up static website at the top

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
    git clone $REPO1 $BUILD_DIR
    git clone $REPO2 $DAPP_DIR
    popd
fi

pushd $BUILD_DIR
git pull
git fetch -v
git checkout master
popd

pushd $DAPP_DIR
git pull
popd

rsync -avz --delete $SRC_DIR/docs/html/ $DAPP_DIR/docs/html/
rsync -avz --delete $SRC_DIR/assets/ $DAPP_DIR/assets/
rsync -avz --delete $SRC_DIR/truffle/build/ $DAPP_DIR/truffle/build/
# rsync -avz --delete $SRC_DIR/cli/ $DAPP_DIR/cli/
rsync -avz --delete $SRC_DIR/js/ $DAPP_DIR/js/
# rsync -avz --delete $SRC_DIR/rinkeby/ $DAPP_DIR/rinkeby/
rsync -avz --delete $SRC_DIR/v1/ $DAPP_DIR/v1/
# rsync -avz --delete $SRC_DIR/beta/ $DAPP_DIR/beta/
cp $SRC_DIR/index.html $DAPP_DIR/index.html

cd $BUILD_DIR/webroot
IPFS_HASH=`ipfs add -r --ignore=.git . | tail -n1 | awk '{print $2}'`

echo $IPFS_HASH > "$BUILD_DIR/ipfs.txt"

ipfs pin add -r $IPFS_HASH

echo "Preview site at:"
echo "https://ipfs.io/ipfs/${IPFS_HASH}"
