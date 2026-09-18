import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Layers3,
    Palette,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { SpriteV2Character } from '@/components/game/sprite-v2/sprite-v2-character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SpriteV2View } from '@/game/sprite-v2';

const manifestUrl = '/game/characters/v2/manifests/human-broad-d2.json';

const views: SpriteV2View[] = ['front', 'side', 'back'];

const layerIds = [
    'shadow',
    'weapon_back',
    'body',
    'face',
    'eyes',
    'hair',
] as const;

export default function SpriteV2Lab() {
    return (
        <>
            <Head title="Sprite Engine v2 · D2 Human Broad" />

            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Character Engine · Phase D2
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Human Broad · Production Sprite Master
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
                            Real authored pixel-art PNGs composed by Sprite
                            Engine v2. No SVG anatomy, no runtime rectangles and
                            no CSS body construction.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href="/character/lineage-lab">
                                Technical prototype
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
                    <Fact label="Engine" value="Sprite v2" />
                    <Fact label="Cell" value="128×128" />
                    <Fact label="Views" value="3" />
                    <Fact label="Runtime layers" value="6/view" />
                    <Fact label="Renderer" value="Canvas 2D" />
                </section>

                <Card className="overflow-hidden rounded-3xl border-2">
                    <CardHeader className="border-b">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                                    D2 · first production master
                                </p>
                                <CardTitle className="mt-1">
                                    Human Broad · Front / Side / Back
                                </CardTitle>
                            </div>
                            <span className="rounded-full border px-3 py-1 text-xs font-medium">
                                human_broad_d2_master
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="grid gap-px bg-white/10 lg:grid-cols-3">
                            {views.map((view) => (
                                <div
                                    key={view}
                                    className="flex min-h-[500px] flex-col items-center justify-center bg-zinc-950 p-6 text-white"
                                >
                                    <SpriteV2Character
                                        manifestUrl={manifestUrl}
                                        view={view}
                                        scale={3}
                                        className="w-full max-w-[384px]"
                                    />
                                    <div className="mt-5 text-center">
                                        <p className="font-semibold capitalize">
                                            {view}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            layered PNG composition
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <section className="grid gap-6 xl:grid-cols-[1fr_430px]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>Native-size readability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex min-h-72 flex-wrap items-end justify-center gap-8 rounded-2xl bg-zinc-950 p-6 text-white">
                                {[1, 2, 3].map((scale) => (
                                    <div
                                        key={scale}
                                        className="flex flex-col items-center"
                                    >
                                        <SpriteV2Character
                                            manifestUrl={manifestUrl}
                                            view="front"
                                            scale={scale as 1 | 2 | 3}
                                        />
                                        <span className="mt-3 text-xs text-zinc-500">
                                            {128 * scale}px
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-muted-foreground mt-4 text-sm">
                                Source frame stays 128×128. Runtime previews are
                                integer-scaled with image smoothing disabled.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>D2 implementation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                'Real raster pixel-art master',
                                'Transparent 128×128 PNG cells',
                                'Front / Side / Back authored views',
                                'Manifest-driven composition',
                                'Canvas 2D renderer',
                                'Nearest-neighbor rendering',
                                'No procedural SVG anatomy',
                                'One shared Human Broad master id',
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

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers3 className="size-4" />
                            Runtime layer breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            {layerIds.map((layer) => (
                                <div
                                    key={layer}
                                    className="overflow-hidden rounded-2xl border"
                                >
                                    <div className="flex aspect-square items-center justify-center bg-zinc-950 p-2">
                                        <img
                                            src={
                                                '/game/characters/v2/characters/human/broad/master/front-' +
                                                layer +
                                                '.png'
                                            }
                                            alt={layer}
                                            className="h-full w-full object-contain [image-rendering:pixelated]"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium">
                                            {humanize(layer)}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-[10px]">
                                            transparent PNG
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <section className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="size-4" />
                                Source master vs compositor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <PreviewPanel
                                title="Flattened source master"
                                image="/game/characters/v2/characters/human/broad/master/front-master.png"
                            />
                            <div className="rounded-2xl border">
                                <div className="flex aspect-square items-center justify-center bg-zinc-950 p-3 text-white">
                                    <SpriteV2Character
                                        manifestUrl={manifestUrl}
                                        view="front"
                                        scale={2}
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium">
                                        Runtime recomposition
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        6 ordered PNG layers
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="size-4" />
                                D2 visual review gate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <ReviewItem
                                title="Character identity"
                                text="Does this finally feel like the RuneDay concept rather than a technical placeholder?"
                            />
                            <ReviewItem
                                title="Proportions"
                                text="Check head size, shoulder mass, torso length, thighs and boots."
                            />
                            <ReviewItem
                                title="Three-view consistency"
                                text="Front, Side and Back should read as the same hero."
                            />
                            <ReviewItem
                                title="Starter desirability"
                                text="The base hero should already feel worth owning before Rare/Epic gear."
                            />
                            <ReviewItem
                                title="Pixel-art density"
                                text="Enough authored detail for faces/materials without becoming noisy at 128px."
                            />
                        </CardContent>
                    </Card>
                </section>

                <div className="flex items-start gap-3 rounded-2xl border bg-emerald-500/5 p-4">
                    <Sparkles className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                    <div>
                        <p className="font-medium">
                            D2 stops here for visual approval
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Walk/Attack/Cast sheets and Human Lean should not be
                            mass-produced until this static Human Broad master
                            is approved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

function PreviewPanel({ title, image }: { title: string; image: string }) {
    return (
        <div className="rounded-2xl border">
            <div className="flex aspect-square items-center justify-center bg-zinc-950 p-3">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-contain [image-rendering:pixelated]"
                />
            </div>
            <div className="p-3">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                    128×128 transparent PNG
                </p>
            </div>
        </div>
    );
}

function ReviewItem({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-2xl border p-4">
            <p className="font-medium">{title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{text}</p>
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
