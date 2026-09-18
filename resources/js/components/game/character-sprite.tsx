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
import { CHARACTER_SYSTEM, normalizeBodyFrame } from '@/game/character-system';
import type {
    CharacterLineage,
    CharacterView,
    EquippedVisual,
    GameAppearance,
    GameCharacter,
} from '@/types/game';

export type CharacterSpriteState =
    | 'idle'
    | 'walk'
    | 'attack'
    | 'cast'
    | 'celebrate'
    | 'hurt';

export type CharacterSpriteDebug = 'none' | 'bounds' | 'anchors';

type SpriteCharacter = Pick<
    GameCharacter,
    'appearance' | 'equipment' | 'archetype'
> & {
    lineage?: CharacterLineage;
};

type Tone = {
    shadow: string;
    base: string;
    highlight: string;
};

type Geometry = {
    torsoX: number;
    torsoWidth: number;
    armLeftX: number;
    armRightX: number;
    armWidth: number;
    legLeftX: number;
    legRightX: number;
    legWidth: number;
    headX: number;
    headWidth: number;
    headY: number;
    headHeight: number;
};

export function CharacterSprite({
    character,
    state = 'idle',
    view = 'front',
    debug = 'none',
    className = '',
}: {
    character: SpriteCharacter;
    state?: CharacterSpriteState;
    view?: CharacterView;
    debug?: CharacterSpriteDebug;
    className?: string;
}) {
    const lineage = character.lineage ?? 'human';
    const frame = normalizeBodyFrame(character.appearance.body);
    const geometry = geometryFor(frame);
    const bodyPalette = bodyPaletteFor(lineage, character.appearance);
    const hairPalette = CHARACTER_PALETTE.hair[character.appearance.hair_color];
    const eyeColor = CHARACTER_PALETTE.eyes[character.appearance.eye_color];
    const eyeGlow = CHARACTER_PALETTE.eyeGlow[character.appearance.eye_glow];
    const archetypePalette = CHARACTER_PALETTE.archetype[character.archetype];
    const artPass =
        lineage === 'human' && frame === 'broad'
            ? 'human-broad-c2.1'
            : 'phase-b-base';

    return (
        <div
            data-character-style={CHARACTER_STYLE_ID}
            data-character-style-version={CHARACTER_STYLE_VERSION}
            data-lineage={lineage}
            data-frame={frame}
            data-view={view}
            data-art-pass={artPass}
            className={['runeday-sprite', 'runeday-sprite-' + state, className]
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
                aria-label={
                    capitalize(lineage) + ' RuneDay hero · ' + view + ' view'
                }
                className="h-full w-full"
                shapeRendering="crispEdges"
            >
                <ellipse
                    cx="32"
                    cy={CHARACTER_CANVAS.baselineY}
                    rx={frame === 'heavy' ? 18 : 15}
                    ry="3"
                    fill={CHARACTER_RENDER_RULES.castShadow}
                    opacity={CHARACTER_RENDER_RULES.castShadowOpacity}
                />

                {view === 'front' && (
                    <FrontHero
                        character={character}
                        lineage={lineage}
                        geometry={geometry}
                        bodyPalette={bodyPalette}
                        hairPalette={hairPalette}
                        eyeColor={eyeColor}
                        eyeGlow={eyeGlow}
                        archetypePalette={archetypePalette}
                    />
                )}

                {view === 'side' && (
                    <SideHero
                        character={character}
                        lineage={lineage}
                        geometry={geometry}
                        bodyPalette={bodyPalette}
                        hairPalette={hairPalette}
                        eyeColor={eyeColor}
                        eyeGlow={eyeGlow}
                        archetypePalette={archetypePalette}
                    />
                )}

                {view === 'back' && (
                    <BackHero
                        character={character}
                        lineage={lineage}
                        geometry={geometry}
                        bodyPalette={bodyPalette}
                        hairPalette={hairPalette}
                        archetypePalette={archetypePalette}
                    />
                )}

                {debug !== 'none' && (
                    <DebugOverlay mode={debug} frame={frame} />
                )}
            </svg>
        </div>
    );
}

function FrontHero({
    character,
    lineage,
    geometry,
    bodyPalette,
    hairPalette,
    eyeColor,
    eyeGlow,
    archetypePalette,
}: {
    character: SpriteCharacter;
    lineage: CharacterLineage;
    geometry: Geometry;
    bodyPalette: Tone;
    hairPalette: Tone;
    eyeColor: string;
    eyeGlow: string;
    archetypePalette: Tone;
}) {
    const { appearance, equipment } = character;

    if (
        lineage === 'human' &&
        normalizeBodyFrame(appearance.body) === 'broad'
    ) {
        return (
            <HumanBroadFrontC21
                character={character}
                geometry={geometry}
                bodyPalette={bodyPalette}
                hairPalette={hairPalette}
                eyeColor={eyeColor}
                archetypePalette={archetypePalette}
            />
        );
    }

    return (
        <>
            <BackLayer item={equipment.back} view="front" geometry={geometry} />

            <Legs
                lineage={lineage}
                geometry={geometry}
                bodyPalette={bodyPalette}
                archetypePalette={archetypePalette}
            />
            <FeetLayer item={equipment.feet} view="front" geometry={geometry} />

            <Arms
                lineage={lineage}
                geometry={geometry}
                bodyPalette={bodyPalette}
            />
            <Torso
                lineage={lineage}
                geometry={geometry}
                bodyPalette={bodyPalette}
                archetypePalette={archetypePalette}
            />
            <ChestLayer
                item={equipment.chest}
                view="front"
                geometry={geometry}
            />

            <HeadBase
                lineage={lineage}
                appearance={appearance}
                geometry={geometry}
                bodyPalette={bodyPalette}
            />
            <FaceFeatures
                lineage={lineage}
                appearance={appearance}
                geometry={geometry}
                eyeColor={eyeColor}
                eyeGlow={eyeGlow}
            />
            <LineageFeatures
                lineage={lineage}
                appearance={appearance}
                geometry={geometry}
                bodyPalette={bodyPalette}
                view="front"
            />

            <HairLayer
                appearance={appearance}
                palette={hairPalette}
                view="front"
                geometry={geometry}
            />
            <HeadLayer item={equipment.head} view="front" geometry={geometry} />

            <AccessoryLayer item={equipment.accessory} view="front" />
            <WeaponLayer item={equipment.weapon} view="front" />
        </>
    );
}

function SideHero({
    character,
    lineage,
    geometry,
    bodyPalette,
    hairPalette,
    eyeColor,
    eyeGlow,
    archetypePalette,
}: {
    character: SpriteCharacter;
    lineage: CharacterLineage;
    geometry: Geometry;
    bodyPalette: Tone;
    hairPalette: Tone;
    eyeColor: string;
    eyeGlow: string;
    archetypePalette: Tone;
}) {
    const { appearance, equipment } = character;

    if (
        lineage === 'human' &&
        normalizeBodyFrame(appearance.body) === 'broad'
    ) {
        return (
            <HumanBroadSideC21
                character={character}
                geometry={geometry}
                bodyPalette={bodyPalette}
                hairPalette={hairPalette}
                eyeColor={eyeColor}
                archetypePalette={archetypePalette}
            />
        );
    }

    const heavy = appearance.body === 'heavy';
    const torsoX = heavy ? 23 : 25;
    const torsoWidth = heavy ? 20 : 16;

    return (
        <>
            <BackLayer item={equipment.back} view="side" geometry={geometry} />

            <PixelBlock
                x={heavy ? 26 : 27}
                y={42}
                width={heavy ? 9 : 7}
                height={15}
                fill={
                    lineage === 'skeleton'
                        ? bodyPalette.base
                        : archetypePalette.shadow
                }
            />
            <PixelBlock
                x={heavy ? 35 : 34}
                y={42}
                width={heavy ? 9 : 7}
                height={15}
                fill={
                    lineage === 'skeleton'
                        ? bodyPalette.base
                        : archetypePalette.shadow
                }
            />
            <FeetLayer item={equipment.feet} view="side" geometry={geometry} />

            <PixelBlock
                x={torsoX}
                y={25}
                width={torsoWidth}
                height={19}
                fill={
                    lineage === 'skeleton'
                        ? bodyPalette.base
                        : archetypePalette.base
                }
            />
            <PixelBlock
                x={heavy ? 40 : 39}
                y={28}
                width={heavy ? 8 : 7}
                height={15}
                fill={bodyPalette.base}
            />
            <ChestLayer
                item={equipment.chest}
                view="side"
                geometry={geometry}
            />

            <PixelBlock
                x={heavy ? 22 : 24}
                y={10}
                width={heavy ? 24 : 18}
                height={17}
                fill={bodyPalette.base}
            />
            <rect
                x={heavy ? 42 : 40}
                y="16"
                width={heavy ? 5 : 4}
                height="5"
                fill={bodyPalette.base}
            />

            <LineageFeatures
                lineage={lineage}
                appearance={appearance}
                geometry={geometry}
                bodyPalette={bodyPalette}
                view="side"
            />

            <rect
                x={heavy ? 38 : 36}
                y="18"
                width="3"
                height="3"
                fill={lineage === 'skeleton' ? eyeGlow : eyeColor}
            />
            {lineage === 'skeleton' && appearance.eye_glow !== 'none' && (
                <rect
                    x={heavy ? 37 : 35}
                    y="17"
                    width="5"
                    height="5"
                    fill={eyeGlow}
                    opacity="0.24"
                />
            )}

            <HairLayer
                appearance={appearance}
                palette={hairPalette}
                view="side"
                geometry={geometry}
            />
            <HeadLayer item={equipment.head} view="side" geometry={geometry} />

            <AccessoryLayer item={equipment.accessory} view="side" />
            <WeaponLayer item={equipment.weapon} view="side" />
        </>
    );
}

function BackHero({
    character,
    lineage,
    geometry,
    bodyPalette,
    hairPalette,
    archetypePalette,
}: {
    character: SpriteCharacter;
    lineage: CharacterLineage;
    geometry: Geometry;
    bodyPalette: Tone;
    hairPalette: Tone;
    archetypePalette: Tone;
}) {
    const { appearance, equipment } = character;

    if (
        lineage === 'human' &&
        normalizeBodyFrame(appearance.body) === 'broad'
    ) {
        return (
            <HumanBroadBackC21
                character={character}
                geometry={geometry}
                bodyPalette={bodyPalette}
                hairPalette={hairPalette}
                archetypePalette={archetypePalette}
            />
        );
    }

    return (
        <>
            <WeaponLayer item={equipment.weapon} view="back" />
            <BackLayer item={equipment.back} view="back" geometry={geometry} />

            <Legs
                lineage={lineage}
                geometry={geometry}
                bodyPalette={bodyPalette}
                archetypePalette={archetypePalette}
            />
            <FeetLayer item={equipment.feet} view="back" geometry={geometry} />
            <Arms
                lineage={lineage}
                geometry={geometry}
                bodyPalette={bodyPalette}
            />
            <Torso
                lineage={lineage}
                geometry={geometry}
                bodyPalette={bodyPalette}
                archetypePalette={archetypePalette}
            />
            <ChestLayer
                item={equipment.chest}
                view="back"
                geometry={geometry}
            />

            <HeadBase
                lineage={lineage}
                appearance={appearance}
                geometry={geometry}
                bodyPalette={bodyPalette}
            />
            <LineageFeatures
                lineage={lineage}
                appearance={appearance}
                geometry={geometry}
                bodyPalette={bodyPalette}
                view="back"
            />
            <HairLayer
                appearance={appearance}
                palette={hairPalette}
                view="back"
                geometry={geometry}
            />
            <HeadLayer item={equipment.head} view="back" geometry={geometry} />
        </>
    );
}

function HumanBroadFrontC21({
    character,
    geometry,
    bodyPalette,
    hairPalette,
    eyeColor,
    archetypePalette,
}: {
    character: SpriteCharacter;
    geometry: Geometry;
    bodyPalette: Tone;
    hairPalette: Tone;
    eyeColor: string;
    archetypePalette: Tone;
}) {
    const { appearance, equipment } = character;

    return (
        <>
            <BackLayer item={equipment.back} view="front" geometry={geometry} />
            <HumanBroadLegsC21 archetypePalette={archetypePalette} />
            <FeetLayer item={equipment.feet} view="front" geometry={geometry} />
            <HumanBroadArmsC21
                bodyPalette={bodyPalette}
                archetypePalette={archetypePalette}
            />
            <HumanBroadTorsoC21
                bodyPalette={bodyPalette}
                archetypePalette={archetypePalette}
            />
            {equipment.chest && (
                <HumanBroadChestC21 item={equipment.chest} view="front" />
            )}
            <HumanBroadHeadC21 bodyPalette={bodyPalette} />
            <HumanBroadFaceC21
                appearance={appearance}
                bodyPalette={bodyPalette}
                eyeColor={eyeColor}
            />
            <HumanBroadHairC21
                appearance={appearance}
                palette={hairPalette}
                view="front"
            />
            <HeadLayer item={equipment.head} view="front" geometry={geometry} />
            <AccessoryLayer item={equipment.accessory} view="front" />
            <WeaponLayer item={equipment.weapon} view="front" />
        </>
    );
}

function HumanBroadSideC21({
    character,
    geometry,
    bodyPalette,
    hairPalette,
    eyeColor,
    archetypePalette,
}: {
    character: SpriteCharacter;
    geometry: Geometry;
    bodyPalette: Tone;
    hairPalette: Tone;
    eyeColor: string;
    archetypePalette: Tone;
}) {
    const { appearance, equipment } = character;

    return (
        <>
            <BackLayer item={equipment.back} view="side" geometry={geometry} />

            <PixelBlock
                x={26}
                y={42}
                width={8}
                height={15}
                fill={archetypePalette.shadow}
            />
            <PixelBlock
                x={34}
                y={42}
                width={8}
                height={15}
                fill={archetypePalette.shadow}
            />
            <rect
                x="27"
                y="43"
                width="4"
                height="2"
                fill={archetypePalette.base}
            />
            <FeetLayer item={equipment.feet} view="side" geometry={geometry} />

            <PixelBlock
                x={24}
                y={29}
                width={7}
                height={15}
                fill={bodyPalette.shadow}
            />
            <PixelBlock
                x={39}
                y={29}
                width={7}
                height={16}
                fill={bodyPalette.base}
            />
            <rect
                x="40"
                y="31"
                width="3"
                height="6"
                fill={bodyPalette.highlight}
            />

            <PixelBlock
                x={24}
                y={27}
                width={19}
                height={17}
                fill={archetypePalette.base}
            />
            <rect
                x="25"
                y="29"
                width="7"
                height="2"
                fill={archetypePalette.highlight}
            />
            <rect
                x="25"
                y="40"
                width="17"
                height="2"
                fill={archetypePalette.shadow}
            />

            <PixelBlock
                x={28}
                y={23}
                width={8}
                height={6}
                fill={bodyPalette.base}
            />
            <rect
                x="26"
                y="25"
                width="14"
                height="3"
                fill={archetypePalette.shadow}
            />
            <rect
                x="28"
                y="25"
                width="9"
                height="1"
                fill={archetypePalette.highlight}
            />

            {equipment.chest && (
                <HumanBroadChestC21 item={equipment.chest} view="side" />
            )}

            <PixelBlock
                x={24}
                y={9}
                width={19}
                height={18}
                fill={bodyPalette.base}
            />
            <rect
                x="25"
                y="11"
                width="7"
                height="2"
                fill={bodyPalette.highlight}
            />
            <PixelBlock
                x={22}
                y={15}
                width={4}
                height={6}
                fill={bodyPalette.shadow}
            />
            <rect x="42" y="16" width="4" height="5" fill={bodyPalette.base} />
            <rect
                x="43"
                y="18"
                width="2"
                height="1"
                fill={bodyPalette.highlight}
            />
            <rect x="37" y="17" width="3" height="2" fill={eyeColor} />
            <rect
                x="36"
                y="15"
                width="5"
                height="1"
                fill={CHARACTER_RENDER_RULES.internalOutline}
            />
            <rect
                x="39"
                y="22"
                width="4"
                height="1"
                fill={bodyPalette.shadow}
            />

            <HumanBroadHairC21
                appearance={appearance}
                palette={hairPalette}
                view="side"
            />
            <HeadLayer item={equipment.head} view="side" geometry={geometry} />
            <AccessoryLayer item={equipment.accessory} view="side" />
            <WeaponLayer item={equipment.weapon} view="side" />
        </>
    );
}

function HumanBroadBackC21({
    character,
    geometry,
    bodyPalette,
    hairPalette,
    archetypePalette,
}: {
    character: SpriteCharacter;
    geometry: Geometry;
    bodyPalette: Tone;
    hairPalette: Tone;
    archetypePalette: Tone;
}) {
    const { appearance, equipment } = character;

    return (
        <>
            <WeaponLayer item={equipment.weapon} view="back" />
            <BackLayer item={equipment.back} view="back" geometry={geometry} />
            <HumanBroadLegsC21 archetypePalette={archetypePalette} />
            <FeetLayer item={equipment.feet} view="back" geometry={geometry} />
            <HumanBroadArmsC21
                bodyPalette={bodyPalette}
                archetypePalette={archetypePalette}
            />
            <HumanBroadTorsoC21
                bodyPalette={bodyPalette}
                archetypePalette={archetypePalette}
                back
            />
            {equipment.chest && (
                <HumanBroadChestC21 item={equipment.chest} view="back" />
            )}
            <PixelBlock
                x={22}
                y={9}
                width={20}
                height={18}
                fill={bodyPalette.base}
            />
            <rect
                x="23"
                y="11"
                width="7"
                height="2"
                fill={bodyPalette.highlight}
            />
            <HumanBroadHairC21
                appearance={appearance}
                palette={hairPalette}
                view="back"
            />
            <HeadLayer item={equipment.head} view="back" geometry={geometry} />
        </>
    );
}

function HumanBroadTorsoC21({
    bodyPalette,
    archetypePalette,
    back = false,
}: {
    bodyPalette: Tone;
    archetypePalette: Tone;
    back?: boolean;
}) {
    return (
        <>
            <PixelBlock
                x={29}
                y={23}
                width={6}
                height={6}
                fill={bodyPalette.base}
            />
            <PixelBlock
                x={19}
                y={27}
                width={26}
                height={7}
                fill={archetypePalette.shadow}
            />
            <PixelBlock
                x={21}
                y={32}
                width={22}
                height={11}
                fill={archetypePalette.base}
            />
            <rect
                x="23"
                y="33"
                width="8"
                height="2"
                fill={archetypePalette.highlight}
            />
            <rect
                x="23"
                y="40"
                width="18"
                height="2"
                fill={archetypePalette.shadow}
            />
            <rect
                x="22"
                y="41"
                width="20"
                height="3"
                fill={CHARACTER_PALETTE.material.leather.base}
            />
            {!back && (
                <rect
                    x="30"
                    y="41"
                    width="4"
                    height="3"
                    fill={CHARACTER_PALETTE.material.gold.base}
                />
            )}
            <rect
                x="23"
                y="25"
                width="18"
                height="3"
                fill={archetypePalette.base}
            />
            <rect
                x="25"
                y="25"
                width="8"
                height="1"
                fill={archetypePalette.highlight}
            />
        </>
    );
}

function HumanBroadArmsC21({
    bodyPalette,
    archetypePalette,
}: {
    bodyPalette: Tone;
    archetypePalette: Tone;
}) {
    return (
        <>
            <PixelBlock
                x={15}
                y={28}
                width={9}
                height={8}
                fill={archetypePalette.shadow}
            />
            <PixelBlock
                x={40}
                y={28}
                width={9}
                height={8}
                fill={archetypePalette.shadow}
            />
            <rect
                x="17"
                y="29"
                width="4"
                height="2"
                fill={archetypePalette.highlight}
            />
            <rect
                x="42"
                y="29"
                width="4"
                height="2"
                fill={archetypePalette.highlight}
            />
            <PixelBlock
                x={17}
                y={35}
                width={7}
                height={11}
                fill={bodyPalette.base}
            />
            <PixelBlock
                x={40}
                y={35}
                width={7}
                height={11}
                fill={bodyPalette.base}
            />
            <rect
                x="18"
                y="36"
                width="2"
                height="5"
                fill={bodyPalette.highlight}
            />
            <rect
                x="41"
                y="36"
                width="2"
                height="5"
                fill={bodyPalette.highlight}
            />
            <PixelBlock
                x={18}
                y={44}
                width={6}
                height={6}
                fill={bodyPalette.base}
            />
            <PixelBlock
                x={40}
                y={44}
                width={6}
                height={6}
                fill={bodyPalette.base}
            />
        </>
    );
}

function HumanBroadLegsC21({ archetypePalette }: { archetypePalette: Tone }) {
    return (
        <>
            <PixelBlock
                x={21}
                y={41}
                width={10}
                height={10}
                fill={archetypePalette.shadow}
            />
            <PixelBlock
                x={33}
                y={41}
                width={10}
                height={10}
                fill={archetypePalette.shadow}
            />
            <rect
                x="23"
                y="43"
                width="5"
                height="2"
                fill={archetypePalette.base}
            />
            <rect
                x="35"
                y="43"
                width="5"
                height="2"
                fill={archetypePalette.base}
            />
            <PixelBlock
                x={22}
                y={49}
                width={9}
                height={9}
                fill={archetypePalette.base}
            />
            <PixelBlock
                x={33}
                y={49}
                width={9}
                height={9}
                fill={archetypePalette.base}
            />
            <rect
                x="23"
                y="50"
                width="4"
                height="1"
                fill={archetypePalette.highlight}
            />
            <rect
                x="34"
                y="50"
                width="4"
                height="1"
                fill={archetypePalette.highlight}
            />
        </>
    );
}

function HumanBroadHeadC21({ bodyPalette }: { bodyPalette: Tone }) {
    return (
        <>
            <PixelBlock
                x={22}
                y={9}
                width={20}
                height={18}
                fill={bodyPalette.base}
            />
            <PixelBlock
                x={20}
                y={15}
                width={4}
                height={7}
                fill={bodyPalette.shadow}
            />
            <PixelBlock
                x={40}
                y={15}
                width={4}
                height={7}
                fill={bodyPalette.base}
            />
            <rect
                x="24"
                y="11"
                width="7"
                height="2"
                fill={bodyPalette.highlight}
            />
            <rect
                x="25"
                y="24"
                width="14"
                height="2"
                fill={bodyPalette.shadow}
            />
        </>
    );
}

function HumanBroadFaceC21({
    appearance,
    bodyPalette,
    eyeColor,
}: {
    appearance: GameAppearance;
    bodyPalette: Tone;
    eyeColor: string;
}) {
    const strong = appearance.face_style === 'strong';
    const soft = appearance.face_style === 'soft';

    return (
        <>
            <rect
                x="25"
                y={strong ? 15 : 16}
                width="5"
                height="1"
                fill={CHARACTER_RENDER_RULES.internalOutline}
            />
            <rect
                x="34"
                y={strong ? 15 : 16}
                width="5"
                height="1"
                fill={CHARACTER_RENDER_RULES.internalOutline}
            />
            <rect x="26" y="17" width="3" height="3" fill={eyeColor} />
            <rect x="35" y="17" width="3" height="3" fill={eyeColor} />
            <rect x="27" y="17" width="1" height="1" fill="#f8fbff" />
            <rect x="36" y="17" width="1" height="1" fill="#f8fbff" />
            <rect
                x="31"
                y="19"
                width="2"
                height="3"
                fill={bodyPalette.shadow}
            />
            <rect
                x="32"
                y="19"
                width="1"
                height="2"
                fill={bodyPalette.highlight}
            />
            <rect
                x={soft ? 30 : 29}
                y="23"
                width={soft ? 4 : 6}
                height="1"
                fill={CHARACTER_RENDER_RULES.internalOutline}
                opacity="0.78"
            />
            {strong && (
                <>
                    <rect
                        x="24"
                        y="21"
                        width="2"
                        height="2"
                        fill={bodyPalette.shadow}
                    />
                    <rect
                        x="38"
                        y="21"
                        width="2"
                        height="2"
                        fill={bodyPalette.shadow}
                    />
                </>
            )}
        </>
    );
}

function HumanBroadHairC21({
    appearance,
    palette,
    view,
}: {
    appearance: GameAppearance;
    palette: Tone;
    view: CharacterView;
}) {
    const style = appearance.hair_style;
    if (style === 'none') return null;

    if (view === 'back') {
        return (
            <>
                <PixelBlock
                    x={20}
                    y={6}
                    width={24}
                    height={10}
                    fill={palette.base}
                />
                <PixelBlock
                    x={19}
                    y={11}
                    width={7}
                    height={10}
                    fill={palette.shadow}
                />
                <PixelBlock
                    x={38}
                    y={10}
                    width={7}
                    height={11}
                    fill={palette.base}
                />
                <rect
                    x="23"
                    y="7"
                    width="8"
                    height="2"
                    fill={palette.highlight}
                />
                {style === 'braid' && (
                    <PixelBlock
                        x={29}
                        y={15}
                        width={6}
                        height={18}
                        fill={palette.shadow}
                    />
                )}
            </>
        );
    }

    if (view === 'side') {
        return (
            <>
                <PixelBlock
                    x={22}
                    y={6}
                    width={22}
                    height={9}
                    fill={palette.base}
                />
                <PixelBlock
                    x={21}
                    y={10}
                    width={7}
                    height={10}
                    fill={palette.shadow}
                />
                <rect
                    x="25"
                    y="7"
                    width="8"
                    height="2"
                    fill={palette.highlight}
                />
                <PixelBlock
                    x={35}
                    y={5}
                    width={7}
                    height={6}
                    fill={palette.base}
                />
                {style === 'braid' && (
                    <PixelBlock
                        x={22}
                        y={17}
                        width={5}
                        height={16}
                        fill={palette.shadow}
                    />
                )}
            </>
        );
    }

    if (style === 'crest') {
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
                    x={28}
                    y={3}
                    width={8}
                    height={7}
                    fill={palette.base}
                />
                <rect
                    x="24"
                    y="8"
                    width="8"
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
                    y={6}
                    width={24}
                    height={9}
                    fill={palette.base}
                />
                <PixelBlock
                    x={19}
                    y={10}
                    width={7}
                    height={11}
                    fill={palette.shadow}
                />
                <PixelBlock
                    x={18}
                    y={19}
                    width={6}
                    height={14}
                    fill={palette.base}
                />
                <rect
                    x="23"
                    y="7"
                    width="9"
                    height="2"
                    fill={palette.highlight}
                />
            </>
        );
    }

    const wild = style === 'wild';
    return (
        <>
            <PixelBlock
                x={20}
                y={6}
                width={24}
                height={9}
                fill={palette.base}
            />
            <PixelBlock
                x={18}
                y={10}
                width={7}
                height={10}
                fill={palette.shadow}
            />
            <PixelBlock
                x={39}
                y={9}
                width={7}
                height={10}
                fill={palette.base}
            />
            <PixelBlock x={24} y={4} width={7} height={5} fill={palette.base} />
            <PixelBlock x={32} y={3} width={7} height={6} fill={palette.base} />
            {wild && (
                <PixelBlock
                    x={39}
                    y={5}
                    width={6}
                    height={6}
                    fill={palette.base}
                />
            )}
            <rect x="23" y="7" width="10" height="2" fill={palette.highlight} />
            <rect x="34" y="6" width="5" height="1" fill={palette.highlight} />
        </>
    );
}

function HumanBroadChestC21({
    item,
    view,
}: {
    item: EquippedVisual;
    view: CharacterView;
}) {
    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;
    const leather = CHARACTER_PALETTE.material.leather;
    const isLinen = item.visual_key.includes('linen');

    if (view === 'side') {
        return (
            <>
                <PixelBlock
                    x={24}
                    y={28}
                    width={18}
                    height={15}
                    fill={palette.base}
                />
                <PixelBlock
                    x={38}
                    y={27}
                    width={9}
                    height={8}
                    fill={isLinen ? palette.shadow : palette.base}
                />
                <rect
                    x="26"
                    y="29"
                    width="7"
                    height="2"
                    fill={palette.highlight}
                />
                <rect x="26" y="40" width="15" height="2" fill={leather.base} />
            </>
        );
    }

    return (
        <>
            <PixelBlock
                x={20}
                y={28}
                width={24}
                height={15}
                fill={palette.base}
            />
            <PixelBlock
                x={15}
                y={27}
                width={10}
                height={8}
                fill={isLinen ? palette.shadow : palette.base}
            />
            <PixelBlock
                x={39}
                y={27}
                width={10}
                height={8}
                fill={isLinen ? palette.shadow : palette.base}
            />
            <rect x="17" y="28" width="5" height="2" fill={palette.highlight} />
            <rect x="22" y="29" width="8" height="2" fill={palette.highlight} />
            <rect x="22" y="40" width="20" height="2" fill={palette.shadow} />
            <rect x="22" y="41" width="20" height="3" fill={leather.base} />
            {view !== 'back' && (
                <rect
                    x="30"
                    y="41"
                    width="4"
                    height="3"
                    fill={CHARACTER_PALETTE.material.gold.base}
                />
            )}
            {item.rarity !== 'common' && view !== 'back' && (
                <rect x="31" y="33" width="3" height="3" fill={accent} />
            )}
        </>
    );
}

function Torso({
    lineage,
    geometry,
    bodyPalette,
    archetypePalette,
}: {
    lineage: CharacterLineage;
    geometry: Geometry;
    bodyPalette: Tone;
    archetypePalette: Tone;
}) {
    if (lineage === 'skeleton') {
        return (
            <>
                <PixelBlock
                    x={geometry.torsoX + 2}
                    y={25}
                    width={geometry.torsoWidth - 4}
                    height={17}
                    fill={bodyPalette.base}
                />
                <rect
                    x={geometry.torsoX + 4}
                    y="29"
                    width={geometry.torsoWidth - 8}
                    height="2"
                    fill={CHARACTER_RENDER_RULES.internalOutline}
                />
                <rect
                    x={geometry.torsoX + 4}
                    y="34"
                    width={geometry.torsoWidth - 8}
                    height="2"
                    fill={CHARACTER_RENDER_RULES.internalOutline}
                />
                <rect
                    x="31"
                    y="27"
                    width="2"
                    height="13"
                    fill={bodyPalette.highlight}
                />
            </>
        );
    }

    return (
        <>
            <PixelBlock
                x={geometry.torsoX}
                y={24}
                width={geometry.torsoWidth}
                height={20}
                fill={archetypePalette.base}
            />
            <rect
                x={geometry.torsoX + 2}
                y="26"
                width={Math.max(5, geometry.torsoWidth - 10)}
                height="2"
                fill={archetypePalette.highlight}
            />
            <rect
                x={geometry.torsoX + 1}
                y="40"
                width={geometry.torsoWidth - 2}
                height="2"
                fill={archetypePalette.shadow}
            />
        </>
    );
}

function Arms({
    lineage,
    geometry,
    bodyPalette,
}: {
    lineage: CharacterLineage;
    geometry: Geometry;
    bodyPalette: Tone;
}) {
    const width =
        lineage === 'skeleton'
            ? Math.max(4, geometry.armWidth - 2)
            : geometry.armWidth;

    return (
        <>
            <PixelBlock
                x={geometry.armLeftX}
                y={27}
                width={width}
                height={16}
                fill={bodyPalette.base}
            />
            <PixelBlock
                x={geometry.armRightX}
                y={27}
                width={width}
                height={16}
                fill={bodyPalette.base}
            />
        </>
    );
}

function Legs({
    lineage,
    geometry,
    bodyPalette,
    archetypePalette,
}: {
    lineage: CharacterLineage;
    geometry: Geometry;
    bodyPalette: Tone;
    archetypePalette: Tone;
}) {
    const fill =
        lineage === 'skeleton' ? bodyPalette.base : archetypePalette.shadow;
    const width =
        lineage === 'skeleton'
            ? Math.max(4, geometry.legWidth - 2)
            : geometry.legWidth;

    return (
        <>
            <PixelBlock
                x={geometry.legLeftX}
                y={41}
                width={width}
                height={16}
                fill={fill}
            />
            <PixelBlock
                x={geometry.legRightX}
                y={41}
                width={width}
                height={16}
                fill={fill}
            />
        </>
    );
}

function HeadBase({
    lineage,
    appearance,
    geometry,
    bodyPalette,
}: {
    lineage: CharacterLineage;
    appearance: GameAppearance;
    geometry: Geometry;
    bodyPalette: Tone;
}) {
    const inset =
        lineage === 'skeleton' && appearance.face_style === 'narrow_skull'
            ? 2
            : 0;
    const height =
        lineage === 'ogre' ? geometry.headHeight + 2 : geometry.headHeight;

    return (
        <PixelBlock
            x={geometry.headX + inset}
            y={geometry.headY}
            width={geometry.headWidth - inset * 2}
            height={height}
            fill={bodyPalette.base}
        />
    );
}

function FaceFeatures({
    lineage,
    appearance,
    geometry,
    eyeColor,
    eyeGlow,
}: {
    lineage: CharacterLineage;
    appearance: GameAppearance;
    geometry: Geometry;
    eyeColor: string;
    eyeGlow: string;
}) {
    const leftEye = geometry.headX + 5;
    const rightEye = geometry.headX + geometry.headWidth - 8;
    const eyeY = geometry.headY + 8;
    const eyeFill =
        lineage === 'skeleton' && appearance.eye_glow !== 'none'
            ? eyeGlow
            : eyeColor;

    return (
        <>
            <rect x={leftEye} y={eyeY} width="3" height="3" fill={eyeFill} />
            <rect x={rightEye} y={eyeY} width="3" height="3" fill={eyeFill} />

            {lineage === 'skeleton' && appearance.eye_glow !== 'none' && (
                <>
                    <rect
                        x={leftEye - 1}
                        y={eyeY - 1}
                        width="5"
                        height="5"
                        fill={eyeGlow}
                        opacity="0.22"
                    />
                    <rect
                        x={rightEye - 1}
                        y={eyeY - 1}
                        width="5"
                        height="5"
                        fill={eyeGlow}
                        opacity="0.22"
                    />
                </>
            )}

            {lineage !== 'skeleton' && (
                <>
                    <rect
                        x={leftEye + 1}
                        y={eyeY}
                        width="1"
                        height="1"
                        fill="#f6fbff"
                    />
                    <rect
                        x={rightEye + 1}
                        y={eyeY}
                        width="1"
                        height="1"
                        fill="#f6fbff"
                    />
                </>
            )}

            <FaceStyleMark
                lineage={lineage}
                faceStyle={appearance.face_style}
                geometry={geometry}
            />
        </>
    );
}

function FaceStyleMark({
    lineage,
    faceStyle,
    geometry,
}: {
    lineage: CharacterLineage;
    faceStyle: GameAppearance['face_style'];
    geometry: Geometry;
}) {
    if (lineage === 'skeleton') {
        return (
            <rect
                x={geometry.headX + Math.floor(geometry.headWidth / 2) - 1}
                y={geometry.headY + 12}
                width="3"
                height="2"
                fill={CHARACTER_RENDER_RULES.internalOutline}
            />
        );
    }

    if (faceStyle === 'scarred') {
        return (
            <rect
                x={geometry.headX + geometry.headWidth - 8}
                y={geometry.headY + 6}
                width="1"
                height="7"
                fill="#7b3d35"
            />
        );
    }

    if (
        faceStyle === 'strong' ||
        faceStyle === 'angular' ||
        faceStyle === 'brute'
    ) {
        return (
            <rect
                x={geometry.headX + 4}
                y={geometry.headY + 6}
                width={geometry.headWidth - 8}
                height="1"
                fill={CHARACTER_RENDER_RULES.internalOutline}
                opacity="0.7"
            />
        );
    }

    return null;
}

function LineageFeatures({
    lineage,
    appearance,
    geometry,
    bodyPalette,
    view,
}: {
    lineage: CharacterLineage;
    appearance: GameAppearance;
    geometry: Geometry;
    bodyPalette: Tone;
    view: CharacterView;
}) {
    return (
        <>
            {lineage === 'elf' && (
                <ElfEars
                    style={appearance.ear_style}
                    geometry={geometry}
                    palette={bodyPalette}
                    view={view}
                />
            )}

            {lineage === 'skeleton' && (
                <SkeletonJaw
                    style={appearance.jaw_style}
                    geometry={geometry}
                    palette={bodyPalette}
                    view={view}
                />
            )}

            {lineage === 'ogre' && (
                <>
                    <OgreEars
                        style={appearance.ear_style}
                        geometry={geometry}
                        palette={bodyPalette}
                        view={view}
                    />
                    <OgreJaw
                        style={appearance.jaw_style}
                        geometry={geometry}
                        palette={bodyPalette}
                        view={view}
                    />
                    <OgreHorns
                        style={appearance.horn_style}
                        geometry={geometry}
                        view={view}
                    />
                </>
            )}
        </>
    );
}

function ElfEars({
    style,
    geometry,
    palette,
    view,
}: {
    style: GameAppearance['ear_style'];
    geometry: Geometry;
    palette: Tone;
    view: CharacterView;
}) {
    const length = style === 'long' ? 8 : style === 'swept' ? 7 : 6;
    const y = geometry.headY + (style === 'high' ? 4 : 7);

    if (view === 'side') {
        return (
            <polygon
                points={
                    geometry.headX +
                    ',' +
                    y +
                    ' ' +
                    (geometry.headX - length) +
                    ',' +
                    (y + 1) +
                    ' ' +
                    geometry.headX +
                    ',' +
                    (y + 5)
                }
                fill={palette.base}
                stroke={CHARACTER_RENDER_RULES.silhouetteOutline}
                strokeWidth="1"
            />
        );
    }

    return (
        <>
            <polygon
                points={
                    geometry.headX +
                    ',' +
                    y +
                    ' ' +
                    (geometry.headX - length) +
                    ',' +
                    (y + 2) +
                    ' ' +
                    geometry.headX +
                    ',' +
                    (y + 5)
                }
                fill={palette.base}
                stroke={CHARACTER_RENDER_RULES.silhouetteOutline}
                strokeWidth="1"
            />
            <polygon
                points={
                    geometry.headX +
                    geometry.headWidth +
                    ',' +
                    y +
                    ' ' +
                    (geometry.headX + geometry.headWidth + length) +
                    ',' +
                    (y + 2) +
                    ' ' +
                    (geometry.headX + geometry.headWidth) +
                    ',' +
                    (y + 5)
                }
                fill={palette.base}
                stroke={CHARACTER_RENDER_RULES.silhouetteOutline}
                strokeWidth="1"
            />
        </>
    );
}

function SkeletonJaw({
    style,
    geometry,
    palette,
    view,
}: {
    style: GameAppearance['jaw_style'];
    geometry: Geometry;
    palette: Tone;
    view: CharacterView;
}) {
    if (style === 'missing' || view === 'back') return null;

    const width =
        style === 'cracked'
            ? Math.max(8, geometry.headWidth - 9)
            : Math.max(10, geometry.headWidth - 7);

    return (
        <>
            <PixelBlock
                x={
                    geometry.headX +
                    Math.floor((geometry.headWidth - width) / 2)
                }
                y={geometry.headY + geometry.headHeight - 2}
                width={width}
                height="5"
                fill={palette.base}
            />
            {style === 'cracked' && (
                <rect
                    x={geometry.headX + Math.floor(geometry.headWidth / 2)}
                    y={geometry.headY + geometry.headHeight - 1}
                    width="1"
                    height="4"
                    fill={CHARACTER_RENDER_RULES.castShadow}
                />
            )}
        </>
    );
}

function OgreEars({
    style,
    geometry,
    palette,
    view,
}: {
    style: GameAppearance['ear_style'];
    geometry: Geometry;
    palette: Tone;
    view: CharacterView;
}) {
    const y = geometry.headY + 8;

    if (view === 'side') {
        return (
            <PixelBlock
                x={geometry.headX - 4}
                y={y}
                width={style === 'torn' ? 5 : 6}
                height="5"
                fill={palette.base}
            />
        );
    }

    return (
        <>
            <PixelBlock
                x={geometry.headX - 4}
                y={y}
                width="6"
                height={style === 'torn' ? 4 : 5}
                fill={palette.base}
            />
            <PixelBlock
                x={geometry.headX + geometry.headWidth - 2}
                y={y}
                width="6"
                height={style === 'torn' ? 4 : 5}
                fill={palette.base}
            />
        </>
    );
}

function OgreJaw({
    style,
    geometry,
    palette,
    view,
}: {
    style: GameAppearance['jaw_style'];
    geometry: Geometry;
    palette: Tone;
    view: CharacterView;
}) {
    if (view === 'back') return null;

    const jawWidth = geometry.headWidth - 6;
    const x = geometry.headX + 3;
    const y = geometry.headY + geometry.headHeight - 1;

    return (
        <>
            <PixelBlock
                x={x}
                y={y}
                width={jawWidth}
                height="6"
                fill={palette.shadow}
            />
            {style === 'tusked' && (
                <>
                    <rect
                        x={x + 3}
                        y={y - 2}
                        width="2"
                        height="4"
                        fill={CHARACTER_PALETTE.bone.ivory.highlight}
                    />
                    <rect
                        x={x + jawWidth - 5}
                        y={y - 2}
                        width="2"
                        height="4"
                        fill={CHARACTER_PALETTE.bone.ivory.highlight}
                    />
                </>
            )}
        </>
    );
}

function OgreHorns({
    style,
    geometry,
    view,
}: {
    style: GameAppearance['horn_style'];
    geometry: Geometry;
    view: CharacterView;
}) {
    if (style === 'none') return null;

    const hornColor = CHARACTER_PALETTE.bone.aged.base;
    const y = geometry.headY + 1;
    const spread = style === 'swept' ? 8 : 5;

    if (view === 'side') {
        return (
            <polygon
                points={
                    geometry.headX +
                    5 +
                    ',' +
                    (y + 4) +
                    ' ' +
                    (geometry.headX - spread) +
                    ',' +
                    y +
                    ' ' +
                    (geometry.headX + 7) +
                    ',' +
                    (y + 7)
                }
                fill={hornColor}
                stroke={CHARACTER_RENDER_RULES.silhouetteOutline}
                strokeWidth="1"
            />
        );
    }

    return (
        <>
            <polygon
                points={
                    geometry.headX +
                    5 +
                    ',' +
                    (y + 4) +
                    ' ' +
                    (geometry.headX - spread) +
                    ',' +
                    y +
                    ' ' +
                    (geometry.headX + 7) +
                    ',' +
                    (y + 7)
                }
                fill={hornColor}
                stroke={CHARACTER_RENDER_RULES.silhouetteOutline}
                strokeWidth="1"
            />
            <polygon
                points={
                    geometry.headX +
                    geometry.headWidth -
                    5 +
                    ',' +
                    (y + 4) +
                    ' ' +
                    (geometry.headX + geometry.headWidth + spread) +
                    ',' +
                    y +
                    ' ' +
                    (geometry.headX + geometry.headWidth - 7) +
                    ',' +
                    (y + 7)
                }
                fill={hornColor}
                stroke={CHARACTER_RENDER_RULES.silhouetteOutline}
                strokeWidth="1"
            />
        </>
    );
}

function HairLayer({
    appearance,
    palette,
    view,
    geometry,
}: {
    appearance: GameAppearance;
    palette: Tone;
    view: CharacterView;
    geometry: Geometry;
}) {
    const style = appearance.hair_style;

    if (style === 'none') return null;

    const extra = geometry.headWidth > 22 ? 2 : 0;

    if (view === 'back') {
        return (
            <>
                <PixelBlock
                    x={geometry.headX - 1}
                    y={geometry.headY - 3}
                    width={geometry.headWidth + 2}
                    height={style === 'braid' ? 13 : 9}
                    fill={palette.base}
                />
                {style === 'braid' && (
                    <PixelBlock
                        x="29"
                        y={geometry.headY + 7}
                        width="6"
                        height="17"
                        fill={palette.shadow}
                    />
                )}
            </>
        );
    }

    if (view === 'side') {
        return (
            <>
                <PixelBlock
                    x={geometry.headX - 1}
                    y={geometry.headY - 3}
                    width={geometry.headWidth - 2}
                    height="8"
                    fill={palette.base}
                />
                <rect
                    x={geometry.headX + 2}
                    y={geometry.headY - 1}
                    width="7"
                    height="2"
                    fill={palette.highlight}
                />
                {style === 'braid' && (
                    <PixelBlock
                        x={geometry.headX}
                        y={geometry.headY + 3}
                        width="5"
                        height="18"
                        fill={palette.shadow}
                    />
                )}
            </>
        );
    }

    if (style === 'crest') {
        return (
            <>
                <PixelBlock
                    x={geometry.headX + 2}
                    y={geometry.headY - 4}
                    width={geometry.headWidth - 4}
                    height="7"
                    fill={palette.base}
                />
                <PixelBlock
                    x={29}
                    y={geometry.headY - 7}
                    width="7"
                    height="5"
                    fill={palette.base}
                />
            </>
        );
    }

    if (style === 'wild') {
        return (
            <>
                <PixelBlock
                    x={geometry.headX - 2}
                    y={geometry.headY - 3}
                    width={geometry.headWidth + 4}
                    height="8"
                    fill={palette.base}
                />
                <PixelBlock
                    x={geometry.headX - 4}
                    y={geometry.headY}
                    width="6"
                    height="10"
                    fill={palette.shadow}
                />
                <PixelBlock
                    x={geometry.headX + geometry.headWidth - 2}
                    y={geometry.headY}
                    width="6"
                    height="10"
                    fill={palette.base}
                />
                <rect
                    x={geometry.headX + 2}
                    y={geometry.headY - 1}
                    width={8 + extra}
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
                    x={geometry.headX - 1}
                    y={geometry.headY - 3}
                    width={geometry.headWidth + 2}
                    height="8"
                    fill={palette.base}
                />
                <PixelBlock
                    x={geometry.headX - 3}
                    y={geometry.headY + 1}
                    width="6"
                    height="14"
                    fill={palette.shadow}
                />
                <PixelBlock
                    x={geometry.headX - 5}
                    y={geometry.headY + 12}
                    width="6"
                    height="6"
                    fill={palette.base}
                />
            </>
        );
    }

    return (
        <>
            <PixelBlock
                x={geometry.headX - 1}
                y={geometry.headY - 3}
                width={geometry.headWidth + 2}
                height="8"
                fill={palette.base}
            />
            <PixelBlock
                x={geometry.headX - 1}
                y={geometry.headY + 1}
                width="6"
                height="7"
                fill={palette.shadow}
            />
            <rect
                x={geometry.headX + 3}
                y={geometry.headY - 1}
                width={8 + extra}
                height="2"
                fill={palette.highlight}
            />
        </>
    );
}

function WeaponLayer({
    item,
    view,
}: {
    item?: EquippedVisual;
    view: CharacterView;
}) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;
    const rare = item.rarity === 'rare' || item.rarity === 'epic';

    const x = view === 'back' ? 12 : view === 'side' ? 47 : 48;

    return (
        <g className="runeday-weapon-layer">
            <PixelBlock
                x={x}
                y={21}
                width={4}
                height={25}
                fill={CHARACTER_PALETTE.material.wood.base}
            />
            <rect
                x={x - 2}
                y="20"
                width="8"
                height="3"
                fill={CHARACTER_PALETTE.material.gold.base}
            />
            <PixelBlock x={x} y={6} width={6} height={17} fill={palette.base} />
            <rect
                x={x + 2}
                y="8"
                width="1"
                height="11"
                fill={palette.highlight}
            />
            {rare && (
                <rect x={x + 5} y="5" width="2" height="2" fill={accent} />
            )}
        </g>
    );
}

function ChestLayer({
    item,
    view,
    geometry,
}: {
    item?: EquippedVisual;
    view: CharacterView;
    geometry: Geometry;
}) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;

    const x = view === 'side' ? geometry.torsoX + 2 : geometry.torsoX - 1;
    const width =
        view === 'side'
            ? Math.max(12, geometry.torsoWidth - 3)
            : geometry.torsoWidth + 2;

    return (
        <>
            <PixelBlock
                x={x}
                y={24}
                width={width}
                height={19}
                fill={palette.base}
            />
            <rect
                x={x + 2}
                y="26"
                width={Math.max(5, width - 10)}
                height="2"
                fill={palette.highlight}
            />
            {view !== 'back' &&
                (item.visual_key.includes('runic') ||
                    item.rarity === 'epic') && (
                    <rect
                        x={x + Math.floor(width / 2) - 2}
                        y="32"
                        width="4"
                        height="4"
                        fill={accent}
                    />
                )}
        </>
    );
}

function HeadLayer({
    item,
    view,
    geometry,
}: {
    item?: EquippedVisual;
    view: CharacterView;
    geometry: Geometry;
}) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;
    const x = geometry.headX - 2;
    const width = geometry.headWidth + 4;

    if (item.visual_key.includes('crown')) {
        return (
            <>
                <rect
                    x={x}
                    y={geometry.headY - 1}
                    width={width}
                    height="4"
                    fill={palette.base}
                />
                <rect
                    x={x + 2}
                    y={geometry.headY - 5}
                    width="4"
                    height="5"
                    fill={palette.base}
                />
                <rect
                    x={31}
                    y={geometry.headY - 6}
                    width="4"
                    height="6"
                    fill={palette.base}
                />
                <rect
                    x={x + width - 6}
                    y={geometry.headY - 5}
                    width="4"
                    height="5"
                    fill={palette.base}
                />
                {view !== 'back' && (
                    <rect
                        x="32"
                        y={geometry.headY - 5}
                        width="2"
                        height="2"
                        fill={accent}
                    />
                )}
            </>
        );
    }

    if (item.visual_key.includes('circlet')) {
        return (
            <rect
                x={x + 1}
                y={geometry.headY + 3}
                width={width - 2}
                height="3"
                fill={palette.base}
            />
        );
    }

    return (
        <PixelBlock
            x={x}
            y={geometry.headY - 3}
            width={width}
            height="11"
            fill={palette.base}
        />
    );
}

function FeetLayer({
    item,
    view,
    geometry,
}: {
    item?: EquippedVisual;
    view: CharacterView;
    geometry: Geometry;
}) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const width = Math.max(7, geometry.legWidth + 3);

    return (
        <>
            <PixelBlock
                x={geometry.legLeftX - 2}
                y={52}
                width={width}
                height={7}
                fill={palette.base}
            />
            <PixelBlock
                x={geometry.legRightX - 1}
                y={52}
                width={width}
                height={7}
                fill={palette.base}
            />
            {view !== 'back' && (
                <rect
                    x={geometry.legLeftX}
                    y="53"
                    width="4"
                    height="1"
                    fill={palette.highlight}
                />
            )}
        </>
    );
}

function BackLayer({
    item,
    view,
    geometry,
}: {
    item?: EquippedVisual;
    view: CharacterView;
    geometry: Geometry;
}) {
    if (!item) return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));

    if (item.visual_key.includes('satchel')) {
        return (
            <PixelBlock
                x={view === 'side' ? 20 : 14}
                y={29}
                width="10"
                height="14"
                fill={palette.base}
            />
        );
    }

    const width = geometry.torsoWidth + (view === 'side' ? 5 : 8);
    const x =
        view === 'side' ? geometry.torsoX - 5 : 32 - Math.floor(width / 2);

    return (
        <>
            <PixelBlock
                x={x}
                y={23}
                width={width}
                height={27}
                fill={palette.base}
            />
            <rect
                x={x + 2}
                y="25"
                width={Math.max(5, width - 15)}
                height="2"
                fill={palette.highlight}
            />
            <rect x={x} y="42" width={width} height="8" fill={palette.shadow} />
        </>
    );
}

function AccessoryLayer({
    item,
    view,
}: {
    item?: EquippedVisual;
    view: CharacterView;
}) {
    if (!item || view === 'back') return null;

    const palette = materialPalette(equipmentMaterial(item.visual_key));
    const accent = CHARACTER_RARITY_RULES[item.rarity].accent;
    const x = view === 'side' ? 37 : 30;

    return (
        <>
            <rect x={x} y="34" width="4" height="4" fill={accent} />
            <rect x={x + 1} y="38" width="2" height="4" fill={palette.base} />
        </>
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
    x: number | string;
    y: number | string;
    width: number | string;
    height: number | string;
    fill: string;
    outline?: string;
}) {
    const nx = Number(x);
    const ny = Number(y);
    const nwidth = Number(width);
    const nheight = Number(height);

    return (
        <>
            <rect
                x={nx}
                y={ny}
                width={nwidth}
                height={nheight}
                fill={outline}
            />
            <rect
                x={nx + 1}
                y={ny + 1}
                width={Math.max(1, nwidth - 2)}
                height={Math.max(1, nheight - 2)}
                fill={fill}
            />
        </>
    );
}

function DebugOverlay({
    mode,
    frame,
}: {
    mode: CharacterSpriteDebug;
    frame: GameAppearance['body'];
}) {
    if (mode === 'bounds') {
        const bounds =
            CHARACTER_SYSTEM.frames[normalizeBodyFrame(frame)].heroBounds;

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
                        opacity="0.85"
                    />
                </g>
            ))}
        </>
    );
}

function bodyPaletteFor(
    lineage: CharacterLineage,
    appearance: GameAppearance,
): Tone {
    if (lineage === 'skeleton') {
        return (
            CHARACTER_PALETTE.bone[
                appearance.bone_tone as keyof typeof CHARACTER_PALETTE.bone
            ] ?? CHARACTER_PALETTE.bone.ivory
        );
    }

    return (
        CHARACTER_PALETTE.skin[
            appearance.skin_tone as keyof typeof CHARACTER_PALETTE.skin
        ] ?? CHARACTER_PALETTE.skin.bronze
    );
}

function geometryFor(frame: GameAppearance['body']): Geometry {
    const normalized = normalizeBodyFrame(frame);

    if (normalized === 'lean') {
        return {
            torsoX: 24,
            torsoWidth: 16,
            armLeftX: 18,
            armRightX: 39,
            armWidth: 7,
            legLeftX: 23,
            legRightX: 35,
            legWidth: 7,
            headX: 22,
            headWidth: 20,
            headY: 10,
            headHeight: 17,
        };
    }

    if (normalized === 'heavy') {
        return {
            torsoX: 20,
            torsoWidth: 24,
            armLeftX: 13,
            armRightX: 43,
            armWidth: 10,
            legLeftX: 20,
            legRightX: 35,
            legWidth: 10,
            headX: 19,
            headWidth: 26,
            headY: 9,
            headHeight: 18,
        };
    }

    return {
        torsoX: 23,
        torsoWidth: 18,
        armLeftX: 17,
        armRightX: 38,
        armWidth: 9,
        legLeftX: 22,
        legRightX: 34,
        legWidth: 9,
        headX: 22,
        headWidth: 20,
        headY: 10,
        headHeight: 17,
    };
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
