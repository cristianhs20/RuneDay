import type { GameAppearance, GameCharacter } from '@/types/game';

type State = 'idle' | 'attack' | 'celebrate';

const skin: Record<GameAppearance['skin_tone'], string> = {
    moon: '#f0d2c2',
    sun: '#d9a06f',
    bronze: '#a96842',
    deep: '#6f412f',
};

const hair: Record<GameAppearance['hair_color'], string> = {
    onyx: '#1e2028',
    chestnut: '#6d3f2c',
    blonde: '#d8b35e',
    silver: '#b7bdc8',
    ember: '#9f3f2d',
};

const eyes: Record<GameAppearance['eye_color'], string> = {
    emerald: '#3ba66b',
    azure: '#3a7fc4',
    amber: '#c78b34',
    violet: '#7a5bc6',
};

export function CharacterSprite({
    character,
    state = 'idle',
    className = '',
}: {
    character: Pick<GameCharacter, 'appearance' | 'equipment' | 'archetype'>;
    state?: State;
    className?: string;
}) {
    const { appearance, equipment } = character;
    const skinTone = skin[appearance.skin_tone];
    const hairTone = hair[appearance.hair_color];
    const eyeTone = eyes[appearance.eye_color];
    const bodyB = appearance.body === 'type_b';

    return (
        <div
            className={[
                'runeday-sprite',
                state === 'attack' && 'runeday-sprite-attack',
                state === 'celebrate' && 'runeday-sprite-celebrate',
                state === 'idle' && 'runeday-sprite-idle',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <svg
                viewBox="0 0 64 64"
                role="img"
                aria-label="RuneDay hero"
                className="h-full w-full"
                shapeRendering="crispEdges"
            >
                <ellipse
                    cx="32"
                    cy="58"
                    rx="15"
                    ry="3"
                    fill="currentColor"
                    opacity="0.12"
                />

                <BackLayer visualKey={equipment.back?.visual_key} />

                <rect
                    x={bodyB ? 23 : 22}
                    y="42"
                    width={bodyB ? 7 : 8}
                    height="13"
                    fill="#2a2f3b"
                />
                <rect
                    x="34"
                    y="42"
                    width={bodyB ? 7 : 8}
                    height="13"
                    fill="#2a2f3b"
                />
                <FeetLayer visualKey={equipment.feet?.visual_key} />

                <rect
                    x={bodyB ? 19 : 18}
                    y="26"
                    width={bodyB ? 7 : 8}
                    height="16"
                    fill={skinTone}
                />
                <rect
                    x="38"
                    y="26"
                    width={bodyB ? 7 : 8}
                    height="16"
                    fill={skinTone}
                />
                <rect
                    x={bodyB ? 25 : 24}
                    y="24"
                    width={bodyB ? 14 : 16}
                    height="21"
                    fill={archetypeBase(character.archetype)}
                />
                <ChestLayer visualKey={equipment.chest?.visual_key} />

                <rect x="23" y="11" width="18" height="15" fill={skinTone} />
                <rect x="26" y="18" width="3" height="3" fill={eyeTone} />
                <rect x="35" y="18" width="3" height="3" fill={eyeTone} />

                <HairLayer style={appearance.hair_style} color={hairTone} />
                <HeadLayer visualKey={equipment.head?.visual_key} />

                <AccessoryLayer visualKey={equipment.accessory?.visual_key} />
                <WeaponLayer visualKey={equipment.weapon?.visual_key} />
            </svg>
        </div>
    );
}

function archetypeBase(archetype: GameCharacter['archetype']) {
    return {
        wanderer: '#495365',
        warden: '#3f6b55',
        rogue: '#454252',
        arcanist: '#4e4b72',
    }[archetype];
}

function HairLayer({
    style,
    color,
}: {
    style: GameAppearance['hair_style'];
    color: string;
}) {
    if (style === 'none') return null;

    if (style === 'crest') {
        return (
            <>
                <rect x="25" y="6" width="14" height="5" fill={color} />
                <rect x="29" y="3" width="6" height="4" fill={color} />
            </>
        );
    }

    if (style === 'wild') {
        return (
            <>
                <rect x="21" y="8" width="22" height="6" fill={color} />
                <rect x="19" y="11" width="5" height="9" fill={color} />
                <rect x="40" y="10" width="5" height="8" fill={color} />
                <rect x="25" y="5" width="5" height="4" fill={color} />
                <rect x="35" y="4" width="5" height="5" fill={color} />
            </>
        );
    }

    if (style === 'braid') {
        return (
            <>
                <rect x="21" y="8" width="22" height="6" fill={color} />
                <rect x="21" y="11" width="4" height="13" fill={color} />
                <rect x="18" y="22" width="5" height="5" fill={color} />
            </>
        );
    }

    return (
        <>
            <rect x="22" y="8" width="20" height="6" fill={color} />
            <rect x="22" y="12" width="4" height="5" fill={color} />
        </>
    );
}

function WeaponLayer({ visualKey }: { visualKey?: string }) {
    if (!visualKey) return null;

    const rare =
        visualKey.includes('moonsteel') || visualKey.includes('emberfang');
    const blade = visualKey.includes('emberfang')
        ? '#e66f3f'
        : visualKey.includes('moonsteel')
          ? '#86a6c9'
          : visualKey.includes('mossblade')
            ? '#6f9b62'
            : '#aeb7c4';

    return (
        <g className="runeday-weapon-layer">
            <rect x="48" y="21" width="3" height="24" fill="#684832" />
            <rect x="46" y="20" width="7" height="3" fill="#c0964d" />
            <rect x="49" y="7" width="4" height="15" fill={blade} />
            <rect
                x="48"
                y="8"
                width="1"
                height="13"
                fill="#eef3f7"
                opacity="0.7"
            />
            {rare && <rect x="50" y="5" width="2" height="2" fill="#f4d47b" />}
        </g>
    );
}

function ChestLayer({ visualKey }: { visualKey?: string }) {
    if (!visualKey) return null;

    const color = visualKey.includes('dragonplate')
        ? '#713c35'
        : visualKey.includes('runic')
          ? '#536987'
          : visualKey.includes('ranger')
            ? '#49664e'
            : '#7b6858';

    return (
        <>
            <rect x="23" y="25" width="18" height="17" fill={color} />
            <rect
                x="26"
                y="28"
                width="12"
                height="3"
                fill="#ffffff"
                opacity="0.12"
            />
            {visualKey.includes('runic') && (
                <rect x="30" y="32" width="4" height="4" fill="#8fc3d5" />
            )}
        </>
    );
}

function HeadLayer({ visualKey }: { visualKey?: string }) {
    if (!visualKey) return null;

    if (visualKey.includes('crown')) {
        return (
            <>
                <rect x="23" y="8" width="18" height="4" fill="#d5ac4c" />
                <rect x="24" y="5" width="3" height="4" fill="#d5ac4c" />
                <rect x="31" y="4" width="3" height="5" fill="#d5ac4c" />
                <rect x="38" y="5" width="3" height="4" fill="#d5ac4c" />
            </>
        );
    }

    if (visualKey.includes('circlet')) {
        return <rect x="22" y="13" width="20" height="3" fill="#6da6d3" />;
    }

    const color = visualKey.includes('scout') ? '#405f49' : '#5d534d';

    return (
        <>
            <rect x="21" y="8" width="22" height="7" fill={color} />
            <rect x="20" y="13" width="24" height="3" fill={color} />
        </>
    );
}

function FeetLayer({ visualKey }: { visualKey?: string }) {
    if (!visualKey) return null;

    const color = visualKey.includes('void')
        ? '#403657'
        : visualKey.includes('shadow')
          ? '#30333f'
          : visualKey.includes('trail')
            ? '#5d4935'
            : '#58453a';

    return (
        <>
            <rect x="20" y="53" width="11" height="5" fill={color} />
            <rect x="33" y="53" width="11" height="5" fill={color} />
        </>
    );
}

function BackLayer({ visualKey }: { visualKey?: string }) {
    if (!visualKey) return null;

    if (visualKey.includes('satchel')) {
        return <rect x="15" y="29" width="8" height="13" fill="#73553b" />;
    }

    const color = visualKey.includes('phoenix')
        ? '#a84331'
        : visualKey.includes('starcloak')
          ? '#253a63'
          : '#485468';

    return (
        <>
            <rect
                x="20"
                y="24"
                width="24"
                height="25"
                fill={color}
                opacity="0.95"
            />
            <rect
                x="18"
                y="42"
                width="28"
                height="8"
                fill={color}
                opacity="0.9"
            />
        </>
    );
}

function AccessoryLayer({ visualKey }: { visualKey?: string }) {
    if (!visualKey) return null;

    const color = visualKey.includes('astral')
        ? '#af8ce0'
        : visualKey.includes('lucky')
          ? '#72b6c7'
          : visualKey.includes('emerald')
            ? '#4daa78'
            : '#bf854e';

    return (
        <>
            <rect x="30" y="34" width="4" height="4" fill={color} />
            <rect x="31" y="38" width="2" height="4" fill={color} />
        </>
    );
}
