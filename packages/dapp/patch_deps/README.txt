# There's an issue with the web3 version used by the version of truffle-contract we use which can cause it to explode on bad log input.
# Ultimately we'll upgrade the whole stack and make this problem go away, but for now we apply this patch to catch the error and carry on.
# After reinstalling truffle-contract, apply the patch with:

patch -p0 ./node_modules/truffle-contract/node_modules/web3/lib/web3/event.js < ./patch_deps/event.js.patch

