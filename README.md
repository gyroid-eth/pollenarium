# Pollenarium

花粉を観察し、球面上の模様を計算し、自分の標本箱に残す教育用Webアプリ。
Observe real pollen, explore mathematical patterns, and keep your own specimen collection.

**[Open Pollenarium](https://gyroid-eth.github.io/pollenarium/)** · [日本語ガイド](docs/user-guide.ja.md) · [English guide](docs/user-guide.en.md)

- Browse 15 individually credited SEM references in a searchable shape atlas.
- Explore two distinct models from Radja et al. (2019): restricted equilibrium shapes (Eq. 6) and conserved pattern growth (Eq. 7).
- Save complete numerical states, conditions, observations and generated snapshots locally; export/import JSON without an account.

You judge resemblance. There is no automatic score or biological parameter identification. This is an independent numerical implementation with documented approximations, not a certified reproduction of every published image or global minimum. See [model details](MODEL.md), [coverage](COVERAGE.md) and [numerical diagnostics](REPRODUCTION_DIAGNOSTICS.md).

## Run locally

From the repository root, with Python 3 installed:

```sh
python3 -m http.server 8916 --bind 127.0.0.1
```

Open [localhost:8916](http://localhost:8916/). The app uses browser ES modules, a Web Worker, WebGL and IndexedDB; it needs no application server or package installation. The source checkout does not contain SEM image files. Reference links remain available without them.

[開発ガイド](docs/development.ja.md) · [Development guide](docs/development.en.md) · [All documentation](docs/README.md)

## Code and image rights

Original code and original project outputs are **MIT licensed**; see [LICENSE](LICENSE). The article, author code and PalDat photographs are separate works and are not relicensed by this repository.

The educational demo serves a separate 15-image PalDat pack under PalDat's educational/noncommercial exception, with photographer and source attribution. Image files are excluded from Git history and fetched during the deployment build. This does not make them MIT assets or grant unrestricted commercial reuse. See [image rights](references/PALDAT_RIGHTS.md), the [per-image manifest](references/paldat-manifest.json), and [PalDat's terms](https://www.paldat.org/info/copyright).

Saved specimens belong to the browser's site storage; there is no account or cloud sync. Export important records as JSON. Exports contain generated model snapshots and reference metadata, **not SEM image bytes**.

## Citation

Radja, A., Horsley, E. M., Lavrentovich, M. O., & Sweeney, A. M. (2019). Pollen Cell Wall Patterns Form from Modulated Phases. *Cell*, 176(4), 856–868.e10. [DOI: 10.1016/j.cell.2019.01.014](https://doi.org/10.1016/j.cell.2019.01.014).

[Author implementation](https://github.com/asjaradja/PollenPhaseTransitionPaper) · [Bibliography](REFERENCES.bib)
