import { Head, Link, useForm } from '@inertiajs/react';
import { Shield, Sparkles, Swords, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { ProductionCharacter } from '@/components/game/production-character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    CHARACTER_LINEAGES,
    frameConfig,
    lineageConfig,
    lineageDefaults,
    lineageOptions,
} from '@/game/character-system';
import type {
    CharacterLineage,
    CharacterView,
    GameAppearance,
    GameCharacter,
} from '@/types/game';

const archetypes = [
    {
        value: 'wanderer',
        label: 'Wanderer',
        description: 'Balanced visual foundation for any lineage.',
        icon: Swords,
    },
    {
        value: 'warden',
        label: 'Warden',
        description: 'Grounded, protective and armor-forward.',
        icon: Shield,
    },
    {
        value: 'rogue',
        label: 'Rogue',
        description: 'Sharper shapes and stealthier equipment language.',
        icon: Sparkles,
    },
    {
        value: 'arcanist',
        label: 'Arcanist',
        description: 'Controlled mystical accents and arcane silhouettes.',
        icon: WandSparkles,
    },
] as const;

const views: CharacterView[] = ['front', 'side', 'back'];

export default function Character({ character }: { character: GameCharacter }) {
    const [view, setView] = useState<CharacterView>('front');
    const form = useForm({
        character_name: character.name,
        archetype: character.archetype,
        lineage: character.lineage,
        appearance: character.appearance,
    });

    const preview: GameCharacter = {
        ...character,
        name: form.data.character_name || character.name,
        archetype: form.data.archetype,
        lineage: form.data.lineage,
        appearance: form.data.appearance,
    };

    const selectedLineage = lineageConfig(form.data.lineage);
    const options = lineageOptions(form.data.lineage);

    const setLineage = (lineage: CharacterLineage) => {
        const defaults = lineageDefaults(lineage) as unknown as GameAppearance;

        form.setData((current) => ({
            ...current,
            lineage,
            appearance: defaults,
        }));
    };

    const setAppearance = <K extends keyof GameAppearance>(
        key: K,
        value: GameAppearance[K],
    ) => {
        form.setData('appearance', {
            ...form.data.appearance,
            [key]: value,
        });
    };

    return (
        <>
            <Head title="Hero" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Character Engine · Modular V3
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {character.created
                                ? 'Your Hero'
                                : 'Create your Hero'}
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
                            Create your hero and see equipped gear update in
                            real time. Human Broad now uses the production
                            Modular V3 renderer; other lineages keep a
                            compatible fallback while their V3 art is completed.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href="/character/style-lab">Style Lab</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/character/modular-v3-lab">
                                Advanced V3 preview
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/character/sprite-v2-lab">
                                Sprite v2 Lab
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/character/lineage-lab">
                                Lineage Lab
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
                    <div className="space-y-4">
                        <Card className="overflow-hidden rounded-3xl">
                            <CardContent className="p-0">
                                <div className="flex min-h-[470px] items-center justify-center bg-zinc-950 p-8 text-white">
                                    <ProductionCharacter
                                        character={preview}
                                        view={view}
                                        className="size-80 max-w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-3 border-t">
                                    {views.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setView(item)}
                                            className={
                                                view === item
                                                    ? 'bg-muted px-3 py-3 text-sm font-medium capitalize'
                                                    : 'text-muted-foreground hover:bg-muted/50 px-3 py-3 text-sm capitalize transition'
                                            }
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-5 border-t">
                                    <HeroStat
                                        label="Level"
                                        value={character.level}
                                    />
                                    <HeroStat
                                        label="Power"
                                        value={character.stats.power}
                                    />
                                    <HeroStat
                                        label="Guard"
                                        value={character.stats.guard}
                                    />
                                    <HeroStat
                                        label="Focus"
                                        value={character.stats.focus}
                                    />
                                    <HeroStat
                                        label="Luck"
                                        value={character.stats.luck}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                                            Current lineage
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {selectedLineage.label}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {selectedLineage.description}
                                        </p>
                                    </div>
                                    <span className="rounded-full border px-2.5 py-1 text-[10px] font-medium">
                                        {
                                            frameConfig(
                                                form.data.appearance.body,
                                            ).label
                                        }
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <form
                        className="space-y-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.put('/character', {
                                preserveScroll: true,
                            });
                        }}
                    >
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Lineage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {CHARACTER_LINEAGES.map((lineage) => {
                                        const config = lineageConfig(lineage);
                                        const active =
                                            form.data.lineage === lineage;

                                        return (
                                            <button
                                                key={lineage}
                                                type="button"
                                                className={
                                                    active
                                                        ? 'border-foreground bg-muted/50 rounded-2xl border-2 p-4 text-left'
                                                        : 'hover:bg-muted/40 rounded-2xl border p-4 text-left transition'
                                                }
                                                onClick={() =>
                                                    setLineage(lineage)
                                                }
                                            >
                                                <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-xs font-bold text-white">
                                                    {config.label
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>
                                                <p className="mt-3 font-semibold">
                                                    {config.label}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    {config.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Identity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Hero name
                                    </label>
                                    <Input
                                        value={form.data.character_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'character_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Name your hero"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Archetype
                                    </label>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {archetypes.map((archetype) => {
                                            const Icon = archetype.icon;
                                            const active =
                                                form.data.archetype ===
                                                archetype.value;

                                            return (
                                                <button
                                                    key={archetype.value}
                                                    type="button"
                                                    className={
                                                        active
                                                            ? 'border-foreground bg-muted/50 rounded-2xl border-2 p-4 text-left'
                                                            : 'hover:bg-muted/40 rounded-2xl border p-4 text-left transition'
                                                    }
                                                    onClick={() =>
                                                        form.setData(
                                                            'archetype',
                                                            archetype.value,
                                                        )
                                                    }
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="size-4" />
                                                        <span className="font-medium">
                                                            {archetype.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground mt-2 text-xs">
                                                        {archetype.description}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>
                                    {selectedLineage.label} customization
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <AppearanceSelect
                                    label="Body frame"
                                    value={form.data.appearance.body}
                                    options={selectedLineage.allowedFrames.map(
                                        (frame) => [
                                            frame,
                                            frameConfig(frame).label,
                                        ],
                                    )}
                                    onChange={(value) =>
                                        setAppearance(
                                            'body',
                                            value as GameAppearance['body'],
                                        )
                                    }
                                />

                                {form.data.lineage === 'skeleton' ? (
                                    <AppearanceSelect
                                        label="Bone tone"
                                        value={form.data.appearance.bone_tone}
                                        options={optionPairs(options.bone_tone)}
                                        onChange={(value) =>
                                            setAppearance(
                                                'bone_tone',
                                                value as GameAppearance['bone_tone'],
                                            )
                                        }
                                    />
                                ) : (
                                    <AppearanceSelect
                                        label="Skin tone"
                                        value={form.data.appearance.skin_tone}
                                        options={optionPairs(options.skin_tone)}
                                        onChange={(value) =>
                                            setAppearance(
                                                'skin_tone',
                                                value as GameAppearance['skin_tone'],
                                            )
                                        }
                                    />
                                )}

                                <AppearanceSelect
                                    label="Face"
                                    value={form.data.appearance.face_style}
                                    options={optionPairs(options.face_style)}
                                    onChange={(value) =>
                                        setAppearance(
                                            'face_style',
                                            value as GameAppearance['face_style'],
                                        )
                                    }
                                />

                                {options.ear_style.length > 1 && (
                                    <AppearanceSelect
                                        label="Ears"
                                        value={form.data.appearance.ear_style}
                                        options={optionPairs(options.ear_style)}
                                        onChange={(value) =>
                                            setAppearance(
                                                'ear_style',
                                                value as GameAppearance['ear_style'],
                                            )
                                        }
                                    />
                                )}

                                {options.jaw_style.length > 1 && (
                                    <AppearanceSelect
                                        label="Jaw"
                                        value={form.data.appearance.jaw_style}
                                        options={optionPairs(options.jaw_style)}
                                        onChange={(value) =>
                                            setAppearance(
                                                'jaw_style',
                                                value as GameAppearance['jaw_style'],
                                            )
                                        }
                                    />
                                )}

                                {options.horn_style.length > 1 && (
                                    <AppearanceSelect
                                        label="Horns"
                                        value={form.data.appearance.horn_style}
                                        options={optionPairs(
                                            options.horn_style,
                                        )}
                                        onChange={(value) =>
                                            setAppearance(
                                                'horn_style',
                                                value as GameAppearance['horn_style'],
                                            )
                                        }
                                    />
                                )}

                                <AppearanceSelect
                                    label="Hair style"
                                    value={form.data.appearance.hair_style}
                                    options={optionPairs(options.hair_style)}
                                    onChange={(value) =>
                                        setAppearance(
                                            'hair_style',
                                            value as GameAppearance['hair_style'],
                                        )
                                    }
                                />

                                {form.data.appearance.hair_style !== 'none' && (
                                    <AppearanceSelect
                                        label="Hair color"
                                        value={form.data.appearance.hair_color}
                                        options={optionPairs(
                                            options.hair_color,
                                        )}
                                        onChange={(value) =>
                                            setAppearance(
                                                'hair_color',
                                                value as GameAppearance['hair_color'],
                                            )
                                        }
                                    />
                                )}

                                {form.data.lineage === 'skeleton' ? (
                                    <AppearanceSelect
                                        label="Soul eyes"
                                        value={form.data.appearance.eye_glow}
                                        options={optionPairs(options.eye_glow)}
                                        onChange={(value) =>
                                            setAppearance(
                                                'eye_glow',
                                                value as GameAppearance['eye_glow'],
                                            )
                                        }
                                    />
                                ) : (
                                    <AppearanceSelect
                                        label="Eye color"
                                        value={form.data.appearance.eye_color}
                                        options={optionPairs(options.eye_color)}
                                        onChange={(value) =>
                                            setAppearance(
                                                'eye_color',
                                                value as GameAppearance['eye_color'],
                                            )
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {(form.errors.lineage || form.errors.appearance) && (
                            <p className="text-destructive text-sm">
                                {form.errors.lineage ?? form.errors.appearance}
                            </p>
                        )}

                        <Button
                            className="w-full"
                            disabled={
                                form.processing ||
                                form.data.character_name.trim().length < 2
                            }
                        >
                            {character.created
                                ? 'Save hero'
                                : 'Begin adventure'}
                        </Button>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Equipped layers</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    'weapon',
                                    'head',
                                    'chest',
                                    'feet',
                                    'back',
                                    'accessory',
                                ].map((slot) => {
                                    const item =
                                        character.equipment[slot] ?? null;

                                    return (
                                        <div
                                            key={slot}
                                            className="rounded-2xl border p-3"
                                        >
                                            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                                                {slot}
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {item?.name ?? 'Empty'}
                                            </p>
                                            {item && (
                                                <p className="text-muted-foreground mt-1 text-xs capitalize">
                                                    {item.rarity}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}

function HeroStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="border-r p-3 text-center last:border-r-0">
            <div className="font-semibold">{value}</div>
            <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
                {label}
            </div>
        </div>
    );
}

function AppearanceSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: Array<[string, string]>;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <select
                className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map(([optionValue, optionLabel]) => (
                    <option key={optionValue} value={optionValue}>
                        {optionLabel}
                    </option>
                ))}
            </select>
        </div>
    );
}

function optionPairs(values: string[]): Array<[string, string]> {
    return values.map((value) => [value, humanize(value)]);
}

function humanize(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/^./, (letter) => letter.toUpperCase());
}