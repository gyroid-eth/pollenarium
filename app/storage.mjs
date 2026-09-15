import {MODEL_ID,validateParameters}from'./spectral.mjs';
import {EQUILIBRIUM_ID,validateEquilibrium}from'./equilibrium.mjs';
import {ETDRK4_ID}from'./etdrk4.mjs';
const DB='pollen-specimen-cabinet',STORE='specimens';
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function transaction(mode,operation){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,mode),r=operation(t.objectStore(STORE));let result;r.onsuccess=()=>result=r.result;t.oncomplete=()=>{db.close();resolve(result)};t.onerror=()=>{db.close();reject(t.error)};t.onabort=()=>{db.close();reject(t.error||Error('Storage transaction aborted'))}})}
export const listRecords=()=>transaction('readonly',s=>s.getAll()).then(r=>r.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
export const putRecord=r=>transaction('readwrite',s=>s.put(r));
export const removeRecord=id=>transaction('readwrite',s=>s.delete(id));
export function validateRecord(r){
 if(!r||r.schema!=='pollen-specimen/2'||![MODEL_ID,ETDRK4_ID,EQUILIBRIUM_ID].includes(r.state?.model))throw Error('この版で読み込める標本ではありません');
 const eq=r.state.model===EQUILIBRIUM_ID,p=eq?validateEquilibrium(r.state.parameters):validateParameters(r.state.parameters),L=eq?Math.ceil(p.l0):p.L;
 if(r.state.parameters.L!==L||r.state.coefficients?.length!==(L+1)**2||!r.state.coefficients.every(Number.isFinite))throw Error('球面係数が不正です');
 if(!eq&&(!Number.isFinite(r.state.time)||r.state.time<0||!Number.isFinite(r.state.nextDt)||r.state.nextDt<=0))throw Error('保存時刻・時間刻みが不正です');
 if(eq){const allowed=new Set(Number.isInteger(p.l0)?[p.l0]:[Math.floor(p.l0),Math.ceil(p.l0)]);for(let l=0;l<=L;l++)if(!allowed.has(l))for(let m=-l;m<=l;m++)if(r.state.coefficients[l*l+l+m]!==0)throw Error('Eq6の制限部分空間にない係数です')}
 if(typeof r.id!=='string'||typeof r.createdAt!=='string'||typeof r.title!=='string'||typeof r.previewPng!=='string'||!r.previewPng.startsWith('data:image/png;base64,'))throw Error('標本のメタデータが不正です');
 if(r.reference){for(const key of['id','species','requiredCredit'])if(typeof r.reference[key]!=='string')throw Error('参照情報が不正です');for(const key of['publicationUrl','imageUrl'])if(typeof r.reference[key]!=='string'||!r.reference[key].startsWith('https://'))throw Error('参照URLが不正です')}
 for(let k of['angle','tilt','zoom','relief'])if(!Number.isFinite(r.view?.[k]))throw Error('表示条件が不正です');
 if(r.view.peakSharpness!==undefined&&(!Number.isFinite(r.view.peakSharpness)||r.view.peakSharpness<1||r.view.peakSharpness>6))throw Error('突出部の表示条件が不正です');
 if(r.view.valleyDepth!==undefined&&(!Number.isFinite(r.view.valleyDepth)||r.view.valleyDepth<0||r.view.valleyDepth>1))throw Error('谷の表示条件が不正です');return r;
}
export function downloadRecord(record){const blob=new Blob([JSON.stringify(record,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`specimen-${record.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return blob}
