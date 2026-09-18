# RuneDay Character Engine — C2.1 Human Broad Art Pass

## Status

**Implemented — awaiting visual approval.**

C2.1 is the first production art pass in Phase C.

Only the **Human + Broad** canonical body uses this refined branch.

Human Lean, Elf Broad/Lean, Skeleton Broad/Lean and Ogre Heavy remain on Phase B art until they receive their own review.

## Approved target

The implementation follows the approved Human Broad concept direction:

- heroic but approachable;
- stronger shoulder read;
- compact three-head heroic proportion;
- readable face at native size;
- fuller hair silhouette;
- tapered torso;
- more substantial thighs, knees and lower legs;
- equipment that changes prestige without erasing the hero.

## Art pass id

`human-broad-c2.1`

Character Style version:

`1.2.0`

The renderer exposes this through:

`data-art-pass="human-broad-c2.1"`

for Human Broad characters.

## What changed

### Silhouette

Phase B Human Broad used the generic Broad anatomy shared with early lineage prototypes.

C2.1 introduces a dedicated production branch with:

- wider visual shoulder mass;
- clearer neck/shoulder transition;
- torso taper toward the waist;
- explicit belt break;
- heavier thighs;
- defined knee/lower-leg clusters;
- larger readable hands;
- more grounded stance.

Canonical RuneDay sockets remain unchanged.

## Face

The face now uses a more deliberate cluster hierarchy:

1. brow;
2. eyes;
3. nose;
4. mouth;
5. jaw/cheek shadow.

Human face variants continue to support:

- Balanced;
- Strong;
- Soft.

The variants alter brow/jaw emphasis without changing the head socket.

## Hair

Human Broad receives a dedicated authored hair treatment for:

- Short;
- Wild;
- Braid;
- Crest;
- None.

The goal is stronger volume and less “flat cap” appearance.

Front, Side and Back receive separate cluster layouts.

## Three-view consistency

C2.1 implements dedicated:

- Front;
- Side;
- Back

Human Broad art.

The review target is consistent perceived mass rather than identical pixel width in every view.

## Starter equipment mask

The existing equipment catalog remains unchanged.

C2.1 adds a refined Broad chest mask so the starter `Linen Tunic` and future chest pieces do not collapse the improved torso into a rectangular block.

The mask adds:

- shoulder shape;
- torso taper;
- highlight plane;
- material shadow plane;
- waist/belt separation.

The item remains the same inventory definition.

No Human-specific duplicate item is created.

## Material correction

`linen` visual keys now resolve to the registered `clothBlue` material family rather than falling through to Steel.

This keeps the starter outfit aligned with the approved blue-cloth heroic direction.

## Production renderer behavior

Human Broad uses C2.1 automatically when:

- lineage = Human;
- body frame = Broad.

All other canonical body targets continue using Phase B art.

This is intentional.

Phase C requires visual approval of one art target before propagating the style.

## Review environment

Open:

`/character/lineage-lab`

The new C2.1 review section shows:

- Front;
- Side;
- Back;
- 64 px;
- 96 px;
- 128 px.

It also lists the specific C2.1 changes being judged.

## Acceptance questions

Before C2.2 / Human Lean begins, review:

### Silhouette

- Do the shoulders feel heroic enough?
- Is the waist too narrow or too wide?
- Do the legs feel substantial enough?
- Does the head/body ratio match the approved target?

### Face

- Is the face attractive enough at 64 px?
- Are eyes too large/small?
- Is the brow too aggressive?
- Does the nose/mouth read cleanly?

### Hair

- Does the default Short/Wild direction feel premium?
- Is hair volume too large?
- Does Side/Back preserve the same hairstyle identity?

### Equipment

- Does Linen Tunic improve rather than hide the silhouette?
- Do shoulder shapes feel like RuneDay rather than generic armor?
- Does the Training Sword still feel correctly scaled?

### Three views

- Does Side feel like the same character?
- Does Back preserve shoulder/leg mass?
- Is any view noticeably lower quality?

## Gate

C2.1 is **implemented** but should not be marked **artistically approved** until the visual review is accepted.

The next production step after approval is:

**C2.2 — Human Lean Art Pass.**
