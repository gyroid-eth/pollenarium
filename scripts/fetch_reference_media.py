"""Fetch the individually documented reference images for educational use.

These are not MIT assets. Read references/PALDAT_RIGHTS.md before redistributing.
This helper fetches only the manifest-listed educational references; it grants no rights.
"""
from pathlib import Path
import hashlib
import json
import urllib.request
import time

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'references/paldat-manifest.json').read_text())
print(manifest['rights'])
for item in manifest['images']:
    path = root / item['localPath']
    if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256']:
        print('Already present:', path.name)
        continue
    for attempt in range(3):
        try:
            request = urllib.request.Request(item['imageUrl'], headers={'User-Agent': 'Pollenarium educational-reference builder'})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read()
            break
        except OSError:
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))
    if hashlib.sha256(data).hexdigest() != item['sha256']:
        raise RuntimeError('Source image changed; review the source and credit before replacing: ' + item['id'])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    print(path.name, '—', item['requiredCredit'])
