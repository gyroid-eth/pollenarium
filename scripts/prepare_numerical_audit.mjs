import fs from'node:fs';import{Simulation}from'../app/spectral.mjs';
const root=new URL('../',import.meta.url),dir=process.env.POLLEN_AUDIT_DIR||new URL('.numerical-audit/',root).pathname;fs.mkdirSync(dir,{recursive:true});
const s=new Simulation({L:64,initialBand:32,seed:19,noise:.2});fs.writeFileSync(dir+'/common-initial.json',JSON.stringify({coefficients:Array.from(s.a),description:'Fixed band32 seed19 RMS.2 mean0 coefficients; pad zeros for spatial refinement'}));
fs.copyFileSync(new URL('assets/cell-noise-initialization.json',root),dir+'/cell-noise-projection.json');console.log('Prepared exact diagnostic initial fields in',dir);
