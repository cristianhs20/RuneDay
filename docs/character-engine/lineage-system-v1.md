# RuneDay Lineage System v1

## Principle

A lineage may change anatomy and silhouette.

A lineage may **not** casually create a second equipment ecosystem.

The rule is:

> Change flesh, bone and mass around the RuneDay sockets; do not move the sockets to fit the lineage.

## Shared Humanoid Rig

Current rig id:

`humanoid`

All launch lineages target it.

Future lineages should use this rig whenever visually credible.

A completely different rig is justified only when shared equipment would become visibly incoherent.

## Canonical sockets

Inherited from Character Style Bible:

- head center;
- neck;
- shoulders;
- hands;
- waist;
- feet;
- back;
- weapon grip;
- accessory.

These remain stable across Human, Elf, Skeleton and Ogre.

## Frame policy

### Broad

Standard heroic mass.

Allowed:

- Human;
- Elf;
- Skeleton.

### Lean

Reduced torso/limb mass.

Allowed:

- Human;
- Elf;
- Skeleton.

### Heavy

Ogre production mass.

Allowed:

- Ogre.

Heavy may extend into wider frame-specific hero bounds but remains inside Phase A effect bounds.

## Equipment adaptation

### Standard mask

Human / Elf / Skeleton.

Equipment placement remains the canonical standard geometry.

Skeleton may reveal bone where armor does not cover the body.

Elf ears may extend beyond helmets unless an authored helmet explicitly masks them later.

### Heavy mask

Ogre.

Heavy equipment renderer may widen:

- chest silhouette;
- headgear silhouette;
- boots;
- back equipment.

It may not create a second item id or inventory definition.

## Personalization categories

### Universal contract

All characters store every canonical key so serialization remains predictable.

A lineage defines which values are legal.

### Human

- skin;
- face;
- hair;
- eyes;
- Broad/Lean.

### Elf

- skin;
- Elf face;
- ear shape;
- hair;
- eyes;
- Broad/Lean.

### Skeleton

- bone tone;
- skull shape;
- jaw;
- soul eye glow;
- limited hair;
- Broad/Lean.

### Ogre

- Ogre skin;
- Ogre face;
- ears;
- jaw/tusks;
- horns;
- hair;
- eyes;
- Heavy.

## Compatibility matrix

Current equipment slots are universally shared:

- weapon;
- head;
- chest;
- feet;
- back;
- accessory.

A future slot must be added to the Character System contract before lineage-specific assets target it.

## New lineage acceptance

A proposed new lineage must answer:

1. Can it use the Humanoid Rig?
2. Can existing weapon grip remain unchanged?
3. Can existing headgear be adapted with a mask?
4. Can existing chest/back/feet slots remain the same item definitions?
5. Which body frames are legal?
6. Which anatomy layers differ?
7. Which personalization fields become active?
8. Does it require a new canonical layer?
9. Does it remain readable in Today/Friends/Guild at small size?

If the answer to 1–4 is no, the proposal requires a Character Engine architecture review before asset production.

## No gameplay power

Lineage is visual identity.

Phase B lineage selection does not alter:

- personal XP;
- gold;
- loot chance;
- task reward factor;
- Adventure damage;
- Guild XP;
- raid damage.

If lineage gameplay traits are considered later, they require a separate balance design and must not become pay-to-win.
