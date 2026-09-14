import fs from'node:fs';import{Simulation}from'../app/spectral.mjs';
const results=[];const relative=(a,b)=>{let e=0,n=0;for(let i=0;i<Math.min(a.length,b.length);i++){e+=(a[i]-b[i])**2;n+=b[i]**2}return Math.sqrt(e/Math.max(n,1e-30))};
for(const[q0,tau]of[[1.5,20],[2,-20],[.5,-20]]){
 let states=[];for(const[L,dt]of[[48,.005],[64,.005],[96,.005],[64,.0025]]){const start=performance.now(),s=new Simulation({q0,tau,u3:-40,noise:.2,initialBand:32,L,dt,stopTime:2});while(s.step());const state=s.state();states.push(state);console.log(JSON.stringify({q0,tau,L,dt,seconds:(performance.now()-start)/1000,energy:s.energy,peak:state.diagnostics.peakDegree,tail:state.diagnostics.tailPowerFraction}));}
 results.push({q0,tau,initialization:'seed 19; Gaussian harmonic coefficients through degree 32, RMS .2, mean 0; not author cellwise noise',runs:states.map(s=>({parameters:s.parameters,diagnostics:s.diagnostics})),relativeCoefficientDifferences:{L48vs96:relative(states[0].coefficients,states[2].coefficients),L64vs96:relative(states[1].coefficients,states[2].coefficients),dt005vs0025_L64:relative(states[1].coefficients,states[3].coefficients)}});
 fs.writeFileSync('assets/dynamics-audit.json',JSON.stringify({method:'same band-limited initial field; final t=2; differences on shared coefficients; diagnostics do not establish match to published images',results},null,2));
}
