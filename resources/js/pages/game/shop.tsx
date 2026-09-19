import { Head, router } from '@inertiajs/react';
import { Coins, LockKeyhole, Store } from 'lucide-react';
import { ProductionCharacter } from '@/components/game/production-character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GameCharacter } from '@/types/game';

type ShopItem = {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
    slot?: string | null;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
    visual_key: string;
    stats: Record<string, number>;
    price_gold: number;
    min_level: number;
    owned: boolean;
};

const rarityClass = {
    common: 'border-zinc-300 dark:border-zinc-700',
    uncommon: 'border-emerald-400/60',
    rare: 'border-sky-400/70',
    epic: 'border-violet-400/70',
};

export default function Shop({
    character,
    items,
}: {
    character: GameCharacter;
    items: ShopItem[];
}) {
    return (
        <>
            <Head title="Shop" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Spend what you earned
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Adventure Shop
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                            The shop uses only gold earned through productivity.
                            Rare and epic gear stays loot-only in Phase 2.
                        </p>
                    </div>
                    <div className="bg-card flex items-center gap-2 rounded-2xl border px-4 py-3">
                        <Coins className="size-4" />
                        <span className="text-lg font-semibold">
                            {character.gold}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            gold
                        </span>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    <Card className="h-fit overflow-hidden rounded-3xl">
                        <CardContent className="p-0">
                            <div className="flex min-h-72 items-center justify-center bg-zinc-950 p-5 text-white">
                                <ProductionCharacter
                                    character={character}
                                    className="size-52"
                                />
                            </div>
                            <div className="p-4">
                                <p className="font-semibold">
                                    {character.name}
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Level {character.level} · Gear score{' '}
                                    {character.stats.gear_score}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="size-4" />
                                Available gear
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {items.map((item) => {
                                const levelLocked =
                                    character.level < item.min_level;
                                const tooExpensive =
                                    character.gold < item.price_gold;

                                return (
                                    <div
                                        key={item.id}
                                        className={
                                            'flex flex-col rounded-2xl border-2 p-4 ' +
                                            rarityClass[item.rarity]
                                        }
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold">
                                                        {item.name}
                                                    </p>
                                                    <span className="bg-muted rounded-full px-2 py-0.5 text-[10px] capitalize">
                                                        {item.rarity}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground mt-1 text-xs capitalize">
                                                    {item.slot}
                                                </p>
                                            </div>
                                            {levelLocked && (
                                                <LockKeyhole className="text-muted-foreground size-4" />
                                            )}
                                        </div>

                                        <p className="text-muted-foreground mt-3 flex-1 text-sm">
                                            {item.description}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {Object.entries(item.stats).map(
                                                ([key, value]) => (
                                                    <span
                                                        key={key}
                                                        className="rounded-full border px-2 py-1 text-[11px] capitalize"
                                                    >
                                                        +{value} {key}
                                                    </span>
                                                ),
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <Coins className="size-4" />
                                                <span className="font-semibold">
                                                    {item.price_gold}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={
                                                    item.owned ||
                                                    levelLocked ||
                                                    tooExpensive
                                                }
                                                onClick={() =>
                                                    router.post(
                                                        '/shop/' +
                                                            item.id +
                                                            '/purchase',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                {item.owned
                                                    ? 'Owned'
                                                    : levelLocked
                                                      ? 'Level ' +
                                                        item.min_level
                                                      : tooExpensive
                                                        ? 'Need gold'
                                                        : 'Buy'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}