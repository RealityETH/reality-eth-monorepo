## reality.eth monorepo

This repo replaces the old separate repos that were previously at realitio.github.com.

It comprises the following packages, under packages/:

  * contracts: reality.eth contracts source code, also details of supported networks and tokens and the relevant contract addresses.
  * reality-eth-lib: Useful functions for creating and interpreting questions and templates used by the reality.eth system.
  * dapp: The UI front-end as deployed at reality.eth/dapp
  * docs: The system documentation as deployed at reality.eth/docs
  * website: The project website as seen at reality.eth/
  * cli-tools: Javascript tools, mainly used for arbitration
  * graph: Subgraph definitions for https://thegraph.com/
  * template-generator: A GUI tool to create custom question templates.
  * twitter-bot: A script to tweet out new questions and answers.

See the README of each respective package for details.

The following scripts are used for deployment, under tools/:
  
  * ipfs_build.sh: Deploy web-accessible parts of the project to a web-accessible URL, pin it to IPFS on the local server and on Filebase. You should then register it with ENS to update reality.eth.link.
  * gh_build.sh: As with ipfs_build.sh but deploying the dapp only, to github.io repo at https://realityeth.github.io/. This is usually updated more frequently than the IPFS build.

### NPM packages

The following are published to npm. They are versioned individually, and updated by running `lerna publish`.

  * @reality.eth/contracts
  * @reality.eth/reality-eth-lib
  * @reality.eth/dapp
  * @reality.eth/cli-tools

Some packages reference each other, for example `dapp` needs `contracts` and `reality-eth-lib`. When developing it can be useful to make your local environment refer directly to the working versions of the other packages in the repo. To do this, instead of running the normal `npm install` for each JavaScript package, run `./bootstrap.sh` from the uppermost directory. This will install external dependencies normally, but set up dependencies within this repo as symlinks.

### Build dependencies

#### Node.js

Install [nvm](https://github.com/nvm-sh/nvm), then from the repo root:

```
nvm install
```

This will install the version specified in `.nvmrc`. Run `nvm use` at the start of each shell session to activate it.

#### Docs (Sphinx)

The docs package uses Sphinx with a pinned `requirements.txt`. To build:

```
cd packages/docs
python3 -m venv ~/venv/reality-eth-docs
source ~/venv/reality-eth-docs/bin/activate
pip install -r requirements.txt
make html
```

**Known issue:** Sphinx 3.5.4 has a Python version check bug that causes an `ImportError` on Python 3.10. After installing, patch the venv:

```
sed -i 's/sys.version_info > (3, 10)/sys.version_info >= (3, 11)/' \
  ~/venv/reality-eth-docs/lib/python3.10/site-packages/sphinx/util/typing.py
```

#### IPFS

Required for `ipfs_build.sh`. Install the [Kubo](https://github.com/ipfs/kubo) binary as the local user:

```
mkdir -p ~/.local/bin
curl -L https://github.com/ipfs/kubo/releases/download/v0.41.0/kubo_v0.41.0_linux-amd64.tar.gz \
  | tar -xz -C /tmp
cp /tmp/kubo/ipfs ~/.local/bin/ipfs
```

Make sure `~/.local/bin` is on your `PATH`.

#### GitHub Pages deploy key

Required for `gh_build.sh`. Generate a dedicated SSH key and add it as a deploy key (with write access) on the `RealityETH.github.io` repo:

```
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_ghpages -C "realityeth.github.io deploy"
cat ~/.ssh/id_ed25519_ghpages.pub
```

Then add a host alias to `~/.ssh/config`:

```
Host github-pages
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_ghpages
    IdentitiesOnly yes
```

#### Filebase remote pinning

Required for `ipfs_build.sh`. Add Filebase as a remote pinning service using your access token from the Filebase dashboard:

```
ipfs pin remote service add filebase https://api.filebase.io/v1/ipfs <YOUR_FILEBASE_TOKEN>
```
