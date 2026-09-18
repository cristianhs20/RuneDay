export type SpriteV2View = 'front' | 'side' | 'back';
export type SpriteV2Animation =
    | 'idle'
    | 'walk'
    | 'attack'
    | 'cast'
    | 'celebrate'
    | 'hurt';

export type SpriteV2Layer = {
    id: string;
    z: number;
    sheet: string;
    frames: number;
    fps?: number;
    loop?: boolean;
    opacity?: number;
};

export type SpriteV2AssemblyManifest = {
    engine: 'runeday-sprite-v2';
    version: string;
    asset_id: string;
    type: 'character_assembly';
    lineage: 'human' | 'elf' | 'skeleton' | 'ogre';
    fit_profile: 'broad' | 'lean' | 'heavy';
    cell: {
        width: 128;
        height: 128;
    };
    views: Record<
        SpriteV2View,
        Partial<Record<SpriteV2Animation, SpriteV2Layer[]>>
    >;
};

export async function loadSpriteV2Manifest(
    url: string,
): Promise<SpriteV2AssemblyManifest> {
    const response = await fetch(url, {
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error('Unable to load RuneDay Sprite v2 manifest.');
    }

    return (await response.json()) as SpriteV2AssemblyManifest;
}
