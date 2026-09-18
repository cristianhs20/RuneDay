import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Grid3X3,
    Layers3,
    Palette,
    Ruler,
    Sparkles,
} from 'lucide-react';
import {
    CharacterSprite,
    type CharacterSpriteDebug,
    type CharacterSpriteState,
} from '@/components/game/character-sprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CHARACTER_ANCHORS,
    CHARACTER_ANIMATION_RULES,
    CHARACTER_ASSET_NAMING,
    CHARACTER_CANVAS,
    CHARACTER_LAYER_ORDER,
    CHARACTER_MATERIAL_RULES,
    CHARACTER_PALETTE,
    CHARACTER_RARITY_RULES,
    CHARACTER_STYLE_ID,
    CHARACTER_STYLE_VERSION,
} from '@/game/character-style';
import type {
    EquippedVisual,
    GameAppearance,
    GameCharacter,
} from '@/types/game';

const baseAppearance: GameAppearance = {
    body: 'type_a',
    skin_tone: 'bronze',
    hair_style: 'short',
    hair_color: 'onyx',
    eye_color: 'emerald',
};

const emptyStats = {
    power: 0,
    guard: 0,
    focus: 0,
    luck: 0,
    gear_score: 0,
};

const sets = {
    starter: {
        weapon: item(
            1,
            'training-sword',
            'Training Sword',
            'common',
            'weapon_training_sword',
        ),
        chest: item(
            2,
            'linen-tunic',
            'Linen Tunic',
            'common',
            'chest_linen_tunic',
        ),
        feet: item(
            3,
            'simple-boots',
            'Simple Boots',
            'common',
            'feet_simple_boots',
        ),
    },
    rare: {
        weapon: item(
            11,
            'moonsteel-blade',
            'Moonsteel Blade',
            'rare',
            'weapon_moonsteel_blade',
        ),
        head: item(
            12,
            'azure-circlet',
            'Azure Circlet',
            'rare',
            'head_azure_circlet',
        ),
        chest: item(
            13,
            'runic-armor',
            'Runic Armor',
            'rare',
            'chest_runic_armor',
        ),
        feet: item(
            14,
            'shadow-boots',
            'Shadow Boots',
            'rare',
            'feet_shadow_boots',
        ),
        back: item(15, 'starcloak', 'Starcloak', 'rare', 'back_starcloak'),
        accessory: item(
            16,
            'lucky-rune',
            'Lucky Rune',
            'rare',
            'accessory_lucky_rune',
        ),
    },
    epic: {
        weapon: item(21, 'emberfang', 'Emberfang', 'epic', 'weapon_emberfang'),
        head: item(
            22,
            'crown-of-dawn',
            'Crown of Dawn',
            'epic',
            'head_crown_of_dawn',
        ),
        chest: item(
            23,
            'dragonplate',
            'Dragonplate',
            'epic',
            'chest_dragonplate',
        ),
        feet: item(
            24,
            'voidwalkers',
            'Voidwalkers',
            'epic',
            'feet_voidwalkers',
        ),
        back: item(
            25,
            'phoenix-mantle',
            'Phoenix Mantle',
            'epic',
            'back_phoenix_mantle',
        ),
        accessory: item(
            26,
            'astral-sigil',
            'Astral Sigil',
            'epic',
            'accessory_astral_sigil',
        ),
    },
} satisfies Record<string, Record<string, EquippedVisual>>;

export default function CharacterStyleLab() {
    return (
        <>
            <Head title="Character Style Lab" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Character Engine · Phase A
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            RuneDay Character Style Lab
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
                            Production reference for RuneDay Heroic Compact
                            Fantasy. Future sprites, equipment and animation
                            must be judged against this system before shipping.
                        </p>
                    </div>

                    <Button asChild variant="outline">
                        <Link href="/character">
                            <ArrowLeft />
                            Back to Hero
                        </Link>
                    </Button>
                </header>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Fact
                        icon={<Grid3X3 />}
                        label="Canvas"
                        value={
                            CHARACTER_CANVAS.width +
                            '×' +
                            CHARACTER_CANVAS.height
                        }
                    />
                    <Fact
                        icon={<Ruler />}
                        label="Baseline"
                        value={'Y ' + CHARACTER_CANVAS.baselineY}
                    />
                    <Fact
                        icon={<Layers3 />}
                        label="Layers"
                        value={CHARACTER_LAYER_ORDER.length}
                    />
                    <Fact
                        icon={<Sparkles />}
                        label="Style"
                        value={'v' + CHARACTER_STYLE_VERSION}
                    />
                </section>

                <Card className="overflow-hidden rounded-3xl">
                    <CardHeader>
                        <CardTitle>Canonical silhouette</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="grid gap-4 bg-zinc-950 p-6 text-white sm:grid-cols-2 lg:grid-cols-4">
                            {(
                                [
                                    'wanderer',
                                    'warden',
                                    'rogue',
                                    'arcanist',
                                ] as const
                            ).map((archetype) => (
                                <SpriteReference
                                    key={archetype}
                                    label={capitalize(archetype)}
                                    character={previewCharacter({
                                        archetype,
                                    })}
                                />
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Rule
                                title="One silhouette family"
                                text="All playable heroes use the same 64×64 skeleton, baseline and equipment anchors. Body variants may alter mass, never sockets."
                            />
                            <Rule
                                title="Heroic compact proportion"
                                text="Target ~3 heads tall: readable and friendly, but substantial enough for armor, capes and high-rarity silhouettes."
                            />
                            <Rule
                                title="Top-left light"
                                text="Highlight clusters always describe light from roughly 10 o'clock. A piece with opposite lighting fails QA."
                            />
                            <Rule
                                title="Three-tone discipline"
                                text="Shadow + base + highlight is the normal material budget. Extra colors belong to accents or effects, not random shading."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Body frames & anchor contract</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 lg:grid-cols-[1fr_1fr_340px]">
                        <DebugReference
                            title="Frame A · broad"
                            body="type_a"
                            debug="bounds"
                        />
                        <DebugReference
                            title="Frame B · lean"
                            body="type_b"
                            debug="anchors"
                        />
                        <div className="space-y-3">
                            {Object.entries(CHARACTER_ANCHORS).map(
                                ([name, point]) => (
                                    <div
                                        key={name}
                                        className="flex items-center justify-between rounded-xl border px-3 py-2"
                                    >
                                        <span className="text-sm font-medium">
                                            {humanize(name)}
                                        </span>
                                        <span className="text-muted-foreground font-mono text-xs">
                                            {point.x}, {point.y}
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>

                <section className="grid gap-6 xl:grid-cols-2">
                    <PaletteCard />
                    <MaterialCard />
                </section>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Rarity language</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                        {Object.entries(CHARACTER_RARITY_RULES).map(
                            ([rarity, rule]) => (
                                <div
                                    key={rarity}
                                    className="rounded-2xl border p-4"
                                >
                                    <div
                                        className="h-10 rounded-xl border"
                                        style={{
                                            backgroundColor: rule.accent,
                                        }}
                                    />
                                    <p className="mt-3 font-semibold capitalize">
                                        {rarity}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        FX budget {rule.fxBudget} · silhouette{' '}
                                        {rule.silhouetteComplexity}
                                    </p>
                                </div>
                            ),
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl">
                    <CardHeader>
                        <CardTitle>Equipment progression check</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 bg-zinc-950 p-6 text-white md:grid-cols-3">
                        <SpriteReference
                            label="Starter"
                            character={previewCharacter({
                                equipment: sets.starter,
                            })}
                        />
                        <SpriteReference
                            label="Rare"
                            character={previewCharacter({
                                equipment: sets.rare,
                                archetype: 'arcanist',
                                appearance: {
                                    ...baseAppearance,
                                    hair_style: 'braid',
                                    hair_color: 'silver',
                                    eye_color: 'azure',
                                },
                            })}
                        />
                        <SpriteReference
                            label="Epic"
                            character={previewCharacter({
                                equipment: sets.epic,
                                archetype: 'warden',
                                appearance: {
                                    ...baseAppearance,
                                    body: 'type_b',
                                    hair_style: 'crest',
                                    hair_color: 'ember',
                                    eye_color: 'amber',
                                },
                            })}
                        />
                    </CardContent>
                </Card>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Motion contract</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
                        <div className="grid gap-4 bg-zinc-950 p-5 text-white sm:grid-cols-3">
                            {(
                                [
                                    'idle',
                                    'attack',
                                    'celebrate',
                                ] satisfies CharacterSpriteState[]
                            ).map((state) => (
                                <SpriteReference
                                    key={state}
                                    label={capitalize(state)}
                                    state={state}
                                    character={previewCharacter({
                                        equipment: sets.rare,
                                    })}
                                />
                            ))}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            {Object.entries(CHARACTER_ANIMATION_RULES).map(
                                ([animation, rule]) => (
                                    <div
                                        key={animation}
                                        className="rounded-xl border p-3"
                                    >
                                        <p className="font-medium capitalize">
                                            {animation}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {rule.targetFrames} frames ·{' '}
                                            {rule.fps} FPS · max root travel{' '}
                                            {rule.maxRootTravelPx}px ·{' '}
                                            {rule.loop ? 'loop' : 'one-shot'}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>

                <section className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>Layer order</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {CHARACTER_LAYER_ORDER.map((layer, index) => (
                                <div
                                    key={layer}
                                    className="rounded-xl border p-3"
                                >
                                    <span className="text-muted-foreground text-[10px] font-semibold">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <p className="mt-1 text-sm font-medium">
                                        {humanize(layer)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>Production contract</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Rule
                                title="No anti-aliasing"
                                text="Pixels must remain hard-edged. Never export bicubic/bilinear sprite assets."
                            />
                            <Rule
                                title="Integer scaling only"
                                text="1×, 2×, 3×, 4×… Never 1.25× or 1.5× in raster production."
                            />
                            <Rule
                                title="No gradients inside sprite assets"
                                text="Depth comes from pixel clusters and controlled tonal ramps."
                            />
                            <Rule
                                title="Naming is machine-readable"
                                text={
                                    CHARACTER_ASSET_NAMING.pattern +
                                    ' · e.g. ' +
                                    CHARACTER_ASSET_NAMING.example
                                }
                            />
                        </CardContent>
                    </Card>
                </section>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Phase A acceptance checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 md:grid-cols-2">
                        {[
                            'One canonical style direction selected',
                            '64×64 canvas and baseline locked',
                            'Playable hero bounds locked',
                            'Equipment anchors locked',
                            'Layer order versioned',
                            'Skin/hair/eye palettes versioned',
                            'Material ramps versioned',
                            'Rarity visual language defined',
                            'Animation timing targets defined',
                            'Naming convention defined',
                            'Renderer consumes style tokens',
                            'Debug bounds/anchors available',
                            'Visual reference lab available',
                            'QA and production docs versioned',
                        ].map((entry) => (
                            <div
                                key={entry}
                                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                            >
                                <Check className="size-4 text-emerald-500" />
                                {entry}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <p className="text-muted-foreground text-center text-xs">
                    {CHARACTER_STYLE_ID} · style v{CHARACTER_STYLE_VERSION} ·
                    source of truth:{' '}
                    <code>resources/js/game/character-style.ts</code>
                </p>
            </div>
        </>
    );
}

function PaletteCard() {
    return (
        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="size-4" />
                    Character palettes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <SwatchGroup title="Skin" values={CHARACTER_PALETTE.skin} />
                <SwatchGroup title="Hair" values={CHARACTER_PALETTE.hair} />
                <div>
                    <p className="mb-2 text-sm font-medium">Eyes</p>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(CHARACTER_PALETTE.eyes).map(
                            ([name, color]) => (
                                <div
                                    key={name}
                                    className="rounded-xl border p-2"
                                >
                                    <div
                                        className="h-8 rounded-lg"
                                        style={{ backgroundColor: color }}
                                    />
                                    <p className="text-muted-foreground mt-1 truncate text-[10px] capitalize">
                                        {name}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MaterialCard() {
    return (
        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle>Material library v1</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
                {Object.entries(CHARACTER_PALETTE.material).map(
                    ([name, colors]) => {
                        const family = materialFamily(name);
                        const rule = CHARACTER_MATERIAL_RULES[family];

                        return (
                            <div key={name} className="rounded-xl border p-3">
                                <div className="grid h-8 grid-cols-3 overflow-hidden rounded-lg">
                                    <div
                                        style={{
                                            backgroundColor: colors.shadow,
                                        }}
                                    />
                                    <div
                                        style={{
                                            backgroundColor: colors.base,
                                        }}
                                    />
                                    <div
                                        style={{
                                            backgroundColor: colors.highlight,
                                        }}
                                    />
                                </div>
                                <div className="mt-2 flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {humanize(name)}
                                        </p>
                                        <p className="text-muted-foreground text-[10px]">
                                            {family} · {rule.specular}
                                        </p>
                                    </div>
                                    <span className="text-muted-foreground text-[10px]">
                                        {rule.tones} tones
                                    </span>
                                </div>
                            </div>
                        );
                    },
                )}
            </CardContent>
        </Card>
    );
}

function SwatchGroup({
    title,
    values,
}: {
    title: string;
    values: Record<string, { shadow: string; base: string; highlight: string }>;
}) {
    return (
        <div>
            <p className="mb-2 text-sm font-medium">{title}</p>
            <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(values).map(([name, colors]) => (
                    <div key={name} className="rounded-xl border p-2">
                        <div className="grid h-8 grid-cols-3 overflow-hidden rounded-lg">
                            <div
                                style={{
                                    backgroundColor: colors.shadow,
                                }}
                            />
                            <div
                                style={{
                                    backgroundColor: colors.base,
                                }}
                            />
                            <div
                                style={{
                                    backgroundColor: colors.highlight,
                                }}
                            />
                        </div>
                        <p className="text-muted-foreground mt-1 text-[10px] capitalize">
                            {name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DebugReference({
    title,
    body,
    debug,
}: {
    title: string;
    body: GameAppearance['body'];
    debug: CharacterSpriteDebug;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border">
            <div className="flex min-h-80 items-center justify-center bg-zinc-950 p-5 text-white">
                <CharacterSprite
                    character={previewCharacter({
                        appearance: {
                            ...baseAppearance,
                            body,
                        },
                        equipment: sets.starter,
                    })}
                    debug={debug}
                    className="size-64"
                />
            </div>
            <div className="p-3">
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                    Debug overlay: {debug}
                </p>
            </div>
        </div>
    );
}

function SpriteReference({
    label,
    character,
    state = 'idle',
}: {
    label: string;
    character: GameCharacter;
    state?: CharacterSpriteState;
}) {
    return (
        <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-3">
            <CharacterSprite
                character={character}
                state={state}
                className="size-40"
            />
            <p className="mt-2 text-sm font-medium">{label}</p>
        </div>
    );
}

function Fact({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}) {
    return (
        <div className="bg-card flex items-center gap-3 rounded-2xl border p-4">
            <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                {icon}
            </div>
            <div>
                <p className="font-semibold">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
            </div>
        </div>
    );
}

function Rule({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-2xl border p-4">
            <p className="font-medium">{title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{text}</p>
        </div>
    );
}

function item(
    id: number,
    slug: string,
    name: string,
    rarity: EquippedVisual['rarity'],
    visualKey: string,
): EquippedVisual {
    return {
        inventory_item_id: id,
        slug,
        name,
        rarity,
        visual_key: visualKey,
        stats: {},
    };
}

function previewCharacter(
    overrides: {
        appearance?: GameAppearance;
        archetype?: GameCharacter['archetype'];
        equipment?: Record<string, EquippedVisual>;
    } = {},
): GameCharacter {
    return {
        created: true,
        name: 'Rune',
        archetype: overrides.archetype ?? 'wanderer',
        appearance: overrides.appearance ?? baseAppearance,
        level: 1,
        xp: 0,
        total_xp: 0,
        gold: 0,
        equipment: overrides.equipment ?? {},
        stats: emptyStats,
    };
}

function materialFamily(name: string): keyof typeof CHARACTER_MATERIAL_RULES {
    if (name.includes('leather') || name === 'darkLeather') {
        return 'leather';
    }
    if (name.includes('cloth')) return 'cloth';
    if (
        name.includes('steel') ||
        name === 'iron' ||
        name === 'gold' ||
        name === 'bronze'
    ) {
        return 'metal';
    }
    if (name === 'wood') return 'wood';

    return 'magic';
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function humanize(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (letter) => letter.toUpperCase());
}
