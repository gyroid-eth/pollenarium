// Original real spherical-harmonic Galerkin implementation for Radja et al. Eq.7.
export const MODEL_ID='radja-eq7-spherical-spectral-v1';
export function fft(re,im,inverse=false){
 const n=re.length;
 for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
 for(let len=2;len<=n;len<<=1){const angle=(inverse?2:-2)*Math.PI/len,cr=Math.cos(angle),ci=Math.sin(angle);for(let i=0;i<n;i+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){let a=i+j,b=a+len/2,tr=re[b]*wr-im[b]*wi,ti=re[b]*wi+im[b]*wr;re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;let nr=wr*cr-wi*ci;wi=wr*ci+wi*cr;wr=nr}}}
 if(inverse)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n}
}
export function gaussLegendre(n){const x=new Float64Array(n),w=new Float64Array(n);for(let i=0;i<Math.ceil(n/2);i++){let z=Math.cos(Math.PI*(i+.75)/(n+.5)),p1,p2,der;for(let k=0;k<30;k++){p1=1;p2=0;for(let j=1;j<=n;j++){let p3=p2;p2=p1;p1=((2*j-1)*z*p2-(j-1)*p3)/j}der=n*(z*p1-p2)/(z*z-1);let next=z-p1/der;if(Math.abs(next-z)<2e-15){z=next;break}z=next}x[i]=-z;x[n-1-i]=z;w[i]=w[n-1-i]=2/((1-z*z)*der*der)}return{x,w}}
export const index=(l,m)=>l*l+l+m;
export class SphereBasis{
 constructor(L=32){this.L=L;this.size=(L+1)**2;this.nt=2*L+2;this.np=2**Math.ceil(Math.log2(4*L+2));this.points=this.nt*this.np;const{x,w}=gaussLegendre(this.nt);this.x=x;this.weights=w;this.legendre=new Float64Array(this.nt*this.size);this.re=new Float64Array(this.np);this.im=new Float64Array(this.np);
  for(let i=0;i<this.nt;i++){const base=i*this.size,z=x[i],sn=Math.sqrt(1-z*z),p=this.legendre;p[base+index(0,0)]=1/Math.sqrt(4*Math.PI);for(let m=1;m<=L;m++)p[base+index(m,m)]=-Math.sqrt((2*m+1)/(2*m))*sn*p[base+index(m-1,m-1)];for(let m=0;m<=L;m++){if(m<L)p[base+index(m+1,m)]=Math.sqrt(2*m+3)*z*p[base+index(m,m)];for(let l=m+2;l<=L;l++){let A=Math.sqrt((4*l*l-1)/(l*l-m*m)),B=Math.sqrt((2*l+1)*((l-1)**2-m*m)/((2*l-3)*(l*l-m*m)));p[base+index(l,m)]=A*z*p[base+index(l-1,m)]-B*p[base+index(l-2,m)]}}}
 }
 synthesize(coeff,out=new Float64Array(this.points)){
  const{L,size,np,nt,legendre:p,re,im}=this;
  for(let i=0;i<nt;i++){re.fill(0);im.fill(0);let base=i*size;for(let l=0;l<=L;l++)re[0]+=p[base+index(l,0)]*coeff[index(l,0)];re[0]*=np;
   for(let m=1;m<=L;m++){let c=0,s=0;for(let l=m;l<=L;l++){const v=p[base+index(l,m)];c+=v*coeff[index(l,m)];s+=v*coeff[index(l,-m)]}re[m]=re[np-m]=c*np/Math.SQRT2;im[m]=-s*np/Math.SQRT2;im[np-m]=-im[m]}
   fft(re,im,true);out.set(re,i*np);
  }return out;
 }
 analyze(field,out=new Float64Array(this.size)){
  const{L,size,np,nt,legendre:p,re,im}=this;out.fill(0);
  for(let i=0;i<nt;i++){re.set(field.subarray(i*np,(i+1)*np));im.fill(0);fft(re,im);const base=i*size,w=this.weights[i]*2*Math.PI/np;for(let l=0;l<=L;l++)out[index(l,0)]+=w*p[base+index(l,0)]*re[0];for(let m=1;m<=L;m++){let c=w*Math.SQRT2*re[m],s=-w*Math.SQRT2*im[m];for(let l=m;l<=L;l++){const v=p[base+index(l,m)];out[index(l,m)]+=v*c;out[index(l,-m)]+=v*s}}}return out;
 }
 integrate(field){let s=0;for(let i=0;i<this.nt;i++){let row=0;for(let j=0;j<this.np;j++)row+=field[i*this.np+j];s+=row*this.weights[i]*2*Math.PI/this.np}return s}
 power(coeff){let power=new Float64Array(this.L+1);for(let l=0;l<=this.L;l++)for(let m=-l;m<=l;m++)power[l]+=coeff[index(l,m)]**2;return power}
}
export function seededRandom(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function normalGenerator(seed){let rand=seededRandom(seed),cached;return()=>{if(cached!==undefined){const a=cached;cached=undefined;return a}let r=Math.sqrt(-2*Math.log(Math.max(rand(),1e-12))),t=2*Math.PI*rand();cached=r*Math.sin(t);return r*Math.cos(t)}}
export const DEFAULTS={q0:.65,tau:-3,u3:-8,u4:120,K:1,D:1,R:15,seed:19,noise:.1,mean:0,L:48,dt:.02,stopTime:12,initialBand:12};
export function validateParameters(input){const p={...DEFAULTS,...input};for(let k of ['q0','tau','u3','u4','K','D','R','seed','noise','mean','L','dt','stopTime','initialBand'])if(!Number.isFinite(p[k]))throw Error('Invalid parameter '+k);if(p.q0<=0||p.R<=0||p.K<=0||p.D<=0||p.u4<=0||p.dt<=0||p.stopTime<0||p.noise<0)throw Error('Positive scales required');if(![16,24,32,48,64,96].includes(p.L))throw Error('Unsupported spectral resolution');if(p.initialBand>p.L||p.initialBand<1||!Number.isInteger(p.initialBand))throw Error('Invalid initial band');if(!Number.isInteger(p.seed)||p.seed<0||p.seed>4294967295)throw Error('Seed must be uint32');return p}
export class Simulation{
 constructor(input={},state=null){this.p=validateParameters(input);this.basis=new SphereBasis(this.p.L);const b=this.basis,p=this.p;this.a=new Float64Array(b.size);this.k2=new Float64Array(b.size);this.alpha=new Float64Array(b.size);for(let l=0;l<=p.L;l++)for(let m=-l;m<=l;m++){let i=index(l,m);this.k2[i]=l*(l+1)/(p.R*p.R);this.alpha[i]=p.K*(p.q0*p.q0-this.k2[i])**2+p.tau}
  this.time=state?.time||0;this.steps=state?.steps||0;this.rejected=state?.rejected||0;this.nextDt=state?.nextDt||p.dt;
  if(state){if(state.coefficients.length!==b.size)throw Error('Coefficient count does not match resolution');this.a.set(state.coefficients)}else{const normal=normalGenerator(p.seed);for(let l=1;l<=p.initialBand;l++)for(let m=-l;m<=l;m++)this.a[index(l,m)]=normal();let norm=0;for(let i=1;i<this.a.length;i++)norm+=this.a[i]**2;let scale=p.noise*Math.sqrt(4*Math.PI/Math.max(norm,1e-30));for(let i=1;i<this.a.length;i++)this.a[i]*=scale;this.a[0]=p.mean*Math.sqrt(4*Math.PI)}
  this.initialMean=this.a[0]/Math.sqrt(4*Math.PI);this.field=b.synthesize(this.a);this.energy=this.computeEnergy(this.a,this.field);this.initialEnergy=state?.initialEnergy??this.energy;this.nonlinear=new Float64Array(b.points);this.nonlinearHat=new Float64Array(b.size);this.candidate=new Float64Array(b.size);this.candidateField=new Float64Array(b.points);this.lastDt=0;this.history=state?.history?.slice()||[{time:this.time,energy:this.energy}];
 }
 computeEnergy(a,f){let e=0;const p=this.p,b=this.basis;for(let i=0;i<a.length;i++)e+=.5*this.alpha[i]*a[i]*a[i];for(let i=0;i<b.nt;i++){let sum=0;for(let j=0;j<b.np;j++){let v=f[i*b.np+j];sum+=p.u3/6*v*v*v+p.u4/24*v*v*v*v}e+=sum*b.weights[i]*2*Math.PI/b.np}return e*p.R*p.R}
 step(until=this.p.stopTime){if(this.time>=until-1e-12)return false;const p=this.p,b=this.basis;let stabilizer=0;for(let i=0;i<this.field.length;i++){const v=this.field[i];this.nonlinear[i]=p.u3/2*v*v+p.u4/6*v*v*v;stabilizer=Math.max(stabilizer,Math.abs(p.u3*v+p.u4/2*v*v))}b.analyze(this.nonlinear,this.nonlinearHat);let dt=Math.min(this.nextDt,until-this.time),energy;
  for(let trial=0;trial<18;trial++){let valid=true;for(let i=0;i<this.a.length;i++){const g=dt*p.D*this.k2[i],den=1+g*(this.alpha[i]+stabilizer);if(den<.2){valid=false;break}this.candidate[i]=(this.a[i]+g*(stabilizer*this.a[i]-this.nonlinearHat[i]))/den}this.candidate[0]=this.a[0];
   if(valid){b.synthesize(this.candidate,this.candidateField);energy=this.computeEnergy(this.candidate,this.candidateField);valid=Number.isFinite(energy)&&energy<=this.energy+1e-10*Math.max(1,Math.abs(this.energy))}
   if(valid){[this.a,this.candidate]=[this.candidate,this.a];[this.field,this.candidateField]=[this.candidateField,this.field];this.energy=energy;this.time+=dt;this.lastDt=dt;this.steps++;this.nextDt=Math.min(p.dt,dt*1.05);if(this.steps%10===0||this.time>=until-1e-12)this.history.push({time:this.time,energy:this.energy});return true}
   dt*=.5;this.rejected++;
  }throw Error('Unable to find an energy-decreasing timestep; reduce parameter severity or timestep');
 }
 diagnostics(){const power=this.basis.power(this.a),total=power.reduce((a,b)=>a+b,0)-power[0];let tail=0,peak=1;for(let l=1;l<power.length;l++){if(power[l]>power[peak])peak=l;if(l>=Math.ceil(this.p.L*.8))tail+=power[l]}let min=Infinity,max=-Infinity;for(const x of this.field){min=Math.min(min,x);max=Math.max(max,x)}return{time:this.time,energy:this.energy,mean:this.a[0]/Math.sqrt(4*Math.PI),meanDrift:this.a[0]/Math.sqrt(4*Math.PI)-this.initialMean,min,max,peakDegree:total>1e-20?peak:0,tailPowerFraction:total>1e-20?tail/total:0,steps:this.steps,rejected:this.rejected,lastDt:this.lastDt,quadraturePoints:this.basis.points,power:Array.from(power)}}
 state(){return{model:MODEL_ID,parameters:{...this.p},time:this.time,steps:this.steps,rejected:this.rejected,nextDt:this.nextDt,initialEnergy:this.initialEnergy,coefficients:Array.from(this.a),history:this.history.slice(),diagnostics:this.diagnostics()}}
}
