import { CHARACTER_PALETTE } from '@/game/character-style';
import type { GameAppearance, GameCharacter } from '@/types/game';
import { hex, mix, rampFrom } from './raster';
import type { Ramp, Rgba } from './raster';

export type ForgePalette = {
    skin: Ramp;
    bone: Ramp;
    hair: Ramp;
    iris: Rgba;
    sclera: Rgba;
    glow: Rgba | null;
    mouth: Rgba;
    tusk: Ramp;
    horn: Ramp;
    cloth: Ramp;
    pants: Ramp;
    leather: Ramp;
    ink: Rgba;
};

type Tone = { shadow: string; base: string; highlight: string };

const extra: Record<string, Tone> = {
    tusk: { shadow: '#a89a78', base: '#e2d7b6', highlight: '#fbf5e2' },
    horn: { shadow: '#3d3330', base: '#6b5a50', highlight: '#a08c7a' },
    pantsDark: { shadow: '#2a2522', base: '#45392f', highlight: '#5f5042' },
    loincloth: { shadow: '#3c2a22', base: '#62442f', highlight: '#8a6243' },
    rag: { shadow: '#2d2a2c', base: '#4a4446', highlight: '#6c6466' },
};

export const MATERIALS: Record<string, Tone> = {
    ...CHARACTER_PALETTE.material,
    wood: CHARACTER_PALETTE.material.wood,
    copper: { shadow: '#6b3a23', base: '#a8603a', highlight: '#e19a66' },
    emerald: { shadow: '#1f5e3f', base: '#2f9a63', highlight: '#7fe0a3' },
    ruby: { shadow: '#6a1a24', base: '#b02f3c', highlight: '#f07a7c' },
    sapphire: { shadow: '#1d3570', base: '#3561bf', highlight: '#86b5ff' },
    void: { shadow: '#1d1430', base: '#3a2760', highlight: '#7a5bc0' },
    phoenix: { shadow: '#7a2416', base: '#c9461f', highlight: '#f3a03a' },
    starcloth: { shadow: '#151b3a', base: '#25305e', highlight: '#3e4e8c' },
    stone: { shadow: '#4b4a48', base: '#73716b', highlight: '#a19e95' },
    linen: { shadow: '#8a7a62', base: '#c2b08f', highlight: '#e6d8b8' },
    ...extra,
};

export function ramp(name: string, shine = false): Ramp {
    return rampFrom(MATERIALS[name] ?? MATERIALS.iron, shine);
}

export function forgePalette(
    lineage: GameCharacter['lineage'],
    appearance: GameAppearance,
    archetype: GameCharacter['archetype'],
): ForgePalette {
    const skinTone =
        CHARACTER_PALETTE.skin[
            appearance.skin_tone as keyof typeof CHARACTER_PALETTE.skin
        ] ??
        (lineage === 'ogre'
            ? CHARACTER_PALETTE.skin.moss
            : CHARACTER_PALETTE.skin.sun);
    const boneTone =
        CHARACTER_PALETTE.bone[appearance.bone_tone] ??
        CHARACTER_PALETTE.bone.ivory;
    const hairTone =
        CHARACTER_PALETTE.hair[appearance.hair_color] ??
        CHARACTER_PALETTE.hair.onyx;
    const archetypeTone =
        CHARACTER_PALETTE.archetype[archetype] ??
        CHARACTER_PALETTE.archetype.wanderer;
    const glowName = appearance.eye_glow;
    const glow =
        lineage === 'skeleton'
            ? hex(
                  CHARACTER_PALETTE.eyeGlow[
                      glowName === 'none' ? 'azure' : glowName
                  ],
              )
            : null;

    const skin = rampFrom(skinTone);
    const bone = rampFrom(
        appearance.bone_tone === 'none'
            ? CHARACTER_PALETTE.bone.ivory
            : boneTone,
    );

    return {
        skin,
        bone,
        hair: rampFrom(hairTone, true),
        iris: hex(CHARACTER_PALETTE.eyes[appearance.eye_color] ?? '#4bb879'),
        sclera: hex('#f4efe6'),
        glow,
        mouth: mix(skin.shadow, skin.line, 0.5),
        tusk: rampFrom(extra.tusk),
        horn: rampFrom(extra.horn),
        cloth: rampFrom(archetypeTone),
        pants:
            lineage === 'ogre'
                ? rampFrom(extra.loincloth)
                : lineage === 'skeleton'
                  ? rampFrom(extra.rag)
                  : rampFrom(extra.pantsDark),
        leather: rampFrom(CHARACTER_PALETTE.material.leather),
        ink: hex('#120e1a'),
    };
}
