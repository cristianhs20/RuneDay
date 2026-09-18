# RuneDay Production Sprite Pipeline v2

## 1. Asset philosophy

Art is authored first.

Code composes it.

The renderer must never become the artist.

## 2. Canonical frame cell

Production cell:

**128×128 px**

Every layer uses the complete cell.

Never trim transparent edges from runtime sprite layers.

## 3. Asset root

Recommended structure:

```text
public/game/characters/v2/
  characters/
    human/
      broad/
        body/
        face/
        eyes/
        hair/
    elf/
    skeleton/
    ogre/

  equipment/
    weapon/
    head/
    chest/
    feet/
    back/
    accessory/

  fx/
  portraits/
  manifests/
```

## 4. Animation sheet structure

A sheet belongs to:

- asset/layer;
- fit profile;
- view;
- animation.

Example:

```text
equipment/chest/linen-tunic/broad/front/idle.png
equipment/chest/linen-tunic/broad/front/walk.png
equipment/chest/linen-tunic/heavy/front/idle.png
```

The item remains one gameplay item.

## 5. Spritesheet layout

Preferred initial format:

- horizontal strip;
- fixed 128×128 cells;
- frames ordered left-to-right;
- transparent background.

Examples:

Idle 4:

`512×128`

Walk 8:

`1024×128`

Attack 6:

`768×128`

## 6. Views

Initial production views:

- Front;
- Side;
- Back.

Side may support horizontal mirroring when declared safe.

Asymmetric equipment can require a dedicated mirrored sheet.

## 7. Layer stack

Recommended production order:

1. shadow;
2. back_fx;
3. cape_back;
4. hair_back;
5. weapon_back;
6. body;
7. lineage_anatomy_back;
8. legs/pants;
9. feet;
10. chest;
11. arms/sleeves;
12. hands;
13. face;
14. eyes;
15. ears/jaw/horns as required;
16. hair_front;
17. headgear;
18. accessory;
19. weapon_front;
20. cape_front;
21. front_fx.

The exact layer list is manifest-driven.

## 8. Fit profiles

Production fit profiles:

- Broad;
- Lean;
- Heavy.

Fit profile modifies authored visual sheets.

It does not modify gameplay identity.

## 9. Asset naming

Example:

`rdv2_human_broad_body_base_front_idle_v001.png`

Equipment:

`rdv2_equipment_chest_dragonplate_broad_front_attack_v003.png`

## 10. Manifest rule

No production sprite asset ships without metadata.

Manifest defines:

- engine version;
- asset id;
- layer;
- lineage/fit compatibility;
- frame cell;
- animation frame count;
- FPS;
- loop;
- view;
- spritesheet path;
- mirror policy;
- socket metadata when required.

## 11. Portraits

Portraits are separate authored assets.

Do not enlarge a 128×128 full-body sprite and call it a portrait.

Portrait target can use a larger dedicated pixel canvas while preserving:

- face identity;
- hair;
- lineage;
- palette;
- equipment identity.

## 12. Generated previews

Build tooling may generate:

- 64px thumbnail;
- 96px thumbnail;
- inventory preview;
- social card preview.

Generated previews are derivatives.

The source production sheet remains untouched.

## 13. AI-assisted workflow

AI may assist with:

- concepts;
- silhouette exploration;
- equipment themes;
- pose ideas.

AI output must not be dropped directly into runtime.

Every runtime asset must be normalized/authored to:

- pixel grid;
- frame cell;
- palette;
- silhouette;
- layer mask;
- animation timing;
- socket alignment;
- fit profile.

## 14. Source retention

Keep editable/source art separately from runtime exports.

Runtime PNG is a build output of the approved source asset.

## 15. Quality priority

If there is a tradeoff between:

- shipping 50 mediocre items;
- shipping 5 exceptional items;

RuneDay ships the 5 exceptional items.
