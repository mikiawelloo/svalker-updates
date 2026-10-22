# Rare event audio — SVALKER

All 12 sound assets in this directory are original procedural audio generated for this game by `generate.py`. No third-party recordings, music, voice clips, external models, or sampled copyrighted works are used. Nonverbal breathing and radio fragments are synthetic sound design; the radio contains no intelligible spoken content.

Recreate: `python generate.py` (Python 3, numpy, scipy). Fixed PRNG seed makes the output reproducible. Output: mono, 22,050 Hz, signed 16-bit PCM WAV; all peaks 0.65 full scale, with attack/release ramps. Validation is saved in `validation.json`.

| Asset | Duration | Intended use |
| --- | ---: | --- |
| wounded.wav | 3.4 s | Labored nonverbal breath and clothing rustle |
| tripwire.wav | 1.8 s | Taut wire pluck and metallic release |
| radio-static.wav | 3.8 s | Broken noisy transmission |
| emission-siren.wav | 4.4 s | Distant warning siren |
| anomaly-fog.wav | 6 s | Eerie wind bed, loopable with soft edge fades |
| rival-loot.wav | 2.5 s | Crate/cloth rustle and equipment clink |
| night-shadow.wav | 3.6 s | Approaching muffled steps and low uneasy tail |
| mutant-tracks.wav | 3.4 s | Branch snaps and distant animal growl |
| mini-success.wav | 1.15 s | Small mechanical release, airy positive cue |
| mini-fail.wav | 1.5 s | Dull low impact and scrape |
| radio-loop.wav | 10 s | Quiet continuous radio static bed |
| emission-rumble.wav | 10 s | Low rolling pressure/rumble bed |

Suggested engine gains: siren 0.18–0.25, continuous layers 0.08–0.14, short cues 0.25–0.4. Respect existing mute, visibility and scene lifecycle handling. Fade loop layers in/out through the engine gain node; existing limiter can remain enabled.
