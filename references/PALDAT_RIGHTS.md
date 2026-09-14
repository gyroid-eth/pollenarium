# PalDat reference images — rights separate from app code

Checked 14 September 2026 against the live [official Copyright and Citation page](https://www.paldat.org/info/copyright).

PalDat states that its content is copyright protected and describes an exception for educational or other noncommercial uses. It requires photographer and PalDat attribution for images; commercial reuse requires prior written permission from the Society for the Promotion of Palynological Research in Austria (AutPal). These terms are **not** the MIT license or a general permissive open-data license.

The official Pollenarium demo is a noncommercial educational application using 15 individually verified SEM images, selectable as qualitative observation references. Images remain unmodified, including their original scale bars. The educational site fetches this limited pack at build time under the stated exception. Images are not committed to the source repository; there is no bulk harvesting or claim of individually negotiated permission.

## Original publication and image records

| Reference | Exact SEM | Photographer | Preparation | Role |
| --- | --- | --- | --- | --- |
| [Delonix regia](https://www.paldat.org/pub/Delonix_regia/302200) | [2004953](https://www.paldat.org/pic/2004953.jpg), oblique polar view, 10 µm scale | H. Halbritter | Dry pollen, rehydrated in water, critical point dried, gold sputter coated | Active target: network spacing and connectivity only |
| [Aristolochia clematitis](https://www.paldat.org/pub/Aristolochia_clematitis/303787) | [1018467](https://www.paldat.org/pic/1018467.jpg), hydrated grain, 10 µm scale | H. Halbritter | Fresh pollen, rehydrated in water, critical point dried, gold sputter coated | Global smoothness; microscopic perforations are outside the paper global-pattern model |
| [Berberis vulgaris](https://www.paldat.org/pub/Berberis_vulgaris/303900) | [1012963](https://www.paldat.org/pic/1012963.jpg), hydrated grain, 10 µm scale | W. Oberschneider | Fresh pollen, water rehydration and chloroform, critical point dried, gold sputter coated | Qualitative spiral geometry; aperture biogenesis is outside the model |

Display credit: **Photo: H. Halbritter / PalDat (2000 onwards, www.paldat.org)**, with the relevant publication link. Berberis uses **Photo: W. Oberschneider / PalDat (2000 onwards, www.paldat.org)** instead.

The diagnosis author and image photographer are not interchangeable. In particular, Weis is a coauthor of the Delonix record and photographer of its flower image; the SEM used here is credited to Halbritter.

## Concrete separation for OSS publication

- Original JavaScript, Python, styling and mathematical simulation output use the MIT license.
- `private-reference-media/` is ignored by Git and contains the restricted local educational image pack.
- Game review screenshots and their combined board contain the reference SEM; `.gitignore` excludes these too. A screenshot does not remove the underlying image rights.
- `paldat-manifest.json` records each exact source, photographer, preparation and rights statement. It does not grant rights to the referenced media.
- Player JSON exports contain the **generated** model PNG, numerical field, parameters and source-reference metadata. They do not embed or relicense the SEM.
- A public code-only distribution can document the optional local educational reference pack. An educational hosted version must keep per-image attribution and define its allowed audience/use separately from the code license.

The hosted demonstration relies on the educational/noncommercial exception for this specific teaching use. It is not an unrestricted image bundle or a grant for commercial forks, monetized hosting, or other redistribution outside those terms. Such uses require their own assessment and any permission required by AutPal. No affiliation or endorsement by PalDat is implied.

## Expanded observation selection

The manifest now documents 15 exact images (12 additional Table 1 taxa), each visually checked including its original scale bar. Iris bucharica has a 100 µm scale bar; the other 14 selected images have 10 µm bars. Each photograph is shown whole, not resized to a shared physical scale. The extra Chenopodium album SEM is by B. Diethart; the other 11 new SEMs are by H. Halbritter. Visual browsing categories are editorial cues: “pits” and “bands” can include apertures, whose formation is outside the model. Same-species Table 1 links do not establish that the selected SEM is the paper image or that its parameters were fitted to this particular specimen. See [the individually sourced manifest](paldat-manifest.json) for exact image IDs, publication citations, preparation, checksums and credits.
