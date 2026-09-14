import os
import sys,json,time,numpy as np
from pathlib import Path
sys.path.insert(0,'scripts/numerics');from spectral_reference import Solver
root=Path(os.environ.get('POLLEN_AUDIT_DIR',Path(__file__).resolve().parents[1]/'.numerical-audit'));cell=json.load(open(root/'cell-noise-projection.json'));a=np.zeros((97)**2);a[:(33)**2]=cell['coefficients'][:(33)**2];boost=a.copy();boost[1:]*=.2/(np.linalg.norm(a[1:])/np.sqrt(4*np.pi));out=root/'initialization-reference';report=[]
for q in [2,.5]:
 for name,coeff in [('cell-band32',a),('cell-band32-rescaled',boost)]:
  start=time.monotonic();s=Solver(dict(q0=q,L=96,dt=.00125),coeff);initial=s.state();snapshots=[]
  for t in [.05,.1,.25,.5,1,2]:snapshots.append(s.advance(t))
  final=s.state();label=f'q{q}-{name}';(out/(label+'.json')).write_text(json.dumps(dict(initial=initial,final=final,snapshots=snapshots)));r=dict(label=label,seconds=time.monotonic()-start,initial=initial['statistics'],final=final['statistics']);report.append(r);Path('assets/coupled-initialization-audit.json').write_text(json.dumps(dict(method='identical degree1..32 directions from a cell-noise projection; only common amplitude scaled in paired runs, a00 identical; both compared with original untruncated L96 cell projection',report=report),indent=2));print(json.dumps(dict(label=label,seconds=r['seconds'],rms=final['statistics']['rms'],energy=s.energy)),flush=True)
