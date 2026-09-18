export const CHARACTER_STYLE_VERSION = '1.1.0' as const;
export const CHARACTER_STYLE_ID = 'runeday-heroic-compact-fantasy' as const;

export const CHARACTER_CANVAS = {
    width: 64,
    height: 64,
    baselineY: 58,
    heroBounds: {
        left: 17,
        top: 4,
        right: 47,
        bottom: 58,
    },
    effectBounds: {
        left: 5,
        top: 1,
        right: 59,
        bottom: 60,
    },
} as const;

export const CHARACTER_ANCHORS = {
    headCenter: { x: 32, y: 18 },
    neck: { x: 32, y: 25 },
    shoulderLeft: { x: 23, y: 28 },
    shoulderRight: { x: 41, y: 28 },
    handLeft: { x: 21, y: 39 },
    handRight: { x: 43, y: 39 },
    waist: { x: 32, y: 42 },
    footLeft: { x: 25, y: 57 },
    footRight: { x: 39, y: 57 },
    back: { x: 32, y: 31 },
    weaponGrip: { x: 49, y: 39 },
    accessory: { x: 32, y: 36 },
} as const;

export const CHARACTER_LAYER_ORDER = [
    'shadow',
    'back_fx',
    'back',
    'rear_weapon',
    'legs',
    'feet',
    'body',
    'chest',
    'arms',
    'head',
    'hair',
    'headgear',
    'accessory',
    'front_weapon',
    'front_fx',
] as const;

export const CHARACTER_RENDER_RULES = {
    logicalPixel: 1,
    integerScaleOnly: true,
    antialiasing: false,
    gradients: false,
    lightDirection: 'top-left',
    maxTonesPerMaterial: 3,
    silhouetteOutline: '#171a22',
    internalOutline: '#2a2f39',
    castShadow: '#090b10',
    castShadowOpacity: 0.22,
} as const;

type ThreeTone = {
    shadow: string;
    base: string;
    highlight: string;
};

export const CHARACTER_PALETTE = {
    skin: {
        moon: {
            shadow: '#c79d8b',
            base: '#e8c7b8',
            highlight: '#f5ded3',
        },
        sun: {
            shadow: '#aa704d',
            base: '#d99c6c',
            highlight: '#efc090',
        },
        bronze: {
            shadow: '#7a472f',
            base: '#aa6843',
            highlight: '#cb8c60',
        },
        deep: {
            shadow: '#4a2c25',
            base: '#704333',
            highlight: '#986552',
        },
        moss: {
            shadow: '#44502f',
            base: '#657344',
            highlight: '#8d9b61',
        },
        ochre: {
            shadow: '#725133',
            base: '#9e7449',
            highlight: '#c79b68',
        },
        stone: {
            shadow: '#5b5c58',
            base: '#7d7f78',
            highlight: '#a8aaa0',
        },
    },
    bone: {
        none: {
            shadow: '#4a4d53',
            base: '#747a82',
            highlight: '#9da4ad',
        },
        ivory: {
            shadow: '#9d9174',
            base: '#d5c9a6',
            highlight: '#f0e8cf',
        },
        aged: {
            shadow: '#746447',
            base: '#aa9669',
            highlight: '#d2bf8d',
        },
        ash: {
            shadow: '#65666b',
            base: '#92949a',
            highlight: '#c2c5ca',
        },
        obsidian: {
            shadow: '#1d1d24',
            base: '#353641',
            highlight: '#575968',
        },
    },
    hair: {
        onyx: {
            shadow: '#11131a',
            base: '#242833',
            highlight: '#424958',
        },
        chestnut: {
            shadow: '#40271f',
            base: '#70412f',
            highlight: '#9b6246',
        },
        blonde: {
            shadow: '#8d7136',
            base: '#d6b25f',
            highlight: '#efd58b',
        },
        silver: {
            shadow: '#737b87',
            base: '#b4bbc6',
            highlight: '#e1e5ea',
        },
        ember: {
            shadow: '#65291f',
            base: '#9f402d',
            highlight: '#d06a46',
        },
    },
    eyes: {
        emerald: '#4bb879',
        azure: '#55a0dd',
        amber: '#d39943',
        violet: '#9b78dc',
    },
    eyeGlow: {
        none: '#00000000',
        emerald: '#68e19a',
        azure: '#71c8ff',
        amber: '#f4bf63',
        violet: '#bd95ff',
        ember: '#ff744e',
    },
    archetype: {
        wanderer: {
            shadow: '#303743',
            base: '#4b5668',
            highlight: '#69758a',
        },
        warden: {
            shadow: '#294637',
            base: '#3f6d55',
            highlight: '#5f9174',
        },
        rogue: {
            shadow: '#2d2b38',
            base: '#484554',
            highlight: '#696579',
        },
        arcanist: {
            shadow: '#35324f',
            base: '#514d75',
            highlight: '#7670a4',
        },
    },
    material: {
        iron: {
            shadow: '#515864',
            base: '#818a97',
            highlight: '#b6bfca',
        },
        steel: {
            shadow: '#657487',
            base: '#9aa9ba',
            highlight: '#dbe4eb',
        },
        moonsteel: {
            shadow: '#45647e',
            base: '#7fa2c4',
            highlight: '#cae2f2',
        },
        embersteel: {
            shadow: '#7d392c',
            base: '#c75b3b',
            highlight: '#f09a5d',
        },
        mosssteel: {
            shadow: '#436342',
            base: '#6d9866',
            highlight: '#a4c892',
        },
        gold: {
            shadow: '#8b662d',
            base: '#c99a46',
            highlight: '#f0cf78',
        },
        bronze: {
            shadow: '#674332',
            base: '#a06b48',
            highlight: '#cf9865',
        },
        leather: {
            shadow: '#46352b',
            base: '#70533d',
            highlight: '#9a7652',
        },
        darkLeather: {
            shadow: '#28282f',
            base: '#41434e',
            highlight: '#626674',
        },
        wood: {
            shadow: '#493424',
            base: '#755239',
            highlight: '#a6784d',
        },
        clothGreen: {
            shadow: '#294431',
            base: '#48664d',
            highlight: '#70916f',
        },
        clothBlue: {
            shadow: '#2d415d',
            base: '#506b8d',
            highlight: '#7898b9',
        },
        clothViolet: {
            shadow: '#3b3152',
            base: '#62517f',
            highlight: '#9178b3',
        },
        clothRed: {
            shadow: '#5d302d',
            base: '#8b4840',
            highlight: '#bd6e59',
        },
    },
    rarity: {
        common: '#9ba3af',
        uncommon: '#57b37a',
        rare: '#5b9fe1',
        epic: '#9a72e4',
        legendary: '#dfa941',
        mythic: '#d95ca6',
    },
} satisfies {
    skin: Record<string, ThreeTone>;
    bone: Record<string, ThreeTone>;
    hair: Record<string, ThreeTone>;
    eyes: Record<string, string>;
    eyeGlow: Record<string, string>;
    archetype: Record<string, ThreeTone>;
    material: Record<string, ThreeTone>;
    rarity: Record<string, string>;
};

export const CHARACTER_MATERIAL_RULES = {
    skin: {
        tones: 3,
        specular: 'soft-single-pixel',
        edgeContrast: 'medium',
    },
    hair: {
        tones: 3,
        specular: 'clustered',
        edgeContrast: 'high',
    },
    cloth: {
        tones: 3,
        specular: 'none',
        edgeContrast: 'medium',
    },
    leather: {
        tones: 3,
        specular: 'sparse',
        edgeContrast: 'medium-high',
    },
    metal: {
        tones: 3,
        specular: 'hard-one-pixel-band',
        edgeContrast: 'high',
    },
    wood: {
        tones: 3,
        specular: 'none',
        edgeContrast: 'medium',
    },
    magic: {
        tones: 3,
        specular: 'emissive-accent-only',
        edgeContrast: 'high',
    },
} as const;

export const CHARACTER_RARITY_RULES = {
    common: {
        accent: CHARACTER_PALETTE.rarity.common,
        fxBudget: 0,
        silhouetteComplexity: 1,
    },
    uncommon: {
        accent: CHARACTER_PALETTE.rarity.uncommon,
        fxBudget: 0,
        silhouetteComplexity: 1,
    },
    rare: {
        accent: CHARACTER_PALETTE.rarity.rare,
        fxBudget: 1,
        silhouetteComplexity: 2,
    },
    epic: {
        accent: CHARACTER_PALETTE.rarity.epic,
        fxBudget: 2,
        silhouetteComplexity: 2,
    },
    legendary: {
        accent: CHARACTER_PALETTE.rarity.legendary,
        fxBudget: 3,
        silhouetteComplexity: 3,
    },
    mythic: {
        accent: CHARACTER_PALETTE.rarity.mythic,
        fxBudget: 4,
        silhouetteComplexity: 3,
    },
} as const;

export const CHARACTER_ANIMATION_RULES = {
    idle: {
        targetFrames: 4,
        fps: 4,
        maxRootTravelPx: 2,
        loop: true,
    },
    walk: {
        targetFrames: 8,
        fps: 10,
        maxRootTravelPx: 1,
        loop: true,
    },
    attack: {
        targetFrames: 6,
        fps: 12,
        maxRootTravelPx: 5,
        loop: false,
    },
    cast: {
        targetFrames: 8,
        fps: 10,
        maxRootTravelPx: 2,
        loop: false,
    },
    celebrate: {
        targetFrames: 6,
        fps: 9,
        maxRootTravelPx: 5,
        loop: false,
    },
    hurt: {
        targetFrames: 4,
        fps: 10,
        maxRootTravelPx: 3,
        loop: false,
    },
} as const;

export const CHARACTER_ASSET_NAMING = {
    pattern:
        'rd_<category>_<slot-or-part>_<family>_<variant>_<view>_<animation>_v###',
    example: 'rd_equipment_weapon_moonsteel_blade_front_attack_v001',
} as const;

export type CharacterMaterialName = keyof typeof CHARACTER_PALETTE.material;

export function materialPalette(material: CharacterMaterialName): ThreeTone {
    return CHARACTER_PALETTE.material[material];
}

export function equipmentMaterial(visualKey?: string): CharacterMaterialName {
    if (!visualKey) return 'iron';

    if (visualKey.includes('moonsteel')) return 'moonsteel';
    if (visualKey.includes('emberfang')) return 'embersteel';
    if (visualKey.includes('mossblade')) return 'mosssteel';
    if (
        visualKey.includes('crown') ||
        visualKey.includes('sigil') ||
        visualKey.includes('token')
    ) {
        return 'gold';
    }
    if (
        visualKey.includes('trail') ||
        visualKey.includes('simple') ||
        visualKey.includes('satchel')
    ) {
        return 'leather';
    }
    if (visualKey.includes('shadow') || visualKey.includes('void')) {
        return 'darkLeather';
    }
    if (visualKey.includes('ranger') || visualKey.includes('scout')) {
        return 'clothGreen';
    }
    if (visualKey.includes('starcloak') || visualKey.includes('runic')) {
        return 'clothBlue';
    }
    if (visualKey.includes('phoenix') || visualKey.includes('dragonplate')) {
        return 'clothRed';
    }
    if (visualKey.includes('astral') || visualKey.includes('circlet')) {
        return 'clothViolet';
    }

    return 'steel';
}
