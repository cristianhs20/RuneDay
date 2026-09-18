import { Head, useForm } from '@inertiajs/react';
import { Shield, Sparkles, Swords, WandSparkles } from 'lucide-react';
import { CharacterSprite } from '@/components/game/character-sprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { GameAppearance, GameCharacter } from '@/types/game';

const archetypes = [
    {
        value: 'wanderer',
        label: 'Wanderer',
        description: 'Balanced visual style for the first journey.',
        icon: Swords,
    },
    {
        value: 'warden',
        label: 'Warden',
        description: 'Grounded, protective and deliberate.',
        icon: Shield,
    },
    {
        value: 'rogue',
        label: 'Rogue',
        description: 'Lean silhouettes and a stealthier feel.',
        icon: Sparkles,
    },
    {
        value: 'arcanist',
        label: 'Arcanist',
        description: 'A more mystical visual identity.',
        icon: WandSparkles,
    },
] as const;

export default function Character({ character }: { character: GameCharacter }) {
    const form = useForm({
        character_name: character.name,
        archetype: character.archetype,
        appearance: character.appearance,
    });

    const preview: GameCharacter = {
        ...character,
        name: form.data.character_name || character.name,
        archetype: form.data.archetype,
        appearance: form.data.appearance,
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
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Phase 2 · Character RPG
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {character.created ? 'Your Hero' : 'Create your Hero'}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Appearance is cosmetic. Progress comes from the work you
                        complete, not from buying power.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                    <Card className="overflow-hidden rounded-3xl">
                        <CardContent className="p-0">
                            <div className="flex min-h-[430px] items-center justify-center bg-zinc-950 p-8 text-white">
                                <CharacterSprite
                                    character={preview}
                                    className="size-72 max-w-full"
                                />
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

                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Identity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    className="space-y-5"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        form.put('/character', {
                                            preserveScroll: true,
                                        });
                                    }}
                                >
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
                                                                {
                                                                    archetype.label
                                                                }
                                                            </span>
                                                        </div>
                                                        <p className="text-muted-foreground mt-2 text-xs">
                                                            {
                                                                archetype.description
                                                            }
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <AppearanceSelect
                                            label="Body"
                                            value={form.data.appearance.body}
                                            options={[
                                                ['type_a', 'Frame A'],
                                                ['type_b', 'Frame B'],
                                            ]}
                                            onChange={(value) =>
                                                setAppearance(
                                                    'body',
                                                    value as GameAppearance['body'],
                                                )
                                            }
                                        />
                                        <AppearanceSelect
                                            label="Skin tone"
                                            value={
                                                form.data.appearance.skin_tone
                                            }
                                            options={[
                                                ['moon', 'Moon'],
                                                ['sun', 'Sun'],
                                                ['bronze', 'Bronze'],
                                                ['deep', 'Deep'],
                                            ]}
                                            onChange={(value) =>
                                                setAppearance(
                                                    'skin_tone',
                                                    value as GameAppearance['skin_tone'],
                                                )
                                            }
                                        />
                                        <AppearanceSelect
                                            label="Hair style"
                                            value={
                                                form.data.appearance.hair_style
                                            }
                                            options={[
                                                ['short', 'Short'],
                                                ['wild', 'Wild'],
                                                ['braid', 'Braid'],
                                                ['crest', 'Crest'],
                                                ['none', 'None'],
                                            ]}
                                            onChange={(value) =>
                                                setAppearance(
                                                    'hair_style',
                                                    value as GameAppearance['hair_style'],
                                                )
                                            }
                                        />
                                        <AppearanceSelect
                                            label="Hair color"
                                            value={
                                                form.data.appearance.hair_color
                                            }
                                            options={[
                                                ['onyx', 'Onyx'],
                                                ['chestnut', 'Chestnut'],
                                                ['blonde', 'Blonde'],
                                                ['silver', 'Silver'],
                                                ['ember', 'Ember'],
                                            ]}
                                            onChange={(value) =>
                                                setAppearance(
                                                    'hair_color',
                                                    value as GameAppearance['hair_color'],
                                                )
                                            }
                                        />
                                        <AppearanceSelect
                                            label="Eye color"
                                            value={
                                                form.data.appearance.eye_color
                                            }
                                            options={[
                                                ['emerald', 'Emerald'],
                                                ['azure', 'Azure'],
                                                ['amber', 'Amber'],
                                                ['violet', 'Violet'],
                                            ]}
                                            onChange={(value) =>
                                                setAppearance(
                                                    'eye_color',
                                                    value as GameAppearance['eye_color'],
                                                )
                                            }
                                        />
                                    </div>

                                    <Button
                                        className="w-full"
                                        disabled={
                                            form.processing ||
                                            form.data.character_name.trim()
                                                .length < 2
                                        }
                                    >
                                        {character.created
                                            ? 'Save hero'
                                            : 'Begin adventure'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Equipped layers</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2 sm:grid-cols-2">
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
                    </div>
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
