# RuneDay Sprite Manifest v2

## Purpose

The Sprite Manifest is the contract between authored pixel art and the runtime renderer.

## Character manifest example

```json
{
    "engine": "runeday-sprite-v2",
    "version": "2.0.0",
    "asset_id": "human_broad_base",
    "type": "character_base",
    "lineage": "human",
    "fit_profile": "broad",
    "cell": {
        "width": 128,
        "height": 128
    },
    "views": {
        "front": {
            "idle": {
                "sheet": "characters/human/broad/body/front/idle.png",
                "frames": 4,
                "fps": 4,
                "loop": true,
                "mirror_safe": false
            },
            "walk": {
                "sheet": "characters/human/broad/body/front/walk.png",
                "frames": 8,
                "fps": 10,
                "loop": true,
                "mirror_safe": false
            }
        }
    }
}
```

## Equipment manifest example

```json
{
    "engine": "runeday-sprite-v2",
    "version": "2.0.0",
    "asset_id": "dragonplate",
    "type": "equipment",
    "slot": "chest",
    "item_slug": "dragonplate",
    "fits": {
        "broad": {
            "front": {
                "idle": {
                    "sheet": "equipment/chest/dragonplate/broad/front/idle.png",
                    "frames": 4
                }
            }
        },
        "lean": {
            "alias": "broad"
        },
        "heavy": {
            "front": {
                "idle": {
                    "sheet": "equipment/chest/dragonplate/heavy/front/idle.png",
                    "frames": 4
                }
            }
        }
    }
}
```

## Required top-level fields

- engine;
- version;
- asset_id;
- type.

## Required sheet fields

- sheet;
- frames.

Recommended:

- fps;
- loop;
- mirror_safe;
- sockets.

## Socket example

```json
{
    "sockets": [
        {
            "frame": 0,
            "weapon_grip": [93, 66],
            "back": [64, 48],
            "fx_origin": [96, 42]
        }
    ]
}
```

## Validation

Production build must fail when:

- file is missing;
- frame count does not match sheet dimensions;
- cell size differs;
- unknown fit profile is used;
- unknown animation is used;
- item slug does not exist;
- required equipment sheet is missing.

## Immutability

Once an asset id ships publicly:

- do not reuse it for unrelated art;
- use asset versioning for replacements;
- retain migration/compatibility metadata when necessary.
