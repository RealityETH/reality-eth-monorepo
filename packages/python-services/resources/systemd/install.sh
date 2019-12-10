#!/bin/bash

#cp ../bin/ipfs /usr/local/bin/ipfs
cp unit-status-mail.sh /usr/local/bin/unit-status-mail.sh
cp unit-status-mail@.service /etc/systemd/system/unit-status-mail@.service
cp geth.service /lib/systemd/system/geth.service
cp rcpyd.service /lib/systemd/system/rcpyd.service
# cp geth-ropsten.service /lib/systemd/system/geth-ropsten.service
# cp ipfs.service /lib/systemd/system/ipfs.service
