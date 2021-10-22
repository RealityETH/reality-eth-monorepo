#!/bin/bash -x

SRC_DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && cd .. && pwd)
REPO_DIR=/tmp/RealityETH-repo
BUILD_DIR=/tmp/RealityETH-build-ipfs
REPO=git@github.com:RealityETH/reality-eth-monorepo.git
ME=`basename "$0"`

CURR_COMMIT=`git log | head -1`

# Set up static website at the top

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
fi

# Get a clean copy of the repo, we'll only copy over stuff we needed to build from our local directory
if [ ! -d $REPO_DIR ]
then
    git clone $REPO $REPO_DIR
else
    pushd $REPO_DIR
    git pull
    popd
fi

pushd $REPO_DIR
git fetch -v
git checkout master
popd

rsync -avz --delete $REPO_DIR/packages/website/webroot/ $BUILD_DIR/
rsync -avz --delete $REPO_DIR/packages/dapp/ $BUILD_DIR/app/


# TODO: Build this fresh in REPO_DIR instead of assuming we built it locally
mkdir -p $BUILD_DIR/app/docs
rsync -avz --delete $SRC_DIR/packages/docs/html/ $BUILD_DIR/app/docs/html/

# TODO: Build this fresh in REPO_DIR instead of assuming we built it locally
rsync -avz --delete $SRC_DIR/packages/dapp/assets/ $BUILD_DIR/app/assets/
rsync -avz --delete $SRC_DIR/packages/dapp/js/ $BUILD_DIR/app/js/

# TODO: Build this fresh in REPO_DIR instead of assuming we built it locally
rsync -avz --delete $SRC_DIR/packages/template-generator/build/ $BUILD_DIR/app/template-generator/

pushd $BUILD_DIR

echo $CURR_COMMIT > $BUILD_DIR/commit.txt

IPFS_HASH=`ipfs add -r --ignore=.git . | tail -n1 | awk '{print $2}'`

echo $IPFS_HASH > "$BUILD_DIR/ipfs.txt"

ipfs pin add -r $IPFS_HASH

echo "Preview site at:"
echo "https://ipfs.io/ipfs/${IPFS_HASH}"

popd

echo "To update ipns, on the box with the ipns key, run:"
echo 'RE_IPFS=`ssh rc-dev-5.socialminds.jp "cat /tmp/RealityETH-build-ipfs/ipfs.txt"` && echo $RE_IPFS && ipfs name publish --key reality-eth /ipfs/$RE_IPFS'


