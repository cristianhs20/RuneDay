# RuneDay Character Engine — Phase A

## Status

**Complete — Art Direction Foundation v1.**

Phase A freezes the first production rules for RuneDay's playable-character visual system.

The selected direction is:

# RuneDay Heroic Compact Fantasy

The goal is a pixel-art language that feels:

- readable at mobile size;
- friendly without looking childish;
- heroic enough for meaningful equipment progression;
- modular enough for hundreds of future cosmetics;
- visually consistent across heroes, equipment, animation and social inspection.

## Why this direction

RuneDay needs the hero to create emotional value from real-life progress.

The character must therefore support both ends of the progression curve:

- a simple starter hero must already look intentional;
- high-tier equipment must feel prestigious without looking like it came from another game.

The chosen direction keeps a compact classic-RPG silhouette while using stricter modern rules for materials, layering, palette and motion.

## Canonical technical format

- logical canvas: **64×64 px**;
- baseline: **Y = 58**;
- playable hero bounds: approximately **X 17–47 / Y 4–58**;
- effect/weapon overflow bounds: **X 5–59 / Y 1–60**;
- target proportion: approximately **3 heads tall**;
- source pixels are always 1 logical pixel;
- raster scaling must be integer-only;
- no anti-aliasing;
- no gradients inside sprite assets.

The 64×64 canvas is locked for the Heroic Compact family.

Changing canvas size requires a new major Character Style version.

## Lighting

All character assets use the same lighting model:

**primary light from top-left, approximately 10 o'clock.**

A future helmet, sword or cape with opposite lighting fails visual QA even if it is individually attractive.

## Shading

Normal material budget:

1. shadow;
2. base;
3. highlight.

Additional colors are allowed only for:

- rarity accents;
- emissive magic;
- gems;
- controlled FX.

More detail is not automatically better. Readability and consistency take priority.

## Silhouette

Playable heroes share one skeleton and anchor system.

Phase A keeps two body frames:

- **Frame A — broad**;
- **Frame B — lean**.

They may alter torso/limb mass but **cannot move equipment sockets**.

This guarantees that one helmet, weapon or cape system remains compatible with both.

## Locked anchors

The production renderer now exposes a versioned anchor contract for:

- head center;
- neck;
- left/right shoulders;
- left/right hands;
- waist;
- left/right feet;
- back;
- weapon grip;
- accessory.

Exact coordinates live in:

`resources/js/game/character-style.ts`

## Layer order

The canonical layer stack is:

1. shadow;
2. back FX;
3. back equipment;
4. rear weapon;
5. legs;
6. feet;
7. body;
8. chest equipment;
9. arms;
10. head;
11. hair;
12. headgear;
13. accessory;
14. front weapon;
15. front FX.

Future assets cannot invent their own stacking order.

If a new category requires another layer, the Style Bible must be versioned first.

## Material library v1

Phase A defines reusable three-tone ramps for:

- iron;
- steel;
- moonsteel;
- embersteel;
- mosssteel;
- gold;
- bronze;
- leather;
- dark leather;
- wood;
- green cloth;
- blue cloth;
- violet cloth;
- red cloth.

Skin, hair and eye palettes are also centralized.

## Rarity language

Rarity is not permission to abandon the RuneDay style.

Rarity changes:

- accent color;
- silhouette complexity budget;
- FX budget.

It does **not** change:

- lighting direction;
- pixel density;
- anatomy;
- outline logic;
- material shading rules.

Current accent language:

- Common — neutral steel;
- Uncommon — verdant;
- Rare — azure;
- Epic — violet;
- Legendary — gold;
- Mythic — magenta.

Legendary/Mythic are reserved for future use.

## Motion contract

Phase A establishes target animation budgets:

| Animation | Frames | FPS | Max root travel |
| --------- | -----: | --: | --------------: |
| Idle      |      4 |   4 |            2 px |
| Walk      |      8 |  10 |            1 px |
| Attack    |      6 |  12 |            5 px |
| Cast      |      8 |  10 |            2 px |
| Celebrate |      6 |   9 |            5 px |
| Hurt      |      4 |  10 |            3 px |

These are production targets for authored sprite sheets.

The current CSS motion remains a prototype representation until Phase B introduces authored animation frames.

## Source of truth

Machine-readable visual rules:

`resources/js/game/character-style.ts`

Production renderer:

`resources/js/components/game/character-sprite.tsx`

Visual reference environment:

`/character/style-lab`

The Style Lab renders the same component used by the live product.

## What Phase A changed in code

The character renderer no longer owns independent hardcoded art rules.

Phase A centralizes:

- palette;
- materials;
- outlines;
- rarity accents;
- canvas;
- baseline;
- anchors;
- layer order;
- animation targets;
- naming rules.

The renderer consumes those tokens.

It also exposes:

- bounds debug mode;
- anchor debug mode;
- style id/version metadata.

## Phase A exit criteria

Phase A is complete when:

- one art direction is selected;
- canvas/baseline are frozen;
- anchors are frozen;
- layer order is frozen;
- palette/material system is versioned;
- rarity language is defined;
- animation budgets are defined;
- naming convention is defined;
- production renderer consumes shared style tokens;
- Style Lab exists;
- visual QA checklist exists;
- asset-production specification exists.

All criteria are now satisfied.

## What Phase A does not claim

Phase A does **not** mean the final RuneDay sprite is perfect.

It creates the rules needed to iterate toward perfection without visual drift.

Phase B should now focus on the authored base hero itself:

- front/side/back construction;
- final anatomy;
- expression treatment;
- authored idle/walk/attack/cast/celebrate/hurt frames;
- final archetype silhouettes;
- first production-grade hair/skin set.

No large cosmetic catalog should be produced before Phase B is approved.
