# Twitter bot

This script will tweet out new reality.eth questions and answers.

It does this by querying the graph endpoints specified in @reality.eth/contracts.

## Setting it up

Make a file called `secrets/config.json` with the settings from dev.twitter.com

`
{
    "consumer_key": "...",
    "consumer_secret": "...",
    "access_token": "...",
    "access_token_secret": "..."
}
`

You should also make a directory called `state` which will store the files tracking how much has been tweeted out so far.

Install dependencies either from `packages/twitter-bot` with `npm install` or from the top level of the repo with `lerna bootstrap`.

## Initializing

`cd packages/twitter-bot`

The script is run with

`node index.js 1,100`

...where `1` and `100` are the chains you wish to tweet about. You can add the chain ID of any other chain with a graph endpoint set in `@reality.eth/contracts`.

The first time a new chain is initialized it should be run with the `init` flag.

`node index.js 1,100 init`

This will create a state file for the chain at the current timestamp. You can edit this manually if you want to tweet some of the existing entries.

## Running automatically

Make a cron, eg to run every second we use:

`* * * * * cd /home/ed/monorepo-twitter/packages/twitter-bot && node index.js 1,100`

## Lock files

The script uses lock files under `state` to ensure only one process is trying to tweet about a given chain at a time. If something breaks and the lock file isn't deleted, you may need to delete this file manually.

