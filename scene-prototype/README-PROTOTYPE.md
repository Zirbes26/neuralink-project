# Integrated 3D studio

The live entry is ../technology.html. index.html redirects there.

- studio.js: room, camera, story and manual assembly / placement / recorded decoding journey.
- rocketbox-avatar.js: complete Microsoft Rocketbox Medical_Male_02 character, matching seated breathing clip and 10 native facial morphs.
- patient-chair.js: separate chair fitted to the seated rig.
- models/rocketbox/: optimized GLB, compatible motion JSON, MIT license and source credit.
- narrative-speech.js: scripted fictional dialogue. Patient jaw/lip animation is enabled only for patient utterances. Guide and computer audio leave the patient's mouth at rest.
- implant-cutaway.js: abstract educational cutaway; not an anatomical placement map or a surgical simulator.

The original separate Face Cap head and procedural clothed body have been retired. The opening film covers background loading and remains until model/data loading and shader compilation succeed. Source geometry and unused animation FBXs are not loaded by the website.

Recorded trials are Stanford / Willett et al. (2023), participant T12. They are separately sourced replay data, not Neuralink measurements or a running model. Browser TTS is not the participant's original voice. The fictional Rocketbox avatar does not represent T12 or anyone in the opening film.

## Validation
The full interaction was exercised in an isolated local browser: patient and guide dialogue, native mouth rest, three part drags, cutaway, manual placement, signal and decoding slider gates, computer output, restart cancellation and mobile layout. No page errors or missing scene assets were reported.
