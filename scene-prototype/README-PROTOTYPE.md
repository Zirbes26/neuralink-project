# Interactive studio prototype

Independent full-window 3D exploration. The main website is not replaced.

Open `index.html` with VS Code Live Server. All runtime assets are local; no CDN is required.

- `studio.js`: room, furniture, assembly, positioning, pairing and research replay.
- `face-avatar.js`: original Face Cap model hierarchy and native eye/brow morphs.
- `models/facecap.glb`: unchanged Three.js r160 Face Cap example model.
- `vendor/`: Three.js r160, meshopt, KTX2 and Basis texture dependencies.

## Avatar rules

The source animation clip is never played. Only eye blink, eye squint and brow morphs are allow-listed. Jaw, mouth, tongue, cheek and all other channels are reset to zero every frame. Voice is computer speech synthesis only, started explicitly by the user. Reduced motion and a movement pause button are supported.

## Research

Recorded outputs from the separately sourced Stanford T12 study remain labelled separately from Neuralink-inspired hardware. There is no live neural inference and the avatar is not participant T12. Reactions are illustrative.

## Sources and credits

Model: https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/models/gltf/facecap.glb
Example: https://github.com/mrdoob/three.js/blob/r160/examples/webgl_morphtargets_face.html
Model author credited by the example: Face Cap, https://www.bannaflak.com/face-cap/

Three.js library MIT license retained in vendor/LICENSE.txt. The library license must not be assumed to license third-party model media. This local evaluation prototype retains the source model unchanged; model redistribution rights still need confirmation before public release.

The room, furniture and implant are original procedural geometry. Avatar skin tint and proportions are adjusted in code; eyes and eyelids are original model geometry, not painted patches. The clothed body is a simple placeholder, not a scanned full-body model.

## Verification

Isolated browser tests check local asset loading, 52 native morph channels, idle blinking, zero active mouth/jaw/tongue channels, actual pointer assembly and implantation, manual signal/decoder gating, correct-only reaction, and desktop/mobile layouts.
