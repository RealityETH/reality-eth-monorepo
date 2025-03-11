# Reality.eth subgraph

This is the subgraph for reality.eth.

It should be able to parse most templates correctly, but as we do not yet have a complete port of the sprintf-js library used by the dapp, we cannot guarantee the exact same handling of edge cases. We recommend that anywhere important, such as a page where you allow people to submit bonds, you do the template handling and formatting in JavaScript.

Example:
VERSION_LABEL="--version-label v`cat VERSION_LABEL`" GRAPH_AUTH="--deploy-key `cat ~/secrets/graph_studio_auth`" yarn deploy-studio:mainnet
