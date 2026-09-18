# RuneDay Character Asset Production Spec v1

## Purpose

This document is the handoff contract for any human artist, AI-assisted workflow or internal tool producing RuneDay character assets.

An asset is not production-ready because it looks good in isolation.

It must fit the RuneDay Character System.

## Source canvas

Playable hero source canvas:

**64×64 logical pixels**

Baseline:

**Y = 58**

Normal hero silhouette bounds:

- left: 17;
- top: 4;
- right: 47;
- bottom: 58.

Allowed weapon/FX overflow:

- left: 5;
- top: 1;
- right: 59;
- bottom: 60.

## Required anchor compatibility

Every wearable/held asset must be authored against the versioned anchor set in:

`resources/js/game/character-style.ts`

Key examples:

- weapon grip;
- head center;
- shoulders;
- back;
- waist;
- feet.

Do not eyeball offsets separately for each asset.

## File naming

Pattern:

`rd_<category>_<slot-or-part>_<family>_<variant>_<view>_<animation>_v###`

Example:

`rd_equipment_weapon_moonsteel_blade_front_attack_v001`

### Categories

Recommended categories:

- body;
- hair;
- equipment;
- weapon;
- fx;
- pet;
- mount;
- npc;
- enemy.

### Views

Reserved values:

- front;
- side;
- back;
- threequarter.

Phase B will decide exactly which playable-character views become production mandatory.

### Animation names

Use canonical animation ids:

- idle;
- walk;
- attack;
- cast;
- celebrate;
- hurt.

Do not invent synonyms such as `hit`, `ouch`, `victory2` without updating the style system.

## Layer naming

Use canonical layer ids.

Current stack includes:

- shadow;
- back_fx;
- back;
- rear_weapon;
- legs;
- feet;
- body;
- chest;
- arms;
- head;
- hair;
- headgear;
- accessory;
- front_weapon;
- front_fx.

## Palette workflow

1. Identify material.
2. Use an existing material ramp.
3. Add rarity accent if allowed.
4. Add FX only within rarity budget.
5. Request a new material only when existing materials cannot describe the object.

Do not start by freely color-picking.

## Rarity workflow

Rarity should affect:

- shape;
- ornament;
- accent;
- FX budget.

Rarity should not affect:

- anatomy;
- baseline;
- lighting direction;
- rendering resolution;
- outline language.

## Export rules

For raster exports:

- nearest-neighbor only;
- transparent background;
- no color profile transformation that changes palette values;
- no blur;
- no drop shadow baked into item layers unless explicitly defined as FX;
- trim is forbidden for runtime layers unless metadata preserves canonical origin.

Preferred authored source should retain the full canonical canvas.

## AI-assisted art rule

AI generation may be used for:

- ideation;
- silhouette exploration;
- mood boards;
- concept variations.

Generated output is **not** considered production sprite art until manually normalized to:

- exact canvas;
- pixel grid;
- anchors;
- palette;
- material ramps;
- outline;
- layer mask;
- frame timing.

Do not feed arbitrary generated raster art directly into RuneDay inventory.

## LPC relationship

Universal LPC may remain a structural/reference inspiration for:

- modular thinking;
- equipment layering;
- sprite-sheet organization;
- animation coverage.

RuneDay production assets must not visually depend on LPC as the final identity.

The target is a proprietary RuneDay-compatible library governed by this spec.

## Required submission bundle

A production equipment family should eventually include:

- source sprite layer;
- metadata;
- visual key;
- slot;
- material designation;
- rarity;
- compatible style version;
- required animations;
- preview sheet;
- QA checklist result.

## Acceptance

An asset is accepted only after passing:

`docs/character-engine/qa-checklist-v1.md`
