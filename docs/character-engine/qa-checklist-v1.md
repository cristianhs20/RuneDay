# RuneDay Character Visual QA Checklist v1

Use this checklist before merging any production hero, equipment, hair, weapon or animation asset.

## A. Geometry

- [ ] Uses the correct 64×64 logical canvas.
- [ ] Baseline is Y=58.
- [ ] Hero does not drift vertically between frames.
- [ ] Equipment uses locked anchors.
- [ ] Body variant does not alter socket positions.
- [ ] Normal silhouette stays inside hero bounds.
- [ ] Weapon/FX overflow stays inside effect bounds.

## B. Pixel integrity

- [ ] No anti-aliasing.
- [ ] No fractional pixels.
- [ ] No unintended transparency fringes.
- [ ] No raster smoothing.
- [ ] Raster preview uses integer scaling.
- [ ] Pixel clusters are deliberate rather than noisy.

## C. Lighting

- [ ] Light reads from top-left.
- [ ] Shadow direction matches existing RuneDay assets.
- [ ] Highlights describe material rather than random decoration.
- [ ] Emissive effects are separated from normal surface lighting.

## D. Palette

- [ ] Skin/hair uses canonical ramp where applicable.
- [ ] Equipment uses registered material ramp.
- [ ] New colors have a documented reason.
- [ ] Maximum normal material tone budget is respected.
- [ ] Rarity accent matches the canonical rarity language.

## E. Material readability

At 1×/2× size:

- [ ] metal reads as metal;
- [ ] cloth reads as cloth;
- [ ] leather reads as leather;
- [ ] wood reads as wood;
- [ ] magic reads as emissive accent rather than random saturation.

## F. Silhouette

- [ ] Item is recognizable before zooming in.
- [ ] Rare/Epic silhouette feels more prestigious than Common without visual noise.
- [ ] Headgear does not destroy face readability unintentionally.
- [ ] Chest gear does not erase hand/weapon readability.
- [ ] Cape/back item does not merge into legs.

## G. Layering

- [ ] Uses an existing canonical layer.
- [ ] No unexpected z-order conflict.
- [ ] Weapon remains attached to grip anchor.
- [ ] Hair/headgear interaction is intentional.
- [ ] Back item does not render in front accidentally.
- [ ] Front FX does not hide the hero for normal gameplay.

## H. Animation

- [ ] Frame count follows canonical target or has approved exception.
- [ ] FPS follows canonical target or has approved exception.
- [ ] Root travel stays within animation budget.
- [ ] Loop has clean first/last-frame continuity when required.
- [ ] Equipment follows body motion consistently.
- [ ] Weapon does not detach from hand.
- [ ] Cape/hair secondary motion remains readable.
- [ ] Attack/cast has clear anticipation and resolution.

## I. Product readability

Check asset in:

- [ ] Hero Creator;
- [ ] Today;
- [ ] Inventory;
- [ ] Social profile;
- [ ] Guild roster;
- [ ] combat overlay.

At minimum test:

- [ ] dark UI surface;
- [ ] light UI surface;
- [ ] 64 px preview;
- [ ] 128 px preview;
- [ ] 256 px preview.

## J. Consistency comparison

Compare against the Style Lab:

`/character/style-lab`

- [ ] Outline weight feels native to RuneDay.
- [ ] Lighting feels native to RuneDay.
- [ ] Pixel density feels native to RuneDay.
- [ ] Material ramp feels native to RuneDay.
- [ ] Silhouette scale feels native to RuneDay.
- [ ] Rarity treatment feels native to RuneDay.

## K. Metadata

- [ ] Name follows asset naming convention.
- [ ] Visual key is unique and stable.
- [ ] Style version is recorded.
- [ ] Slot is correct.
- [ ] Rarity is correct.
- [ ] Material family is recorded.
- [ ] Source file is retained.

## Release rule

If any non-optional Geometry, Pixel Integrity, Lighting or Layering item fails:

**the asset does not ship.**

Quantity never overrides consistency.
