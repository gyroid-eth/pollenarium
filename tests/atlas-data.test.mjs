import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {matchesAtlasReference,paperPresetLabel,wikipediaLabel} from '../app/atlas.mjs';
import {createTaxonNames} from '../app/taxon-names.mjs';

const load=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const [manifest,presets,names,correspondence]=await Promise.all([
  load('../references/paldat-manifest.json'),load('../references/paper-presets.json'),
  load('../references/japanese-names.json'),load('../references/paper-atlas-correspondence.json')
]);
const refs=manifest.images,taxonName=createTaxonNames(names);

assert.equal(refs.length,52);
assert.equal(new Set(refs.map(x=>x.id)).size,52);
assert.equal(new Set(refs.map(x=>x.species)).size,52);
assert.equal(new Set(refs.map(x=>x.imageUrl)).size,52);
assert.equal(refs.filter(x=>x.paperPreset).length,33);
assert.equal(refs.filter(x=>matchesAtlasReference(x,{presetOnly:true},taxonName(x.species))).length,33);
assert.equal(refs.filter(x=>matchesAtlasReference(x,{shape:'compound-unit'},taxonName(x.species))).length,3);
assert.equal(refs.filter(x=>matchesAtlasReference(x,{query:'euphrosyne'},taxonName(x.species))).map(x=>x.species).join(','),'Iva xanthiifolia');

const bySpecies=new Map(refs.map(x=>[x.species,x]));
assert.match(paperPresetLabel(bySpecies.get('Phyllanthus sp.')),/属のみ$/);
assert.match(paperPresetLabel(bySpecies.get('Iva xanthiifolia')),/異名経由$/);
assert.match(wikipediaLabel(bySpecies.get('Zea mays')),/亜種・日本語/);
assert.match(wikipediaLabel(bySpecies.get('Pfaffia tuberosa')),/科・英語/);
assert.equal(bySpecies.has('Caldesia parnassifolia'),false);

for(const species of ['Alisma plantago-aquatica','Berberis vulgaris','Iva xanthiifolia','Polemonium pauciflorum','Utricularia sandersonii']){
  const name=taxonName(species),ref=bySpecies.get(species);
  assert.equal(name.name,null);
  assert.equal(name.label,ref.displayResolution.label);
  assert.equal(ref.displayResolution.labelType,'group-companion');
  assert.equal(ref.displayResolution.notSpeciesIdentification,true);
}

assert.equal(correspondence.rows.length,34);
assert.deepEqual(correspondence.rows.map(x=>x.row),Array.from({length:34},(_,i)=>i+1));
assert.equal(correspondence.rows.filter(x=>x.candidateId).length,33);
assert.deepEqual(correspondence.rows.filter(x=>!x.candidateId).map(x=>x.inputScientificName),['Caldesia parnassifolia']);
for(const [index,row] of correspondence.rows.entries()){
  assert.equal(row.inputScientificName,presets.equilibrium[index].species);
  assert.deepEqual(row.parameters,Object.fromEntries(['l0','u','r'].map(key=>[key,presets.equilibrium[index][key]])));
  if(row.candidateId){
    const ref=refs.find(x=>x.id===row.candidateId);
    assert.ok(ref);
    assert.equal(ref.paperPreset.sourceIndex,index);
    assert.equal(ref.paperPreset.matchClass,row.matchClass);
    assert.equal(ref.paperPreset.morphologyFitClaim,false);
  }
}

const classes=correspondence.rows.reduce((counts,row)=>({...counts,[row.matchClass]:(counts[row.matchClass]||0)+1}),{});
assert.deepEqual(classes,{
  'exact-species':25,'synonym-bridge':5,'genus-only':2,'not-found':1,'spelling-discrepancy':1
});
console.log('PASS atlas data: 52 unique references, 33/34 preset coverage, ranked links and display fallbacks');
