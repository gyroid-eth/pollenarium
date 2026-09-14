# Radja 2019 design-space coverage

Scope: the mathematical pattern families and parameter domains shown by the paper's models, not every biological structure visible in the accompanying SEMs. This is a coverage record with implementation/validation status, not a claim that every published minimum has already been reproduced.

| Source | Model / pattern space | Published domain or conditions | App coverage / remaining evidence |
| --- | --- | --- | --- |
| Fig. 1 + Table 1 | Eq. 6 equilibrium: polyhedral protrusions, inverse/depression patterns, chiral stripes, mixtures | 34 listed species examples; l₀ from 3.5 to 20.5; u=−1,0,+1; r=R²τ/K=−1 | All 34 rows available as presets; 24 unique pairs independently minimized in the same restricted subspaces. All selected candidates have gradient norm <1e−7 and no Hessian eigenvalue <−1e−6 within that subspace. Local stability is supported, global minima and full published shape identity are not established. |
| Fig. 4 | Eq. 6 phase diagram, intermediate and degenerate minima | Displayed l₀≈3–6 and u∈[−1,1], r=−1 | Implemented continuous free exploration across this domain. The exact complete sampling list is not supplied by the plot or inspected repository; no invented uniform sampling grid is attributed to the authors. Phase boundaries/degeneracies need repeated minima and energy comparison, not a shape classifier. |
| STAR Methods, Eqs. 3–6 | Equilibrium free energy with three dimensionless controls | l₀, u=u₃R/√(Ku₄), r=R²τ/K; one l for integer l₀, floor/ceil l for intermediate l₀ | Independent quadrature evaluation of the same cubic/quartic invariants; original multistart minimization rather than copying Numerical Recipes. General r exploration is an extension beyond the r=−1 diagram. |
| Fig. 2, top | Eq. 7 arrested dynamics | q₀=1.5, τ=+20; D=K=1, u₃=−40, u₄=120, R=15; initial Gaussian variance .04; t=2 | Implemented coefficient preset. Corrected target: the published text p. 862 calls row 1 smooth/unpatterned. The specified free energy is strictly convex (minimum local curvature 40/3); smoothing is expected, not evidence of a missing metastable branch. Initial-spectrum and rendering differences remain under diagnostic comparison. |
| Fig. 2, middle | Eq. 7 arrested dynamics | q₀=2, τ=−20; remaining constants/initialization/time as above | Implemented coefficient preset and live computation; L48/64/96 and timestep audits available. Original first-order bias diagnosed and replaced for new runs by ETDRK4. Same-field time/space convergence demonstrated through L160; initialization still differs from the missing original realization. |
| Fig. 2, bottom | Eq. 7 arrested dynamics | q₀=.5, τ=−20; remaining constants/initialization/time as above | Implemented coefficient preset and live computation; ETDRK4 time/space convergence demonstrated; initialization/provenance limits remain. |
| Fig. 3, Figs. S1–S2 | Developmental observations, glycosyl composition/linkages | Experimental evidence; no separate simulated design-space coordinates | Learning context only, not additional solver modes or a source of invented numeric presets. |
| Fig. 5, Fig. S3, Table 2 | Phylogenetic/trait reconstruction | Evolutionary analysis | Context only; not a pollen-surface forward simulation. |
| Supplemental Tables S1–S4 | Developmental literature/chemical/evolutionary support | Separate supplementary tables not yet retrieved in this environment | Local PDF includes the three supplementary figures. Publisher/CDN supplementary-file requests returned 403. No assertion that unchecked tables add no parameters; resolve this source gap before declaring complete source coverage. |

The inspected author repository is commit `428056b7e1a66b32fc913e58086649d2815d0dd5`. It contains single-/two-degree GD and SA branches and a separate FiPy conserved-dynamics notebook. It does not include a documented comprehensive archive of every equilibrium solution in Figure 1/4. Exact author RNG states, every annealing endpoint and a full phase-diagram sample manifest are not available from the inspected files.

Equation 6 is evaluated in real orthonormal harmonics as

`H = 1/2 Σ[(l−l₀)²+r] a_lm² + u/6 ∫ψ³ dΩ + 1/24 ∫ψ⁴ dΩ`.

This is the real-basis equivalent of the Gaunt-coefficient form, on the restricted mode set. It is not the Eq.7 free energy. A numerical optimizer's iteration count is not biological time.

[Paper DOI](https://doi.org/10.1016/j.cell.2019.01.014) · [author code](https://github.com/asjaradja/PollenPhaseTransitionPaper) · [arXiv author preprint](https://arxiv.org/abs/1803.03643)

Checked directly: published PDF Fig.4 and Eq.6 pages by rendered image; Table 1 text and page; STAR Methods; included supplementary figure captions; author repository structure/constants. The article/preprint version difference is retained rather than silently substituted for missing supplements.

## Current deliverable

`app/` implements both branches, arbitrary conditions in the supported ranges, original computed presets, local specimen storage, JSON transfer and model-specific restore behavior. `assets/equilibrium-audit.json`, `assets/dynamics-audit.json` and `assets/timestep-audit.json` quantify tested limits. The interface intentionally provides no automatic match score. A selectable domain is not a claim that every phase boundary, degeneracy or biological SEM has been reproduced.

## Continued numerical audit

[REPRODUCTION_DIAGNOSTICS.md](REPRODUCTION_DIAGNOSTICS.md) supersedes the earlier Fig. 2 interpretation and first-order-solver conclusions. Top is the smooth/unpatterned class; middle/bottom are numerically reachable without altering the published PDE coefficients. At fixed initial field, L128→160 relative errors are 4.65e−5 / 2.94e−6 and domain counts are stable. New browser runs use ETDRK4; old records retain their old method. Exact author initial states and full phase-boundary/degeneracy verification remain outside the evidence.
