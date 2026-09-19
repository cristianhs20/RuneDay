import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Boxes,
    Check,
    Layers3,
    Palette,
    Shirt,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ModularCharacterV3 } from '@/components/game/modular-character-v3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ModularV3View } from '@/game/modular-v3';

type Skin = 'fair' | 'light_tan' | 'tan' | 'dark';
type Hair =
    | 'messy'
    | 'short_spiky'
    | 'medium_parted'
    | 'long'
    | 'ponytail'
    | 'wild'
    | 'none';
type Expression = 'base' | 'neutral' | 'determined' | 'happy' | 'serious';

const views: ModularV3View[] = ['front'];
const skins: Skin[] = ['fair', 'light_tan', 'tan', 'dark'];
const hairs: Hair[] = [
    'messy',
    'short_spiky',
    'medium_parted',
    'long',
    'ponytail',
    'wild',
    'none',
];
const expressions: Expression[] = [
    'base',
    'neutral',
    'determined',
    'happy',
    'serious',
];

export default function ModularV3Lab() {
    const [skin, setSkin] = useState<Skin>('light_tan');
    const [hair, setHair] = useState<Hair>('messy');
    const [expression, setExpression] = useState<Expression>('base');
    const [equipment, setEquipment] = useState({
        weapon_back: true,
        chest: true,
        neck: true,
        waist: true,
        feet: true,
    });

    const enabledCount = useMemo(
        () => Object.values(equipment).filter(Boolean).length,
        [equipment],
    );

    return (
        <>
            <Head title="Modular Character Engine v3" />

            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Character Engine · Modular v3
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Human Broad · Modular Sprite Builder
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
                            LPC-style modular composition adapted to RuneDay:
                            authored pixel-art body, skin, head, hair and
                            equipment modules loaded from sprite atlases.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href="/character/sprite-v2-lab">
                                v2 experiment
                            </Link>
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
                    <Fact label="Engine" value="Modular v3" />
                    <Fact label="Cell" value="256×256" />
                    <Fact label="Logical modules" value="73" />
                    <Fact label="Skin tones" value="4" />
                    <Fact label="Hair styles" value="6" />
                </section>

                <Card className="overflow-hidden rounded-3xl border-2">
                    <CardHeader className="border-b">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                                    Official modular character pipeline
                                </p>
                                <CardTitle className="mt-1">
                                    Live assembly · Front production preview
                                </CardTitle>
                            </div>
                            <span className="rounded-full border px-3 py-1 text-xs font-medium">
                                runeday-modular-v3
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="grid gap-px bg-white/10">
                            {views.map((view) => (
                                <div
                                    key={view}
                                    className="flex min-h-[500px] flex-col items-center justify-center bg-zinc-950 p-6 text-white"
                                >
                                    <ModularCharacterV3
                                        view={view}
                                        skin={skin}
                                        hair={hair}
                                        expression={expression}
                                        equipment={equipment}
                                        scale={2}
                                        className="w-full max-w-[512px]"
                                    />
                                    <div className="mt-5 text-center">
                                        <p className="font-semibold capitalize">
                                            {view}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            production modular composition
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="size-4" />
                                Character identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ChoiceGroup
                                title="Skin tone"
                                values={skins}
                                value={skin}
                                onChange={(next) => setSkin(next as Skin)}
                            />

                            <ChoiceGroup
                                title="Hair"
                                values={hairs}
                                value={hair}
                                onChange={(next) => setHair(next as Hair)}
                            />

                            <ChoiceGroup
                                title="Expression · front only"
                                values={expressions}
                                value={expression}
                                onChange={(next) =>
                                    setExpression(next as Expression)
                                }
                            />

                            <div className="rounded-2xl border p-4">
                                <p className="font-medium">
                                    Current combination
                                </p>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Human · Broad · {humanize(skin)} ·{' '}
                                    {humanize(hair)} · {humanize(expression)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shirt className="size-4" />
                                Starter equipment layers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                ['weapon_back', 'Training sword'],
                                ['chest', 'Blue harness'],
                                ['neck', 'Royal-blue scarf'],
                                ['waist', 'Starter tabard + belt'],
                                ['feet', 'Starter boots'],
                            ].map(([key, label]) => {
                                const typedKey = key as keyof typeof equipment;
                                const enabled = equipment[typedKey];

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() =>
                                            setEquipment((current) => ({
                                                ...current,
                                                [typedKey]: !enabled,
                                            }))
                                        }
                                        className={
                                            enabled
                                                ? 'border-foreground bg-muted/50 flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left'
                                                : 'hover:bg-muted/40 flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition'
                                        }
                                    >
                                        <div
                                            className={
                                                enabled
                                                    ? 'flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500'
                                                    : 'bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-full'
                                            }
                                        >
                                            {enabled ? (
                                                <Check className="size-4" />
                                            ) : (
                                                <span className="size-2 rounded-full bg-current" />
                                            )}
                                        </div>
                                        <span className="font-medium">
                                            {label}
                                        </span>
                                    </button>
                                );
                            })}

                            <p className="text-muted-foreground pt-2 text-xs">
                                {enabledCount}/5 starter equipment modules
                                enabled.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers3 className="size-4" />
                                Atlas architecture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2">
                            <AtlasCard
                                title="Body + skin + head"
                                src="/game/characters/v3/atlases/human-broad-base.png"
                                meta="24 logical cells"
                            />
                            <AtlasCard
                                title="Hair + face"
                                src="/game/characters/v3/atlases/human-broad-hair-face.png"
                                meta="16 logical cells"
                            />
                            <AtlasCard
                                title="Starter equipment"
                                src="/game/characters/v3/atlases/human-broad-starter-equipment.png"
                                meta="15 logical cells"
                            />
                            <AtlasCard
                                title="Iron / gold armor library"
                                src="/game/characters/v3/atlases/iron-gold-armor-library.png"
                                meta="18 modules · fit calibration"
                            />
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Boxes className="size-4" />
                                LPC-style rules now active
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                'Body, head, skin, hair and equipment are independent logical modules',
                                'Every fitted module shares one 256×256 origin',
                                'Runtime draws atlas cells; it never invents anatomy',
                                'Skin tone affects both body and head coherently',
                                'Hair is selected independently from face/skin',
                                'Starter equipment can be toggled independently',
                                'Armor library is registered but blocked from assembly until fit calibration',
                                'Old SVG and flattened PNG experiments are no longer the production target',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-2 rounded-xl border px-3 py-2 text-sm"
                                >
                                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                    {item}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <div className="flex items-start gap-3 rounded-2xl border bg-amber-500/5 p-4">
                    <Sparkles className="mt-0.5 size-5 shrink-0 text-amber-500" />
                    <div>
                        <p className="font-medium">
                            Next art work is explicit, not procedural
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Only complete production-ready views are shown here.
                            Incomplete side/back V3 art is intentionally hidden
                            instead of rendering broken anatomy.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

function ChoiceGroup({
    title,
    values,
    value,
    onChange,
}: {
    title: string;
    values: string[];
    value: string;
    onChange: (next: string) => void;
}) {
    return (
        <div>
            <p className="mb-2 text-sm font-medium">{title}</p>
            <div className="flex flex-wrap gap-2">
                {values.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onChange(item)}
                        className={
                            value === item
                                ? 'border-foreground bg-muted rounded-full border-2 px-3 py-1.5 text-xs font-medium'
                                : 'hover:bg-muted/40 rounded-full border px-3 py-1.5 text-xs transition'
                        }
                    >
                        {humanize(item)}
                    </button>
                ))}
            </div>
        </div>
    );
}

function AtlasCard({
    title,
    src,
    meta,
}: {
    title: string;
    src: string;
    meta: string;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border">
            <div className="flex aspect-video items-center justify-center bg-zinc-950 p-3">
                <img
                    src={src}
                    alt={title}
                    className="h-full w-full object-contain [image-rendering:pixelated]"
                />
            </div>
            <div className="p-3">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-muted-foreground mt-1 text-xs">{meta}</p>
            </div>
        </div>
    );
}

function Fact({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-card rounded-2xl border p-4">
            <p className="text-xl font-semibold">{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
        </div>
    );
}

function humanize(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/^./, (letter) => letter.toUpperCase());
}