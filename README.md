# A Voice, Reconnected

A static educational website about brain-computer interfaces. Open the folder with VS Code and use Live Server on index.html, or serve the folder with any static web server.

## Directory layout

```text
index.html              Homepage and character selection
technology.html         Intro video and 3D experience
experience.html         Research recordings and provenance
resources.html          Sources, credits and licenses
site.webmanifest        App icons and launch metadata
assets/
  css/                  Shared styles, 3D layout and UI styles
  js/                   Language, theme, navigation, homepage and entry scripts
    scene/              3D scene, interaction, avatars, dialogue and devices
  data/                 Preprocessed public research examples
  images/               Current poster and app icons
  media/                Character previews, opening video and official explanatory media
  models/rocketbox/     Four character GLBs, shared seated animation, license and credits
  vendor/three/         Local Three.js, GLTF loader, orbit controls and MIT license
tools/                  Optional data-export and sharing-metadata development scripts
```

## Runtime entry points

Home cards link to technology.html?character=... . assets/js/studio-entry.js prepares the selected scene while the introduction is displayed and imports assets/js/scene/studio.js. That module imports its component modules, the selected character, shared animation and assets/data/trials.json.

The language button is implemented in assets/js/i18n.js. The stored language is shared between pages in the same tab. Interface text supports English and Chinese. Original English research sentences, source videos and text embedded in images retain their source language.

## Static hosting

Upload the four root HTML pages, site.webmanifest and the complete assets folder. Keep their relative paths. No Node.js server, package installation, training service or database is required. Open index.html through HTTP(S), including when testing locally. The tools folder and README are optional for hosting. Do not upload the .git directory or old backups.

All runtime library, model and media files are local to this project. The first visit still needs to download the selected character and common assets from the hosting server.

The optional tools/configure-sharing.py script sets canonical URLs and sharing-image URLs after a public base URL is known. Run it as python tools/configure-sharing.py --base-url https://example.com/project/ . It updates metadata and does not deploy the site.

## Asset attribution

Character assets and seated motion are Microsoft Rocketbox, MIT. See assets/models/rocketbox/LICENSE.md and CREDITS.md. Three.js uses the MIT license in assets/vendor/three/LICENSE.txt. Neuralink media and the Stanford research examples are explained on resources.html and experience.html. The cover illustration was generated with AI assistance. The scene replays stored research predictions and uses browser speech synthesis.
