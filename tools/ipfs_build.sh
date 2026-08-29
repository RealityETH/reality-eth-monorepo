#!/bin/bash -x

SRC_DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && cd .. && pwd)
BUILD_DIR=/tmp/RealityETH-website-build-ipfs

if [ ! -f "$SRC_DIR/tools/ipfs_build.sh" ]; then
    echo "Expected files not found in $SRC_DIR"
    exit 1
fi

if [ ! -f "$SRC_DIR/LIVE" ]; then
    echo "Expected file not found in $SRC_DIR."
    echo "Create a file called LIVE if you really intend to deploy from this directory."
    exit 1
fi

mkdir -p "$BUILD_DIR"

rsync -avz --delete \
    --exclude='.editorconfig' \
    --exclude='.gitattributes' \
    --exclude='.gitignore' \
    --exclude='.htaccess' \
    --exclude='404.html' \
    --exclude='robots.txt' \
    --exclude='integrations.json' \
    "$SRC_DIR/packages/frontend/webroot/" "$BUILD_DIR/"

CID=$(ipfs add -r --cid-version=1 -Q "$BUILD_DIR")

if [ -z "$CID" ]; then
    echo "ipfs add failed"
    exit 1
fi

echo "CID: $CID"

DEPLOY_DIR="$SRC_DIR/deploy"
mkdir -p "$DEPLOY_DIR"
printf '{"cid":"%s","publishedAt":"%s"}\n' \
    "$CID" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    > "$DEPLOY_DIR/cid.json"

echo "Preview at:"
echo "https://ipfs.filebase.io/ipfs/$CID"
echo "https://$CID.ipfs.dweb.link/"
echo ""
echo "Run tools/pin_ipfs.sh to upload to Filebase, then open deploy/deploy.html."
