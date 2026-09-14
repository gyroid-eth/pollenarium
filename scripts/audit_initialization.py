import os
import sys,json,time,numpy as np
from pathlib import Path
sys.path.insert(0,'scripts/numerics');from spectral_reference import Solver
root=Path(os.environ.get('POLLEN_AUDIT_DIR',Path(__file__).resolve().parents[1]/'.numerical-audit'));a=json.load(open(root/'common-initial.json'))['coefficients'];cell=json.load(open(root/'cell-noise-projection.json'));c=cell['coefficients'];out=root/'initialization-reference';out.mkdir(exist_ok=True);report=[]
for label,q,tau,coeff,L in [('top-band32',1.5,20,a,96),('top-cellwise-projection',1.5,20,c,96),('middle-cellwise-projection',2,-20,c,96),('bottom-cellwise-projection',.5,-20,c,96)]:
 start=time.monotonic();s=Solver(dict(q0=q,tau=tau,L=L,dt=.00125),coeff);initial=s.state();snapshots=[]
 for t in [.01,.05,.1,.25,.5,1,2]:snapshots.append(s.advance(t))
 final=s.state();run=dict(label=label,seconds=time.monotonic()-start,initial=initial['statistics'],final=final['statistics']);(out/(label+'.json')).write_text(json.dumps(dict(initial=initial,final=final,snapshots=snapshots)));report.append(run);Path('assets/initialization-audit.json').write_text(json.dumps(dict(method='same published coefficients and R15; compares band32 RMS .2 with a projection of explicit N(0,.04) cellwise noise on the rebuilt shell; original author seed unknown',report=report),indent=2));print(json.dumps({'label':label,'seconds':run['seconds'],'initialRms':initial['statistics']['rms'],'finalRms':final['statistics']['rms'],'energy':s.energy}),flush=True)
