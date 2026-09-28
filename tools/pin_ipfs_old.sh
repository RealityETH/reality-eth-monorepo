#!/bin/bash -x

# Pins the OLD/classic front-end (old.reality.eth) to Filebase.
#
# Uploads the full DAG as a CAR file to Filebase S3 with the 'import=car'
# metadata flag, which tells Filebase to unpack and pin the blocks immediately.
# No IPFS daemon, no open ports, no P2P reachability needed. This is the same
# mechanism as pin_ipfs.sh (the new front-end); the only difference is the object
# key, so the two deployments don't overwrite each other in the bucket.
#
# Requires: aws CLI, jq, ipfs (kubo)
# Credentials: ~/secrets/filebase_s3.txt with ACCESS_TOKEN= and SECRET_KEY= lines
# Set FILEBASE_BUCKET env var or edit the default below.

set -euo pipefail

SRC_DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && cd .. && pwd)

# The old build (ipfs_build_old.sh) writes its CID here.
OLD_BUILD_IPFS="/tmp/RealityETH-build-ipfs/ipfs.txt"

CID=${1:-}
if [ -z "$CID" ] && [ -f "$OLD_BUILD_IPFS" ]; then
    CID=$(cat "$OLD_BUILD_IPFS")
fi
if [ -z "$CID" ] || [ "$CID" = "null" ]; then
    echo "Usage: $0 <CID>"
    echo "Or run ipfs_build_old.sh first to write $OLD_BUILD_IPFS"
    exit 1
fi

# Normalise to CIDv1 base32 so it matches what Filebase returns and the gateway URLs.
CID=$(ipfs cid format -v 1 -b base32 "$CID")

FILEBASE_BUCKET="${FILEBASE_BUCKET:-reality-eth-2026}"
ACCESS_KEY=$(grep ACCESS_TOKEN ~/secrets/filebase_s3.txt | cut -d= -f2)
SECRET_KEY=$(grep SECRET_KEY ~/secrets/filebase_s3.txt | cut -d= -f2)
BUCKET="$FILEBASE_BUCKET"
OBJECT_KEY="reality-eth-old-site-${CID}.car"

CAR_FILE="$(mktemp --suffix=.car)"
trap 'rm -f "$CAR_FILE"' EXIT

echo "Exporting DAG to CAR..."
ipfs dag export "$CID" > "$CAR_FILE"
echo "CAR size: $(stat -c%s "$CAR_FILE") bytes"

echo "Uploading to Filebase bucket \"$BUCKET\" as $OBJECT_KEY..."
AWS_ACCESS_KEY_ID="$ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$SECRET_KEY" \
    aws --endpoint-url https://s3.filebase.com \
    s3 cp "$CAR_FILE" "s3://$BUCKET/$OBJECT_KEY" \
    --metadata 'import=car'

echo "Checking pin status..."
HEAD=$(AWS_ACCESS_KEY_ID="$ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$SECRET_KEY" \
    aws --endpoint-url https://s3.filebase.com \
    s3api head-object --bucket "$BUCKET" --key "$OBJECT_KEY")

RETURNED_CID=$(echo "$HEAD" | jq -r '.Metadata.cid // .Metadata.Cid // "unknown"')
STATUS=$(echo "$HEAD" | jq -r '(.Metadata["pinning-status"] // .Metadata["Pinning-Status"]) // "unknown"')

echo "Filebase CID: $RETURNED_CID"
echo "Pinning status: $STATUS"

if [ "$RETURNED_CID" != "$CID" ] && [ "$RETURNED_CID" != "unknown" ]; then
    echo "WARNING: CID mismatch — expected $CID, Filebase returned $RETURNED_CID"
    exit 1
fi
if [ "$STATUS" != "pinned" ]; then
    echo "Not pinned yet (status=$STATUS) — rerun in a moment to check again"
    exit 1
fi

echo ""
echo "Pinned: $CID"
echo "  https://ipfs.filebase.io/ipfs/$CID/"
echo "  https://$CID.ipfs.dweb.link/"
