# RuneDay Character Engine — Phase C

## Status

**In execution. C1 complete. C2.1 Human Broad implemented and awaiting visual approval.**

Phase C is the Base Hero Art Pass & Authored Motion phase.

The goal is not to create more features.

The goal is to make the four launch lineages visually strong enough that RuneDay's progression loop feels desirable before mass equipment production begins.

## Core principle

**Do not scale asset quantity until the Base Hero is excellent.**

Phase C should be treated as multiple art-review gates.

A subphase is not complete because files exist.

It is complete only after visual approval.

# C1 — Art Target Extraction

## Goal

Translate the approved Phase B preview into measurable production rules.

## Deliverables

- Base Hero Art Target v1;
- per-lineage silhouette notes;
- face-cluster rules;
- body proportion rules;
- hair silhouette rules;
- material-readability target;
- native-size review requirements.

## Acceptance

C1 passes when the team can evaluate a new sprite without saying only:

> “I like it / I don't like it.”

Reviewers must instead be able to point to:

- silhouette;
- proportions;
- face cluster;
- material;
- lighting;
- pixel density;
- lineage identity.

# C2 — Base Hero Redraw

## Goal

Produce the first production-quality Base Hero pass.

## Required heroes

### Human

- Broad Front;
- Lean Front.

### Elf

- Broad Front;
- Lean Front.

### Skeleton

- Broad Front;
- Lean Front.

### Ogre

- Heavy Front.

Total primary Front body targets:

**7**

## Redraw priorities

1. head silhouette;
2. face cluster;
3. shoulder/chest proportion;
4. arms/hands;
5. hip/leg transition;
6. boots/feet;
7. hair;
8. lineage anatomy;
9. pixel cleanup.

## Review iterations

At least three internal art iterations are expected:

### C2.1 Silhouette

Review only:

- mass;
- shape;
- proportions.

### C2.2 Anatomy & face

Review:

- face;
- hands;
- legs;
- lineage anatomy.

### C2.3 Pixel polish

Review:

- clusters;
- outline;
- shading;
- material readability.

Do not skip directly to C2.3.

## Current execution status

### C2.1 — Human Broad

Implemented in production renderer.

Review reference:

- [Human Broad C2.1](human-broad-c2-1.md)

Gate state: **implemented / awaiting visual approval**.

Human Lean and remaining lineages intentionally remain on Phase B art until this gate is approved.

## Acceptance

All 7 Base Hero targets must:

- read clearly at 64 px;
- feel like the same game;
- feel different by lineage/frame;
- keep canonical sockets;
- meet Style Bible QA.

# C3 — Multi-view Polish

## Goal

Complete production Front / Side / Back consistency.

## Order

1. Human Broad;
2. Human Lean;
3. Elf;
4. Skeleton;
5. Ogre Heavy.

## Review questions

- does side view preserve perceived body mass?
- does back view look authored rather than secondary?
- is hair volume consistent?
- are ears/horns/jaw consistent?
- does equipment sit at the same perceived height?
- does baseline remain exact?

## Acceptance

Each approved frame has:

- Front;
- Side;
- Back

with no obvious scale jump between views.

# C4 — Authored Animation Pass

## Goal

Replace prototype pose motion with authored frame-by-frame Base Hero animation.

## Production order

### C4.1 Idle

First authored animation.

Why first:

- lowest complexity;
- exposes anatomy drift;
- appears constantly in UI.

### C4.2 Walk

Why second:

- proves body mechanics;
- exposes boots/legs/root problems.

### C4.3 Attack

Why third:

- proves weapon sockets and dynamic silhouette.

### C4.4 Cast

Why fourth:

- proves FX and magical focal point.

### C4.5 Celebrate

Why fifth:

- core emotional reward animation.

### C4.6 Hurt

Final base combat reaction.

## Acceptance

For every state:

- root travel stays within contract;
- no detached equipment;
- no body-frame drift;
- silhouette remains readable;
- lineage identity survives motion.

# C5 — Personalization Art Pass

## Goal

Upgrade customization from structural variants to production-quality authored art.

## Human

- 3 face families;
- 5 hair styles;
- all canonical skin tones;
- all eye colors.

## Elf

- 3 face families;
- 3 ear families;
- 5 hair styles;
- canonical skin/eye palettes.

## Skeleton

- 3 skull families;
- 4 bone tones;
- 3 jaw states;
- 5 soul-eye colors;
- limited hair set.

## Ogre

- 3 face families;
- 4 skin tones;
- 2 ear states;
- 2 jaw states;
- 3 horn states;
- 4 hair styles.

## Acceptance

Random valid combinations should still look intentional.

No option should feel like a sticker placed on top of another sprite.

# C6 — Equipment Integration Pass

## Goal

Verify the improved Base Hero against a small controlled equipment benchmark before catalog expansion.

## Benchmark equipment

Starter:

- Training Sword;
- Linen Tunic.

Prestige:

- Emberfang;
- Crown of Dawn;
- Dragonplate;
- Voidwalkers;
- Phoenix Mantle;
- Astral Sigil.

## Required checks

Every benchmark asset must be reviewed on:

- Human Broad;
- Human Lean;
- Elf Broad;
- Elf Lean;
- Skeleton Broad;
- Skeleton Lean;
- Ogre Heavy.

And for the most collision-prone pieces:

- Front;
- Side;
- Back;
- Attack;
- Cast;
- Celebrate.

## Acceptance

No benchmark item may require a duplicated lineage-specific inventory item.

Mask/shape adaptation is allowed.

Catalog duplication is not.

# Phase C review gates

## Gate 1 — C1 approved

Art target is clear.

## Gate 2 — Human Base approved

Do not continue all lineages until Human proves the production quality target.

## Gate 3 — Four-lineage Front lineup approved

No multi-view mass production before Front lineup approval.

## Gate 4 — Multi-view approved

No animation mass production before view consistency is approved.

## Gate 5 — Idle/Walk approved

No combat animation production before body motion is approved.

## Gate 6 — Full animation set approved

No large equipment catalog before authored motion is stable.

## Gate 7 — Personalization approved

No monetized cosmetic expansion before random-combination quality is acceptable.

## Gate 8 — Benchmark equipment approved

Only after this gate should RuneDay start scaling equipment production.

# Phase C success metric

The phase is successful when a user can look at a naked/starter RuneDay hero and already want to own and progress it.

Equipment should amplify desire.

It should not be required to hide a weak Base Hero.

# Tooling requirements

Phase C should continue using:

- Character Style Lab;
- Lineage Lab;
- bounds/anchor debug;
- B5 stress matrix.

Additional tooling recommended during execution:

- frame-by-frame animation preview;
- onion-skin comparison;
- native-size preview strip;
- side-by-side lineage review;
- equipment collision overlay.

# Deliverables at Phase C completion

- approved production Base Hero set;
- approved Front/Side/Back set;
- authored six-state animation set;
- approved personalization library;
- benchmark equipment compatibility;
- updated Style Bible;
- updated QA checklist;
- animation metadata ready for web/mobile renderer.

# Explicit non-goals

Phase C does not include:

- hundreds of equipment assets;
- pets;
- mounts;
- new lineages;
- monetization catalog;
- seasonal cosmetics;
- guild cosmetics.

Those should wait until the Base Hero is visually approved.
