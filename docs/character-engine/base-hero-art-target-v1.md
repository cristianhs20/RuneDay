# RuneDay Base Hero Art Target v1

## Status

**Approved visual direction.**

This document translates the approved Phase B preview into concrete art rules for the next production pass.

The target is not “copy the preview pixel for pixel.”

The target is to preserve its strongest qualities while making the result fully compatible with RuneDay's canonical rig, shared equipment system and long-term asset pipeline.

## High-level target

RuneDay heroes should feel:

- heroic;
- collectible;
- premium;
- readable at small size;
- expressive without becoming cartoonish;
- detailed enough to make equipment desirable;
- consistent across all lineages.

The final result should create the reaction:

> “I want to keep progressing because I want my hero to look better.”

## Global silhouette target

All playable heroes must remain readable as RuneDay characters even when shown only as a silhouette.

Target visual traits:

- larger, clearer head than realistic anatomy;
- broad readable torso;
- visible hands and boots;
- strong shoulder shape;
- clean separation between chest, legs and back equipment;
- weapon must remain readable at small preview size;
- no noisy micro-detail around silhouette edges.

## Pixel density

The approved preview uses denser visual information than the original Phase A prototype.

Phase C should therefore improve:

- face clusters;
- armor planes;
- hair silhouette;
- hands;
- knees/boots;
- material highlights;
- cape folds;
- facial contrast.

But density must remain controlled.

A sprite that only looks good when zoomed in fails.

## Human art target

### Personality

Human is the visual baseline for the entire character engine.

It should communicate:

- classic fantasy hero;
- balance;
- approachability;
- aspiration;
- adaptability.

### Broad

Target:

- confident shoulders;
- slightly wider chest;
- stable stance;
- good heavy-armor silhouette;
- not bodybuilder-large.

### Lean

Target:

- narrower waist;
- slightly lighter shoulders;
- cleaner leg silhouette;
- elegant enough for Rogue/Arcanist without appearing fragile.

### Face

Human faces should support:

- balanced;
- strong;
- soft.

Differences must be visible at native scale through:

- jaw width;
- brow;
- cheek cluster;
- hairline;
- eye spacing.

Avoid relying on tiny decorative pixels that disappear at UI size.

## Elf art target

### Personality

Elf should communicate:

- elegance;
- precision;
- intelligence;
- mysticism;
- calm confidence.

### Silhouette

Key identifiers:

- long ear shape;
- slightly refined jaw;
- taller visual head silhouette through hair/ears;
- controlled narrow proportions.

Elf must not become:

- simply “Human + triangle ears”;
- extremely thin;
- anime-styled;
- visually disconnected from RuneDay armor.

### Ears

Ear styles:

- Long;
- Swept;
- High.

Ear silhouette must survive:

- no helmet;
- circlet;
- hood;
- full helmet.

Helmet masking rules should be authored later, never improvised per asset.

## Skeleton art target

### Personality

Skeleton should communicate:

- mystery;
- persistence;
- dark-fantasy charisma;
- magical identity.

It should not feel:

- horror/gore;
- comedic Halloween prop;
- anatomically overcomplicated.

### Skull

The skull is the primary identity asset.

Target:

- readable sockets;
- clean nasal cavity cluster;
- strong jaw silhouette;
- clear brow;
- controlled tooth suggestion.

Do not draw individual realistic teeth at native scale.

### Bone

Bone materials:

- Ivory;
- Aged;
- Ash;
- Obsidian.

Bone must read differently from metal.

### Soul eyes

Eye glow is a focal accent.

Rules:

- glow stays compact;
- sockets remain visible;
- aura does not cover skull silhouette;
- glow must remain readable in dark UI.

### Jaw

Jaw variants:

- Intact;
- Cracked;
- Missing.

Missing jaw must remain aesthetically intentional rather than looking like clipping.

## Ogre art target

### Personality

Ogre should communicate:

- mass;
- strength;
- resilience;
- intimidation with personality.

Ogre should not feel:

- like a green Human;
- grotesque;
- excessively monstrous;
- incompatible with equipment.

### Heavy frame

Target:

- wider shoulders;
- larger head;
- thicker forearms;
- thicker thighs;
- wider stance;
- larger hands/feet.

Despite this, canonical equipment sockets remain unchanged.

### Face

Primary visual identity:

- heavy brow;
- broad nose;
- larger jaw;
- clear tusks when enabled.

### Horns

Horn variants:

- Short;
- Swept.

Horns must be treated as lineage anatomy, not head equipment.

Helmets must later define horn interaction masks.

## Face cluster priorities

Phase C should spend significant effort on faces.

At native scale the face must still show:

1. lineage;
2. eye direction;
3. personality;
4. jaw/brow identity.

Priority order:

- silhouette;
- eye cluster;
- brow;
- jaw;
- nose/cheek cluster;
- optional scar/ornament.

## Hair target

Hair should feel authored, not painted onto the skull.

Requirements:

- strong silhouette;
- clear highlight cluster;
- consistent volume;
- correct back-view mass;
- correct side-view flow.

Core styles:

- Short;
- Wild;
- Braid;
- Crest;
- None.

Each style must be authored separately for:

- front;
- side;
- back.

## Material target

Phase C should improve the material readability established in Phase A.

### Metal

- hard highlight;
- darker edge;
- visible plane changes;
- no soft gradients.

### Leather

- warmer;
- softer highlight;
- slightly irregular edge detail.

### Cloth

- broad shadow cluster;
- less specular;
- readable fold direction.

### Bone

- matte;
- high shape contrast;
- softer highlight than polished metal.

### Magic

- emissive focal accent;
- limited glow;
- no full-sprite bloom.

## Equipment interaction target

The approved preview demonstrates the desired final effect:

- equipment substantially changes prestige;
- lineage remains readable under equipment;
- armor never erases the hero's identity.

Phase C equipment testing should use only a small benchmark set.

Do **not** expand the catalog yet.

Benchmark set:

- Training Sword;
- Linen Tunic;
- Emberfang;
- Crown of Dawn;
- Dragonplate;
- Voidwalkers;
- Phoenix Mantle;
- Astral Sigil.

## Native-size acceptance

Every Base Hero must be reviewed at:

- 64 px;
- 96 px;
- 128 px;
- 256 px.

The 64 px view is the most important.

If a face or lineage only reads at 256 px, it is not finished.

## Cross-lineage consistency test

Place:

- Human;
- Elf;
- Skeleton;
- Ogre

side by side with no labels.

A reviewer should be able to answer:

- same game? → yes;
- different lineage? → yes;
- same visual quality? → yes;
- same lighting? → yes;
- same material logic? → yes.

That is the Phase C visual target.
