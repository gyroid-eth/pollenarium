/** Keep species identification separate from Japanese display names and group labels. */
export function createTaxonNames(data){
 const taxa=new Map(data.taxa.map(t=>[t.inputScientificName,t]));
 return species=>{
  const t=taxa.get(species),name=t?.displayDecision?.status==='recommended'?t.displayDecision.candidate:null;
  const group=t?.classification?.companionLabel?.ja||'';
  const label=name||group;
  return {name,group,label,full:label?`${species} — ${label}`:species,
   search:[species,name,group].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase()};
 };
}
