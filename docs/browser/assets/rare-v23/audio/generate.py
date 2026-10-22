"""Original deterministic procedural cues for SVALKER rare encounters.
Requires Python, numpy and scipy. Run in this directory to recreate WAVs.
"""
from pathlib import Path
import wave, json
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
SR=22050
rng=np.random.default_rng(131026)
ROOT=Path(__file__).resolve().parent

def timeline(d): return np.arange(round(d*SR))/SR

def filt(x,lo=None,hi=None):
    if lo and hi: sos=butter(3,[lo,hi],btype='bandpass',fs=SR,output='sos')
    elif lo: sos=butter(3,lo,btype='highpass',fs=SR,output='sos')
    else: sos=butter(3,hi,btype='lowpass',fs=SR,output='sos')
    return sosfilt(sos,x)

def noise(n,lo=None,hi=1400): return filt(rng.normal(size=n),lo,hi)

def fade(x,attack=.04,release=.12):
    x=x.copy();a=min(len(x)//2,round(attack*SR));b=min(len(x)//2,round(release*SR))
    x[:a]*=np.sin(np.linspace(0,np.pi/2,a))**2
    x[-b:]*=np.cos(np.linspace(0,np.pi/2,b))**2
    return x

def add(x,part,start,gain=1):
    i=round(start*SR);n=min(len(part),len(x)-i)
    if n>0: x[i:i+n]+=part[:n]*gain

def reverberate(x,amount=.18):
    y=x.copy()
    for delay,gain in [(0.067,.8),(.113,.65),(.183,.5),(.277,.35),(.397,.22)]:
        n=round(delay*SR); y[n:]+=x[:-n]*gain*amount
    return y

def burst(d,lo,hi):
    t=timeline(d);return fade(noise(len(t),lo,hi),.01,min(.14,d/3))

def metallic(d=.7,freq=1450):
    t=timeline(d);x=np.zeros(len(t))
    for ratio,g in [(1,1),(1.47,.7),(2.32,.4),(3.17,.2)]:
        x+=np.sin(2*np.pi*freq*ratio*t)*np.exp(-t*(9+ratio*2))*g
    return fade(x,.004,.1)

def growl(d=1.8):
    t=timeline(d);hz=61+9*np.sin(t*4)+4*np.sin(t*11)
    phase=2*np.pi*np.cumsum(hz)/SR
    throat=(np.sin(phase)+.65*np.sin(2*phase)+.45*np.sin(3.03*phase))
    throat=np.tanh(throat*2)*(0.58+.3*noise(len(t),None,45))
    return fade(filt(throat,50,650)+.35*noise(len(t),200,1000),.3,.65)

cues={}
# Ragged nonverbal breathing, clothing movement; deliberately no voice/words.
x=np.zeros(round(3.4*SR))
for start,d,g in [(0.05,.58,.75),(.72,.85,.52),(1.87,.7,.7),(2.65,.42,.4)]:
    t=timeline(d);breath=noise(len(t),130,1700)*(np.sin(np.pi*t/d)**1.5)*(1+.18*np.sin(t*40))
    add(x,breath,start,g)
add(x,burst(.6,550,2800),1.4,.16)
cues['wounded']=reverberate(x,.10)
# Wire pluck with two metallic release clicks and faint brushed noise.
x=np.zeros(round(1.8*SR));add(x,metallic(.9,740),.12,.4);add(x,metallic(.4,2150),.65,.18);add(x,burst(.38,1700,4900),.08,.16)
cues['tripwire']=x
# Broken bandlimited carrier, noise and unintelligible formant-shaped fragments.
t=timeline(3.8);x=noise(len(t),300,4200)*.17
for start,d in [(.15,.25),(.55,.08),(1.1,.38),(1.8,.19),(2.3,.45),(3.2,.25)]:
    q=timeline(d); carrier=np.sin(2*np.pi*132*q+.2*np.sin(q*19))
    speech=filt(carrier+noise(len(q),300,3000)*.7,400,1800)
    env=np.sin(np.pi*q/d)**.7*(.45+.55*np.sin(q*17)**2)
    add(x,fade(speech*env,.008,.025),start,.32)
    add(x,burst(.055,1700,5500),start,.28)
cues['radio-static']=x
# Distant warning with slow pitch rise/fall, low rumble and room reflections.
t=timeline(4.4);hz=275+90*np.sin(np.pi*t/4.4)**2;phase=2*np.pi*np.cumsum(hz)/SR
x=(np.sin(phase)+.2*np.sin(phase*3)+.08*np.sin(phase*5))*.34
x=filt(x,None,950)+noise(len(t),None,110)*.13
cues['emission-siren']=reverberate(fade(x,.55,.8),.35)
# Wind loop: periodic envelopes ensure energy matches on either side, fade removes clicks.
t=timeline(6.0);wind=noise(len(t),60,850)
x=wind*(.45+.18*np.sin(2*np.pi*t/6)+.1*np.sin(2*np.pi*t/3))
x+=noise(len(t),1200,3400)*(.018+.016*np.sin(2*np.pi*t/6)**2)
x+=.035*np.sin(2*np.pi*49*t+.2*np.sin(2*np.pi*t/6))
cues['anomaly-fog']=x
# Cloth dragging over wood, irregular hardware clinks, no melodic elements.
x=np.zeros(round(2.5*SR));add(x,burst(.85,150,2300),.08,.6);add(x,burst(.65,250,1900),1.0,.42)
for start,f,g in [(.28,1300,.12),(.91,1850,.09),(1.43,900,.12),(1.76,2200,.06)]: add(x,metallic(.5,f),start,g)
cues['rival-loot']=x
# Footfalls approach: low thud with ground/clothing texture; restrained unsettling tail.
x=np.zeros(round(3.6*SR))
for start,g in [(.08,.22),(.73,.31),(1.35,.45),(1.94,.6)]:
    q=timeline(.33);part=noise(len(q),None,180)*np.exp(-q*15)
    part+=noise(len(q),250,1800)*np.exp(-q*10)*.12
    add(x,fade(part,.014,.09),start,g)
add(x,burst(.75,180,2000),2.4,.15);add(x,growl(.9),2.65,.08)
cues['night-shadow']=x
# Branch snaps with distant distorted animal rumble.
x=np.zeros(round(3.4*SR));add(x,growl(2.3),.65,.24)
for start in [.15,.4,2.65]:
    add(x,burst(.12,700,4500),start,.3)
    add(x,metallic(.25,370),start,.04)
cues['mutant-tracks']=reverberate(x,.15)
# Outcome cues: mechanical release + warm airy rise; dull failure impact + scrape.
x=np.zeros(round(1.15*SR));add(x,metallic(.5,1100),.06,.15);q=timeline(.75);add(x,noise(len(q),400,2200)*np.sin(np.pi*q/.75)**2,.23,.12)
cues['mini-success']=x
x=np.zeros(round(1.5*SR));q=timeline(.9);add(x,noise(len(q),None,170)*np.exp(-q*5),.03,.7);add(x,burst(.5,90,900),.3,.23)
cues['mini-fail']=x
# Quiet continuous radio bed and underground/sky emission pressure bed.
t=timeline(10);x=noise(len(t),350,2600)*.13*(.6+.2*np.sin(2*np.pi*t/10))
for start in [.9,2.8,4.4,7.1,8.6]:add(x,burst(.12,1000,4700),start,.10)
cues['radio-loop']=x
x=noise(len(t),None,130)*.6+noise(len(t),200,900)*.09
x*=.6+.2*np.sin(2*np.pi*t/10)+.1*np.sin(2*np.pi*t/5)
x+=.025*np.sin(2*np.pi*39*t)
cues['emission-rumble']=x

report={}
for name,x in cues.items():
    x=fade(x,.08,.18)
    assert np.isfinite(x).all()
    peak=float(np.max(np.abs(x)))
    # Independent peak normalization preserves texture; levels mixed by engine.
    x=x*(.65/peak)
    pcm=np.round(np.clip(x,-.85,.85)*32767).astype('<i2')
    file=ROOT/(name+'.wav')
    with wave.open(str(file),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
    with wave.open(str(file),'rb') as w:
        assert w.getnchannels()==1 and w.getsampwidth()==2 and w.getframerate()==SR
        samples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2')/32768
        assert len(samples)>0 and np.isfinite(samples).all() and np.max(np.abs(samples))<=.85
        assert np.sqrt(np.mean(samples*samples))>.001
        report[name]={'duration_s':round(len(samples)/SR,3),'peak':round(float(np.max(np.abs(samples))),4),'rms':round(float(np.sqrt(np.mean(samples*samples))),4),'bytes':file.stat().st_size}
(ROOT/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
