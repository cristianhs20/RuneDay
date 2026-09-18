# RuneDay Character Style Bible v1

## Canonical identity

**Style ID:** `runeday-heroic-compact-fantasy`  
**Version:** `1.0.0`

The RuneDay hero should feel like a modern interpretation of a classic fantasy RPG sprite: warm, readable, aspirational and collectible.

It should never feel:

- like generic asset-pack pixel art;
- hyper-detailed at the expense of readability;
- toy-like or preschool;
- grimdark;
- anime-proportioned;
- randomly shaded;
- like a mixture of unrelated sprite packs.

## Shape language

### Head

- slightly oversized relative to realistic anatomy;
- broad enough for readable helmets/hair;
- eyes remain simple and highly readable;
- facial detail stays minimal.

### Torso

- compact;
- readable chest equipment silhouette;
- enough width for armor progression to be obvious.

### Limbs

- chunky enough to survive mobile downscaling;
- hands are equipment anchors, not anatomical-detail showcases;
- boots must remain visible beneath large chest/back equipment.

### Equipment silhouette

A new item should be readable primarily from silhouette before texture.

High rarity may add:

- stronger shape break;
- additional crest;
- asymmetric detail;
- one or two controlled FX pixels/clusters.

It may not simply add visual noise.

## Outline language

Primary silhouette outline:

`#171a22`

Internal outline:

`#2a2f39`

Rules:

- silhouette edges get the strongest dark separation;
- internal material boundaries may use a softer dark;
- highlights never replace outline on the shadow-facing edge;
- no pure black unless deliberately used for very small void/emissive contrast.

## Lighting

Single global light:

**top-left / 10 o'clock.**

Consequences:

- top-left planes receive highlight;
- bottom/right planes receive shadow;
- metallic highlights are hard and narrow;
- cloth highlights are broad/soft clusters;
- leather sits between metal and cloth;
- emissive magic may ignore the global light only for its own glow.

## Palette discipline

### Skin

Skin uses four canonical ramps:

- Moon;
- Sun;
- Bronze;
- Deep.

Each is three-tone.

Do not create item-specific skin colors.

### Hair

Canonical families:

- Onyx;
- Chestnut;
- Blonde;
- Silver;
- Ember.

Hair uses clustered highlights rather than metal-like single-pixel shine.

### Eyes

Eye colors are accents and may use one main hue plus a single white glint.

### Material reuse

Whenever possible, equipment should use a registered material ramp.

Do not create a new gray every time a sword is drawn.

New material ramps require Style Bible review.

## Rare-item philosophy

### Common

- simple silhouette;
- functional;
- little/no FX;
- neutral material language.

### Uncommon

- slightly stronger color identity;
- one recognizable design motif;
- still grounded.

### Rare

- stronger silhouette break;
- one accent/glow cluster allowed;
- should be identifiable at inventory-card size.

### Epic

- prestige silhouette;
- up to two controlled FX clusters;
- more distinct material combination;
- no full-screen neon.

### Legendary / Mythic

Reserved for later Character Engine phases.

They should be special because of authored design quality, not because every pixel glows.

## Pixel clustering

Prefer deliberate clusters over isolated noise.

Avoid:

- single stray pixels that do not describe form;
- checkerboard dithering on small equipment;
- noisy outlines;
- one-pixel spikes everywhere.

Each visible cluster should communicate:

- silhouette;
- material plane;
- ornament;
- light;
- effect.

## Scaling

Raster production:

- 1× source;
- 2×;
- 3×;
- 4×;
- other integer multiples.

Never resample with smoothing.

Web SVG prototype renderer keeps `shape-rendering="crispEdges"`.

## Body frames

### Frame A

Broad heroic frame.

Best suited to:

- Warden;
- heavy armor;
- large capes;
- strong silhouettes.

### Frame B

Lean heroic frame.

Best suited to:

- Rogue;
- Arcanist;
- lighter outfits.

Both frames use exactly the same anchor coordinates.

Archetype does not lock a user to a body frame.

## Archetype identity

Archetypes establish base color/silhouette flavor, not separate rendering systems.

### Wanderer

- neutral;
- versatile;
- travel-worn;
- readable foundation.

### Warden

- grounded;
- defensive;
- green/earth associations;
- broad forms.

### Rogue

- restrained;
- narrow;
- dark neutral fabrics;
- sharp but not edgy/noisy.

### Arcanist

- mystical;
- controlled violet/blue language;
- clean magical accents;
- readable robes/ornament.

## Animation personality

RuneDay motion should feel responsive and satisfying, not hyperactive.

### Idle

Tiny weight/breath movement.

No constant bobbing that makes the UI distracting.

### Walk

Clear leg alternation and readable body weight.

### Attack

Fast anticipation → strike → settle.

Weapon must remain attached to the locked grip anchor.

### Cast

Clear hand/weapon focal point with restrained magic.

### Celebrate

The most expressive regular state.

This is used to reward real-world success, so it should feel joyful.

### Hurt

Short and readable.

No prolonged suffering or punitive framing.

## Non-negotiable consistency rules

A production asset fails if it:

- changes the hero baseline;
- moves a locked anchor;
- uses opposite lighting;
- uses anti-aliased pixels;
- uses a non-integer raster scale;
- adds an unregistered layer;
- ignores outline rules;
- introduces a new material palette without review;
- clips outside allowed effect bounds;
- loses readability at 64 px;
- visually covers required interaction equipment unintentionally.

## Versioning

Patch version:

- palette correction;
- documentation clarification;
- non-breaking token adjustment.

Minor version:

- new material;
- new allowed layer;
- new optional anchor;
- new rarity language extension.

Major version:

- canvas;
- skeleton;
- baseline;
- existing anchor coordinates;
- fundamental proportion family.

Assets must record the Character Style major/minor version they target.
