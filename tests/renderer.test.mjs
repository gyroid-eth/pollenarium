import assert from 'node:assert/strict';
import {DEFAULT_HEIGHT_VIEW,radiusForField,SpecimenRenderer} from '../app/renderer.mjs';

for(const field of[-20,-3,-.25,0,.25,3,20]){
 const relief=.28;
 assert.equal(radiusForField(field,{relief,...DEFAULT_HEIGHT_VIEW}),.78-relief*Math.tanh(field),'default must preserve the original radius exactly');
 assert.equal(radiusForField(field,{relief:0,peakSharpness:6,valleyDepth:0}),.78,'zero relief must be spherical');
}
for(const view of[{relief:.28,peakSharpness:1,valleyDepth:1},{relief:.28,peakSharpness:6,valleyDepth:0},{relief:.28,peakSharpness:3.25,valleyDepth:.4}]){
 const radii=Array.from({length:401},(_,i)=>radiusForField(-10+i/20,view));
 assert.ok(radii.every(Number.isFinite));
 assert.ok(radii.every(radius=>radius>0));
 for(let i=1;i<radii.length;i++)assert.ok(radii[i]<=radii[i-1]+Number.EPSILON,'radius must be monotone with the scalar field');
}
console.log('PASS monotone bounded height mapping and exact default');

const legacy=Object.create(SpecimenRenderer.prototype);
Object.assign(legacy,{view:{angle:0,tilt:0,zoom:1,relief:.2,palette:'silver',peakSharpness:5,valleyDepth:.2},rebuild(){}});
legacy.restoreView({angle:.4,tilt:.1,zoom:.9,relief:.12,palette:'amber'});
assert.equal(legacy.view.peakSharpness,1);
assert.equal(legacy.view.valleyDepth,1);
console.log('PASS legacy restore clears newer height settings');
// Exercise the production geometry path without a GPU. Tiny triangles must
// still upload unit normals, including poles and the longitude seam.
const gl={UNSIGNED_INT:5125,UNSIGNED_SHORT:5123,getExtension:()=>true,bindBuffer(){},bufferData(){}};
for(const [np,nt] of [[64,32],[512,256]]){
 const r=Object.create(SpecimenRenderer.prototype);
 Object.assign(r,{gl,view:{relief:.28,peakSharpness:6,valleyDepth:0},draw(){},buffers:{}});
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
