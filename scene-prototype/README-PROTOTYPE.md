# Interactive studio scene

The current full-window 3D story is integrated directly into the main website’s How it works page (`../technology.html`).

Open `../technology.html` with VS Code Live Server. The old `index.html` entry point redirects there. All runtime assets are local; no CDN is required.

- `studio.js`: room, furniture, assembly, positioning, pairing and research replay.
- `face-avatar.js`: original Face Cap model hierarchy and native eye/brow morphs.
- `models/facecap.glb`: unchanged Three.js r160 Face Cap example model.
- `vendor/`: Three.js r160, meshopt, KTX2 and Basis texture dependencies.

## Avatar rules

The source animation clip is never played. Eye and brow morphs control idle/feedback animation. Selected jaw/lip morphs are enabled only for the scripted patient introduction; all mouth channels are reset to zero during pauses, guide replies and final computer speech. All audio is explicit, user-triggered browser speech synthesis. Reduced motion and a movement pause button are supported.

## Research

Recorded outputs from the separately sourced Stanford T12 study remain labelled separately from Neuralink-inspired hardware. There is no live neural inference and the avatar is not participant T12. Reactions are illustrative.

## Sources and credits

Model: https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/models/gltf/facecap.glb
Example: https://github.com/mrdoob/three.js/blob/r160/examples/webgl_morphtargets_face.html
Model author credited by the example: Face Cap, https://www.bannaflak.com/face-cap/

Three.js library MIT license retained in vendor/LICENSE.txt. The library license must not be assumed to license third-party model media. This local evaluation prototype retains the source model unchanged; model redistribution rights still need confirmation before public release.

The room, furniture and implant are original procedural geometry. Avatar skin tint and proportions are adjusted in code; eyes and eyelids are original model geometry, not painted patches. The clothed body is a refined procedural seated character with fabric, continuous limbs and articulated-looking hands; it is not a scanned full-body model.

## Verification

Isolated browser tests check local asset loading, 52 native morph channels, idle blinking, zero active mouth/jaw/tongue channels, actual pointer assembly and implantation, manual signal/decoder gating, correct-only reaction, and desktop/mobile layouts.


## Narrative refinement · 2026-10-30

The studio now opens with Alex, a fictional person living with ALS who retains some speech. This is one fictional situation, not a representation of everyone with ALS. Audio is paced browser synthesis, not an actual patient recording or a clinical simulation of dysarthria. Replies are scripted choices; no microphone or AI conversation service is used.

The previous universal mouth lock is superseded for the opening only. `face-avatar.js` accepts an explicit `talking` input from `narrative-speech.js`. Selected jaw/lip morphs are animated approximately during patient utterances, return to zero between utterances, and remain zero while the visitor/guide or final computer voice is speaking. Mouth timing is illustrative, not phoneme-accurate lip sync.

`seated-person.js` uses a tailored continuous torso, continuous tapered limbs, hands/fingers, fabric patterns, shoes and upholstered chair, replacing the sphere/capsule placeholder. The result remains a stylized procedural character, not a photoreal scanned body.

`room-details.js` adds curtains, bookcase contents, warm lamp, framed print and desk objects.

`implant-cutaway.js` presents a non-graphic, abstract digital cutaway of housing/threads. It is explicitly an educational schematic, not an operating-room procedure, anatomical targeting map or surgical instruction. There are no incisions or clinical steps. Neuralink speech technology is investigational; no efficacy, eligibility or commercial availability is promised.

Sources:
- https://www.als.org/navigating-als/living-with-als/therapies-care/augmentative-alternative-communication
- https://neuralink.com/trials/speech-restoration/

Browser checks cover patient-only mouth activity, stopped mouth during pauses and guide/computer speech, conversation cancellation/restart, manual assembly/implantation, cutaway, signal gates and narrow-screen layout. Speech events are simulated for deterministic browser tests; actual installed voices and speaker output vary by browser/device.


## Main website entry point

`technology.html` is the live scene page, rendered directly rather than in an iframe. Scripts and assets remain in this folder; model, decoder and dataset URLs are resolved with `new URL(..., import.meta.url)`. `site-scene.css` and `site-scene.js` provide shared navigation, header spacing and theme. The root homepage is now poster and explanation only.
