# RuneDay Animation Stress Test v1

## Purpose

The stress test exists to prove that character identity, equipment and motion can coexist before mass asset production.

## Matrix

Launch matrix:

- 4 lineages;
- 6 animation states;
- full Epic equipment set.

Total primary animation cells:

**24**

The Lineage Lab also checks three views per lineage.

## Required states

### Idle

Checks:

- silhouette stability;
- cape stability;
- no UI-distracting movement.

### Walk

Checks:

- root drift;
- boot/body coherence;
- back equipment coherence.

### Attack

Checks:

- weapon grip;
- weapon arc;
- chest/arm collision;
- Ogre Heavy compatibility.

### Cast

Checks:

- weapon/hand focal point;
- magical pose readability;
- headgear stability.

### Celebrate

Checks:

- reward expression;
- root travel;
- cape/hair clipping.

### Hurt

Checks:

- readable impact;
- equipment remains attached;
- no punitive prolonged motion.

## Required lineage checks

### Human

Baseline control case.

### Elf

Focus:

- ear/headgear collision;
- hair/ear collision.

### Skeleton

Focus:

- exposed bone vs armor;
- jaw stability;
- eye glow readability;
- hair/skull interaction.

### Ogre

Focus:

- Heavy chest mask;
- headgear width;
- horns/headgear overlap;
- weapon grip;
- boots/leg mass;
- cape width.

## Equipment stress set

The internal test uses:

- Emberfang;
- Crown of Dawn;
- Dragonplate;
- Voidwalkers;
- Phoenix Mantle;
- Astral Sigil.

This intentionally uses visually aggressive Epic equipment.

If Epic equipment survives, Common/Uncommon geometry should be lower-risk.

## Current implementation level

Phase B validates animation **states and geometry** using the production vector/pixel renderer plus controlled CSS motion.

The next authored-animation iteration may replace each motion with true frame-by-frame art.

That replacement must preserve:

- state ids;
- sockets;
- root travel budgets;
- view contract;
- equipment compatibility.

## Failure conditions

A stress cell fails when:

- weapon detaches from grip;
- equipment changes perceived lineage scale unexpectedly;
- Ogre clips outside Heavy/effect bounds;
- ears/horns vanish without an intentional mask;
- Skeleton anatomy becomes unreadable;
- root motion exceeds contract;
- equipment z-order is wrong;
- action is not understandable at small preview size.

## Reference

Run:

`/character/lineage-lab`

and review the B5 matrix at:

- normal desktop zoom;
- reduced browser width;
- dark theme;
- light theme when applicable.
