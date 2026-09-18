import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import {
    CharacterSprite,
    type CharacterSpriteState,
} from '@/components/game/character-sprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CHARACTER_LINEAGES,
    CHARACTER_SYSTEM,
    frameConfig,
    lineageConfig,
    lineageDefaults,
} from '@/game/character-system';
import type {
    CharacterLineage,
    CharacterView,
    EquippedVisual,
    GameAppearance,
    GameCharacter,
} from '@/types/game';

const views: CharacterView[] = ['front', 'side', 'back'];
const states: CharacterSpriteState[] = [
    'idle',
    'walk',
    'attack',
    'cast',
    'celebrate',
    'hurt',
];

const stressEquipment: Record<string, EquippedVisual> = {
    weapon: item(91, 'emberfang', 'Emberfang', 'epic', 'weapon_emberfang'),
    head: item(
        92,
        'crown-of-dawn',
        'Crown of Dawn',
        'epic',
        'head_crown_of_dawn',
    ),
    chest: item(93, 'dragonplate', 'Dragonplate', 'epic', 'chest_dragonplate'),
    feet: item(94, 'voidwalkers', 'Voidwalkers', 'epic', 'feet_voidwalkers'),
    back: item(
        95,
        'phoenix-mantle',
        'Phoenix Mantle',
        'epic',
        'back_phoenix_mantle',
    ),
    accessory: item(
        96,
        'astral-sigil',
        'Astral Sigil',
        'epic',
        'accessory_astral_sigil',
    ),
};

export default function CharacterLineageLab() {
    return (
        <>
            <Head title="Lineage Lab" />
            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Character Engine · Phase B
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Humanoid Rig & Lineage Lab
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
                            B1–B5 acceptance environment. Human, Elf, Skeleton
                            and Ogre must remain compatible with the same
                            RuneDay equipment sockets across three views and all
                            six core animation states.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/character/style-lab">Style Lab</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/character">
                                <ArrowLeft />
                                Hero
                            </Link>
                        </Button>
                    </div>
                </header>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Fact label="Rig" value={CHARACTER_SYSTEM.rig.id} />
                    <Fact label="Lineages" value={CHARACTER_LINEAGES.length} />
                    <Fact label="Views" value={CHARACTER_SYSTEM.views.length} />
                    <Fact
                        label="Animations"
                        value={CHARACTER_SYSTEM.animations.length}
                    />
                    <Fact
                        label="System"
                        value={'v' + CHARACTER_SYSTEM.version}
                    />
                </section>

                <Card className="overflow-hidden rounded-3xl">
                    <CardHeader>
                        <CardTitle>B1 · Canonical Humanoid Rig</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid gap-px bg-white/10 xl:grid-cols-4">
                            {CHARACTER_LINEAGES.map((lineage) => (
                                <div
                                    key={lineage}
                                    className="bg-zinc-950 p-5 text-white"
                                >
                                    <p className="text-sm font-semibold">
                                        {lineageConfig(lineage).label}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {
                                            lineageConfig(lineage)
                                                .equipmentCompatibility
                                        }
                                    </p>
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {views.map((view) => (
                                            <div
                                                key={view}
                                                className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-2"
                                            >
                                                <CharacterSprite
                                                    character={character(
                                                        lineage,
                                                    )}
                                                    view={view}
                                                    className="size-28"
                                                />
                                                <span className="mt-1 text-[10px] text-zinc-500 capitalize">
                                                    {view}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>B2 · Compatibility matrix</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[620px] text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-3 py-2 text-left">
                                                Lineage
                                            </th>
                                            {Object.entries(
                                                CHARACTER_SYSTEM.frames,
                                            ).map(([frame, config]) => (
                                                <th
                                                    key={frame}
                                                    className="px-3 py-2 text-center"
                                                >
                                                    {config.label}
                                                </th>
                                            ))}
                                            <th className="px-3 py-2 text-left">
                                                Equipment
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {CHARACTER_LINEAGES.map((lineage) => {
                                            const config =
                                                lineageConfig(lineage);

                                            return (
                                                <tr
                                                    key={lineage}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="px-3 py-3 font-medium">
                                                        {config.label}
                                                    </td>
                                                    {Object.keys(
                                                        CHARACTER_SYSTEM.frames,
                                                    ).map((frame) => (
                                                        <td
                                                            key={frame}
                                                            className="px-3 py-3 text-center"
                                                        >
                                                            {config.allowedFrames.includes(
                                                                frame as never,
                                                            ) ? (
                                                                <Check className="mx-auto size-4 text-emerald-500" />
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td className="px-3 py-3 text-xs">
                                                        {
                                                            config.equipmentCompatibility
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                {CHARACTER_SYSTEM.equipmentSlots.map((slot) => (
                                    <div
                                        key={slot}
                                        className="flex items-center gap-2 rounded-xl border px-3 py-2"
                                    >
                                        <ShieldCheck className="size-4 text-emerald-500" />
                                        <span className="text-sm capitalize">
                                            {slot}
                                        </span>
                                        <span className="text-muted-foreground ml-auto text-[10px]">
                                            shared
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>B3 · Canonical lineages</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {CHARACTER_LINEAGES.map((lineage) => {
                                const config = lineageConfig(lineage);

                                return (
                                    <div
                                        key={lineage}
                                        className="rounded-2xl border p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-950 text-xs font-bold text-white">
                                                {config.label
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {config.label}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    Default:{' '}
                                                    {
                                                        frameConfig(
                                                            config.defaultFrame,
                                                        ).label
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground mt-3 text-sm">
                                            {config.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </section>

                <Card className="overflow-hidden rounded-3xl">
                    <CardHeader>
                        <CardTitle>B4 · Personalization stress</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 bg-zinc-950 p-5 text-white md:grid-cols-2 xl:grid-cols-4">
                        {CHARACTER_LINEAGES.map((lineage) => (
                            <div
                                key={lineage}
                                className="rounded-2xl border border-white/10 bg-white/5 p-3"
                            >
                                <p className="font-medium">
                                    {lineageConfig(lineage).label}
                                </p>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {personalizationVariants(lineage).map(
                                        (appearance, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-center rounded-xl border border-white/10 bg-black/20 p-2"
                                            >
                                                <CharacterSprite
                                                    character={character(
                                                        lineage,
                                                        appearance,
                                                    )}
                                                    className="size-32"
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl">
                    <CardHeader>
                        <CardTitle>
                            B5 · Animation + equipment stress test
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-[1180px]">
                                <div className="bg-muted/20 grid grid-cols-[130px_repeat(6,1fr)] border-b">
                                    <div className="p-3 text-xs font-semibold tracking-wide uppercase">
                                        Lineage
                                    </div>
                                    {states.map((state) => (
                                        <div
                                            key={state}
                                            className="p-3 text-center text-xs font-semibold capitalize"
                                        >
                                            {state}
                                        </div>
                                    ))}
                                </div>

                                {CHARACTER_LINEAGES.map((lineage) => (
                                    <div
                                        key={lineage}
                                        className="grid grid-cols-[130px_repeat(6,1fr)] border-b last:border-0"
                                    >
                                        <div className="flex items-center p-3 font-medium">
                                            {lineageConfig(lineage).label}
                                        </div>
                                        {states.map((state) => (
                                            <div
                                                key={state}
                                                className="flex min-h-44 items-center justify-center border-l bg-zinc-950 p-2 text-white"
                                            >
                                                <CharacterSprite
                                                    character={character(
                                                        lineage,
                                                        undefined,
                                                        stressEquipment,
                                                    )}
                                                    state={state}
                                                    className="size-36"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Phase B acceptance</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 md:grid-cols-2">
                        {[
                            'Humanoid Rig shared by all four launch lineages',
                            'Broad / Lean / Heavy frames defined',
                            'Human implemented',
                            'Elf implemented with ear variants',
                            'Skeleton implemented with bone tone, jaw and eye glow',
                            'Ogre implemented with Heavy mass, jaw and horns',
                            'All current equipment slots shared',
                            'Front / Side / Back renderer available',
                            'Legacy type_a / type_b profiles normalize safely',
                            'Lineage-specific personalization is server validated',
                            'Idle / Walk / Attack / Cast / Celebrate / Hurt states available',
                            'Epic full-equipment stress matrix renders all four lineages',
                            'No lineage moves canonical equipment sockets',
                            'Character System contract shared by Laravel and React',
                        ].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                            >
                                <Check className="size-4 text-emerald-500" />
                                {item}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="bg-muted/20 flex items-start gap-3 rounded-2xl border p-4">
                    <Layers3 className="mt-0.5 size-5 shrink-0" />
                    <div>
                        <p className="font-medium">Shared-equipment rule</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Human, Elf and Skeleton use standard Broad/Lean
                            masks. Ogre uses the Heavy mask around the same
                            sockets. The sword, helmet, cape and other catalog
                            objects remain the same inventory item and visual
                            family.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border bg-violet-500/5 p-4">
                    <Sparkles className="mt-0.5 size-5 shrink-0" />
                    <div>
                        <p className="font-medium">
                            Next gate: authored animation frames
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            This lab validates anatomy, views, equipment masks
                            and motion states. The next art iteration can
                            replace CSS pose motion with authored frame sheets
                            without changing the lineage or equipment contract.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

function character(
    lineage: CharacterLineage,
    appearance?: GameAppearance,
    equipment: Record<string, EquippedVisual> = {},
): GameCharacter {
    return {
        created: true,
        name: lineageConfig(lineage).label,
        archetype:
            lineage === 'ogre'
                ? 'warden'
                : lineage === 'elf'
                  ? 'arcanist'
                  : lineage === 'skeleton'
                    ? 'rogue'
                    : 'wanderer',
        lineage,
        character_system_version: CHARACTER_SYSTEM.version,
        appearance:
            appearance ??
            (lineageDefaults(lineage) as unknown as GameAppearance),
        level: 12,
        xp: 0,
        total_xp: 1100,
        gold: 0,
        equipment,
        stats: {
            power: 0,
            guard: 0,
            focus: 0,
            luck: 0,
            gear_score: 0,
        },
    };
}

function personalizationVariants(lineage: CharacterLineage): GameAppearance[] {
    const base = lineageDefaults(lineage) as unknown as GameAppearance;

    if (lineage === 'human') {
        return [
            base,
            {
                ...base,
                body: 'lean',
                skin_tone: 'moon',
                hair_style: 'braid',
                hair_color: 'blonde',
                eye_color: 'violet',
                face_style: 'soft',
            },
            {
                ...base,
                skin_tone: 'deep',
                hair_style: 'wild',
                hair_color: 'silver',
                eye_color: 'amber',
                face_style: 'strong',
            },
            {
                ...base,
                body: 'lean',
                skin_tone: 'sun',
                hair_style: 'crest',
                hair_color: 'ember',
                eye_color: 'azure',
            },
        ];
    }

    if (lineage === 'elf') {
        return [
            base,
            {
                ...base,
                skin_tone: 'deep',
                ear_style: 'swept',
                hair_color: 'onyx',
                eye_color: 'emerald',
                face_style: 'angular',
            },
            {
                ...base,
                body: 'broad',
                skin_tone: 'sun',
                ear_style: 'high',
                hair_style: 'wild',
                hair_color: 'ember',
                face_style: 'serene',
            },
            {
                ...base,
                hair_style: 'none',
                ear_style: 'long',
                eye_color: 'violet',
            },
        ];
    }

    if (lineage === 'skeleton') {
        return [
            base,
            {
                ...base,
                body: 'lean',
                bone_tone: 'aged',
                jaw_style: 'cracked',
                eye_glow: 'emerald',
                face_style: 'narrow_skull',
            },
            {
                ...base,
                bone_tone: 'obsidian',
                jaw_style: 'missing',
                eye_glow: 'violet',
                hair_style: 'crest',
                hair_color: 'silver',
                face_style: 'ancient_skull',
            },
            {
                ...base,
                bone_tone: 'ash',
                hair_style: 'wild',
                hair_color: 'ember',
                eye_glow: 'ember',
            },
        ];
    }

    return [
        base,
        {
            ...base,
            skin_tone: 'ochre',
            jaw_style: 'tusked',
            horn_style: 'short',
            hair_style: 'wild',
            hair_color: 'chestnut',
        },
        {
            ...base,
            skin_tone: 'stone',
            face_style: 'elder',
            ear_style: 'torn',
            horn_style: 'swept',
            hair_style: 'none',
            eye_color: 'azure',
        },
        {
            ...base,
            skin_tone: 'deep',
            face_style: 'scarred',
            jaw_style: 'tusked',
            horn_style: 'swept',
            hair_color: 'ember',
        },
    ];
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

function Fact({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-card rounded-2xl border p-4">
            <p className="text-xl font-semibold capitalize">{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
        </div>
    );
}
