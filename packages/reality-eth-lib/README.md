# reality-eth-lib

Useful libraries for Reality.eth

## CJS build

Used by the indexer and other Node.js packages.

```
npm run build
```

Compiles TypeScript sources under `src/` to `dist/cjs/` via `tsc`.

## Browser bundle

Used by the website (`packages/website/webroot/js/reality-eth-lib.js`).
Exports all public functions from `browser-entry.ts` as `window.RealityLib`.

```
npm run build:browser
```

Built with esbuild (version pinned in `package.json` for reproducibility).
The output file is committed to the website package. To verify a clean rebuild
produces the same file:

```
npm run build:browser
sha256sum ../website/webroot/js/reality-eth-lib.js
```

Expected hash: `6b713caca2d26b7e9b4814e7137179d66d70af185228f4adfd66a1d3b1a159fa`

Update this hash in the README after any intentional change to `browser-entry.ts`
or its dependencies.
