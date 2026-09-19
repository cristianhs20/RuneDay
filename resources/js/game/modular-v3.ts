export type ModularV3View = 'front' | 'side' | 'back';

export type ModularV3Module = {
    atlas: string;
    cellIndex: number;
    x: number;
    y: number;
    w: number;
    h: number;
    category: string;
    tone?: string;
    view?: ModularV3View;
    style?: string;
    expression?: string;
    asset?: string;
    slot?: string;
    subtype?: string;
    variant?: number;
};

export type ModularV3Manifest = {
    engine: 'runeday-modular-v3';
    version: string;
    cell: {
        width: number;
        height: number;
    };
    atlases: Record<
        string,
        {
            path: string;
            columns: number;
            rows: number;
        }
    >;
    modules: Record<string, ModularV3Module>;
    presets: Record<string, unknown>;
    availability: {
        hair: Record<ModularV3View, boolean>;
        face: Record<ModularV3View, boolean>;
    };
    layerOrder: string[];
};

export async function loadModularV3Manifest(
    url = '/game/characters/v3/manifests/modular-v3.json',
): Promise<ModularV3Manifest> {
    const response = await fetch(url, {
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error('Unable to load RuneDay Modular Character Engine v3.');
    }

    return (await response.json()) as ModularV3Manifest;
}
