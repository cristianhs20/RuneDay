# RuneDay Character Engine — Phase B

## Status

**Complete — Base Hero + Lineage System v1.**

Phase B extends the Character Style Foundation into a playable, persistent lineage architecture.

The launch lineage set is:

- Human;
- Elf;
- Skeleton;
- Ogre.

All four use one shared RuneDay Humanoid Rig and one shared equipment catalog.

## B1 — Canonical Humanoid Rig

The production hero now supports:

- Front view;
- Side view;
- Back view.

The rig keeps the Phase A contract:

- 64×64 logical canvas;
- Y=58 baseline;
- canonical hand/head/back/feet/weapon anchors;
- shared equipment layer order.

### Body frames

Phase B replaces the old implementation labels `type_a/type_b` with semantic frames:

- Broad;
- Lean;
- Heavy.

Compatibility:

| Lineage  | Broad | Lean | Heavy |
| -------- | :---: | :--: | :---: |
| Human    |   ✓   |  ✓   |   —   |
| Elf      |   ✓   |  ✓   |   —   |
| Skeleton |   ✓   |  ✓   |   —   |
| Ogre     |   —   |  —   |   ✓   |

Legacy `type_a` normalizes to Broad and `type_b` normalizes to Lean.

### Heavy frame

Ogre uses a wider Heavy silhouette, but **does not move canonical equipment sockets**.

Heavy has its own allowed silhouette bounds while keeping:

- weapon grip;
- hands;
- head center;
- back;
- waist;
- feet anchors

compatible with RuneDay equipment.

## B2 — Lineage Architecture

The shared machine-readable contract is:

`resources/game/character-system.json`

It is consumed by both:

- Laravel through `CharacterSystem`;
- React through `character-system.ts`.

This file defines:

- rig;
- frames;
- frame bounds;
- lineages;
- default frame per lineage;
- allowed frames;
- equipment compatibility;
- default appearance;
- allowed personalization options;
- views;
- animation states;
- equipment slots;
- legacy body mapping.

The goal is to prevent backend and frontend lineage rules from drifting apart.

## Persistence

Character profiles now store:

- lineage;
- character system version.

Existing profiles default to Human and are normalized lazily through the snapshot layer.

## B3 — Launch Lineages

### Human

Identity:

- classic RuneDay adventurer;
- broadest neutral customization;
- Broad or Lean frame.

### Elf

Identity:

- elegant silhouette;
- long/swept/high ear variants;
- refined/angular/serene faces;
- Broad or Lean frame.

Elf still equips the exact same weapons, helmets, chest pieces, boots, back items and accessories.

### Skeleton

Identity:

- bone anatomy;
- skull variants;
- bone color ramps;
- jaw variants;
- emissive soul eyes;
- optional limited hair;
- Broad or Lean frame.

Bone palettes:

- Ivory;
- Aged;
- Ash;
- Obsidian.

Jaw options:

- Intact;
- Cracked;
- Missing.

Soul eye colors:

- Azure;
- Emerald;
- Amber;
- Violet;
- Ember.

### Ogre

Identity:

- visibly heavier mass;
- large jaw;
- Ogre-specific ears;
- optional horns;
- Heavy frame.

Skin palettes:

- Moss;
- Ochre;
- Stone;
- Deep.

Jaw:

- Broad;
- Tusked.

Horns:

- None;
- Short;
- Swept.

Ogre uses a Heavy equipment mask around the same canonical sockets.

## B4 — Lineage Personalization

Every character uses a normalized appearance object containing:

- body;
- skin tone;
- bone tone;
- hair style;
- hair color;
- eye color;
- eye glow;
- face style;
- ear style;
- jaw style;
- horn style.

Some values are visually inactive for a lineage but remain normalized in the contract.

The Character Creator now changes controls dynamically by lineage.

Examples:

Skeleton exposes:

- Bone Tone;
- Jaw;
- Soul Eyes.

Ogre exposes:

- Heavy frame;
- Ogre skin;
- Ears;
- Jaw;
- Horns.

Elf exposes:

- Ear style;
- Elf face profiles.

Server validation rejects incompatible combinations.

Examples:

- Ogre + Lean → invalid;
- Human + Heavy → invalid.

## Shared equipment rule

RuneDay does **not** create a parallel inventory catalog per lineage.

A Training Sword remains one item.

A Moonsteel Blade remains one item.

A Dragonplate remains one item.

Renderer geometry adapts the visual mask around the same equipment definition.

Current equipment compatibility policy:

- Human: shared humanoid;
- Elf: shared humanoid;
- Skeleton: shared humanoid;
- Ogre: shared humanoid + Heavy mask.

## B5 — Animation Stress Test

Core states:

- Idle;
- Walk;
- Attack;
- Cast;
- Celebrate;
- Hurt.

The Lineage Lab renders:

**4 lineages × 6 states = 24 equipped stress cells**

using the same production renderer and a full Epic equipment set.

The goal is to detect:

- detached weapons;
- broken headgear;
- cape collisions;
- frame clipping;
- Ogre mask failures;
- Skeleton anatomy/equipment conflicts;
- Elf ear/headgear conflicts;
- inconsistent root motion.

Current phase uses the versioned animation timing contract plus CSS pose motion.

Authored frame-by-frame sprite sheets can replace those motion implementations later without changing the lineage, equipment or socket contract.

## Lineage Lab

Authenticated internal reference:

`/character/lineage-lab`

It contains:

- B1 three-view rig comparison;
- B2 frame/equipment compatibility matrix;
- B3 canonical lineage lineup;
- B4 personalization variants;
- B5 animation/equipment stress matrix;
- Phase B acceptance checklist.

## Phase B exit criteria

Phase B is complete when:

- one shared Humanoid Rig exists;
- Broad/Lean/Heavy frames exist;
- Human exists;
- Elf exists;
- Skeleton exists;
- Ogre exists;
- Front/Side/Back render;
- lineage customization is persisted;
- server validation enforces lineage/frame rules;
- existing profiles normalize safely;
- equipment catalog remains shared;
- all six animation states render;
- full Epic equipment stress matrix renders;
- Friends/Public Profiles/Guilds retain lineage identity.

These criteria are implemented in Phase B.
