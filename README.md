# A Voice, Reconnected

Independent English-language student website about speech brain-computer interfaces. Open this folder in VS Code and use Live Server on `index.html` so the interactive page can load its local JSON data.

- `index.html`: interaction-first homepage, including the 3D trial journey and evidence heatmap
- `experience.html`: explanation of the selected recordings; `experience.js`: homepage interaction controller
- `data/trials.json`: compact, downsampled extracts from the Dryad Version 4 `sentences` dataset
- `technology.html`: explanation of the research process
- `resources.html`: sources and image credit
- `styles.css`: shared visual design; edit `:root` variables first
- `nav.js`, `theme.js`, `motion.js`: navigation state, theme toggle, and scroll motion

The selected trial data are from participant T12 in the Stanford speech neuroprosthesis study by Willett et al. (2023), not Neuralink. Heatmap values are log-scaled for visual contrast and sampled at 40 ms from data originally binned at 20 ms. Recorded partial and final decoder outputs are displayed alongside the prompted target sentence. The final audio is browser speech synthesis, not the participant's voice.

Icons, a web manifest and page-specific Open Graph metadata are included. Before deployment, run `python scripts/configure-sharing.py --base-url https://YOUR-REAL-SITE/` to set absolute share-image and page URLs. No public deployment is confirmed. Use the course brief for other submission requirements.

## 3D journey

The WebGL scene in `brain-scene.js` uses local Three.js r160 files in `vendor/` and the Lee Perry-Smith head scan in `models/head.glb` (CC BY 3.0). Original licenses are retained in both folders. Geometry is scaled and recolored; implant placement, particles and the decoder network are conceptual illustrations. This scan does not depict participant T12. No external CDN is needed to render the scene.

Capture and decoding unlock in sequence after playback. Recorded partial text appears only during decoding; final predictions appear in the Words stage. Synthetic audio is user-triggered in the Voice stage and cancelled when changing stages, selecting a trial or restarting. The evidence heatmap has an independent inspection slider.

Use Live Server, not a file:// URL, because the page loads JavaScript modules, GLB geometry and JSON. The browser needs WebGL support.

## Data alignment and current scope

The exporter converts MATLAB 1-based inclusive bounds into Python `[first-1:last]`, verifies the go-period boundaries and checks each duration against `sentenceDurations`. Trials 363 and 365 contain 188 and 117 source bins (3.76 s and 2.34 s). Recorded partial text timestamps are relative to the corrected first bin.

Reproduce with Python, NumPy and SciPy: `python scripts/export-trials.py --source PATH_TO_MAT --output data`.

Neuralink provides the inspiration; Stanford provides the recorded data. This project replays recorded predictions and uses optional browser synthetic speech. Reconstructing the participant voice and anatomically accurate implant placement remain outside the implemented scope. The Enlarge head button offers a close view without advancing the trial; Reset view or a stage change restores the journey camera.

## Homepage-first layout

The only interactive journey is on index.html#journey. technology.html explains training and decoding with an original conceptual diagram; experience.html explains the recorded examples and provenance; resources.html contains external sources and credits. The quote and poster appear after the interaction. The shared masthead combines the guide introduction and the official Neuralink link in one sentence.

## Localized recording sites

The four markers represent the two 6v and two area 44 recording arrays in Stanford participant T12. Only the two 6v anchors feed the illustrative decoding route. There are no distributed whole-head recording fibers. Approximate markers are positioned on the participant-left side of the generic head and slightly inside its surface, not registered to T12 MRI. Marker size is exaggerated. Show implant reveals the local sites with a left-side view and a source legend. The source heatmap still includes 256 channels: 0–127 are 6v and 128–255 area 44 according to sentences_readme.txt.

Reference: Willett et al., Nature (2023), DOI 10.1038/s41586-023-06377-x, Figure 1 and Extended Data Figures 2 and 7. This is not a claim about Neuralink implant placement.

## Neuralink hardware focus

The homepage opens in hardware mode. `implant-device.js` builds an original exploded schematic of the four component categories described in Neuralink’s technology overview: enclosure, battery, electronics and flexible electrode threads. It is not a CAD replica and does not map Neuralink threads to Stanford recording sites. Select a component to highlight it and read its description.

A separate recording mode replays public Stanford data, with a short visible attribution. Opening hardware mode pauses recording playback and cancels synthetic speech. Only recording mode can reveal decoder text or trigger speech. The hardware animation does not read or validate the public data. Detailed Stanford provenance remains on experience.html and resources.html.

## External decoding computer

`decoding-computer.js` replaces the old transparent decoder cube and separate text slab with a generic 3D laptop, including a screen, bezel, hinge, keyboard, trackpad and receiver symbol. The small software-network illustration and recorded words are rendered inside its screen. The dashed signal path represents wireless data transfer; it is not a cable or measured radio propagation. Stages 2–4 frame the computer, final text and voice output. The surgical robot is discussed separately as an implantation tool. The laptop is not a branded product, an exact replica of study equipment, or evidence of live model inference.


## Main-site integration · 2026-10-30

- `index.html` is a concise poster homepage with the site's purpose and a simple signal-flow figure. It loads no WebGL, old experience controller or neural recording data.
- `technology.html` (How it works) is the actual native page for the current full-window 3D story. It renders the scene directly, not inside an iframe or a separate linked prototype.
- `scene-prototype/studio.js` and its modules remain the single maintained scene implementation. Asset URLs resolve relative to `import.meta.url`, so entry-page location does not break the face, texture decoders or recordings.
- `site-scene.css` and `site-scene.js` integrate the main navigation, header spacing and shared theme with the scene. The scene title is plain heading text.
- The previous `/scene-prototype/index.html` address redirects to `/technology.html` for existing bookmarks.
- `experience.html` explains the two recordings. All live-page links point to How it works rather than the retired homepage journey.
- Replace only the contents of `#principle-visual` in the homepage when the user's explanatory image is supplied. The temporary four-step diagram is functional content, not an empty placeholder.
- The old root scene scripts are retained for recovery but are no longer loaded by the homepage or How it works page.


## Homepage speech explanation · 2026-10-30

The user's desktop image and two MP4s are copied into `media/neuralink-speech/`. The homepage follows the official section’s media/text, text/media, media/text arrangement, with concise paraphrases and source attribution. The temporary four-step principle diagram has been replaced. `home-media.js` plays muted videos only while visible, honors manual pause/reduced motion, and uses extracted local poster frames. Media require no remote connection. The 3D story stays in `technology.html`.


## Film-to-studio entry · 2026-10-30

`technology.html` begins with the user-supplied 12.63-second `Video Project.mp4`, copied as `media/studio/introduction.mp4`. `studio-entry.js` keeps the scene hidden/inert while the face model, KTX texture transcode, research data and GPU shader warm-up complete. The film starts only from a user gesture, can be skipped once the scene is ready, and enters the scene automatically on completion when ready. A slower model keeps the film cover visible instead of exposing a partial character. Replay preserves assembled parts.

The face tint is now `#ffe9d8`; neck/hand skin is `#e7c2aa`. This adjusts the existing fictional character's material palette; no person in the film is recreated. The current body remains procedural and has not been replaced by a higher-detail scanned or rigged full-body asset. See `scene-prototype/CHARACTER-ASSET-BRIEF.md` for the model selection criteria.

Tests cover normal entry, deliberately delayed face loading, film completion before loading, manual skip, replay, light materials, phone layout and the complete existing interactive story.
