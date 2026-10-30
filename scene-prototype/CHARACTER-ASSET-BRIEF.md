# Full-body replacement brief

The current body is still procedural. A production-quality replacement should be a consistent clothed full-body character, not another collection of primitive parts or an unrelated body with an obvious head seam.

## Preferred deliverable

- GLB, or glTF with all textures and binary files supplied.
- A body skeleton that supports a seated pose and stable hands on the lap.
- Natural eye, eyelid, jaw and lip blend shapes for the scripted dialogue.
- Closed neutral mouth and neutral rest pose; no baked talking animation.
- Realistic clothing and skin materials; suitable proportions for the existing chair.
- Ideally below 15 MB, with 1K/2K textures and roughly 30–100K triangles as an initial web budget. These are project targets, not hard format limits.
- Explicit asset license and author/source records; third-party clothes and textures must be checked separately.

## Researched route

MakeHuman / MPFB is a human-character generator for Blender, with documented rigging, body parts, clothing, posing and lip-sync workflows. It is a character creation route, not a ready-made drop-in seated GLB. Producing a matching character would require a separate Blender modeling/export pass.

Primary sources checked:
- https://static.makehumancommunity.org/mpfb.html
- https://github.com/makehumancommunity/mpfb2
- https://raw.githubusercontent.com/makehumancommunity/mpfb2/master/LICENSE.ASSETS.md

No character generator has been installed and no replacement model has been bundled in this iteration. A candidate GLB or its source link can be evaluated against the criteria above before replacing the current character.
