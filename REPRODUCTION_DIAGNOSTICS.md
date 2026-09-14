# Reproduction diagnostics — continued scientific audit

This document supersedes the earlier claim that Fig. 2 top represents an unreproduced nonuniform metastable state. The original UI is maintained while the numerical and source differences are isolated. No paper coefficient is tuned to improve a visual match.

## Corrected target for Fig. 2 top

The published article p. 862 explicitly assigns Fig. 2 row 1 to smooth patterns, either due to early arrest or an unpatterned equilibrium. It also explains that features below approximately 1 µm are outside the global patterning mechanism being classified. The simulation on p. 858 is a nearly smooth sphere. The paper's caption calls the whole figure kinetic arrest, which is not sufficient reason to classify every row as a nonuniform metastable pattern.

For the actual top-row coefficients, the local potential has

```
f''(ψ) = τ + u₃ ψ + (u₄/2) ψ²
min f'' = τ − u₃²/(2u₄) = 20 − 1600/240 = 40/3 > 0.
```

The quadratic operator K(Δs+q₀²)² is nonnegative. Thus the free energy is strictly convex; on a connected closed sphere at fixed mean, the uniform state is the unique equilibrium. There cannot be an additional nonuniform metastable free-energy minimum at these coefficients. Finite-time residual fluctuations depend on initialization, but smoothing is expected. Our earlier metastability/missing-pattern interpretation was wrong and has been corrected in the coverage, model and handoff notes.

The public notebook's visualization radially displaces face-center points by the **raw** field. It separately rescales colors to the current min/max and draws fixed-size point glyphs (scale factor .5). Consequently visible granular texture or strong color contrast need not imply appreciable radial pattern amplitude. This is evidence about the supplied visualization route, not proof that every pixel of the published figure was rendered through exactly this notebook state. The notebook contains no archived outputs, exact RNG state or published solution array.

## Rebuilding the supplied spatial setup

The repository notebook at commit `428056b7e1a66b32fc913e58086649d2815d0dd5` declares Python 2.7.15, R=15, cellSize=.4 and a radial extrusion `r→1.1r`. With the literal source and FiPy 4.0.3, construction fails on the removed `order=2` argument. After removing it, literal doctest `...` prefixes in the supplied Gmsh string also cause parsing failure. Those two explicit compatibility edits allow a modern reconstruction; no radii or cell sizes were changed.

Historical FiPy 3.1–3.3 source does accept `order`. In the inspected meshing path, order>1 forces serial communication; it is not passed as Gmsh's finite-element polynomial-order flag. The modern reconstruction is **not** asserted to be the exact missing historical mesh.

FiPy 4.0.3 / Gmsh 4.15.2 generates 42,310 extruded cells, one connected domain, with volume-weighted cell-center radius 15.74818 and bounding radii 15/16.5. A volume-weighted Laplacian Rayleigh check gives low-degree eigenvalues about .908 times the ideal R=15 sphere values, consistent with the shell's larger effective radius. At degree 32 the ratio is .897; the discrete operator also mixes ideal spherical modes. The pointwise eigen-residuals are reported rather than hidden. See `assets/author-discretization-audit.json`.

This identifies a concrete distinction between the paper's mathematical sphere of radius 15 and the visible notebook's one-layer thick-shell numerical geometry. Radius 15 remains the primary mathematical comparison; changing it to an effective shell radius would be an explicitly separate code-discretization comparison, not an undocumented fit.

## Initial spectrum, not just point variance

FiPy's GaussianNoiseVariable draws one independent normal value per cell with the provided variance; it does not silently divide scalar variance by cell volume. In the rebuilt mesh a diagnostic MT19937 seed 19 draw has variance .03991 and weighted mean −.000122. The author's RNG seed is unavailable.

Projecting that cellwise field onto spherical harmonics gives RMS .01335 through degree 12, .03225 through degree 32, .06433 through degree 64, and .09548 through degree 96. The existing app's band-32 initialization instead normalizes the **retained field** to RMS .2 and sets its mean exactly to zero. Those are materially different initial spectra even though both descriptions mention a variance of .04. Approximate independent-cell counting predicts the same difference: retained variance scales roughly as ((B+1)²−1)/N_eff, with N_eff≈41,986 here.

The diagnostic compares both initializations explicitly while retaining the published PDE coefficients. A projection of the same cellwise field into successively larger spaces is distinguished from zero-padding an already fixed band-limited field. See `assets/initial-spectrum-audit.json` and `assets/initialization-audit.json`.

## Separating temporal and spatial errors

An independent exponential RK4 comparison solver implements the Cox–Matthews formula with real phi-function series/recurrences; it does not copy the reference paper's MATLAB programs. A separate NumPy spherical transform/solver agrees with the JavaScript result to approximately 2e−14 on a same-state comparison. Linear growth is exact to roundoff and a nonlinear refinement test displays fourth-order convergence. The original app's first-order stabilized update remains available for continuing legacy saved specimens; new runs use ETDRK4 as described below.

For the middle Fig. 2 coefficients at L64 and the identical original band-32 field, ETDRK4 Δt=.0025→.00125 gives relative field error 8.45e−5; .00125→.000625 gives 1.15e−5. For the bottom row those errors are .00300 and .000404. These are far smaller than the earlier stabilized first-order differences. Therefore the earlier discrepancy must not simply be explained away as inherent sensitivity of pattern formation.

Accurate time stepping also reveals spatial errors hidden by the old method's bias: L64 versus L96 at ETDRK4 Δt=.0025 has full coefficient/field L2 differences .220 (middle) and .118 (bottom), including the higher modes. The completed higher-resolution comparisons below separate these spatial errors using the same fixed initial field. Energy, spectrum, RMS, skewness, phase-area fraction and excursion-set component counts are tracked alongside pointwise errors; they answer different questions. Excursion counts report both four- and eight-neighbor connectivity on a shared analysis grid to expose sampling sensitivity.

Current evidence is in `assets/reference-time-audit.json`, `assets/reference-space-audit.json`, `assets/high-resolution-audit.json` and `assets/legacy-time-bias-audit.json`. No match score or claim of full pointwise convergence follows merely from a stable peak degree or low high-frequency power.

## Primary sources

- [Radja et al. (2019)](https://doi.org/10.1016/j.cell.2019.01.014), published Fig. 2 (p. 858), classification text (p. 862), Eq. 7 and methods.
- [Author notebook, fixed commit](https://github.com/asjaradja/PollenPhaseTransitionPaper/blob/428056b7e1a66b32fc913e58086649d2815d0dd5/PhaseDiagramCalculations/ConservedDynamics/FiPyConservedDynamics.ipynb).
- [FiPy Gaussian noise documentation](https://pages.nist.gov/fipy/en/latest/generated/fipy.variables.gaussianNoiseVariable.html), with scalar-variance semantics checked against source.
- [Historical FiPy 3.3 meshing source](https://github.com/usnistgov/fipy/blob/3.3/fipy/meshes/gmshMesh.py), for the old order argument.
- [Kassam & Trefethen (2005)](https://doi.org/10.1137/S1064827502410633), exponential RK4 numerical method.

## Completed same-field refinement and coupled-initialization results

The finest fixed-initial-field spatial comparisons at ETDRK4 Δt=.00125, t=2 are:

| Published coefficient pair | L64→96 | L96→128 | L128→160 | Positive excursion domains at L96/128/160 |
| --- | ---: | ---: | ---: | --- |
| Middle: q₀=2, τ=−20 | .21966 | .0033105 | .00004654 | 202 / 202 / 202 |
| Bottom: q₀=.5, τ=−20 | .11874 | .00016650 | .000002944 | 65 / 65 / 65 |

Errors are unaligned full-field relative L2 norms; means and initial coefficients are held fixed, and higher-degree coefficients are included. Four- and eight-neighbor excursion counts agree on the shared L160 analysis grid with periodic/pole connectivity. At L96, changing Δt=.0025→.00125 gives errors .000323 (middle) and .000171 (bottom). These data establish numerical reachability for these specified test fields; they are not an error certificate for every arbitrary user condition or an exact match to the unavailable author arrays.

The original coefficient pairs therefore generate the three stated global categories: nearly smooth, finer foam and coarser foam. The original diagnostic figure below uses fixed grayscale across spheres, so it does not magnify the smooth case's residual noise into a false texture.

![Independent simulations and numerical diagnostics](diagnostics/numerical-validation.png)

To isolate initialization effects from changing the random realization, we took one explicit cellwise field and compared its full degree-96 projection, its **same** coefficients truncated at degree 32, and those same low-degree coefficients rescaled to RMS .2. The constant coefficient is unchanged in every paired run. All use the original q₀/τ/u₃/u₄/K/D/R and the same t=2, L96, Δt=.00125.

| Initial field of this single diagnostic realization | Middle domain count | Bottom domain count |
| --- | ---: | ---: |
| Full degree-96 cellwise projection | 246 | 92 |
| Same field, degree-32 truncation | 234 | 93 |
| Same degree-32 field, only amplitude enlarged to RMS .2 | 195 | 68 |

These differences identify two real effects. Removing high initial degrees changes defect locations considerably even where the domain count is similar. Enlarging the retained noise changes the amount of coarsening by the fixed observation time. For the middle case the linear unstable degrees are 1–43 and the fastest degree is 35, so initial band32 omits part of the unstable spectrum; for the bottom they are 1–32 and fastest 24. The spectrum distinction is therefore not just a cosmetic change to random graininess. An ensemble study would be needed to turn these one-realization comparisons into population distributions.

The pointwise final L2 changes from full projection→band32 are 1.080 (middle), .350 (bottom); from band32→its enlarged-amplitude counterpart they are .925 and 1.011. Large field changes here arise from explicit changes of the initial problem, after controlling the integrator, not from unexplained failure of timestep convergence. The author's seed, original mesh and solution arrays are not provided, so an exact point-for-point correspondence with the published rendering cannot be uniquely specified. We make no claim to have recovered the authors' particular defects, all SEM pore statistics, or their rendering pixels.

## Browser integration after diagnosis

New Eq. 7 runs now use exponential RK4 (`radja-eq7-spherical-etdrk4-v2`) with recorded next timestep and energy-rejection fallback. Paper-coefficient presets use L96 and Δt≤.00125. Their initialization remains explicitly the independent band32/RMS.2 exploration field, **not** the author's cellwise realization; the initial bandwidth and amplitude can be inspected and changed. The interface says “start from the paper's coefficients,” not “exact author run.” This still provides the original PDE design space while keeping a clear boundary around source-equivalent initialization.

Saved v1 specimens keep their original first-order solver when continued. They are not silently reinterpreted as higher-accuracy trajectories. The screen layout and collection interaction are retained. New-v2 saving/continuation, old-v1 continuation and model IDs passed an actual browser check; analytical linear growth, fourth-order nonlinear refinement, checkpoint continuation and rejected-step recovery passed the numerical tests.

## Reproducing the audit

The research scripts accept `POLLEN_AUDIT_DIR` (default `.numerical-audit/`, ignored by Git). `node scripts/prepare_numerical_audit.mjs` writes the fixed initial vectors. The cellwise projection coefficients are an original diagnostic dataset in `assets/cell-noise-initialization.json`, with seed, rebuilt-geometry provenance and realized statistics, not author-supplied data.

The sequence `audit_reference.mjs`, `audit_reference_space.mjs`, `audit_high_resolution.py`, `audit_legacy_bias.mjs`, `audit_initialization.py`, `audit_coupled_initialization.py`, `compare_spatial_audit.py`, `audit_morphology.py`, and `plot_numerical_audit.py` regenerates the displayed comparisons. Run from the repository root; Python requires NumPy, SciPy and Matplotlib. The mesh reconstruction itself additionally used FiPy4.0.3/Gmsh4.15.2 with the two explicitly recorded compatibility edits. No author code, article image or private note is bundled.
