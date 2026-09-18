# RuneDay Character Engine — Phase D

## Production Pixel Sprite Pipeline v2

## Status

**In execution — D1 complete. D2 Human Broad master implemented and awaiting visual approval.**

Phase D replaces the current SVG/shape-based visual direction as the final production path for RuneDay characters.

The existing SVG CharacterSprite remains temporarily available only as:

- technical rig visualizer;
- socket/layering debugger;
- compatibility fallback while v2 assets are produced.

It is **not** the production art target.

## Why Phase D exists

The Phase A–C architecture proved useful concepts:

- lineages;
- Broad / Lean / Heavy frames;
- equipment slots;
- shared catalog;
- layer order;
- canonical sockets;
- animation state ids;
- social/guild identity propagation.

However, the runtime SVG/shapes renderer cannot reach the approved visual target.

The approved concepts require:

- real authored pixel clusters;
- richer anatomy;
- expressive faces;
- detailed hair;
- material-specific pixel art;
- authored equipment;
- frame-by-frame motion.

Phase D preserves the architecture and replaces the visual implementation.

# Non-negotiable production rule

**RuneDay production characters are authored pixel-art assets.**

The runtime engine composes and animates assets.

The runtime engine does not draw the final hero from rectangles, polygons or procedural SVG anatomy.

# D0 — Deprecate prototype rendering

## Goal

Separate technical prototype rendering from production rendering.

## Rules

The current CharacterSprite SVG system becomes:

`prototype-svg-v1`

Status:

`deprecated-for-production-art`

It may still be used for:

- bounds debugging;
- anchor debugging;
- legacy fallback;
- verifying inventory/lineage contracts.

It must not be used as the visual source for:

- final character art;
- final equipment art;
- store previews;
- marketing character renders;
- production animation frames.

## Exit

All product surfaces use Sprite Engine v2 before the prototype renderer is removed.

# D1 — Production Sprite Standard v2

## Goal

Lock the real authored-sprite format before producing a large asset library.

## Master frame

**128×128 transparent PNG cell**

This is the canonical authored frame cell for production characters.

Why 128×128:

- enough room for the approved level of face/hair/armor detail;
- room for capes, weapons and Ogre Heavy silhouettes;
- still practical for spritesheet atlases;
- compatible with pixel-perfect nearest-neighbor rendering.

The visible hero does not need to fill the entire cell.

Unused transparent space is intentional and preserves common origins across layers.

## Coordinate origin

All layers for a character frame share:

- identical 128×128 canvas;
- identical origin;
- identical baseline;
- identical frame index;
- identical view/animation timing.

No runtime trim is allowed for production layers.

## Display sizes

Primary full-body product displays should prefer:

- 128 px;
- 256 px;
- 384 px;
- 512 px

using integer scaling.

Small UI may use generated dedicated thumbnails rather than arbitrary browser downscaling.

## Rendering

Required:

- transparent PNG;
- nearest-neighbor;
- image smoothing disabled;
- no SVG reconstruction;
- no CSS-generated anatomy.

# D2 — Human Broad Master

## Current D2 status

Implemented in Sprite Engine v2 and available for review at:

`/character/sprite-v2-lab`

Reference:

- [D2 Human Broad Production Master](d2-human-broad-master.md)

Gate state: **implemented / awaiting visual approval**.

## Goal

Produce the first real RuneDay production character.

Human Broad is the master quality reference for every later body.

## Required static views

- Front;
- Side;
- Back.

Side may be mirrored when the animation/art is explicitly marked mirror-safe.

## Required Base Hero layers

At minimum:

- shadow;
- body;
- face;
- eyes;
- hair_back;
- hair_front;
- hands/front anatomy where needed.

## Required starter-equipment layers

- Training Sword;
- Linen Tunic;
- starter boots;
- starter back/cape reference if used.

## Required prestige benchmark

Use only a small benchmark set:

- Emberfang;
- Crown of Dawn;
- Dragonplate;
- Voidwalkers;
- Phoenix Mantle;
- Astral Sigil.

Do not create a large equipment catalog during D2.

## Quality gate

Human Broad must visually approach the approved concept board before D3/D4 asset scaling begins.

# D3 — Sprite Composer / Renderer v2

## Goal

Replace procedural drawing with layered asset composition.

## Renderer responsibilities

The renderer may:

- load manifests;
- preload PNG spritesheets;
- choose view;
- choose animation;
- choose frame;
- resolve fit profile;
- composite ordered layers;
- draw FX layers;
- mirror mirror-safe side views;
- apply integer scale;
- expose debug overlays.

The renderer may not:

- redraw anatomy;
- invent armor geometry;
- generate face pixels;
- recolor arbitrary art outside approved palette transformations.

## Recommended web implementation

Canvas 2D compositor:

- one output canvas;
- `imageSmoothingEnabled = false`;
- ordered `drawImage` calls from spritesheet cells;
- requestAnimationFrame clock;
- deterministic frame timing from manifest.

This keeps the number of DOM elements low while preserving layered composition.

## Mobile portability

The manifest is renderer-agnostic.

The same assets/metadata must be usable by the future React Native renderer.

# D4 — Authored Animation Sheets

## Required states

- Idle — 4 frames;
- Walk — 8 frames;
- Attack — 6 frames;
- Cast — 8 frames;
- Celebrate — 6 frames;
- Hurt — 4 frames.

## Production rule

Frames are authored pixel art.

CSS transform animation may be used only for:

- UI presentation;
- very small secondary effects;
- transition polish.

It must not substitute the body animation.

## Socket metadata

Each authored frame may provide socket coordinates for:

- weapon grip;
- offhand;
- head;
- back;
- FX origin.

Socket metadata exists to align independent layers.

It does not generate the art.

# D5 — Lineage rollout

After Human Broad approval:

1. Human Lean;
2. Elf Broad;
3. Elf Lean;
4. Skeleton Broad;
5. Skeleton Lean;
6. Ogre Heavy.

Each target must use the same Sprite Engine v2 contract.

## Lineage anatomy remains authored

Examples:

Elf:

- ear pixels are authored layers.

Skeleton:

- skull/bones/jaw are authored layers.

Ogre:

- Heavy anatomy/tusks/horns are authored layers.

No lineage returns to procedural SVG anatomy.

# D6 — Personalization Packs

Personalization becomes authored sprite assets.

## Human

- face families;
- skin tones;
- hair styles/colors;
- eyes.

## Elf

- face;
- ears;
- skin;
- hair;
- eyes.

## Skeleton

- skull;
- bone tone;
- jaw;
- soul eyes;
- hair where supported.

## Ogre

- face;
- skin;
- ears;
- tusks/jaw;
- horns;
- hair.

## Rule

A valid combination must be visually reviewed.

The system must never rely on random runtime geometry to make combinations fit.

# D7 — Equipment Fit Profiles

The gameplay item catalog remains shared.

Example:

`Emberfang` is one ItemDefinition.

Its visual definition may contain sprite variants for fit profiles:

- Broad;
- Lean;
- Heavy.

This is visual adaptation, not a duplicated item.

## Equipment asset contract

An equipment piece may provide:

- `broad` sheet;
- `lean` sheet;
- `heavy` sheet.

If a fit profile can safely reuse another sheet, the manifest may declare an alias.

## Production requirement

Every benchmark item must pass:

- required views;
- required animations;
- required fit profiles;
- z-order;
- socket alignment.

# D8 — Production QA & Cutover

## Goal

Move RuneDay product surfaces from prototype renderer to Sprite Engine v2.

## Required surfaces

- Hero Creator;
- Today;
- Inventory;
- Shop;
- Adventure overlay;
- Friends;
- public profile;
- share card;
- Guild roster;
- Guild raid feedback.

## Cutover rule

The prototype SVG renderer can be removed only when:

- all required surfaces use v2;
- Base Hero assets are approved;
- launch lineages are available;
- starter equipment is available;
- fallback behavior is tested.

# Phase D success criterion

A RuneDay user should see a starter hero and already feel:

> “I want to progress this character.”

The desire must come from the quality of the Base Hero itself.

Equipment then amplifies that desire.

# Explicitly retained from previous phases

Keep:

- lineage ids;
- body-frame ids;
- inventory item ids;
- equipment slots;
- shared catalog;
- gameplay stats;
- social/guild integration;
- achievement/economy systems;
- animation state names where compatible.

# Explicitly replaced

Replace as production art:

- SVG body blocks;
- SVG face construction;
- SVG hair construction;
- SVG equipment construction;
- CSS-only body animation.

# Phase D output

At completion RuneDay has:

- Sprite Engine v2;
- production Human/Elf/Skeleton/Ogre sprite assets;
- authored animation sheets;
- layered customization;
- fit-profile equipment assets;
- manifest-driven composition;
- no dependence on procedural SVG art for final characters.
