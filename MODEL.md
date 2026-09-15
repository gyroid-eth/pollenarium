# Mathematical models and numerical limits

This app independently evaluates two distinct models in Radja et al. (2019). An Eq. 7 trajectory is never labelled an Eq. 6 minimum. The reference SEM is an observation target, not evidence that model parameters identify a species or its material properties. The app does not model aperture biogenesis, wall layering, molecular detail, or mechanical grain deformation.

## Eq. 6: restricted equilibrium exploration

With real orthonormal spherical harmonics on the unit sphere, write ψ=ΣaₗₘYₗₘ and

```
H = 1/2 Σ [(l−l₀)²+r] aₗₘ² + u/6 ∫ψ³ dΩ + 1/24 ∫ψ⁴ dΩ
r = R²τ/K,     u = u₃R/√(Ku₄).
```

The paper's restriction uses degree l₀ when it is an integer, and floor(l₀), ceil(l₀) otherwise. This is a truncation of the equilibrium theory, not the unrestricted dynamical field. All 34 Table 1 rows are supplied; they contain 24 unique parameter pairs at r=−1. The displayed Fig. 4 domain (approximately l₀=3–6, u=−1–1) is freely explorable; extending r beyond −1 is an app exploration beyond that diagram.

`app/equilibrium.mjs` evaluates the same cubic/quartic invariants by Gaussian spherical quadrature. An original limited-memory BFGS search with Armijo line search runs multiple independently seeded initial configurations. It does not copy the authors' Numerical Recipes routines or reproduce their simulated-annealing trajectory. The best energy found is a **candidate minimum**, not a proof of the global equilibrium or of a particular chiral/degenerate phase boundary.

The bundled candidate set uses seed 19, 12 starts, 600 iterations per start, and gradient tolerance 1e−7. All 24 selected candidates have gradient norm below 1e−7. A central finite-difference Hessian check (h=1e−5) within each restricted subspace finds no eigenvalues below −1e−6; the most negative numerical eigenvalue is approximately −4.14e−8. Rotational zero modes are expected. This supports local stability at that tolerance; it neither tests excluded harmonic degrees nor establishes the global minimum. Some initial configurations reach higher-energy stationary candidates. See `assets/equilibrium-audit.json`.

Eq. 6 saves full coefficients, conditions and search diagnostics. Restoring recovers the exact field and graphical view. Searching again starts a new optimization from the saved seed; the L-BFGS memory/random-stream position is not saved as a resumable optimizer checkpoint.

## Eq. 7: conserved dynamics on a sphere

```
∂tψ = D Δs [ K(Δs + q₀²)² ψ + τψ + (u₃/2)ψ² + (u₄/6)ψ³ ]
Δs Yₗₘ = −l(l+1)/R² Yₗₘ.
```

The interface fixes D=K=1 and u₄=120 and records these constants. D rescales time; making D and time unrelated independent knobs would be redundant. The Fig. 2 coefficient presets are (q₀,τ)=(1.5,+20), (2,−20), (.5,−20), with u₃=−40, R=15, initial mean zero, variance .04, and stop time 2. The app's presets use L=96, initial bandwidth 32 and an ETDRK4 timestep upper limit .00125; the latter numerical choices are ours, not published parameters.

`app/spectral.mjs` uses a real spherical-harmonic Galerkin discretization. Gaussian latitude quadrature has 2L+2 points and longitude uses the next power of two at least 4L+2. This overintegration resolves the projected polynomial nonlinearities for the retained space. The constant harmonic coefficient is preserved exactly. There is no clipped field or artificial mass renormalization during integration.

New experiments use the original exponential RK4 implementation in `app/etdrk4.mjs` (model ID `radja-eq7-spherical-etdrk4-v2`). Its linear spherical operator is exponentiated exactly; four nonlinear evaluations per step provide fourth-order accuracy in the validated regime. A browser wrapper rejects nonfinite or energy-increasing candidates and halves the step, recording the accepted/next step for continuation. The displayed step remains an upper limit, not an error tolerance. See [the numerical audit](REPRODUCTION_DIAGNOSTICS.md) for measured time/space errors.

Saved model-v1 records continue through their original first-order, stabilized semi-implicit Euler update; they are not silently migrated: For k²=l(l+1)/R², α=K(q₀²−k²)²+τ and N=u₃ψ²/2+u₄ψ³/6,

```
a_new = [a + Δt D k² (S a − N_hat)] / [1 + Δt D k² (α + S)]
S = max_grid |u₃ψ + (u₄/2)ψ²|.
```

A candidate with invalid denominator/nonfinite energy or increasing energy is rejected and the timestep halved. After acceptance the next step grows at most 5%, capped by the requested upper limit. Energy decrease is an acceptance condition, **not a bound on temporal error**. Each algorithm has its own model ID recorded in the saved state. The full double-precision coefficients, accepted time, next timestep, parameters and history are sufficient to continue the same numerical trajectory in the same implementation. Equivalence across unrelated future solver versions is not promised.

The deterministic initial field uses Gaussian random harmonic coefficients up to `initialBand`, normalized to the requested spatial RMS, with an explicit mean. It stays the same when numerical resolution is increased while the initial bandwidth is held fixed. The authors' inspected FiPy example instead uses Gaussian cellwise noise on a Gmsh shell (visible radius 15, cell size .4). These initial distributions and discretizations differ. Correction after rereading the published Fig. 2 and p. 862: the top row is explicitly a smooth/unpatterned category (early arrest or an unpatterned equilibrium), not a required nonuniform metastable pattern. With τ=20, u₃=−40, u₄=120, the minimum local second derivative is τ−u₃²/(2u₄)=40/3>0. Together with the nonnegative squared-gradient term this makes the free energy strictly convex, so the unique fixed-mean equilibrium is uniform. The observed smoothing is consistent with that target. Residual fluctuations and the author glyph/min-max-color rendering must be distinguished from persistent modeled surface patterns.

Linear growth is governed by σₗ=−Dk²[K(q₀²−k²)²+τ]. q₀ is the preferred wavenumber in the free energy, not automatically the fastest-growing angular degree. The tests verify growth and selected degree using the spherical dispersion relation.

## What was checked, and what remains sensitive

The core tests check harmonic roundtrip/quadrature, zero-mode conservation, stationary uniform fields, energy descent, deterministic seeds, exact saved-state continuation, linear growth and selected degree, timestep refinement and shared-mode resolution refinement. Moderate default conditions show decreasing discrepancy with refinement. These checks are not a universal accuracy guarantee for arbitrary user conditions.

For the Fig. 2 coefficient pairs we compared L=48,64,96 with the **same degree-32 initial field**, seed 19, at t=2. At Δt=.005, shared-coefficient relative differences L64 versus L96 were approximately 4.1e−7 (top), .046 (middle), and .022 (bottom). Middle/bottom Δt=.005 versus .0025 differences were approximately .33, despite low high-degree power and conserved mean. These large errors belonged to the former first-order solver. The app now uses ETDRK4 for new experiments and preserves that old method only for compatible saved-state continuation. At Δt=.000625 versus .0003125, field differences remain .266 (middle) and .122 (bottom), while dominant degrees remain 30 and 11 and energies differ by about .09% and .10%. These statistics are more stable than exact defect positions in this audit; the trajectories are not pointwise-converged. Further data are in `assets/timestep-audit.json`; no blanket temporal-convergence claim is made. The independent ETDRK4 comparison demonstrates that the old differences were substantially numerical bias, rather than evidence that such large errors are intrinsic to pattern formation. New same-initial-field spatial comparisons give L96→128 differences .00331 (middle) and .000166 (bottom); see the continuing audit for the finest reference.

The displayed high-degree power fraction (top 20% of retained degrees) is a truncation diagnostic, not a proof of resolution. A nearly zero field can also have a small fraction. Compare at the same initial bandwidth, seed and time when changing L, and compare successively smaller timesteps. The interface supports L=16,24,32,48,64,96. High resolutions/long trajectories cost more browser time and can be paused.

## Rendering and source separation

The field is synthesized on a smooth Gaussian sphere; low-degree equilibrium solutions are resynthesized on a finer display grid without adding mathematical modes. Shared smooth normals replace the original prototype's faceted mesh. The default view uses radius `.78 − relief*tanh(ψ)` and a monotone grayscale mapping. Optional outer-wall display controls define `u = −tanh(ψ)` and `radius = .78 + relief*h(u)`, where `h(u) = u^peakSharpness` for `u >= 0` and `h(u) = valleyDepth*u` for `u < 0`. Defaults `peakSharpness = valleyDepth = 1` preserve the original shape. Increasing sharpness narrows protruding regions and can also lower their peaks; valley depth controls inward relief. The mapping is continuous and monotone, retains the spatial ordering of the field (with possible ties at zero valley depth), and does not create independently located spines from a stripe field.

This bounded geometric interpretation is not a simulation of sporopollenin deposition, a physical wall thickness, an SEM forward model, or a fit to the reference photograph. The pattern field is the model output; the chosen height mapping is a separate presentation choice. View settings and the height-mapping version are saved independently of model parameters. Legacy records without the new keys restore the original mapping.

All solver, optimizer, renderer and UI code is original. No author coefficient files, licensed author routines, article figures, PDF, or private notes are distributed. PalDat's 15 individually verified local SEMs retain their scale bars and separate rights/credits. Generated PNG/JSON exports do not contain SEM bytes. See [COVERAGE.md](COVERAGE.md), [PUBLICATION_NOTES.md](PUBLICATION_NOTES.md), and [PalDat rights](references/PALDAT_RIGHTS.md).

Earlier `/prototypes/` and `/game/` routes use a coarse cotangent-sphere Python calculation and precomputed playback. Their older records cannot be imported as the new spherical spectral schema. They are preserved only as direction-review artifacts and are not shipped in the static app build.
