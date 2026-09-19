# RuneDay Modular Character Engine v3

## Status

**Integrated — official production target.**

The Character Engine now follows an LPC-style modular architecture while preserving RuneDay's more detailed pixel-art direction.

## Core rule

Art is authored as independent modules. Runtime only selects and composites modules from pixel-art atlases.

It does not draw anatomy with SVG, split a flattened hero at runtime, invent equipment geometry, or stretch unrelated parts until they appear to fit.

## Production cell

**256×256 px** with a shared origin for all fitted modules.

## Current Human Broad catalog

- 4 coherent body/head skin tones: Fair, Light Tan, Tan, Dark
- 6 hair styles: Messy, Short Spiky, Medium Parted, Long, Ponytail, Wild
- 4 front expressions: Neutral, Determined, Happy, Serious
- Starter equipment: scarf, blue harness chest, belt/tabard, boots, training sword
- Front / Side / Back body, head and starter-equipment views

Generated hair currently has Front and Back only. Side-view hair is explicitly unavailable until authored.

## Armor library

The iron/gold generated sheet is registered as 18 logical modules:

- 8 shoulder pieces
- 4 chest pieces
- 6 greave pieces

Status: **fit-calibration-required**. They are catalogued but not force-mounted until their Broad anchors are calibrated.

## Runtime atlases

- human-broad-base.png
- human-broad-hair-face.png
- human-broad-starter-equipment.png
- iron-gold-armor-library.png

Total logical modules: **73**.

## Renderer

ModularCharacterV3 uses Canvas 2D with manifest-driven atlas-cell composition, image smoothing disabled, and a fixed 256×256 origin.

## Review environment

Authenticated route: `/character/modular-v3-lab`.

The lab changes skin tone, hair style, front expression, starter equipment toggles, and Front / Side / Back comparison in real time.

## Superseded systems

- prototype-svg-v1: debug/legacy only.
- runeday-sprite-v2: superseded because it started from a flattened hero and decomposed afterward.

Correct workflow: author body → head/skin → hair → facial modules → equipment → normalize to shared cell → atlas pack → manifest composition.

## Next production work

1. Author Side variants for all six Human Broad hair styles.
2. Calibrate iron/gold armor against Broad anchors.
3. Persist Modular v3 choices in CharacterProfile.
4. Build authored Idle/Walk sheets per module.
5. Repeat the modular contract for Human Lean, then Elf, Skeleton and Ogre.
