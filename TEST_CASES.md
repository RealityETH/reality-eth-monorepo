# Interesting test cases

## Arbitration

### Mainnet — arbitrated question with bond=0 answer
URL: `https://dev2.edochan.com/packages/website/webroot/question.html#!/network/1/question/0x5b7dd1e86623548af054a4985f7fc8ccbb554e2c-0x98d47adbdcad6f6edccd4d85e61d84dc5402d3b9a7eaabe6a5a161efa870ba3d`

- Two responses: first with 1 ETH bond (regular answer), second with 0 ETH bond (arbitrator via `submitAnswerByArbitrator`)
- Tests that "Top Bond" shows the max regular bond (1 ETH) not the arbitrator's 0
- Tests that the arbitrated answer entry is tagged "Arbitrated" and shows no bond
