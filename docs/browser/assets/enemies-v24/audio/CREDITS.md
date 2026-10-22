# Original enemy audio — СВАЛКЕР

Created for this project with the included deterministic `generate.py` using NumPy,
SciPy and PCM WAV encoding. No sampled audio, third-party sound recording,
copyrighted character voice, real-person imitation, or external speech service.

The sounds are original procedural vocal effects, not recordings of a human actor.

| File | Description | Duration |
|---|---|---:|
| rat-voice.wav | Three irregular high squeaks blend into a rough low growl/howl | 3.80 s |
| rat-attack.wav | Short sharp falling squeak and aggressive growl | 0.80 s |
| rat-down.wav | Dying squeak followed by falling rasp | 1.01 s |
| bum-babble-1.wav | Slurred nasal vowel fragments, lip/stop consonants, rolling rasp, breath | 3.05 s |
| bum-babble-2.wav | Alternate irregular unintelligible vowel/consonant muttering | 3.26 s |
| bum-attack.wav | Brief open-vowel effort grunt | 0.68 s |
| bum-down.wav | Falling low defeat grunt and fading exhale | 1.15 s |

All files: 22050 Hz, mono PCM16, normalized maximum amplitude 0.65, fades at both
ends. The babbling contains no meaningful words or insult. Pitch droop, irregular
glottal excitation, vocal fry, formant resonances and fricative/stop/nasal segments
make the human sound voice-like rather than a UI beep or tune.

`validation.json` was produced by reopening every written WAV and inspecting its
header, decoded sample peak, finite RMS, duration and zero-valued endpoints.
`waveform-review.png` shows waveform and spectrogram inspection; it is a QA
artifact and need not be shipped with the game. Actual device playback was not
available in this environment.

These assets may be copied into the user's game and distributed with it.
