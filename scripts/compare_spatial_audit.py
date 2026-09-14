import os
import sys,json,numpy as np
from pathlib import Path
sys.path.insert(0,'scripts/numerics');from spectral_reference import Basis
from scipy.ndimage import label,generate_binary_structure
root=Path(os.environ.get('POLLEN_AUDIT_DIR',Path(__file__).resolve().parents[1]/'.numerical-audit'))/'etd-reference'
def diff(a,b):
 n=max(len(a),len(b));x=np.pad(a,(0,n-len(a)));y=np.pad(b,(0,n-len(b)));return dict(relativeL2=float(np.linalg.norm(x-y)/np.linalg.norm(y)),correlation=float(np.dot(x,y)/(np.linalg.norm(x)*np.linalg.norm(y))))
report=[]
for q in [2,.5]:
 items=[]
 for L in [64,96,128,160]:
  path=root/(f'q{q}-L64-dt0.00125.json' if L==64 else f'python-q{q}-L{L}-dt0.00125.json')
  if path.exists():items.append((L,json.load(open(path))['final']))
 rows=[]
 for (La,a),(Lb,b) in zip(items,items[1:]):rows.append(dict(coarse=La,fine=Lb,**diff(a['coefficients'],b['coefficients'])))
 report.append(dict(q0=q,spatial=rows));print(report[-1])
json.dump(report,open('assets/spatial-comparison.json','w'),indent=2)
