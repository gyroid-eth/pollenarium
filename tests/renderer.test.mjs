import assert from 'node:assert/strict';
import {SpecimenRenderer} from '../app/renderer.mjs';
// Exercise the production geometry path without a GPU. Tiny triangles must
// still upload unit normals, including poles and the longitude seam.
const gl={UNSIGNED_INT:5125,UNSIGNED_SHORT:5123,getExtension:()=>true,bindBuffer(){},bufferData(){}};
for(const [np,nt] of [[64,32],[512,256]]){
 const r=Object.create(SpecimenRenderer.prototype);
 Object.assign(r,{gl,view:{relief:.13},draw(){},buffers:{}});
 r.createGrid({np,nt,x:Float64Array.from({length:nt},(_,i)=>-Math.cos(Math.PI*(i+.5)/nt))});
 for(let i=0;i<r.values.length;i++)r.values[i]=Math.sin(i*.17);
 r.rebuild();
 for(let i=0;i<r.normals.length;i+=3){
  const n=r.normals.subarray(i,i+3);
  assert.ok(Math.abs(Math.hypot(...n)-1)<1e-6,'GPU normals must have unit length');
  assert.ok(n.every(Number.isFinite));
 }
 console.log(`PASS unit finite normals at ${np}x${nt}`);
}
