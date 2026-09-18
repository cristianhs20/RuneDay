# RuneDay Character Engine — D2 Human Broad Production Master

## Status

**Implemented — awaiting visual approval.**

D2 is the first RuneDay character delivered through the official Production Pixel Sprite Pipeline v2.

It replaces the SVG/shapes approach for this review asset with real raster pixel-art PNGs.

## Runtime identity

- Engine: `runeday-sprite-v2`
- Asset: `human_broad_d2_master`
- Lineage: Human
- Fit profile: Broad
- Cell: 128×128
- Views: Front / Side / Back
- Current animation state: Idle/static master
- Review route: `/character/sprite-v2-lab`

## Source art

The three D2 views were produced against the approved Human Broad concept direction:

- heroic compact proportions;
- expressive face;
- messy brown hair;
- royal-blue starter cloth;
- brown leather;
- controlled steel accents;
- grounded boots;
- starter training sword.

The generated source masters are normalized by RuneDay tooling before runtime use.

## Runtime PNG output

Each view produces:

- master;
- shadow;
- weapon_back;
- body;
- face;
- eyes;
- hair.

All runtime files are:

- PNG;
- transparent;
- 128×128;
- aligned to the same cell origin.

The layer files are derived from the same approved master pixels so the runtime compositor does not redraw anatomy.

## Sprite Engine v2 renderer

D2 introduces the first functional Canvas 2D compositor.

Responsibilities:

- load assembly manifest;
- preload layer PNGs;
- sort by z-index;
- select view/animation;
- render fixed sprite cells;
- animate by frame metadata;
- disable image smoothing;
- use integer display scales.

The renderer does not create anatomy or equipment geometry.

## Current layer stack

1. shadow
2. weapon_back
3. body
4. face
5. eyes
6. hair

This is intentionally the first practical layer decomposition.

Future equipment/personalization passes can split the body/starter master into more granular authored layers without changing the renderer contract.

## Review page

Open:

`/character/sprite-v2-lab`

The page provides:

- Front / Side / Back composed by Canvas;
- native/integer-size previews;
- individual runtime layers;
- flattened source vs runtime recomposition;
- D2 visual review checklist.

## D2 visual approval gate

Review before proceeding to authored animation:

- Does the character finally resemble the approved RuneDay concept quality?
- Are proportions desirable?
- Is the face attractive/readable?
- Does Side look like the same hero as Front?
- Does Back preserve the same mass and identity?
- Does the starter appearance already make progression desirable?
- Is 128×128 the right production density?

## Not yet approved

D2 implementation does **not** automatically approve:

- the exact face;
- the exact body proportion;
- hair;
- starter outfit;
- sword size;
- three-view consistency.

Those remain art-review decisions.

## After approval

The next production step is D4 authored motion for Human Broad:

- Idle 4 frames;
- Walk 8;
- Attack 6;
- Cast 8;
- Celebrate 6;
- Hurt 4.

Human Lean and other lineages should not be mass-produced until Human Broad static quality is approved.
