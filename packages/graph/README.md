# Reality.eth subgraph

This is the subgraph for reality.eth.

It should be able to parse most templates correctly, but as we do not yet have a complete port of the sprintf-js library used by the dapp, we cannot guarantee the exact same handling of edge cases. We recommend that anywhere important, such as a page where you allow people to submit bonds, you do the template handling and formatting in JavaScript.

You may need to pass the GRAPH_AUTH environmental variable with the param
 --access-token <YOUR KEY>
We suggest keeping this in a file, eg
GRAPH_AUTH="--access-token `cat ~/secrets/graph_auth`" yarn deploy:zksync-goerli

