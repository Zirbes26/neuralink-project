# A Voice, Reconnected

Independent English-language student website about speech brain-computer interfaces. Open this folder in VS Code and use Live Server on `index.html` so the interactive page can load its local JSON data.

- `index.html`: homepage and project poster
- `experience.html` / `experience.js`: interactive exploration of two de-identified research trials
- `data/trials.json`: compact, downsampled extracts from the Dryad Version 4 `sentences` dataset
- `technology.html`: explanation of the research process
- `resources.html`: sources and image credit
- `styles.css`: shared visual design; edit `:root` variables first
- `nav.js`, `theme.js`, `motion.js`: navigation state, theme toggle, and scroll motion

The selected trial data are from participant T12 in the Stanford speech neuroprosthesis study by Willett et al. (2023), not Neuralink. Heatmap values are log-scaled for visual contrast and sampled at 40 ms from data originally binned at 20 ms. Recorded partial and final decoder outputs are displayed alongside the prompted target sentence. The final audio is browser speech synthesis, not the participant's voice.

Before submission: create favicon and app icon, add Open Graph metadata with the actual deployment URL to every page, record weekly Git progress, deploy, and capture desktop/mobile screenshots. Use the course project brief for remaining requirements.

## 3D journey

The WebGL scene in `brain-scene.js` uses local Three.js r160 files in `vendor/` and the Lee Perry-Smith head scan in `models/head.glb` (CC BY 3.0). Original licenses are retained in both folders. Geometry is scaled and recolored; implant placement, particles and the decoder network are conceptual illustrations. This scan does not depict participant T12. No external CDN is needed to render the scene.

Capture and decoding unlock in sequence after playback. Recorded partial text appears only during decoding; final predictions appear in the Words stage. Synthetic audio is user-triggered in the Voice stage and cancelled when changing stages, selecting a trial or restarting. The evidence heatmap has an independent inspection slider.

Use Live Server, not a file:// URL, because the page loads JavaScript modules, GLB geometry and JSON. The browser needs WebGL support.
