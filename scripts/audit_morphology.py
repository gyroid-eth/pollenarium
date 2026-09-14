import os
import sys,json,numpy as np
from pathlib import Path
from scipy.ndimage import label,generate_binary_structure
sys.path.insert(0,'scripts/numerics');from spectral_reference import Basis
root=Path(os.environ.get('POLLEN_AUDIT_DIR',Path(__file__).resolve().parents[1]/'.numerical-audit'));b=Basis(160)
def count(mask,diagonal,poles):
 lab,n=label(mask,generate_binary_structure(2,2 if diagonal else 1));parent=np.arange(n+1)
 def find(x):
  while parent[x]!=x:parent[x]=parent[parent[x]];x=parent[x]
  return x
 def union(a,c):
  if a and c:parent[find(a)]=find(c)
 for i in range(mask.shape[0]):
  for shift in ([-1,0,1] if diagonal else [0]):
   j=i+shift
   if 0<=j<len(mask):union(lab[i,0],lab[j,-1])
 for row,positive in [(0,poles[0]),(-1,poles[1])]:
  if positive:
   labels=np.unique(lab[row]);labels=labels[labels>0]
   for k in labels[1:]:union(labels[0],k)
 return len({find(i) for i in range(1,n+1)})
def shape(state):
 a=np.zeros(b.size);a[:len(state['coefficients'])]=state['coefficients'];f=b.synthesize(a);mean=a[0]/np.sqrt(4*np.pi);rms=np.linalg.norm(a[1:])/np.sqrt(4*np.pi);pole=[0.,0.]
 for l in range(b.L+1):
  v=a[l*l+l]*np.sqrt((2*l+1)/(4*np.pi));pole[0]+=(-1)**l*v;pole[1]+=v
 return dict(analysisL=160,rms=float(rms),thresholds=[dict(thresholdInRms=k,components4=count(f>mean+k*rms,False,[p>mean+k*rms for p in pole]),components8=count(f>mean+k*rms,True,[p>mean+k*rms for p in pole])) for k in [-.25,0,.25]])
report=[]
for q in [2,.5]:
 for L in [64,96,128,160]:
  p=root/'etd-reference'/(f'q{q}-L64-dt0.00125.json' if L==64 else f'python-q{q}-L{L}-dt0.00125.json')
  if p.exists():
   s=json.load(open(p))['final'];r=dict(case='band32',q0=q,L=L,statistics=s.get('statistics',s.get('diagnostics')),shape=shape(s));report.append(r);print(q,L,r['shape']['thresholds'][1],flush=True)
for p in sorted((root/'initialization-reference').glob('*.json')):
 s=json.load(open(p))['final'];r=dict(case=p.stem,q0=s['parameters']['q0'],L=s['parameters']['L'],statistics=s['statistics'],shape=shape(s));report.append(r);print(p.stem,r['shape']['thresholds'][1],flush=True)
Path('assets/morphology-audit.json').write_text(json.dumps(dict(method='shared L160 evaluation grid, periodic longitude, pole connectivity; excursion components are diagnostics, not SEM scores',report=report),indent=2))
