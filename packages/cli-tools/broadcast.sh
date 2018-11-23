#!/bin/bash

# Quick-and-dirty script to send output to a local node for quicker testing
# Usually your node should be offline so you can"t do this
# Raw TX output should be the first line beginning "0x"

while read LINE; do
    if [[ $LINE == 0x* ]] 
    then
        #echo $LINE
        curl -X POST --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_sendRawTransaction\",\"params\":[\"$LINE\"],\"id\":1}" http://localhost:8545
        exit
    fi
done < /dev/stdin

