# Radio Echo v3 — uncluttered audio

Active set: mono PCM16 44.1 kHz. Reproduce with tools/make-echo-audio-v3.py.

- echo-carrier.wav: quiet steady band-limited aperiodic radio noise, original procedural sound design. No oscillating tone, pulse modulation, music, speech, animal, footsteps or prerecorded mixtures.
- echo-static.wav: 0.22-second faded excerpt of that radio noise, one cue at regeneration start.
- echo-windup.wav: single existing creak.wav recording, Kenney RPG Audio, CC0, https://kenney.nl/assets/rpg-audio . Gain normalization and short fades.
- echo-attack.wav: single existing heavy.wav recording, Kenney Impact Sounds, CC0, https://kenney.nl/assets/impact-sounds . Gain normalization and short fades.
- echo-glass.wav: single existing glass-2.wav recording, Kenney Impact Sounds, CC0, https://kenney.nl/assets/impact-sounds . Gain normalization and short fades.

Kenney notices and source manifest remain in assets/audio/. No new third-party downloads. All foreground files are shorter than 0.5 seconds. The engine plays one radio loop, one exclusive boss-effects channel and one exclusive glass channel. Old multi-source echo-v1/v2 WAV files are archived and not loaded. Their imagery remains independently active.
