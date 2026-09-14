# Publication and distribution

## Source and hosted demo

- Source: https://github.com/gyroid-eth/pollenarium
- Educational demo: https://gyroid-eth.github.io/pollenarium/
- Original code and generated assets: [MIT](LICENSE).
- PalDat photographs: separate [image terms](references/PALDAT_RIGHTS.md), never MIT.

The Git repository contains the static application, independent numerical solvers, tests, numerical audits, documentation, and a curated image-provenance manifest. It does not contain PalDat photographs, article figures/PDFs, author code, personal experiment records, or internal design-review screenshots.

The default static build is code-only. The official noncommercial educational Pages deployment fetches exactly the 15 images recorded in the manifest, verifies their SHA-256 hashes, and includes them in a separate media directory under PalDat’s educational/noncommercial exception. Original scale bars and per-image photographer/source credits are retained. This deployment choice does not grant image rights to commercial forks or turn the media into open data. There are no advertising, payment, account, or application telemetry services in this app.

## Rebuild and deploy

Run the numerical tests, then `python3 scripts/build_static.py` for a code-only site. To build an educational image-bearing site within the image terms, first run `python3 scripts/fetch_reference_media.py`, then `python3 scripts/build_static.py --educational-media`.

The official repository’s Pages workflow performs the educational build. Forks run the code-only build by default. Configure GitHub Pages to use GitHub Actions. The deployment is served from the repository subpath and uses relative resource URLs. GitHub Pages may collect service-level access logs; this is separate from the app’s browser-local specimen storage.

## Independent implementation

The author repository was inspected at commit `428056b7e1a66b32fc913e58086649d2815d0dd5`. It had no general LICENSE/COPYING file and referenced Numerical Recipes routines. None of its routines were copied or translated into this project. The JavaScript solvers and renderer implement the published mathematics independently. Optional scientific audit dependencies are not bundled with the browser app.

Numerical convergence has been investigated for documented initial fields and parameter pairs, not certified for every user setting. The app does not recover the authors’ unknown RNG states or guarantee their global minima. See [coverage](COVERAGE.md).
