"""Original enemy vocal sound design, deterministic NumPy/SciPy synthesis.

Run python generate.py in any directory; assets are saved beside this script.
No recordings, speech engines, third-party sound libraries, or imitated voices.
"""
from pathlib import Path
import json
import wave
import numpy as np
from scipy.signal import butter, sosfilt, lfilter

ROOT = Path(__file__).resolve().parent
SR = 22050
RNG = np.random.default_rng(130026)


def fade(x, attack=.018, release=.050):
    x = x.copy()
    a, b = min(len(x), int(attack * SR)), min(len(x), int(release * SR))
    x[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    x[-b:] *= np.sin(np.linspace(np.pi / 2, 0, b)) ** 2
    return x


def noise(n, low=120, high=4500):
    return sosfilt(butter(2, [low, high], btype='bandpass', fs=SR, output='sos'), RNG.normal(size=n))


def resonator(x, freq, bandwidth):
    r = np.exp(-np.pi * bandwidth / SR)
    return lfilter([1-r], [1, -2*r*np.cos(2*np.pi*freq/SR), r*r], x)


def glottal(n, f0, rough=.12):
    """Irregular continuous glottal flow derivative, with subharmonic fry."""
    t = np.arange(n)/SR
    f0 = np.broadcast_to(f0, (n,)).copy()
    jitter = np.interp(t, np.arange(0, t[-1] + .03, .018),
                       RNG.uniform(-rough, rough, len(np.arange(0, t[-1] + .03, .018))))
    f0 *= 1 + jitter + .025*np.sin(2*np.pi*3.7*t)
    p = np.cumsum(f0)/SR
    phase = p % 1
    # Smooth opening, short closing, long breathy closed phase.
    pulse = np.where(phase < .52, np.sin(np.pi * phase / .52) ** 2,
                     np.where(phase < .72, np.cos(np.pi*(phase-.52)/.4) ** 2, 0))
    derivative = np.gradient(pulse)
    derivative /= max(np.max(np.abs(derivative)), 1e-9)
    fry = .25 * np.sin(np.pi*p) * derivative
    return derivative + fry + .025*noise(n, 200, 7000)


VOWELS = {
    'a': (720, 1170, 2450), 'o': (450, 850, 2350),
    'u': (310, 720, 2200), 'e': (520, 1650, 2450),
    'i': (320, 1900, 2600), 'm': (260, 900, 1900),
    'uh': (540, 1050, 2250), 'rr': (390, 1250, 2450),
}


def syllable(vowel, dur, pitch=105, fall=.65, rough=.10, consonant='', gain=1):
    n = int(dur*SR)
    t = np.arange(n)/SR
    f0 = pitch*(1 + (fall-1)*t/dur + .06*np.sin(2*np.pi*1.6*t + RNG.uniform(0,6)))
    source = glottal(n, f0, rough)
    formants = VOWELS[vowel]
    x = sum(w*np.sin(2*np.pi*f/SR)*resonator(source, f, bw) for w, f, bw in
            zip([1, .82, .38], formants, [95, 125, 200]))
    x /= max(np.max(np.abs(x)), 1e-9)
    # A nasal component, breath, and slow amplitude wavering make it vocal.
    x += .13*resonator(source, 260, 100) / max(np.max(np.abs(source)), 1e-9)
    x += .016*noise(n, 400, 3500)
    x *= .84 + .16*np.sin(2*np.pi*2.4*t + RNG.uniform(0,6))
    if consonant in ('b', 'd', 'g'):
        stop = int(.035*SR)
        x[:stop] *= .12
        burst_n = int(.014*SR)
        x[stop:stop+burst_n] += fade(noise(burst_n, 550, 4800), .003, .008)*.18
    elif consonant in ('sh', 'f'):
        nn = int(.07*SR)
        x[:nn] *= .3
        x[:nn] += fade(noise(nn, 1700, 7000), .008, .025)*.22
    elif consonant == 'r':
        x *= .60 + .40*np.clip(np.sin(2*np.pi*24*t), 0, 1)
    elif consonant == 'm':
        nn = min(n,int(.12*SR))
        nasal = resonator(source[:nn], 240, 80)
        nasal /= max(np.max(np.abs(nasal)),1e-9)
        blend = np.linspace(0,1,nn)
        x[:nn] = nasal*(1-blend)*.35 + x[:nn]*blend
    return fade(x*gain, .026, .065)


def human_phrase(plan):
    clips=[]
    for vowel, dur, pitch, consonant, pause in plan:
        clips.append(syllable(vowel,dur,pitch,fall=RNG.uniform(.56,.94),
                              rough=RNG.uniform(.07,.17), consonant=consonant,
                              gain=RNG.uniform(.5,.9)))
        n=int(pause*SR)
        if n:
            clips.append(fade(noise(n, 200, 2200)*.026, .03, .045))
    return np.concatenate(clips)


def rat_squeak(dur, start, end, rough=.07):
    n=int(SR*dur); t=np.arange(n)/SR
    freq=np.linspace(start,end,n)*(1+.045*np.sin(2*np.pi*38*t))
    freq*=1+rough*np.interp(t,np.linspace(0,dur,17),RNG.normal(size=17))
    phase=np.cumsum(freq)/SR
    x=np.sin(2*np.pi*phase)+.24*np.sin(4*np.pi*phase)+.12*noise(n,1800,8000)
    x*=.70+.30*np.sin(2*np.pi*19*t+.5)**2
    return fade(x,.018,.06)


def rat_growl(dur, start=118, end=70):
    n=int(dur*SR); t=np.arange(n)/SR
    src=glottal(n,np.linspace(start,end,n),.26)
    x=resonator(src,370,150)+.5*resonator(src,800,210)+.18*resonator(src,1800,300)
    x/=max(np.max(np.abs(x)),1e-9)
    x=np.tanh(x*2.3)*.7 + .20*noise(n,300,4000)
    x*=.70+.30*np.sin(2*np.pi*17*t)**2
    return fade(x,.10,.18)


def rat_voice():
    x=np.zeros(int(3.8*SR))
    for start,dur,hi,lo,gain in [(0.08,.28,2400,1600,.42),(.45,.40,1900,2650,.5),
                                (1.0,.55,2600,1150,.5)]:
        clip=rat_squeak(dur,hi,lo)*gain
        i=int(start*SR);x[i:i+len(clip)]+=clip
    growl=rat_growl(2.30,150,67)*.82
    i=int(1.45*SR);x[i:i+len(growl)]+=growl
    return x


def save(name,x):
    x=np.nan_to_num(x)
    x-=np.mean(x)
    x=fade(x,.020,.070)
    x*=.65/max(np.max(np.abs(x)),1e-12)
    pcm=np.rint(x*32767).astype('<i2')
    path=ROOT/name
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
    with wave.open(str(path),'rb') as w:
        decoded=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
        return dict(file=name, format='PCM16', channels=w.getnchannels(),
                    sample_rate=w.getframerate(), frames=w.getnframes(),
                    duration_s=round(w.getnframes()/SR,5),
                    peak=round(float(np.max(np.abs(decoded))),6),
                    rms=round(float(np.sqrt(np.mean(decoded**2))),6),
                    finite=bool(np.all(np.isfinite(decoded))),
                    first_last_samples=[int(pcm[0]),int(pcm[-1])], bytes=path.stat().st_size)


def main():
    assets={
      'rat-voice.wav':rat_voice(),
      'rat-attack.wav':np.concatenate([rat_squeak(.32,2200,1000)*.6,rat_growl(.48,155,100)]),
      'rat-down.wav':np.concatenate([rat_squeak(.36,1700,700)*.4,rat_growl(.65,108,44)*.6]),
      'bum-babble-1.wav':human_phrase([
          ('uh',.44,116,'m',.13),('a',.26,108,'b',.07),('o',.39,91,'r',.17),
          ('e',.20,122,'d',.05),('u',.63,101,'g',.22),('m',.37,77,'m',.12)]),
      'bum-babble-2.wav':human_phrase([
          ('o',.58,93,'b',.18),('i',.24,119,'sh',.05),('a',.46,112,'r',.16),
          ('uh',.31,100,'d',.08),('u',.53,82,'m',.22),('e',.35,104,'g',.10)]),
      'bum-attack.wav':human_phrase([('a',.22,154,'g',.02),('uh',.38,127,'r',.06)]),
      'bum-down.wav':human_phrase([('uh',.42,101,'g',.10),('o',.50,72,'m',.13)]),
    }
    validation=[save(name,x) for name,x in assets.items()]
    assert all(v['channels']==1 and v['sample_rate']==SR and v['finite'] and
               0<v['rms']<v['peak']<=.7 and v['first_last_samples']==[0,0] for v in validation)
    (ROOT/'validation.json').write_text(json.dumps(validation,indent=2)+'\n')
    print(json.dumps(validation,indent=2))
    # Visual inspection artifact: envelopes and frequency spectra.
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    fig,axes=plt.subplots(len(assets),2,figsize=(11,13))
    for row,(name,x) in enumerate(assets.items()):
        axes[row,0].plot(np.arange(len(x))[::50]/SR,x[::50],lw=.4)
        axes[row,0].set_title(name,fontsize=9);axes[row,0].set_xlabel('Seconds')
        axes[row,1].specgram(x,NFFT=512,Fs=SR,noverlap=384,cmap='magma')
        axes[row,1].set_ylim(0,5000);axes[row,1].set_xlabel('Seconds');axes[row,1].set_ylabel('Hz')
    fig.tight_layout();fig.savefig(ROOT/'waveform-review.png',dpi=100);plt.close(fig)


if __name__=='__main__':
    main()
