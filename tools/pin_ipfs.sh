#!/bin/bash -x

CID=$1
SECRET=`cat ~/secrets/filebase.key`
echo $CID
echo $SECRET

JSON="{ \"cid\": \"$CID\", \"name\": \"reality-eth\", \"meta\": { \"key_name\": \"reality-eth\" } } "

RESPONSE=`curl -H POST https://api.filebase.io/v1/ipfs -H 'Content-Type: application/json;charset=utf-8' -d "$JSON" -H "Authorization: Bearer $SECRET"`
echo $RESPONSE

