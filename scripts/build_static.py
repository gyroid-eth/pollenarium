"""Assemble the static app. No server, credentials, or package manager needed."""
from pathlib import Path
import argparse, shutil
ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--educational-media', action='store_true', help='Include the separately restricted local SEM pack; NOT a code-license asset')
a = p.parse_args()
out = ROOT / '.site'
if out.exists():
    shutil.rmtree(out)  # This script exclusively owns the generated .site directory.
out.mkdir()
for name in ['app', 'references']:
    shutil.copytree(ROOT / name, out / name, dirs_exist_ok=True)
(out / 'assets').mkdir(exist_ok=True)
for path in (ROOT / 'assets').glob('*audit.json'):
    shutil.copyfile(path, out / 'assets' / path.name)
for name in ['spatial-comparison.json', 'initialization-comparison.json']:
    if (ROOT / 'assets' / name).exists():
        shutil.copyfile(ROOT / 'assets' / name, out / 'assets' / name)
if (ROOT / 'diagnostics').exists():
    shutil.copytree(ROOT / 'diagnostics', out / 'diagnostics', dirs_exist_ok=True)
for name in ['equilibrium-presets.json', 'equilibrium-audit.json', 'dynamics-audit.json', 'timestep-audit.json']:
    if (ROOT / 'assets' / name).exists():
        shutil.copyfile(ROOT / 'assets' / name, out / 'assets' / name)
for name in ['index.html', 'README.md', 'MODEL.md', 'REPRODUCTION_DIAGNOSTICS.md', 'COVERAGE.md', 'PUBLICATION_NOTES.md', 'REFERENCES.bib', 'LICENSE', 'NOTICE.md']:
    shutil.copyfile(ROOT / name, out / name)
if (ROOT / 'docs').exists():
    shutil.copytree(ROOT / 'docs', out / 'docs', dirs_exist_ok=True)
(out / '.nojekyll').touch()
media = out / 'private-reference-media'
if media.exists():
    shutil.rmtree(media)  # Only generated output; prevents an optional pack lingering in a later code-only build.
if a.educational_media:
    shutil.copytree(ROOT / 'private-reference-media', media)
print(f'Built {out}; SEM pack {"included under separate PalDat conditions" if a.educational_media else "excluded; app links to original records"}.')
