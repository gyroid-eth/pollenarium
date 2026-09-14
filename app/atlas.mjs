/** Curated reference selection; deliberately independent of the numerical state. */
export class ReferenceAtlas {
  constructor({images, onSelect, selectedId}) {
    this.images = [...images];
    this.onSelect = onSelect;
    this.selectedId = selectedId;
    this.shape = 'all';
    this.query = '';
    this.dialog = document.getElementById('reference-atlas');
    this.trigger = document.getElementById('open-atlas');
    this.search = document.getElementById('atlas-search');
    this.filters = document.getElementById('atlas-filters');
    this.grid = document.getElementById('atlas-grid');
    this.count = document.getElementById('atlas-count');
    this.trigger.textContent = `${this.images.length}点から選ぶ`;
    this.trigger.disabled = false;
    this.trigger.onclick = () => this.open();
    document.getElementById('close-atlas').onclick = () => this.dialog.close();
    this.dialog.addEventListener('close', () => {
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.focus({preventScroll: true});
    });
    // Keep Tab at the first/last control inside the atlas, including in browsers
    // that otherwise move focus into browser chrome at a native dialog boundary.
    this.dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...this.dialog.querySelectorAll('button, input, a[href]')]
        .filter(element => !element.disabled && element.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    // Native <dialog> provides Escape and an inert background.
    this.search.addEventListener('input', () => {
      this.query = this.search.value.trim().toLocaleLowerCase();
      this.render();
    });
    const labels = {all:'すべて', spines:'突起', pits:'くぼみ・孔', bands:'溝・帯', network:'網目', smooth:'平滑'};
    for (const [key, label] of Object.entries(labels)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.dataset.shape = key;
      button.onclick = () => { this.shape = key; this.render(); };
      this.filters.append(button);
    }
  }

  open() {
    this.render();
    this.dialog.showModal();
    this.dialog.scrollTop = 0;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.search.focus({preventScroll: true});
  }

  render() {
    const matches = this.images.filter(ref =>
      (this.shape === 'all' || ref.shapeTags?.includes(this.shape)) &&
      ref.species.toLocaleLowerCase().includes(this.query));
    this.count.textContent = `${matches.length} / ${this.images.length}点のSEM`;
    for (const button of this.filters.children)
      button.setAttribute('aria-pressed', String(button.dataset.shape === this.shape));
    this.grid.replaceChildren();
    document.getElementById('atlas-empty').hidden = matches.length > 0;
    for (const ref of matches) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'taxon';
      button.dataset.reference = ref.id;
      button.setAttribute('aria-pressed', String(ref.id === this.selectedId()));
      button.setAttribute('aria-label', `${ref.species}を観察する`);
      const media = document.createElement('span');
      media.className = 'taxon-media';
      const image = document.createElement('img');
      image.alt = ''; // The enclosing button names the taxon.
      const missing = document.createElement('span');
      missing.className = 'taxon-missing';
      missing.textContent = 'SEM画像未同梱';
      missing.hidden = !!ref.localPath;
      image.hidden = !ref.localPath;
      image.onerror = () => { image.hidden = true; missing.hidden = false; };
      if (ref.localPath) image.src = new URL('../' + ref.localPath, import.meta.url);
      const name = document.createElement('strong');
      name.textContent = ref.species;
      const credit = document.createElement('small');
      credit.textContent = ref.requiredCredit.replace(/^Photo: /, '').split(' / PalDat')[0] + ' / PalDat';
      media.append(image, missing);
      button.append(media, name, credit);
      button.onclick = () => { this.onSelect(ref.id); this.dialog.close(); };
      item.append(button);
      this.grid.append(item);
    }
  }
}
