# RuneDay Sprite Forge (Character Engine v4)

## Status

**Official production renderer** for every lineage: Human, Elf, Skeleton and Orc (`ogre` id).
Supersedes [Modular v3](modular-v3.md), the SVG prototype and Sprite v2 as the production path.

## Why it replaced Modular v3

Modular v3 composed 256×256 generated PNG modules that were never drawn on a shared rig.
Head, hair and gear offsets were patched at runtime, which produced the Hero page bugs
(black stripe across the face, dark disc on the chest, stray hair pixels, Onyx rendering
as chestnut), had no side-view hair, could not mount the iron/gold armour and only
covered Human Broad. Every other lineage fell back to the SVG prototype.

## Core rule

One rig, one grid. Every hero frame is painted on a **64×64** logical cell from a shared
humanoid rig. Anatomy, hair, equipment and FX are all placed from the same joints, so an
item authored once fits every lineage and body frame, in every view and animation frame.

## Pipeline

1. **Rig** (`resources/js/game/forge/rig.ts`): per lineage/frame body profiles
   (Human Broad/Lean, Elf Broad/Lean, Skeleton Broad/Lean, Orc Heavy) and forward-kinematic
   poses for `idle`, `walk`, `attack`, `cast`, `celebrate`, `hurt` in `front`, `side`, `back`.
2. **Anatomy** (`anatomy.ts`): torso, limbs, heads, faces, ears, horns, ribcage and hair
   styles per lineage.
3. **Gear** (`gear.ts`): registry keyed by item `visual_key` (all shop/starter items plus the
   18 iron/gold armour pieces). Unknown keys still render from their slot and material.
4. **Raster** (`raster.ts`): pixel shapes carry a light value that is quantised into 4–5 tone
   ramps (top-left light, hue-shifted shadows), inner lines between parts and a selective
   outline. No anti-aliasing; every pixel lands on the grid.
5. **Compose** (`compose.ts`): draw order per view, ground shadow, emissive FX after the
   outline, and a frame cache keyed by appearance + equipment.

Palette values come from `resources/js/game/character-style.ts`, so skin, bone, hair, eye
and material colours stay the single source of truth.

## Rendering

`ForgeSprite` (`resources/js/components/game/forge-sprite.tsx`) draws frames to a canvas at
the largest **integer** scale that fits its box, with smoothing disabled, and animates with
the state timing (idle 4f@4fps, walk 8f@10fps, attack 6f@12fps, cast 8f@10fps,
celebrate 6f@9fps, hurt 4f@10fps). It respects `prefers-reduced-motion`.

`ProductionCharacter` uses it for every surface (Hero, Today, Inventory, Shop, World,
event overlay, Friends, public profile, Guild).

## Review environment

Authenticated route: `/character/sprite-forge` (the old `/character/modular-v3-lab`
redirects here). It edits lineage, frame, every appearance option, archetype and each
equipment slot, and shows all views, all animation frames and the same gear on all four
lineages.

## Adding content

- New item: add an entry to the registry in `gear.ts` using the shared painters
  (`plate`, `tunic`, `pauldrons`, `greaves`, `boots`, `cape`, `hood`, `circlet`, `sword`).
- New hair style or face: add a branch in `paintHair` / `paintFace` for all three views.
- New lineage or frame: add a body profile in `rig.ts`; gear fits automatically.
