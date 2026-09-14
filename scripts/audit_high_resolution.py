"""Higher spatial-resolution diagnostic on exactly the same initial coefficients."""
import sys,json,time,os
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent/'numerics'))
from spectral_reference import Solver
root=Path(__file__).resolve().parents[1];scratch=Path(os.environ.get('POLLEN_AUDIT_DIR',root/'.numerical-audit'))
initial=json.loads((scratch/'common-initial.json').read_text())['coefficients'];out=scratch/'etd-reference';out.mkdir(exist_ok=True,parents=True)
report=[]
for q0 in [2,.5]:
 for L,dt in [(96,.00125),(128,.00125),(160,.00125)]:
  start=time.monotonic();s=Solver(dict(q0=q0,L=L,dt=dt),initial);snapshots=[]
  for until in [.05,.1,.25,.5,1,2]:snapshots.append(s.advance(until))
  final=s.state();run=dict(q0=q0,L=L,dt=dt,seconds=time.monotonic()-start,statistics=final['statistics'])
  (out/f'python-q{q0}-L{L}-dt{dt}.json').write_text(json.dumps(dict(final=final,snapshots=snapshots,run=run)))
  report.append(run);(root/'assets'/'high-resolution-audit.json').write_text(json.dumps(dict(method='independent NumPy ETDRK4; fixed initial coefficients, fixed physical R15',report=report),indent=2))
  print(json.dumps({k:v for k,v in run.items() if k!='statistics'}|{'energy':s.energy,'tail':final['statistics']['tailPowerFraction']}),flush=True)
