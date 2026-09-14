"""Original research figures, no SEM/paper-image pixels included."""
import os,json,sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.ndimage import map_coordinates
from matplotlib.ticker import NullFormatter
sys.path.insert(0,str(Path(__file__).resolve().parent/'numerics'))
from spectral_reference import Basis
ROOT=Path(__file__).resolve().parents[1];S=Path(os.environ.get('POLLEN_AUDIT_DIR',ROOT/'.numerical-audit'));D=S/'etd-reference';out=ROOT/'diagnostics';out.mkdir(exist_ok=True)
def read(p):return json.loads(p.read_text())
def err(a,b):
 n=max(len(a),len(b));a=np.pad(a,(0,n-len(a)));b=np.pad(b,(0,n-len(b)));return np.linalg.norm(a-b)/np.linalg.norm(b)
def state(q,L=128,dt=.00125):return read(D/f'python-q{q}-L{L}-dt{dt}.json')['final']
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,'axes.spines.right':False})
fig=plt.figure(figsize=(15,9.3),layout='constrained');gs=fig.add_gridspec(2,3,height_ratios=[1.2,1]);fig.suptitle('Pollen patterns: source interpretation and numerical convergence',fontsize=18,weight='bold')
cases=[(read(S/'initialization-reference/top-band32.json')['final'],'Smooth / unpatterned',r'$q_0=1.5,\ \tau=20$'),(state(2),'Finer foam',r'$q_0=2,\ \tau=-20$'),(state(.5),'Coarser foam',r'$q_0=0.5,\ \tau=-20$')]
for j,(s,title,subtitle) in enumerate(cases):
 ax=fig.add_subplot(gs[0,j]);L=s['parameters']['L'];b=Basis(L);f=b.synthesize(np.array(s['coefficients']));v=np.linspace(-1.03,1.03,480);X,Y=np.meshgrid(v,v[::-1]);inside=X*X+Y*Y<=1;Z=np.sqrt(np.maximum(0,1-X*X-Y*Y));row=np.interp(Y,b.x,np.arange(b.nt));col=((np.arctan2(Z,X)+.7)%(2*np.pi))*b.np/(2*np.pi);field=map_coordinates(np.pad(f,((0,0),(0,1)),mode='wrap'),[row,col],order=1,mode='nearest');light=np.maximum(0,-.45*X+.65*Y+.8*Z);tone=.22+.78/(1+np.exp(np.clip(field*2,-10,10)));gray=np.clip(tone*(.2+.8*light),0,1);image=np.ones((*X.shape,3));image[inside]=gray[inside,None];ax.imshow(image);ax.axis('off');ax.set_title(title+'\n'+subtitle,fontsize=14);rms=s['statistics']['rms'];label=f'RMS {rms:.5f}  |  L={L}';label+='  |  202 positive domains' if j==1 else '  |  65 positive domains' if j==2 else '  |  strictly convex energy';ax.text(.5,-.025,label,ha='center',transform=ax.transAxes,fontsize=9)
ax=fig.add_subplot(gs[1,0]);colors={2:'#236b55',.5:'#406caa'}
legacy=read(ROOT/'assets/legacy-time-bias-audit.json')['report']
for q in [2,.5]:
 ref=read(D/f'q{q}-L64-dt0.000625.json')['final']['coefficients'];steps=[.0025,.00125];errors=[err(read(D/f'q{q}-L64-dt{h}.json')['final']['coefficients'],ref) for h in steps];ax.loglog(steps,errors,'o-',color=colors[q],label=f'ETDRK4 q={q}')
 rows=[r for r in legacy if r['parameters']['q0']==q];ax.loglog([r['parameters']['dt'] for r in rows],[r['snapshots'][-1]['relativeToEtd4']['relativeL2'] for r in rows],'x--',color=colors[q],alpha=.7,label=f'first order q={q}')
ax.set_xticks([.000625,.00125,.0025,.005],['6.25e−4','1.25e−3','2.5e−3','5e−3']);ax.xaxis.set_minor_formatter(NullFormatter());ax.tick_params(axis='x',labelsize=9)
ax.set(xlabel='Time step',ylabel='Relative field L2 error',title='Time error at the same L=64');ax.legend(fontsize=8);ax.grid(alpha=.15)
ax=fig.add_subplot(gs[1,1])
for q in [2,.5]:
 refpath=D/f'python-q{q}-L160-dt0.00125.json';ref=read(refpath)['final']['coefficients'] if refpath.exists() else state(q)['coefficients'];Ls=[64,96,128] if refpath.exists() else [64,96];errors=[]
 for L in Ls:
  a=read(D/f'q{q}-L64-dt0.00125.json')['final']['coefficients'] if L==64 else state(q,L)['coefficients'];errors.append(err(a,ref))
 ax.semilogy(Ls,errors,'o-',color=colors[q],label=f'q={q}')
ax.set(xlabel='Retained harmonic degree L',ylabel='Relative field L2 error',title='Space error at the same initial field');ax.set_xticks([64,96,128,160]);ax.legend();ax.grid(alpha=.15)
ax=fig.add_subplot(gs[1,2]);init=np.array(read(S/'common-initial.json')['coefficients']);app=np.array([np.sum(init[l*l:(l+1)**2]**2)/(4*np.pi) for l in range(65)]);cell=read(ROOT/'assets/initial-spectrum-audit.json');power=np.array(cell['power'])/(4*np.pi);ax.semilogy(np.arange(1,33),app[1:33],label='App: band32 RMS .2',color='#9b4b3c');ax.semilogy(np.arange(1,97),power[1:],label='Cellwise noise projection',color='#406caa',alpha=.8);l=np.arange(1,97);ax.semilogy(l,.04*(2*l+1)/41986.26,'--',color='#444444',label='Independent-cell expectation');ax.set(xlabel='Harmonic degree l',ylabel='Variance contribution per degree',title='The same point variance is not the same spectrum');ax.legend(fontsize=8);ax.grid(alpha=.15)
fig.text(.5,-.06,'Original simulations, t=2, R=15, published PDE coefficients. Fixed grayscale across spheres; graphical shading, not SEM.\nSpatial reference: L160 where available; temporal reference: ETDRK4 dt=.000625. Statistical counts are diagnostics, not resemblance scores.',ha='center',fontsize=9)
fig.savefig(out/'numerical-validation.png',dpi=170,bbox_inches='tight');fig.savefig(out/'numerical-validation.pdf',bbox_inches='tight');plt.close(fig)
print(out/'numerical-validation.png')
