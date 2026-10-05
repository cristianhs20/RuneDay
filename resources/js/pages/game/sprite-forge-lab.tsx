import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clapperboard, Palette, Shirt, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ForgeSprite } from '@/components/game/forge-sprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CHARACTER_LINEAGES,
    lineageConfig,
    lineageDefaults,
    lineageOptions,
} from '@/game/character-system';
import {
    FORGE_ENGINE_VERSION,
    type ForgeCharacter,
} from '@/game/forge/compose';
import { FORGE_ITEM_CATALOG } from '@/game/forge/gear';
import { STATE_TIMING, type ForgeState } from '@/game/forge/rig';
import type {
    CharacterLineage,
    CharacterView,
    GameAppearance,
    GameCharacter,
} from '@/types/game';

const views: CharacterView[] = ['front', 'side', 'back'];
const states = Object.keys(STATE_TIMING) as ForgeState[];
const archetypes: GameCharacter['archetype'][] = [
    'wanderer',
    'warden',
    'rogue',
    'arcanist',
];
const slots = [
    'weapon',
    'head',
    'chest',
    'shoulder',
    'legs',
    'feet',
    'back',
    'accessory',
] as const;

const presets: Record<
    string,
    Partial<Record<(typeof slots)[number], string>>
> = {
    Starter: {
        weapon: 'weapon_training_sword',
        chest: 'chest_linen_tunic',
        feet: 'feet_simple_boots',
    },
    Ranger: {
        weapon: 'weapon_mossblade',
        head: 'head_scout_hood',
        chest: 'chest_ranger_vest',
        feet: 'feet_trail_boots',
        back: 'back_adventurer_cape',
    },
    'Iron & Gold': {
        weapon: 'weapon_moonsteel_blade',
        head: 'head_azure_circlet',
        chest: 'v3_armor_chest_10',
        shoulder: 'v3_armor_shoulder_4',
        legs: 'v3_armor_greave_16',
        feet: 'feet_shadow_boots',
        accessory: 'accessory_emerald_token',
    },
    Legendary: {
        weapon: 'weapon_emberfang',
        head: 'head_crown_of_dawn',
        chest: 'chest_dragonplate',
        shoulder: 'v3_armor_shoulder_7',
        feet: 'feet_voidwalkers',
        back: 'back_phoenix_mantle',
        accessory: 'accessory_astral_sigil',
    },
    None: {},
};

function label(value: string): string {
    return value
        .replace(/^(weapon|head|chest|feet|back|accessory)_/, '')
        .replace(/^v3_armor_(\w+?)_(\d+)$/, 'iron gold $1 $2')
        .replaceAll('_', ' ');
}

function equipmentFrom(
    selection: Partial<Record<string, string>>,
): ForgeCharacter['equipment'] {
    return Object.fromEntries(
        Object.entries(selection)
            .filter(([, key]) => Boolean(key))
            .map(([slot, key]) => [slot, { visual_key: key as string }]),
    );
}

function Chips<T extends string>({
    values,
    value,
    onChange,
    format = label,
}: {
    values: readonly T[];
    value: T | undefined;
    onChange: (value: T) => void;
    format?: (value: T) => string;
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {values.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={
                        'rounded-full border px-3 py-1 text-xs capitalize transition ' +
                        (option === value
                            ? 'border-foreground bg-foreground text-background'
                            : 'hover:bg-muted')
                    }
                >
                    {format(option)}
                </button>
            ))}
        </div>
    );
}

export default function SpriteForgeLab() {
    const [lineage, setLineage] = useState<CharacterLineage>('human');
    const [appearance, setAppearance] = useState<GameAppearance>(
        () => lineageDefaults('human') as unknown as GameAppearance,
    );
    const [archetype, setArchetype] =
        useState<GameCharacter['archetype']>('wanderer');
    const [gear, setGear] = useState<Partial<Record<string, string>>>(
        presets.Starter,
    );
    const [view, setView] = useState<CharacterView>('front');
    const [state, setState] = useState<ForgeState>('idle');

    const options = lineageOptions(lineage);
    const frames = lineageConfig(lineage).allowedFrames as string[];

    const character: ForgeCharacter = useMemo(
        () => ({
            lineage,
            archetype,
            appearance,
            equipment: equipmentFrom(gear),
        }),
        [lineage, archetype, appearance, gear],
    );

    const lineup = useMemo(
        () =>
            CHARACTER_LINEAGES.map((id) => ({
                id,
                character: {
                    lineage: id,
                    archetype,
                    appearance: lineageDefaults(
                        id,
                    ) as unknown as GameAppearance,
                    equipment: equipmentFrom(gear),
                } satisfies ForgeCharacter,
            })),
        [archetype, gear],
    );

    const chooseLineage = (next: CharacterLineage) => {
        setLineage(next);
        setAppearance(lineageDefaults(next) as unknown as GameAppearance);
    };

    const setTrait = (key: keyof GameAppearance, value: string) =>
        setAppearance((current) => ({ ...current, [key]: value }));

    const timing = STATE_TIMING[state];

    return (
        <>
            <Head title="Sprite Forge Lab" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Character Engine · Sprite Forge v
                            {FORGE_ENGINE_VERSION}
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Sprite Forge Lab
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
                            One rig-driven pixel engine for Human, Elf, Skeleton
                            and Orc. Every lineage, view, animation and item is
                            composed on the same 64×64 grid, so gear fits every
                            body without per-sprite offsets.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/character">
                            <ArrowLeft className="size-4" /> Hero
                        </Link>
                    </Button>
                </header>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <Card className="overflow-hidden rounded-3xl">
                        <CardContent className="p-0">
                            <div className="flex min-h-[420px] items-center justify-center bg-zinc-950 p-6">
                                <ForgeSprite
                                    character={character}
                                    view={view}
                                    state={state}
                                    className="size-96 max-w-full"
                                />
                            </div>
                            <div className="grid gap-3 border-t p-4">
                                <Chips
                                    values={views}
                                    value={view}
                                    onChange={setView}
                                />
                                <Chips
                                    values={states}
                                    value={state}
                                    onChange={setState}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Palette className="size-4" /> Lineage &
                                    look
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Chips
                                    values={CHARACTER_LINEAGES}
                                    value={lineage}
                                    onChange={chooseLineage}
                                    format={(id) => lineageConfig(id).label}
                                />
                                <div className="space-y-1.5">
                                    <p className="text-muted-foreground text-xs">
                                        Body frame
                                    </p>
                                    <Chips
                                        values={frames}
                                        value={appearance.body}
                                        onChange={(value) =>
                                            setTrait('body', value)
                                        }
                                    />
                                </div>
                                {Object.entries(options)
                                    .filter(([, values]) => values.length > 1)
                                    .map(([key, values]) => (
                                        <div key={key} className="space-y-1.5">
                                            <p className="text-muted-foreground text-xs capitalize">
                                                {key.replaceAll('_', ' ')}
                                            </p>
                                            <Chips
                                                values={values}
                                                value={
                                                    appearance[
                                                        key as keyof GameAppearance
                                                    ]
                                                }
                                                onChange={(value) =>
                                                    setTrait(
                                                        key as keyof GameAppearance,
                                                        value,
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                <div className="space-y-1.5">
                                    <p className="text-muted-foreground text-xs">
                                        Archetype
                                    </p>
                                    <Chips
                                        values={archetypes}
                                        value={archetype}
                                        onChange={setArchetype}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Shirt className="size-4" /> Equipment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Chips
                                    values={Object.keys(presets)}
                                    value={undefined}
                                    onChange={(name) => setGear(presets[name])}
                                    format={(name) => name}
                                />
                                {slots.map((slot) => (
                                    <div key={slot} className="space-y-1.5">
                                        <p className="text-muted-foreground text-xs capitalize">
                                            {slot}
                                        </p>
                                        <Chips
                                            values={[
                                                'none',
                                                ...(FORGE_ITEM_CATALOG[slot] ??
                                                    []),
                                            ]}
                                            value={gear[slot] ?? 'none'}
                                            onChange={(value) =>
                                                setGear((current) => ({
                                                    ...current,
                                                    [slot]:
                                                        value === 'none'
                                                            ? undefined
                                                            : value,
                                                }))
                                            }
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="size-4" /> Same gear, every
                            lineage
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {lineup.map(({ id, character: hero }) => (
                            <div
                                key={id}
                                className="rounded-2xl bg-zinc-950 p-3 text-center text-white"
                            >
                                <div className="flex justify-center">
                                    {views.map((v) => (
                                        <ForgeSprite
                                            key={v}
                                            character={hero}
                                            view={v}
                                            state={state}
                                            className="size-32"
                                        />
                                    ))}
                                </div>
                                <p className="mt-2 text-sm font-medium">
                                    {lineageConfig(id).label}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clapperboard className="size-4" /> Frames · {state}{' '}
                            · {timing.frames} frames @ {timing.fps} fps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {Array.from({ length: timing.frames }, (_, i) => (
                            <div
                                key={i}
                                className="rounded-xl bg-zinc-950 p-1 text-center text-[10px] text-zinc-400"
                            >
                                <ForgeSprite
                                    character={character}
                                    view={view}
                                    state={state}
                                    frame={i}
                                    className="size-32"
                                />
                                {i + 1}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
