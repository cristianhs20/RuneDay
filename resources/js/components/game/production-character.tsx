import {
    CharacterSprite,
    type CharacterSpriteState,
} from '@/components/game/character-sprite';
import { ModularCharacterV3 } from '@/components/game/modular-character-v3';
import type { CharacterView, GameCharacter } from '@/types/game';

type Props = {
    character: {
        appearance: GameCharacter['appearance'];
        equipment: GameCharacter['equipment'];
        archetype: GameCharacter['archetype'];
        lineage?: GameCharacter['lineage'];
    };
    state?: CharacterSpriteState;
    view?: CharacterView;
    className?: string;
};

const skinMap = {
    moon: 'fair',
    sun: 'light_tan',
    bronze: 'tan',
    deep: 'dark',
} as const;

const hairMap = {
    short: 'short_spiky',
    wild: 'wild',
    braid: 'long',
    crest: 'messy',
    none: 'none',
} as const;

const faceMap = {
    balanced: 'neutral',
    strong: 'determined',
    soft: 'happy',
} as const;

function armorModuleForVisualKey(visualKey?: string): string | null {
    if (!visualKey?.startsWith('v3_armor_')) return null;

    const match = visualKey.match(/^v3_armor_(shoulder|chest|greave)_(\d+)$/);
    if (!match) return null;

    return `armor.${match[1]}.${match[2]}`;
}

export function ProductionCharacter({
    character,
    state = 'idle',
    view = 'front',
    className = '',
}: Props) {
    const canUseV3 =
        (character.lineage ?? 'human') === 'human' &&
        character.appearance.body === 'broad' &&
        character.appearance.skin_tone in skinMap;

    if (!canUseV3 || state !== 'idle') {
        return (
            <CharacterSprite
                character={character}
                state={state}
                view={view}
                className={className}
            />
        );
    }

    const skin =
        skinMap[character.appearance.skin_tone as keyof typeof skinMap];
    const hair = hairMap[character.appearance.hair_style] ?? 'none';
    const expression =
        faceMap[character.appearance.face_style as keyof typeof faceMap] ??
        'neutral';

    const armorModules = [
        armorModuleForVisualKey(character.equipment.shoulder?.visual_key),
        armorModuleForVisualKey(character.equipment.chest?.visual_key),
        armorModuleForVisualKey(character.equipment.legs?.visual_key),
    ].filter((module): module is string => module !== null);

    return (
        <ModularCharacterV3
            view={view}
            skin={skin}
            hair={hair}
            expression={expression}
            equipment={{
                weapon_back:
                    character.equipment.weapon?.visual_key ===
                    'weapon_training_sword',
                chest:
                    Boolean(character.equipment.chest) &&
                    !character.equipment.chest?.visual_key.startsWith(
                        'v3_armor_chest_',
                    ),
                neck: Boolean(character.equipment.neck),
                waist: Boolean(character.equipment.waist),
                feet: Boolean(character.equipment.feet),
                armorModules,
            }}
            className={className}
        />
    );
}