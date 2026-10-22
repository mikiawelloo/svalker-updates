# Radio Echo original assets

tentacle.png — built-in ImageGen creation using this project's Radio Echo tower as style reference. Original RGBA pixels retained. Full prompt in ECHO-ATTACK.md at repository root.

All nine echo-*.wav files are original deterministic offline sound design created for this game. Reproducible generator: tools/make-echo-audio.py. No external recordings or real radio transmissions. The fictional English broadcast is synthesized locally using the installed libflite SLT voice and processed with band-pass filtering, saturation, dropout and noise. libflite: Carnegie Mellon University, permissive BSD-style license; https://github.com/festvox/flite . Remaining sounds use noise, harmonics, impulses and resonators. Files use 24 kHz mono 16-bit PCM.
