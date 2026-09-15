// Geometric wall profile layered over an unchanged Radja field. No deposition dynamics.
export const LEGACY_HEIGHT_MAPPING='signed-power-v1';
export const PROFILE_HEIGHT_MAPPING='component-profile-v1';
export const PROFILE_DEFAULTS=Object.freeze({wallWidth:.48,tipRoundness:.04,wallValley:.025,wallResolution:64});
const BASE=.78;
const COMMON_DEFAULTS={angle:-.3,tilt:.18,zoom:1,relief:.13,palette:'silver',peakSharpness:1,valleyDepth:1,...PROFILE_DEFAULTS};
const ACTIVE_PROFILE=['relief','wallWidth','tipRoundness','wallValley','wallResolution'];
const ACTIVE_LEGACY=['relief','peakSharpness','valleyDepth'];
export function resolveHeightView(view={},rendering=null){
 const meta=rendering?.heightMapping,explicit=view.heightMappingVersion;
 if(explicit&&meta?.version&&explicit!==meta.version)throw Error('表示方式の記録が一致しません');
 const version=explicit??meta?.version??LEGACY_HEIGHT_MAPPING;
 if(![LEGACY_HEIGHT_MAPPING,PROFILE_HEIGHT_MAPPING].includes(version))throw Error('未対応の外壁表示方式です');
 const out={...COMMON_DEFAULTS,...view,heightMappingVersion:version};
 for(const key of [...ACTIVE_PROFILE,...ACTIVE_LEGACY]){if(view[key]===undefined)out[key]=meta?.[key]??COMMON_DEFAULTS[key];if(meta?.[key]!==undefined&&view[key]!==undefined&&meta[key]!==view[key])throw Error('外壁パラメータの記録が一致しません: '+key)}
 if(meta?.baseRadius!==undefined&&meta.baseRadius!==BASE)throw Error('外壁の基準半径が未対応です');
 return out;
}
export function validateHeightView(view,rendering=null){const v=resolveHeightView(view,rendering);for(const k of['angle','tilt','zoom','relief'])if(!Number.isFinite(v[k]))throw Error('表示条件が不正です');
 const bounds={peakSharpness:[1,6],valleyDepth:[0,1],wallWidth:[.12,.95],tipRoundness:[0,1],wallValley:[0,.08]};
 for(let[k,[min,max]]of Object.entries(bounds))if(!Number.isFinite(v[k])||v[k]<min||v[k]>max)throw Error('外壁の表示条件が不正です: '+k);
 if(v.heightMappingVersion===PROFILE_HEIGHT_MAPPING&&(v.relief<0||v.relief>.28||![64,96].includes(v.wallResolution)))throw Error('成形の高さ・表示解像度が不正です');return v;
}
export function renderingDescription(view){const v=resolveHeightView(view),profile=v.heightMappingVersion===PROFILE_HEIGHT_MAPPING,keys=profile?ACTIVE_PROFILE:ACTIVE_LEGACY;return{version:profile?'component-wall-rendering-v1':'scalar-monotone-height-v2',heightMapping:{version:v.heightMappingVersion,baseRadius:BASE,...Object.fromEntries(keys.map(k=>[k,v[k]]))},meaning:profile?'phenomenological wall geometry; component-normalized scalar profile; half-height spread, not basal footprint; no deposition, growth, or thickness physics':'geometric scalar-field height display, not deposition, growth, or wall-thickness physics'};}
export function wallProfile(t,width=.48,round=.04){if(t<=0)return 0;if(t>=1)return 1;const e=.7*round,A=Math.sqrt(1+e*e),half=(A+e)/2,uHalf=1-(half*half-e*e),threshold=.88-.72*width,gamma=Math.log(uHalf)/Math.log(threshold),u=t**gamma;return u/((A+Math.sqrt(1-u+e*e))*(A-e));}
export function meshAdjacency(faces,n){const offsets=new Uint32Array(n+1);for(let i=0;i<faces.length;i++)offsets[faces[i]+1]+=2;for(let i=1;i<=n;i++)offsets[i]+=offsets[i-1];const cursor=offsets.slice(),neighbors=new Uint32Array(offsets[n]);for(let i=0;i<faces.length;i+=3){let a=faces[i],b=faces[i+1],c=faces[i+2];for(let[v,x,y]of[[a,b,c],[b,a,c],[c,a,b]]){neighbors[cursor[v]++]=x;neighbors[cursor[v]++]=y}}return{offsets,neighbors};}
export function normalizeComponents(field,adj){const labels=new Int32Array(field.length).fill(-1),queue=new Uint32Array(field.length),components=[],normalized=new Float64Array(field.length);let valleyMax=0;for(let i=0;i<field.length;i++){if(field[i]>=0){valleyMax=Math.max(valleyMax,field[i]);continue}if(labels[i]>=0)continue;let id=components.length,start=0,end=1,max=-field[i];queue[0]=i;labels[i]=id;while(start<end){let v=queue[start++];max=Math.max(max,-field[v]);for(let k=adj.offsets[v];k<adj.offsets[v+1];k++){let j=adj.neighbors[k];if(field[j]<0&&labels[j]<0){labels[j]=id;queue[end++]=j}}}components.push({max,count:end});}
 for(let i=0;i<field.length;i++)normalized[i]=field[i]<0?-field[i]/components[labels[i]].max:valleyMax?-field[i]/valleyMax:0;return{normalized,components};}
export function profileRadii(normalized,view,out=new Float64Array(normalized.length)){for(let i=0;i<out.length;i++){const t=normalized[i];out[i]=BASE+(t>=0?view.relief*wallProfile(t,view.wallWidth,view.tipRoundness):view.wallValley*t)}return out;}
