# Vendored JavaScript libraries

All third-party JS is served from this directory rather than CDN, so there is
no runtime dependency on external servers and no need to trust SRI hashes.

| File | Library | Version | SHA-256 | Source |
|------|---------|---------|---------|--------|
| `ethers.js` | ethers | 6.16.0 | `5789774b233255b23fb4bcd627958955c2b540a0e1d10bdf6389811b1769a612` | https://github.com/ethers-io/ethers.js |
| `walletconnect.js` | @walletconnect/ethereum-provider | 2.23.9 | `2d6fde330fd9abc318ceb8da11bb47872ec544bb028dcf6639b0b2d8fb7fcfb3` | https://github.com/WalletConnect/walletconnect-monorepo |
| `marked.js` | marked | 14.1.4 | `0a0fbf5ea62f007e7ede02d6f75b4eb142ee8acb310cd957ed566af3304c0bcc` | https://github.com/markedjs/marked |
| `dompurify.js` | DOMPurify | 3.4.13 | `9ab3d44d73c3e3947f9ab72e0f0bc15c7f1931d60b365ba261fc85fe59013c56` | https://github.com/cure53/DOMPurify |

`walletconnect.js` is built locally from `packages/website/walletconnect-build/`
using esbuild (see `build.js` in that directory). The other three are upstream
minified distributions downloaded directly.

To verify the files in this directory match the recorded hashes:

```
sha256sum ethers.js walletconnect.js marked.js dompurify.js
```

Expected output:
```
5789774b233255b23fb4bcd627958955c2b540a0e1d10bdf6389811b1769a612  ethers.js
2d6fde330fd9abc318ceb8da11bb47872ec544bb028dcf6639b0b2d8fb7fcfb3  walletconnect.js
0a0fbf5ea62f007e7ede02d6f75b4eb142ee8acb310cd957ed566af3304c0bcc  marked.js
9ab3d44d73c3e3947f9ab72e0f0bc15c7f1931d60b365ba261fc85fe59013c56  dompurify.js
```

To verify `marked.js` and `dompurify.js` against their upstream distributions:

```
curl -sL https://cdn.jsdelivr.net/npm/marked@14.1.4/marked.min.js | sha256sum
# expect: 0a0fbf5ea62f007e7ede02d6f75b4eb142ee8acb310cd957ed566af3304c0bcc

curl -sL https://cdn.jsdelivr.net/npm/dompurify@3.4.13/dist/purify.min.js | sha256sum
# expect: 9ab3d44d73c3e3947f9ab72e0f0bc15c7f1931d60b365ba261fc85fe59013c56
```

`ethers.js` and `walletconnect.js` are built from source — see the ethers.js
release assets and `packages/website/walletconnect-build/` respectively.
