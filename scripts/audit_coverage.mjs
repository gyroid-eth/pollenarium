import fs from'node:fs';import{minimize}from'../app/equilibrium.mjs';
const root=new URL('../',import.meta.url),refs=JSON.parse(fs.readFileSync(new URL('references/paper-presets.json',root)));const seen=new Map(),out=[];
for(const row of refs.equilibrium){const key=row.l0+':'+row.u;let state=seen.get(key);if(!state){state=minimize({l0:row.l0,u:row.u,r:-1,seed:19,restarts:12,maxIterations:600});seen.set(key,state)}out.push({...row,state});}
fs.writeFileSync(new URL('assets/equilibrium-presets.json',root),JSON.stringify({generatedBy:'Original independent Eq6 multistart L-BFGS, 12 starts, seed19. Candidate minima, not author coefficient files.',presets:out}));
console.log('Rows',out.length,'unique conditions',seen.size,'max gradient',Math.max(...out.map(x=>x.state.diagnostics.gradientNorm)));
