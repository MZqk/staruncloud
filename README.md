# Starun personal homepage

A dependency-free, responsive project hub for MZZZ. The deployable site is in `dist/`; edit its HTML, CSS, and JavaScript directly. No build step is required.

## Preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173 in a browser.

## Checks

```sh
node --test tests/homepage.test.mjs
```

## Project destinations

| Project | Destination |
| --- | --- |
| Starun Web | https://astra.starun.cloud/ |
| Telescope comparison | https://starun.cloud/telescope |
| Starun desktop | https://github.com/MZqk/StarunClient |
| DeepSky Skills | https://github.com/MZqk/deepsky-skill |
| DeepSky Motion | https://starun.cloud/motion/ |
| Starun mobile | https://github.com/MZqk/StarunAndroid |
| Sky pollution map | https://starun.cloud/map |

These are the requested final URLs. The Starun web application lives on its own host, `astra.starun.cloud` — it is not mounted under a `starun.cloud` sub-path, because the Next.js app has no `basePath` configured and its `/_next/*` asset URLs are absolute. Do not redirect existing applications to the homepage or use a catch-all homepage fallback for their routes.

The `web3astra` README currently describes a deep-sky image animation tool rather than a pollution map. The homepage follows the requested map name and URL; confirm the map application's source before routing it in production.

## Assets

The Starun symbol is reused from the local Starun web project. The nebula image is a deterministic synthetic sample from `web3astra`, compressed to JPEG, and is identified as illustrative in the interface. The before/after treatment and map are visual illustrations, not processing results or live map data.

## Deployment

Serve `dist/` at the domain root. The homepage itself needs only static hosting. Unknown paths answer with `dist/404.html` through the server's `error_page 404 /404.html` rule; the page keeps the 404 status and is marked `noindex`. The existing applications must remain mounted at their individual paths in the domain's reverse proxy. This repository does not change the deployment of any sibling project.
