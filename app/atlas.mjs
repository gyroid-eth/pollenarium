/** Curated reference selection; deliberately independent of the numerical state. */
const MATCH_LABELS={
  'exact-species':'種一致','synonym-bridge':'異名経由',
  'spelling-discrepancy':'綴り要確認','genus-only':'属のみ'
};
export function paperPresetLabel(ref){
  const p=ref.paperPreset;if(!p)return'';
  return `Table 1 row ${p.row} · ${MATCH_LABELS[p.matchClass]||'対応要確認'}`;
}
export function wikipediaLabel(ref){
  const w=ref.wikipedia;if(!w)return'';
  const ranks={species:'種',subspecies:'亜種',genus:'属',family:'科'};
  return `Wikipedia（${ranks[w.targetRank]||w.targetRank}・${w.language==='ja'?'日本語':'英語'}）↗`;
}
export function matchesAtlasReference(ref,{shape='all',presetOnly=false,query=''},taxon={search:''}){
  const classification=ref.classification||{},family=classification.family||{},original=classification.originalNameGenus||{},accepted=classification.acceptedNameGenus||{};
  const haystack=[taxon.search,ref.species,ref.paldatSpecies,ref.taxonomy?.acceptedScientificName,family.scientificName,family.japaneseName,original.scientificName,original.japaneseName,accepted.scientificName,accepted.japaneseName]
    .filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase();
  return (shape==='all'||ref.shapeTags?.includes(shape))&&(!presetOnly||!!ref.paperPreset)&&haystack.includes(query);
}
export class ReferenceAtlas {
  constructor({images, onSelect, selectedId, taxonName}) {
    this.images = [...images];
    this.taxonName = taxonName;
    this.onSelect = onSelect;
    this.selectedId = selectedId;
    this.shape = 'all';
    this.presetOnly = false;
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
      this.query = this.search.value.trim().normalize('NFKC').toLocaleLowerCase();
      this.render();
    });
    const labels = {all:'すべて', spines:'突起', pits:'くぼみ・孔', bands:'溝・帯', network:'網目', smooth:'平滑', 'compound-unit':'複合粒'};
    for (const [key, label] of Object.entries(labels)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.dataset.shape = key;
      button.onclick = () => { this.shape = key; this.render(); };
      this.filters.append(button);
    }
    this.presetFilter=document.createElement('button');
    this.presetFilter.type='button';
    this.presetFilter.className='preset-filter';
    this.presetFilter.textContent='論文presetあり';
    this.presetFilter.onclick=()=>{this.presetOnly=!this.presetOnly;this.render()};
    this.filters.append(this.presetFilter);
  }

  open() {
    this.render();
    this.dialog.showModal();
    this.dialog.scrollTop = 0;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.search.focus({preventScroll: true});
  }

  render() {
    const matches = this.images.filter(ref => matchesAtlasReference(ref,{shape:this.shape,presetOnly:this.presetOnly,query:this.query},this.taxonName(ref.species)));
    this.count.textContent = `${matches.length} / ${this.images.length}点のSEM`;
    for (const button of this.filters.querySelectorAll('[data-shape]'))
      button.setAttribute('aria-pressed', String(button.dataset.shape === this.shape));
    this.presetFilter.setAttribute('aria-pressed',String(this.presetOnly));
    this.grid.replaceChildren();
    document.getElementById('atlas-empty').hidden = matches.length > 0;
    for (const ref of matches) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'taxon';
      button.dataset.reference = ref.id;
      button.setAttribute('aria-pressed', String(ref.id === this.selectedId()));
      button.setAttribute('aria-label', `${this.taxonName(ref.species).full}を観察する`);
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
      const japanese = document.createElement('span');
      japanese.className = 'taxon-ja';
      japanese.textContent = this.taxonName(ref.species).label;
      const preset = document.createElement('span');
      preset.className = 'taxon-preset';
      preset.textContent = paperPresetLabel(ref);
      preset.hidden = !ref.paperPreset;
      const credit = document.createElement('small');
      credit.textContent = ref.requiredCredit.replace(/^Photo: /, '').split(' / PalDat')[0] + ' / PalDat';
      media.append(image, missing);
      button.append(media, name, japanese, preset, credit);
      button.onclick = () => { this.onSelect(ref.id); this.dialog.close(); };
      item.append(button);
      this.grid.append(item);
    }
  }
}
