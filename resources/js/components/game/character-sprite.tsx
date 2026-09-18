import {
    CHARACTER_ANCHORS,
    CHARACTER_CANVAS,
    CHARACTER_PALETTE,
    CHARACTER_RARITY_RULES,
    CHARACTER_RENDER_RULES,
    CHARACTER_STYLE_ID,
    CHARACTER_STYLE_VERSION,
    equipmentMaterial,
    materialPalette,
} from '@/game/character-style';
import type {
    EquippedVisual,
    GameAppearance,
    GameCharacter,
} from '@/types/game';

export type CharacterSpriteState = 'idle' | 'attack' | 'celebrate';
export type CharacterSpriteDebug = 'none' | 'bounds' | 'anchors';

type SpriteCharacter = Pick<
    GameCharacter,
    'appearance' | 'equipment' | 'archetype'
>;

export function CharacterSprite({
    character,
    state = 'idle',
    debug = 'none',
    className = '',
}: {
    character: SpriteCharacter;
    state?: CharacterSpriteState;
    debug?: CharacterSpriteDebug;
    className?: string;
}) {
    const { appearance, equipment } = character;
    const skin = CHARACTER_PALETTE.skin[appearance.skin_tone];
    const hair = CHARACTER_PALETTE.hair[appearance.hair_color];
    const eye = CHARACTER_PALETTE.eyes[appearance.eye_color];
    const archetype = CHARACTER_PALETTE.archetype[character.archetype];
    const lean = appearance.body === 'type_b';

    return (
        <div
            data-character-style={CHARACTER_STYLE_ID}
            data-character-style-version={CHARACTER_STYLE_VERSION}
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
                viewBox={
                    '0 0 ' +
                    CHARACTER_CANVAS.width +
                    ' ' +
                    CHARACTER_CANVAS.height
                }
                role="img"
                aria-label="RuneDay hero"
                className="h-full w-full"
                shapeRendering="crispEdges"
            >
                <ellipse
                    cx="32"
                    cy={CHARACTER_CANVAS.baselineY}
                    rx="15"
                    ry="3"
                    fill={CHARACTER_RENDER_RULES.castShadow}
                    opacity={CHARACTER_RENDER_RULES.castShadowOpacity}
                />

                <BackLayer item={equipment.back} />

                <PixelBlock
                    x={lean ? 23 : 22}
                    y={41}
                    width={lean ? 8 : 9}
                    height={15}
                    fill={archetype.shadow}
                />
                <PixelBlock
                    x={34}
                    y={41}
                    width={lean ? 8 : 9}
                    height={15}
                    fill={archetype.shadow}
                />
                <FeetLayer item={equipment.feet} />

                <PixelBlock
                    x={lean ? 18 : 17}
                    y={27}
                    width={lean ? 8 : 9}
                    height={16}
                    fill={skin.base}
                />
                <PixelBlock
                    x={38}
                    y={27}
                    width={lean ? 8 : 9}
                    height={16}
                    fill={skin.base}
                />

                <PixelBlock
                    x={lean ? 24 : 23}
                    y={24}
                    width={lean ? 16 : 18}
                    height={20}
                    fill={archetype.base}
                />
                <rect
                    x={lean ? 25 : 24}
                    y="25"
                    width={lean ? 6 : 7}
                    height="2"
                    fill={archetype.highlight}
                />

                <ChestLayer item={equipment.chest} />

                <PixelBlock
                    x={22}
                    y={10}
                    width={20}
                    height={17}
                    fill={skin.base}
                />
                <rect
                    x="24"
                    y="11"
                    width="7"
                    height="2"
                    fill={skin.highlight}
                />
                <rect x="23" y="24" width="18" height="2" fill={skin.shadow} />

                <rect x="26" y="18" width="3" height="3" fill={eye} />
                <rect x="35" y="18" width="3" height="3" fill={eye} />
                <rect
                    x="27"
                    y="18"
                    width="1"
                    height="1"
                    fill="#f6fbff"
                    opacity="0.8"
                />
                <rect
                    x="36"
                    y="18"
                    width="1"
                    height="1"
                    fill="#f6fbff"
                    opacity="0.8"
                />

                <HairLayer style={appearance.hair_style} palette={hair} />
                <HeadLayer item={equipment.head} />

                <AccessoryLayer item={equipment.accessory} />
                <WeaponLayer item={equipment.weapon} />

                {debug !== 'none' && <DebugOverlay mode={debug} />}
            </svg>
        </div>
    );
}

function PixelBlock({
    x,
    y,
    width,
    height,
    fill,
    outline = CHARACTER_RENDER_RULES.silhouetteOutline,
}: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    outline?: string;
}) {
    return (
        <>
            <rect x={x} y={y} width={width} height={height} fill={outline} />
            <rect
                x={x + 1}
                y={y + 1}
                width={Math.max(1, width - 2)}
                height={Math.max(1, height - 2)}
                fill={fill}
            />
        </>
    );
}

function HairLayer({
    style,
    palette,
}: {
    style: GameAppearance['hair_style'];
    palette: {
        shadow: string;
        base: string;
        highlight: string;
    };
}) {
    if (style === 'none') return null;

    if (style === 'crest') {
        return (
            <>
                <PixelBlock
                    x={24}
                    y={6}
                    width={16}
                    height={7}
                    fill={palette.base}
                />
                <PixelBlock
                    x={29}
                    y={3}
                    width={7}
                    height={5}
                    fill={palette.base}
                />
                <rect
                    x="26"
                    y="7"
                    width="5"
                    height="1"
                    fill={palette.highlight}
                />
            </>
        );
    }

    if (style === 'wild') {
        return (
            <>
                <PixelBlock
                    x={20}
                    y={7}
                    width={24}
                    height={8}
                    fill={palette.base}
                />
                <PixelBlock
                    x={18}
                    y={10}
                    width={6}
                    height={10}
                    fill={palette.shadow}
                />
                <PixelBlock
                    x={40}
                    y={9}
                    width={6}
                    height={10}
                    fill={palette.base}
                />
                <PixelBlock
                    x={25}
                    y={4}
                    width={6}
                    height={5}
                    fill={palette.base}
                />
                <PixelBlock
                    x={35}
                    y={3}
                    width={6}
                    height={6}
                    fill={palette.base}
                />
                <rect
                    x="23"
                    y="8"
                    width="9"
                    height="2"
                    fill={palette.highlight}
                />
            </>
        );
    }

    if (style === 'braid') {
        return (
            <>
                <PixelBlock
                    x={20}
                    y={7}
                    width={24}
                    height={8}
                    fill={palette.base}
                />
                <PixelBlock
                    x={19}
                    y={11}
                    width={6}
                    height={14}
                    fill={palette.shadow}
                />
                <PixelBlock
                    x={17}
                    y={22}
                    width={6}
                    height={6}
                    fill={palette.base}
                />
                <rect
                    x="23"
                    y="8"
                    width="8"
                    height="2"
                    fill={palette.highlight}
                />
            </>
        );
    }

    return (
        <>
            <PixelBlock
                x={21}
                y={7}
                width={22}
                height={8}
                fill={palette.base}
            />
            <PixelBlock
                x={21}
                y={11}
                width={6}
                height={7}
                fill={palette.shadow}
            />
            <rect x="24" y="8" width="8" height="2" fill={palette.highlight} />
        </>
    );
}

function WeaponLayer({ item }: { item?: EquippedVisual }) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;
    const rare = item.rarity === 'rare' || item.rarity === 'epic';

    return (
        <g className="runeday-weapon-layer">
            <PixelBlock
                x={48}
                y={21}
                width={4}
                height={25}
                fill={CHARACTER_PALETTE.material.wood.base}
            />
            <rect
                x="46"
                y="20"
                width="8"
                height="3"
                fill={CHARACTER_PALETTE.material.gold.base}
            />
            <PixelBlock
                x={48}
                y={6}
                width={6}
                height={17}
                fill={palette.base}
            />
            <rect x="50" y="8" width="1" height="11" fill={palette.highlight} />
            {rare && (
                <>
                    <rect x="53" y="5" width="2" height="2" fill={accent} />
                    {item.rarity === 'epic' && (
                        <rect x="55" y="8" width="1" height="1" fill={accent} />
                    )}
                </>
            )}
        </g>
    );
}

function ChestLayer({ item }: { item?: EquippedVisual }) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;

    return (
        <>
            <PixelBlock
                x={22}
                y={24}
                width={20}
                height={19}
                fill={palette.base}
            />
            <rect x="24" y="26" width="8" height="2" fill={palette.highlight} />
            <rect x="23" y="39" width="18" height="2" fill={palette.shadow} />
            {(item.visual_key.includes('runic') || item.rarity === 'epic') && (
                <rect x="30" y="32" width="4" height="4" fill={accent} />
            )}
        </>
    );
}

function HeadLayer({ item }: { item?: EquippedVisual }) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;

    if (item.visual_key.includes('crown')) {
        return (
            <>
                <rect x="22" y="9" width="20" height="4" fill={palette.base} />
                <rect x="23" y="5" width="4" height="5" fill={palette.base} />
                <rect x="30" y="4" width="4" height="6" fill={palette.base} />
                <rect x="38" y="5" width="4" height="5" fill={palette.base} />
                <rect x="31" y="5" width="2" height="2" fill={accent} />
            </>
        );
    }

    if (item.visual_key.includes('circlet')) {
        return (
            <>
                <rect x="21" y="13" width="22" height="3" fill={palette.base} />
                <rect x="31" y="12" width="3" height="3" fill={accent} />
            </>
        );
    }

    return (
        <>
            <PixelBlock
                x={20}
                y={7}
                width={24}
                height={10}
                fill={palette.base}
            />
            <rect x="23" y="9" width="8" height="2" fill={palette.highlight} />
            {item.rarity === 'epic' && (
                <rect x="40" y="8" width="2" height="2" fill={accent} />
            )}
        </>
    );
}

function FeetLayer({ item }: { item?: EquippedVisual }) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));

    return (
        <>
            <PixelBlock
                x={20}
                y={52}
                width={12}
                height={7}
                fill={palette.base}
            />
            <PixelBlock
                x={32}
                y={52}
                width={12}
                height={7}
                fill={palette.base}
            />
            <rect x="22" y="53" width="5" height="1" fill={palette.highlight} />
            <rect x="34" y="53" width="5" height="1" fill={palette.highlight} />
        </>
    );
}

function BackLayer({ item }: { item?: EquippedVisual }) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));

    if (item.visual_key.includes('satchel')) {
        return (
            <PixelBlock
                x={14}
                y={29}
                width={10}
                height={14}
                fill={palette.base}
            />
        );
    }

    return (
        <>
            <PixelBlock
                x={19}
                y={23}
                width={26}
                height={27}
                fill={palette.base}
            />
            <rect x="21" y="25" width="7" height="2" fill={palette.highlight} />
            <rect x="18" y="42" width="28" height="8" fill={palette.shadow} />
        </>
    );
}

function AccessoryLayer({ item }: { item?: EquippedVisual }) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;

    return (
        <>
            <rect x="30" y="34" width="4" height="4" fill={accent} />
            <rect x="31" y="38" width="2" height="4" fill={palette.base} />
            <rect x="31" y="34" width="1" height="1" fill={palette.highlight} />
        </>
    );
}

function DebugOverlay({ mode }: { mode: CharacterSpriteDebug }) {
    if (mode === 'bounds') {
        const bounds = CHARACTER_CANVAS.heroBounds;

        return (
            <>
                <rect
                    x={bounds.left}
                    y={bounds.top}
                    width={bounds.right - bounds.left}
                    height={bounds.bottom - bounds.top}
                    fill="none"
                    stroke="#ff4f87"
                    strokeWidth="0.5"
                    strokeDasharray="2 1"
                />
                <line
                    x1="0"
                    x2={CHARACTER_CANVAS.width}
                    y1={CHARACTER_CANVAS.baselineY}
                    y2={CHARACTER_CANVAS.baselineY}
                    stroke="#55d6ff"
                    strokeWidth="0.5"
                />
            </>
        );
    }

    return (
        <>
            {Object.entries(CHARACTER_ANCHORS).map(([name, point]) => (
                <g key={name}>
                    <rect
                        x={point.x - 1}
                        y={point.y - 1}
                        width="3"
                        height="3"
                        fill="#ff4f87"
                        opacity="0.8"
                    />
                </g>
            ))}
        </>
    );
}
