import { Head } from '@inertiajs/react';
import { BookOpen, Check, LockKeyhole, Swords } from 'lucide-react';
import { EnemySprite } from '@/components/adventure/enemy-sprite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type BestiaryEnemy = {
    slug: string;
    name: string;
    description: string;
    type: 'normal' | 'elite' | 'boss';
    visual_key: string;
    discovered: boolean;
    wins: number;
    max_hp?: number | null;
    attack?: number | null;
    defense?: number | null;
};

type BestiaryRegion = {
    slug: string;
    name: string;
    unlocked: boolean;
    enemies: BestiaryEnemy[];
};

export default function Bestiary({ regions }: { regions: BestiaryRegion[] }) {
    const total = regions.reduce(
        (sum, region) => sum + region.enemies.length,
        0,
    );
    const discovered = regions.reduce(
        (sum, region) =>
            sum + region.enemies.filter((enemy) => enemy.discovered).length,
        0,
    );

    return (
        <>
            <Head title="Bestiary" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        World knowledge
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Bestiary
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Enemies reveal their full entry after you encounter
                        them. Victories remain recorded permanently.
                    </p>
                </header>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Summary label="Discovered" value={discovered} />
                    <Summary label="Total entries" value={total} />
                    <Summary
                        label="Completion"
                        value={
                            total > 0
                                ? Math.round((discovered / total) * 100)
                                : 0
                        }
                        suffix="%"
                    />
                </div>

                <div className="space-y-6">
                    {regions.map((region) => (
                        <Card key={region.slug} className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="size-4" />
                                    {region.name}
                                    {!region.unlocked && (
                                        <LockKeyhole className="text-muted-foreground ml-auto size-4" />
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-3">
                                {region.enemies.map((enemy) => (
                                    <div
                                        key={enemy.slug}
                                        className={
                                            enemy.discovered
                                                ? 'rounded-2xl border p-4'
                                                : 'bg-muted/20 rounded-2xl border p-4'
                                        }
                                    >
                                        <div className="flex h-40 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                            {enemy.discovered ? (
                                                <EnemySprite
                                                    visualKey={enemy.visual_key}
                                                    className="size-32"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-zinc-600">
                                                    <LockKeyhole className="size-7" />
                                                    <span className="text-xs">
                                                        Undiscovered
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">
                                                    {enemy.name}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-xs capitalize">
                                                    {enemy.type}
                                                </p>
                                            </div>
                                            {enemy.wins > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-700 dark:text-emerald-300">
                                                    <Check className="size-3" />
                                                    {enemy.wins}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-muted-foreground mt-3 text-sm">
                                            {enemy.description}
                                        </p>

                                        {enemy.discovered && (
                                            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                                                <Stat
                                                    label="HP"
                                                    value={enemy.max_hp ?? 0}
                                                />
                                                <Stat
                                                    label="ATK"
                                                    value={enemy.attack ?? 0}
                                                />
                                                <Stat
                                                    label="DEF"
                                                    value={enemy.defense ?? 0}
                                                />
                                            </div>
                                        )}

                                        {enemy.discovered &&
                                            enemy.wins === 0 && (
                                                <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                                                    <Swords className="size-3.5" />
                                                    Encountered, not defeated
                                                    yet.
                                                </div>
                                            )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

function Summary({
    label,
    value,
    suffix = '',
}: {
    label: string;
    value: number;
    suffix?: string;
}) {
    return (
        <div className="bg-card rounded-2xl border p-4">
            <p className="text-2xl font-semibold">
                {value}
                {suffix}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border p-2">
            <strong className="block text-sm">{value}</strong>
            <span className="text-muted-foreground">{label}</span>
        </div>
    );
}
