import {Simulation,SphereBasis,MODEL_ID} from './spectral.mjs';
import {EquilibriumSearch,EQUILIBRIUM_ID} from './equilibrium.mjs';
import {AdaptiveETDRK4} from './etdrk4.mjs';
let active=null,sequence=0,displayBasis,lastFrame=0;
function frame(type='frame'){
 if(!active)return;let state,field,b;
 if(active.mode==='equilibrium'){
  state=active.search?active.search.state():active.state;
  displayBasis??=new SphereBasis(32);b=displayBasis,lastFrame=0;
  const coefficients=new Float64Array(b.size);coefficients.set(state.coefficients);field=b.synthesize(coefficients);
 }else{state=active.sim.state();field=active.sim.field;b=active.sim.basis}
 postMessage({type,job:active.job,state,field:new Float32Array(field),grid:{x:Array.from(b.x),nt:b.nt,np:b.np}});
}
function advance(seq){if(!active||seq!==sequence||active.paused)return;try{
 const start=performance.now();const finished=()=>active.mode==='equilibrium'?active.search.done:active.sim.time>=active.target-1e-12;
 while(performance.now()-start<45&&!finished()){if(active.mode==='equilibrium')active.search.step();else active.sim.step(active.target)}
 if(finished()){active.paused=true;frame('done')}else{if(performance.now()-lastFrame>160){frame();lastFrame=performance.now()}setTimeout(()=>advance(seq),0)}
 }catch(e){active.paused=true;postMessage({type:'error',job:active.job,message:e.message})}}
onmessage=({data:m})=>{try{
 if(m.type==='run'||m.type==='restore'){
  sequence++;const mode=m.mode||(m.state?.model===EQUILIBRIUM_ID?'equilibrium':'dynamics');
  active={job:m.job,mode,paused:m.type==='restore',target:m.parameters.stopTime};
  if(mode==='equilibrium'){if(m.type==='restore')active.state=m.state;else active.search=new EquilibriumSearch(m.parameters)}
  else{const Solver=m.state?.model===MODEL_ID?Simulation:AdaptiveETDRK4;active.sim=new Solver(m.parameters,m.state||null)}
  frame(m.type==='restore'?'restored':'frame');if(!active.paused)advance(sequence);
 }else if(m.type==='pause'&&active&&m.job===active.job){active.paused=true;sequence++;frame('paused')}
 }catch(e){postMessage({type:'error',job:m.job,message:e.message})}};
