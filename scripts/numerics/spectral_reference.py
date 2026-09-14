"""Independent NumPy spherical transform and ETDRK4 research solver.

Real orthonormal harmonics, Gaussian latitude and Fourier longitude quadrature.
Input is a fixed coefficient vector; resolution refinement adds zero modes.
No code from the pollen author repository is copied.
"""
import math
import numpy as np
from scipy.fft import rfft, irfft

class Basis:
    def __init__(self, L):
        self.L=L; self.nt=2*L+2; self.np=2**math.ceil(math.log2(4*L+2)); self.size=(L+1)**2
        self.x,self.w=np.polynomial.legendre.leggauss(self.nt)
        self.P=np.zeros((L+1,L+1,self.nt)); self.P[0,0]=1/np.sqrt(4*np.pi)
        for m in range(1,L+1): self.P[m,m]=-np.sqrt((2*m+1)/(2*m))*np.sqrt(1-self.x**2)*self.P[m-1,m-1]
        for m in range(L+1):
            if m<L: self.P[m,m+1]=np.sqrt(2*m+3)*self.x*self.P[m,m]
            for l in range(m+2,L+1): self.P[m,l]=np.sqrt((4*l*l-1)/(l*l-m*m))*self.x*self.P[m,l-1]-np.sqrt((2*l+1)*((l-1)**2-m*m)/((2*l-3)*(l*l-m*m)))*self.P[m,l-2]
        self.cos=np.zeros((L+1,L+1),dtype=int);self.sin=np.zeros_like(self.cos);self.mask=np.zeros_like(self.cos,dtype=bool)
        for m in range(L+1):
            for l in range(m,L+1):self.cos[m,l]=l*l+l+m;self.sin[m,l]=l*l+l-m;self.mask[m,l]=True
        self.PW=self.P*self.w[None,None,:]
    def synthesize(self,a):
        c=(a[self.cos]-1j*a[self.sin])*self.mask;c[0]=a[self.cos[0]]
        v=np.einsum('mlt,ml->mt',self.P,c,optimize=False).T
        v*=self.np/np.sqrt(2);v[:,0]*=np.sqrt(2)
        F=np.zeros((self.nt,self.np//2+1),dtype=complex);F[:,:self.L+1]=v
        return irfft(F,n=self.np,axis=1,workers=1)
    def analyze(self,f):
        F=rfft(f,axis=1,workers=1)[:,:self.L+1].T
        C=np.einsum('mlt,mt->ml',self.PW,F,optimize=False)*(2*np.pi/self.np)*np.sqrt(2);C[0]/=np.sqrt(2)
        a=np.zeros(self.size);a[self.cos[self.mask]]=C.real[self.mask]
        mask=self.mask.copy();mask[0]=False;a[self.sin[mask]]=-C.imag[mask]
        return a
    def integrate(self,f):return np.sum(f*self.w[:,None])*2*np.pi/self.np

def phi(z,k):
    z=np.asarray(z);out=np.zeros_like(z);small=abs(z)<.7
    term=np.full(np.count_nonzero(small),1/math.factorial(k));s=term.copy()
    for j in range(1,35):term=term*z[small]/(k+j);s+=term
    out[small]=s
    value=np.expm1(z[~small])/z[~small]
    for i in range(1,k):value=(value-1/math.factorial(i))/z[~small]
    out[~small]=value;return out

class Solver:
    def __init__(self,p,coefficients):
        self.p=dict(q0=2,tau=-20,u3=-40,u4=120,K=1,D=1,R=15,L=64,dt=.0025,**{})
        self.p.update(p);p=self.p;self.b=Basis(p['L']);self.a=np.zeros(self.b.size);self.a[:len(coefficients)]=coefficients;self.time=0.;self.steps=0;self.last_h=None
        self.l=np.concatenate([np.repeat(l,2*l+1) for l in range(p['L']+1)])
        self.k2=self.l*(self.l+1)/p['R']**2;self.alpha=p['K']*(p['q0']**2-self.k2)**2+p['tau'];self.rate=-p['D']*self.k2*self.alpha
        self.f=self.b.synthesize(self.a);self.energy=self.compute_energy()
    def compute_energy(self):
        p=self.p;return float((.5*np.dot(self.alpha,self.a**2)+self.b.integrate(p['u3']/6*self.f**3+p['u4']/24*self.f**4))*p['R']**2)
    def rhs(self,a):
        f=self.b.synthesize(a);return -self.p['D']*self.k2*self.b.analyze(self.p['u3']/2*f*f+self.p['u4']/6*f*f*f)
    def step(self,h):
        if h!=self.last_h:
            z=h*self.rate;p1,p2,p3=phi(z,1),phi(z,2),phi(z,3)
            self.E=np.exp(z);self.E2=np.exp(z/2);self.Q=h/2*phi(z/2,1);self.F1=h*(p1-3*p2+4*p3);self.F2=h*(p2-2*p3);self.F3=h*(-p2+4*p3);self.last_h=h
        n0=self.rhs(self.a);A=self.E2*self.a+self.Q*n0;na=self.rhs(A);B=self.E2*self.a+self.Q*na;nb=self.rhs(B);C=self.E2*A+self.Q*(2*nb-n0);nc=self.rhs(C)
        a=self.E*self.a+self.F1*n0+2*self.F2*(na+nb)+self.F3*nc;a[0]=self.a[0]
        if not np.isfinite(a).all():raise RuntimeError('nonfinite ETDRK4 state')
        self.a=a;self.time+=h;self.steps+=1
    def advance(self,until):
        while self.time<until-1e-12:self.step(min(self.p['dt'],until-self.time))
        self.f=self.b.synthesize(self.a);self.energy=self.compute_energy()
        return self.state()
    def state(self):
        power=np.bincount(self.l,weights=self.a**2);power[0]=0;total=power.sum();mean=float(self.a[0]/np.sqrt(4*np.pi));rms=float(np.sqrt(total/(4*np.pi)));f=self.f-mean
        lmean=np.dot(np.arange(len(power)),power)/max(total,1e-30)
        stats=dict(time=self.time,energy=self.energy,mean=mean,rms=rms,peakDegree=int(power.argmax()),meanDegree=float(lmean),tailPowerFraction=float(power[math.ceil(.8*self.p['L']):].sum()/max(total,1e-30)),positiveAreaFraction=float(self.b.integrate((f>0).astype(float))/(4*np.pi)),skewness=float(self.b.integrate(f**3)/(4*np.pi*max(rms**3,1e-30))),kurtosis=float(self.b.integrate(f**4)/(4*np.pi*max(rms**4,1e-30))),power=power.tolist())
        return dict(parameters=self.p,time=self.time,coefficients=self.a.tolist(),statistics=stats)
