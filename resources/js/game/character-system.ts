import system from '../../game/character-system.json';

export type CharacterLineage = keyof typeof system.lineages;
export type CharacterBodyFrame = keyof typeof system.frames;
export type CharacterView = (typeof system.views)[number];
export type CharacterAnimation = (typeof system.animations)[number];

export const CHARACTER_SYSTEM = system;

export const CHARACTER_LINEAGES = Object.keys(
    system.lineages,
) as CharacterLineage[];

export const CHARACTER_FRAMES = Object.keys(
    system.frames,
) as CharacterBodyFrame[];

export function lineageConfig(lineage: CharacterLineage) {
    return system.lineages[lineage];
}

export function lineageDefaults(
    lineage: CharacterLineage,
): Record<string, string> {
    return { ...system.lineages[lineage].defaults };
}

export function lineageOptions(
    lineage: CharacterLineage,
): Record<string, string[]> {
    return system.lineages[lineage].options as Record<string, string[]>;
}

export function normalizeBodyFrame(value: string): CharacterBodyFrame {
    const legacy =
        system.legacyBodyMap[value as keyof typeof system.legacyBodyMap];

    if (legacy) return legacy as CharacterBodyFrame;

    return CHARACTER_FRAMES.includes(value as CharacterBodyFrame)
        ? (value as CharacterBodyFrame)
        : 'broad';
}

export function frameConfig(frame: string) {
    return system.frames[normalizeBodyFrame(frame)];
}
