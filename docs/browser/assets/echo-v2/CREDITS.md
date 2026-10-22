# Radio Echo v2 — recording-based sound design

`pistol-ads.png`: new original built-in ImageGen artwork. User photograph supplied the straight rear sight perspective; the project's gun-v2.png supplied gloves, clothing and materials. Original RGBA pixels retained. Full generation prompt: ECHO-ADS.md in repository root.

Nine stereo PCM16 44.1 kHz WAV derivatives, prepared by tools/make-echo-audio-v2.py from the following already bundled recordings. No new third-party recordings downloaded. Treatments: filtering, time/rate changes, mixing, short stereo reflections, fades and gain control. No oscillator/bitcrusher/quantized tone synthesis.

| Source | Author and license | Used for |
| --- | --- | --- |
| Forest Ambience, forest.mp3 | TinyWorlds, CC0; https://opengameart.org/content/forest-ambience | Wind under the tower |
| Impact Sounds; heavy, glass, wood, hit | Kenney, CC0; https://kenney.nl/assets/impact-sounds | Steel/cloth/impact, cracking and falling glass |
| RPG Audio; creak, metal-click, cloth | Kenney, CC0; https://kenney.nl/assets/rpg-audio | Cable creaks and mechanical movement |
| Gun reload sounds; reload.wav | SpringySpringo, CC0; https://opengameart.org/content/gun-reload-sounds | Attack windup mechanism |
| Wolf Howling Yipping; wolves.wav | Daniel Simon, CC BY 3.0; https://soundbible.com/2132-Wolf-Howling-Yipping.html ; https://creativecommons.org/licenses/by/3.0/ | echo-howl.wav: excerpt, slower playback, band-pass, mixed creaking metal, stereo reflections |
| murmuring; camp-crowd.wav | blaastaal, CC0; https://freesound.org/people/blaastaal/sounds/766658/ | echo-broadcast.wav: indistinct voices, narrow radio band, reception fluctuations |
| Fireplace Sound loop; campfire.wav | PagDev, CC0; https://opengameart.org/content/fireplace-sound-loop | Analog-like static and crackles |

Prior synthesis-only echo-v1 WAV files remain archived and are not loaded by the game. Tentacle artwork in echo-v1 remains active.
