import { Head, router } from '@inertiajs/react';
import { Backpack, ShieldCheck, Sparkles } from 'lucide-react';
import { CharacterSprite } from '@/components/game/character-sprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GameCharacter } from '@/types/game';

type InventoryRow = {
    id: number;
    acquired_from: string;
    acquired_at: string;
    equipped: boolean;
    item: {
        slug: string;
        name: string;
        description?: string | null;
        slot?: string | null;
        rarity: 'common' | 'uncommon' | 'rare' | 'epic';
        visual_key: string;
        stats: Record<string, number>;
    };
};

const rarityClass = {
    common: 'border-zinc-300 dark:border-zinc-700',
    uncommon: 'border-emerald-400/60',
    rare: 'border-sky-400/70',
    epic: 'border-violet-400/70',
};

export default function Inventory({
    character,
    items,
}: {
    character: GameCharacter;
    items: InventoryRow[];
}) {
    return (
        <>
            <Head title="Inventory" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Adventure gear
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Inventory
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Gear is earned from quests or purchased with earned
                        gold. Equipping an item immediately changes the
                        corresponding sprite layer.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
                    <div className="space-y-6">
                        <Card className="overflow-hidden rounded-3xl">
                            <CardContent className="p-0">
                                <div className="flex min-h-80 items-center justify-center bg-zinc-950 p-6 text-white">
                                    <CharacterSprite
                                        character={character}
                                        className="size-60"
                                    />
                                </div>
                                <div className="border-t p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                {character.name}
                                            </p>
                                            <p className="text-muted-foreground text-xs capitalize">
                                                Level {character.level} ·{' '}
                                                {character.archetype}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {character.stats.gear_score}
                                            </p>
                                            <p className="text-muted-foreground text-[10px] uppercase">
                                                Gear score
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Equipped
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    'weapon',
                                    'head',
                                    'chest',
                                    'feet',
                                    'back',
                                    'accessory',
                                ].map((slot) => {
                                    const equipped = character.equipment[slot];

                                    return (
                                        <div
                                            key={slot}
                                            className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-muted-foreground text-[10px] font-semibold uppercase">
                                                    {slot}
                                                </p>
                                                <p className="truncate text-sm font-medium">
                                                    {equipped?.name ?? 'Empty'}
                                                </p>
                                            </div>
                                            {equipped && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.delete(
                                                            '/equipment/' +
                                                                slot,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    Unequip
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Backpack className="size-4" />
                                Owned gear
                                <span className="text-muted-foreground ml-auto text-sm font-normal">
                                    {items.length} items
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {items.length === 0 ? (
                                <div className="text-muted-foreground rounded-2xl border border-dashed p-12 text-center text-sm">
                                    Your first two starter items appear after
                                    creating your hero.
                                </div>
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {items.map((inventory) => (
                                        <div
                                            key={inventory.id}
                                            className={
                                                'rounded-2xl border-2 p-4 ' +
                                                rarityClass[
                                                    inventory.item.rarity
                                                ]
                                            }
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="bg-muted flex size-11 items-center justify-center rounded-xl">
                                                    {inventory.equipped ? (
                                                        <ShieldCheck className="size-5" />
                                                    ) : (
                                                        <Sparkles className="size-5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold">
                                                            {
                                                                inventory.item
                                                                    .name
                                                            }
                                                        </p>
                                                        <span className="bg-muted rounded-full px-2 py-0.5 text-[10px] capitalize">
                                                            {
                                                                inventory.item
                                                                    .rarity
                                                            }
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground mt-1 text-xs capitalize">
                                                        {inventory.item.slot} ·
                                                        from{' '}
                                                        {
                                                            inventory.acquired_from
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {inventory.item.description && (
                                                <p className="text-muted-foreground mt-3 text-sm">
                                                    {inventory.item.description}
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {Object.entries(
                                                    inventory.item.stats,
                                                ).map(([key, value]) => (
                                                    <span
                                                        key={key}
                                                        className="rounded-full border px-2 py-1 text-[11px] capitalize"
                                                    >
                                                        +{value} {key}
                                                    </span>
                                                ))}
                                            </div>

                                            <Button
                                                className="mt-4 w-full"
                                                variant={
                                                    inventory.equipped
                                                        ? 'secondary'
                                                        : 'default'
                                                }
                                                disabled={inventory.equipped}
                                                onClick={() =>
                                                    router.post(
                                                        '/inventory/' +
                                                            inventory.id +
                                                            '/equip',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                {inventory.equipped
                                                    ? 'Equipped'
                                                    : 'Equip item'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
