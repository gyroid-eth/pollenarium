# Development guide

[日本語](development.ja.md) · [User guide](user-guide.en.md) · [Repository](https://github.com/gyroid-eth/pollenarium)

Pollenarium is a static browser application. The runtime uses native ES modules, a module Web Worker, WebGL and IndexedDB. It has no npm installation step, external font dependency or application-server API. Python 3 serves/builds the site; Node.js runs the numerical tests. Use a browser supporting these APIs and native `<dialog>`. High-resolution WebGL meshes need `OES_element_index_uint`.

## Run and build

Run commands from the repository root:

```sh
python3 -m http.server 8916 --bind 127.0.0.1
```

Open [localhost:8916](http://localhost:8916/). Use HTTP rather than opening the HTML as a local file: modules, data fetches and the worker need the served application context.

Build a code-only static site:

```sh
python3 scripts/build_static.py
```

The generated directory is `.site/`. With the repository server still running, inspect [the nested build](http://localhost:8916/.site/). This exercises project-subpath URLs. Root and nested paths on the same origin share the specimen database; they are not isolated test profiles.

### Separate educational image pack

The public educational demo at [gyroid-eth.github.io/pollenarium](https://gyroid-eth.github.io/pollenarium/) is built with a separately restricted PalDat pack. Its deployment build fetches only the 15 individually documented images, then includes them:

```sh
python3 scripts/fetch_reference_media.py
python3 scripts/build_static.py --educational-media
```

The fetch helper validates each SHA-256 against the manifest and rejects changed content for review. It does not discover or harvest additional images. Photos stay out of Git history; their inclusion in a deployment artifact does not make them MIT assets. A later code-only build removes the generated media directory so a previous image pack does not linger.

Preserve each photographer, publication link, full image frame and scale bar. The educational/noncommercial exception is not a general commercial or redistribution license. Read [PalDat rights](../references/PALDAT_RIGHTS.md) and [publication notes](../PUBLICATION_NOTES.md) before changing how media is distributed.

## Code map

| Path | Responsibility |
| --- | --- |
| `app/index.html`, `app/style.css` | Comparison desk, controls, atlas dialog and responsive presentation |
| `app/main.mjs` | UI state, model controls, worker jobs, reference switching and specimen cards |
| `app/atlas.mjs` | Curated name search, visual filters, selection and dialog focus |
| `app/worker.mjs` | Eq. 6/Eq. 7 dispatch, pause/restore and calculation scheduling |
| `app/spectral.mjs` | Spherical basis/transforms, initialization and legacy Eq. 7 solver |
| `app/etdrk4.mjs` | Current Eq. 7 exponential RK4 and energy-rejection wrapper |
| `app/equilibrium.mjs` | Restricted Eq. 6 multistart optimization |
| `app/renderer.mjs` | Graphical scalar-field relief and saved view |
| `app/storage.mjs` | Record validation, IndexedDB and JSON transfer |
| `references/` | Paper coefficient presets and per-image provenance/rights |
| `assets/`, `diagnostics/` | Independent candidate calculations and numerical audit results |
| `scripts/`, `tests/` | Static build, curated image fetch and numerical checks |

The reference selection must remain independent of the numerical preset and field. A species name in Table 1 is not evidence that a specific photograph was fitted by its listed coefficients. The atlas tags describe visible features, not biological classifications or successful model matches.

## Numerical checks

The core tests use Node's built-in assertions and native ES modules:

```sh
node tests/spectral.test.mjs
node tests/equilibrium.test.mjs
node tests/etdrk4.test.mjs
node tests/etdrk4-continuation.test.mjs
```

They check transforms/quadrature, deterministic initialization, conserved mean, energy behavior, linear growth and selected degree, gradients/symmetry, refinement and checkpoint continuation. Passing them is not a universal accuracy certificate.

For numerical changes, compare the same initial coefficient vector at the same physical parameters and observation time. Include full-field errors and useful shape statistics; a stable domain count can hide large positional differences. Preserve the constant mode, distinguish time from spatial error, and test model-specific save/continue behavior. Eq. 6 needs candidate-energy and restricted-gradient checks across starts; it must not be labelled a global minimum solely from convergence of one optimizer run.

[The reproduction report](../REPRODUCTION_DIAGNOSTICS.md) documents the reference audit and its commands. `node scripts/prepare_numerical_audit.mjs` prepares fixed initial vectors. Further scripts write substantial output and may take much longer than unit tests. They use `.numerical-audit/` by default; `POLLEN_AUDIT_DIR` selects another scratch directory. The independent Python audit needs NumPy, SciPy and Matplotlib. Reconstructing the diagnostic mesh additionally used FiPy and Gmsh; these are not app/runtime requirements. Audit scripts can overwrite tracked result JSONs, so inspect their diffs before keeping regenerated results. Earlier first-order audit assets are historical evidence, not results of the current solver.

## Records and compatibility

The record schema is `pollen-specimen/2`. Its `state` includes a model identifier, complete coefficients, parameters and time/search information; the record also includes reference metadata, view and a generated PNG. `app/storage.mjs` is the validation authority.

| Model identifier | Restore/continue behavior |
| --- | --- |
| `radja-eq6-restricted-real-harmonics-v1` | Restore field and settings; another search starts a new optimizer |
| `radja-eq7-spherical-etdrk4-v2` | Continue the saved coefficients and next timestep with exponential RK4 |
| `radja-eq7-spherical-spectral-v1` | Continue with the original first-order method |

Do not silently reinterpret a stored state under a different integrator. If a numerical change alters continuation semantics, define an explicit version/compatibility policy. Do not change database names merely to rename the product. Current storage is IndexedDB database `pollen-specimen-cabinet`, store `specimens`.

JSON import adds a new ID and preserves the source ID as `importedFrom`. Exports contain no SEM bytes, but do contain user observations and reference URLs. Treat those as user content. Rendering is a bounded interpretation of the field; changing relief must not change the solver coefficients.

## UI and release checks

Before keeping a UI change, inspect real desktop and mobile screens, both models and expanded settings. Verify name search, filters and empty results; reference/credit switching; Escape, Enter and focus return; save/restore and JSON transfer; and the nested code-only build with media placeholders. With the calculation paused, compare full saved states before/after changing an observation to catch accidental numerical resets. Use an isolated browser profile for destructive storage tests.

Original code and original project outputs are [MIT licensed](../LICENSE). The authors' implementation, the paper and PalDat images are not covered by that license. Preserve the research citations and label approximations rather than claiming exact paper reproduction. Do not add third-party scientific code or media without checking its license and provenance.
