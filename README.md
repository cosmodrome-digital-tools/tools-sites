# tools-sites

Source code for a small family of free, ad-supported calculator and utility-tool websites.

Every calculator runs entirely in your browser. The sites have no accounts, no forms that store data, and no server code: each one is a static site built with [Astro](https://astro.build) and served from Cloudflare.

## Sites

| Site | Folder | Live URL |
|---|---|---|
| Home & Yard Calcs | `sites/home-project-calcs/` | Not launched yet |

## Repository layout

```
packages/   shared building blocks (layout, SEO, calculator frame, ad slots, consent)
sites/      one folder per website; each site's tools live in sites/<site>/tools/<tool>/
scripts/    the new-tool scaffold and the repository checks run in CI
docs/       guides for contributors
```

## Run it locally

You need Node.js 22 (see `.nvmrc`).

```sh
npm ci                              # install exact dependency versions
npm test                            # run every unit test
npm run build                       # build every site into sites/<site>/dist/
npm run check                       # repository checks (run after the build)
npm run dev:home-project-calcs      # local dev server for one site
```

To start a new tool, see [docs/BUILDING-TOOLS.md](docs/BUILDING-TOOLS.md).

## License

No license: all rights reserved. You may view this code, but not copy, modify, or reuse it.
