# Pollenarium user guide

[Open the app](https://gyroid-eth.github.io/pollenarium/) · [日本語](user-guide.ja.md) · [Documentation](README.md)

Pollenarium is an educational lab for observing pollen SEM photographs and generating patterns with mathematical models on a sphere. You decide what resembles the reference. There is no automatic score or identification of biological material properties. The interface currently uses mostly Japanese control labels; their meanings are explained below.

## 1. Choose an observation in the atlas

In Observe, select **15点から選ぶ** (“Choose from 15”). Search by scientific name, or filter by protrusions, pits/pores, grooves/bands, networks, or smoothness. **すべて** (“All”) resets the shape filter; clear the search field separately when needed.

Selecting a photograph updates the image, species, photographer and source in Observe. **It leaves your calculation conditions and result unchanged.** Choose mathematical presets separately in the settings panel.

Use **実験へ戻る** (“Return to experiment”) or Escape to close. Opening focuses the search field; closing returns focus to the launch button. Use Tab/Shift+Tab to move within the atlas and Enter to select a specimen.

The filters are visual browsing cues. Some pores and grooves are apertures, whose formation is outside these models. Photographs are not displayed at a common physical scale: the selected Iris bucharica image has a 100 µm bar, while the other 14 have 10 µm bars. Read the original scale bar in each image.

## 2. Choose a model

| Mode | What it does | Main controls |
| --- | --- | --- |
| 平衡のかたち / Eq. 6 | Searches for low-energy shapes within a restricted set of spherical-harmonic degrees | l₀, u, r; **この条件で探索する** (“Search with these conditions”) |
| 模様の成長 / Eq. 7 | Evolves a field on the sphere while conserving its mean | q₀, τ, u₃, target time t; **この条件で育てる** (“Grow with these conditions”) |

Selecting Eq. 6 or one of its paper presets displays an independently precomputed candidate. This is not a newly completed live optimization. Press the search button to run a new browser calculation. The 34 Table 1 entries contain 24 distinct parameter pairs.

Switching to Eq. 7 starts a default growth calculation. Selecting a paper preset then loads its coefficients and waits for you to press the grow button. While those conditions are waiting, the sphere still shows the previous result. The three presets use the Fig. 2 coefficients, with an independent initialization and discretization.

Integrating Eq. 7 for a long time is not the same as the restricted Eq. 6 equilibrium search. Neither optimizer iterations nor the dimensionless dynamical time represent biological elapsed time.

## 3. Calculate and compare

Change one parameter at a time to make comparisons easier. Press **停止** (“Stop”) to inspect the current state. Saving is disabled while computing or after you change conditions without recalculating. Follow the status message beside the controls.

Drag the generated sphere to rotate it; use a mouse wheel to zoom. **凹凸の見せ方** changes graphical relief only. The rendering is not a physical wall-thickness prediction or an electron-microscope image model.

| Setting | Meaning |
| --- | --- |
| Eq. 6: l₀ | Determines the retained degree; one degree at integers, the two neighboring degrees otherwise |
| Eq. 6: u | Dimensionless cubic coupling affecting asymmetry between peaks and depressions |
| Eq. 6: r | Dimensionless ordering coefficient; the paper's phase diagram uses r=−1 |
| Eq. 7: q₀ | Preferred wavenumber in the energy, not automatically the fastest-growing spherical degree |
| Eq. 7: τ, u₃ | Coefficients affecting uniform-field instability and peak/depression asymmetry |
| seed | Seed for the initial random configuration |
| Initial RMS and maximum degree | Amplitude and bandwidth of the initial Eq. 7 noise |
| Mean field and R | Conserved mean and sphere radius |
| L and Δt | Retained degree and timestep upper limit; these affect numerical accuracy |

Expand **初期条件・計算の設定** (“Initial conditions and numerical settings”) for detailed controls. Eq. 6 also offers the number of independent starts and an iteration limit. Eq. 7 fixes D=K=1 and u₄=120 in the interface and records them explicitly.

## 4. Keep a specimen

After a calculation finishes or stops, add a title and observation, then select **My specimensに残す**. Saving is explicit, not automatic. Save again if you want to keep a later calculation state or a changed view.

A record pairs the model and numerical-method identifiers, full field coefficients, parameters, seed, actual time or search diagnostics, view/relief, generated PNG, observation and reference URLs/credits.

Select **取り出す** (“Take out”) on a card to restore it:

- **Eq. 7:** **保存時刻から計算を続ける** continues the actual saved coefficients using the stored next timestep. The current interface advances at least two time units beyond the saved time. Editing conditions hides this continuation action; running with changed conditions starts a fresh calculation.
- **Eq. 6:** the shape and conditions are restored, but the optimizer's internal state is not resumed. Searching again starts a new optimization with the saved conditions.
- **Legacy Eq. 7 records:** continuation keeps the original numerical method instead of silently replacing it with the newer solver.

## 5. Export and import JSON

Use a card's **JSON** action to export one record. On another browser or device, select **JSONを読み込む** (“Import JSON”), then take out the imported specimen. Importing adds a new record; repeated imports create multiple records. The current limit is 20 MB per file.

JSON contains the generated model image and numerical state, **not the PalDat SEM image bytes**. It retains the reference URL and credit. The generated PNG is embedded in the JSON; the interface does not offer a separate PNG download action.

Records live in the browser's IndexedDB. There is no account, server-side specimen storage or cloud synchronization. Browser, profile and origin (scheme, hostname and port) matter: `localhost`, `127.0.0.1` and the hosted demo use separate storage. Changing only the URL path on the same origin normally shares storage.

Clearing site data, browser storage eviction or ending a private-browsing session can remove records. Browser quotas also apply. Export the specimens you want to keep.

## Initial conditions and numerical accuracy

The same seed alone does not specify the same problem. Eq. 7 starts from band-limited random spherical-harmonic coefficients normalized to the requested spatial RMS. This differs from the authors' cellwise white noise. Keep the seed, mean, RMS and initial bandwidth together.

For a refinement comparison, hold physical coefficients, initial field and observation time fixed. First reduce Δt, then increase L. If you also change the initial bandwidth, you are comparing different initial problems rather than resolution alone.

Conserved mean, decreasing energy or a small high-degree power fraction do not prove convergence. Domain counts and typical spacing can agree while defects and the full fields differ. Eq. 6 likewise benefits from comparing energies across independent starts; a small gradient alone does not establish the global minimum.

See [model definitions](../MODEL.md), [coverage](../COVERAGE.md) and [same-field numerical diagnostics](../REPRODUCTION_DIAGNOSTICS.md) for tested conditions and remaining differences from the paper.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| SEM image missing | The code-only distribution displays an explicit missing-media label. Select a reference and follow its PalDat link in Observe |
| Sphere cannot render | Check whether WebGL is available in your browser/settings. Higher resolutions may require an additional rendering extension |
| Calculation is slow | Stop and try a shorter time or lower L. Distinguish quick exploration from an accuracy comparison |
| Save is disabled | The calculation is running, or changed conditions have not been calculated. Stop or recalculate |
| Specimens seem missing | Check the browser, profile and origin; import a previously exported JSON backup |
| Import rejected | Check the supported record/model format and the 20 MB limit. Arbitrary older prototype formats are not supported |

The educational demo uses a separately restricted PalDat image pack with photographer attribution. The code's MIT license does not cover those photographs. Read [the image terms](../references/PALDAT_RIGHTS.md) before reusing them.
