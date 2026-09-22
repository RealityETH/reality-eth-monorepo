# @reality.eth/mcp

MCP server for [reality.eth](https://reality.eth.limo) — lets AI agents search, read, and answer on-chain oracle questions.

## Installation

```json
{
  "mcpServers": {
    "reality-eth": {
      "command": "npx",
      "args": ["-y", "@reality.eth/mcp"]
    }
  }
}
```

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS) or your Claude Code project settings (`.claude/settings.json`).

## Configuration

All configuration is via environment variables:

| Variable | Required | Description |
|---|---|---|
| `REALITY_ETH_PRIVATE_KEY` | For writes | Private key (`0x...`) of the wallet that will post bonds and sign transactions |
| `REALITY_ETH_INDEXER_URL` | No | Override the default indexer endpoint (`https://indexer.reality.gwei.name/graphql`) |
| `REALITY_ETH_RPC_URL_{chainId}` | No | Override the default public RPC for a specific chain, e.g. `REALITY_ETH_RPC_URL_100` for Gnosis |

Reading questions works without a private key. `submit_answer` and `claim_winnings` require one.

### Example with a private key

```json
{
  "mcpServers": {
    "reality-eth": {
      "command": "npx",
      "args": ["-y", "@reality.eth/mcp"],
      "env": {
        "REALITY_ETH_PRIVATE_KEY": "0x..."
      }
    }
  }
}
```

## Tools

### `list_questions`
Search for questions. Returns open (unfinalized) questions by default.

Parameters: `chain`, `category`, `keyword`, `open_only`, `limit`

### `get_question`
Get full details for a question, including current answer, bond, and answer history.

Parameters: `question_id` (required), `chain`

### `submit_answer`
Post an answer with a bond. Bond is auto-calculated as double the current bond (or the minimum bond if the question is unanswered). Requires `REALITY_ETH_PRIVATE_KEY`.

Parameters: `question_id` (required), `chain` (required), `answer` (required), `bond_eth`

### `claim_winnings`
Claim your bond and reward from a finalized question where you gave the final correct answer. Requires `REALITY_ETH_PRIVATE_KEY`.

Parameters: `question_id` (required), `chain` (required)

## Question IDs

Questions are identified by `{contractAddress}-{questionId}`, which matches the format used in reality.eth URLs:

```
https://reality.eth.limo/app/#!/network/100/question/0x79e32ae...-0x362d8cb...
                                                      ↑ this whole part is the question_id
```

## Supported chains

Gnosis, Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche, BNB Chain, Celo, Unichain, Rootstock, Sepolia (testnet).
