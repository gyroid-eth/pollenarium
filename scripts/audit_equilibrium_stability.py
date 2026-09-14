"""Recheck candidate Hessians with Node for gradients and NumPy for eigenvalues."""
import json, subprocess
from pathlib import Path
import numpy as np
root = Path(__file__).resolve().parents[1]
js = r'''
import fs from 'node:fs';import {EquilibriumProblem} from './app/equilibrium.mjs';
const rows=JSON.parse(fs.readFileSync('assets/equilibrium-presets.json')).presets,seen=new Set(),out=[];
for(const row of rows){const key=row.l0+':'+row.u;if(seen.has(key))continue;seen.add(key);const state=row.state,problem=new EquilibriumProblem(state.parameters),x=Float64Array.from(problem.active,i=>state.coefficients[i]),n=x.length,h=1e-5,H=Array.from({length:n},()=>Array(n));for(let j=0;j<n;j++){const a=x.slice(),b=x.slice();a[j]+=h;b[j]-=h;const ga=problem.evaluate(a).gradient,gb=problem.evaluate(b).gradient;for(let i=0;i<n;i++)H[i][j]=(ga[i]-gb[i])/(2*h)}out.push({key,H,gradient:state.diagnostics.gradientNorm,energy:state.diagnostics.energy})}
process.stdout.write(JSON.stringify(out));
'''
rows = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=root))
out = []
for row in rows:
    H = np.array(row['H'])
    values = np.linalg.eigvalsh((H + H.T) / 2)
    out.append(dict(condition=row['key'], energy=row['energy'], gradientNorm=row['gradient'], minEigenvalue=float(values[0]), negativeDirections=int(sum(values < -1e-6)), nearZeroModes=int(sum(abs(values) < 1e-6))))
report = dict(method='central finite-difference Hessian, h=1e-5; restricted Eq6 subspace only; rotational zero modes expected', conditions=out)
(root / 'assets' / 'equilibrium-audit.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'{len(out)} conditions; {sum(x["negativeDirections"] for x in out)} directions below -1e-6')
