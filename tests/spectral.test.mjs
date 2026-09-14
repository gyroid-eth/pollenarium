import assert from 'node:assert/strict';
import {SphereBasis,Simulation,index} from '../app/spectral.mjs';
const errors=[];
function norm(a){return Math.sqrt(a.reduce((s,x)=>s+x*x,0))}
function relative(a,b){return norm(a.map((x,i)=>x-b[i]))/Math.max(norm(b),1e-20)}
function run(p,state){let s=new Simulation(p,state);while(s.time<s.p.stopTime-1e-12)s.step();return s}
let b=new SphereBasis(24),a=new Float64Array(b.size);for(const [l,m,v]of[[0,0,.8],[1,-1,-.2],[12,5,.7],[24,-20,.3]])a[index(l,m)]=v;const back=b.analyze(b.synthesize(a));assert.ok(relative(a,back)<1e-12);assert.ok(Math.abs(b.integrate(new Float64Array(b.points).fill(1))-4*Math.PI)<1e-12);console.log('PASS harmonic roundtrip and sphere quadrature',relative(a,back));
const p={L:24,stopTime:2,dt:.02};const s=run(p);assert.equal(s.diagnostics().meanDrift,0);assert.ok(s.history.every((x,i)=>i===0||x.energy<=s.history[i-1].energy+1e-7));assert.ok(s.field.every(Number.isFinite));console.log('PASS conserved constant mode, finite field and decreasing energy',s.diagnostics().tailPowerFraction);
const constant=run({...p,noise:0,mean:.25});assert.ok(constant.field.every(x=>Math.abs(x-.25)<1e-12));console.log('PASS uniform field remains stationary');
// One unstable l=12 mode at vanishing amplitude isolates linear Eq.7 dynamics.
let linear=new Simulation({...p,u3:0,stopTime:1,noise:0});let st=linear.state();st.coefficients[index(12,3)]=1e-8;const k=12*13/225,rate=-k*((.65*.65-k)**2-3),exact=1e-8*Math.exp(rate);let coarse=run({...p,u3:0,stopTime:1,dt:.02},st),fine=run({...p,u3:0,stopTime:1,dt:.005},st);const ec=Math.abs(coarse.a[index(12,3)]-exact)/exact,ef=Math.abs(fine.a[index(12,3)]-exact)/exact;assert.ok(ef<ec*.4&&ef<.02);console.log('PASS linear growth converges to spherical dispersion', {coarse:ec,fine:ef,rate});
const same=run(p);assert.deepEqual(Array.from(s.a),Array.from(same.a));const split=run({...p,stopTime:1});const resumed=run(p,split.state());assert.ok(relative(resumed.a,s.a)<1e-12);console.log('PASS deterministic seed and state continuation');
// Smooth band-limited initial data is identical at every tested resolution.
const start24=new Simulation({L:24}),start32=new Simulation({L:32});assert.deepEqual(Array.from(start24.a),Array.from(start32.a.slice(0,start24.a.length)));console.log('PASS common initial field across resolutions');
const dt1=run({...p,dt:.02,stopTime:3}),dt2=run({...p,dt:.01,stopTime:3}),dt4=run({...p,dt:.005,stopTime:3});let e1=relative(dt1.a,dt4.a),e2=relative(dt2.a,dt4.a);assert.ok(e2<e1);console.log('PASS timestep refinement', {coarseVsReference:e1,halfVsReference:e2});
const r24=run({L:24,stopTime:3,dt:.01}),r32=run({L:32,stopTime:3,dt:.01}),r48=run({L:48,stopTime:3,dt:.01});const e24=relative(r24.a,r48.a.slice(0,r24.a.length)),e32=relative(r32.a,r48.a.slice(0,r32.a.length));assert.ok(e32<e24);console.log('PASS resolution refinement of shared low modes',{L24vs48:e24,L32vs48:e32,tail24:r24.diagnostics().tailPowerFraction,tail32:r32.diagnostics().tailPowerFraction,tail48:r48.diagnostics().tailPowerFraction});
// Coefficients select a predictable fastest-growing angular degree before nonlinear saturation.
const linearRates=Array.from({length:25},(_,l)=>{let k=l*(l+1)/225;return -k*((.65*.65-k)**2-3)});const peak=linearRates.indexOf(Math.max(...linearRates));let seedState=new Simulation({...p,noise:0,u3:0}).state();for(let l=1;l<=24;l++)seedState.coefficients[index(l,0)]=1e-9;let growth=run({...p,noise:0,u3:0,stopTime:1,dt:.005},seedState);assert.equal(growth.diagnostics().peakDegree,peak);console.log('PASS selected linear degree',peak);
