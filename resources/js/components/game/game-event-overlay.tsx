import { usePage } from '@inertiajs/react';
import { Coins, Gem, Sparkles, Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CharacterSprite } from '@/components/game/character-sprite';
import type { GameCharacter, GameEvent } from '@/types/game';

type PageProps = {
    gameCharacter?: GameCharacter | null;
    flash?: {
        game_event?: GameEvent | null;
    };
};

export function GameEventOverlay() {
    const { gameCharacter, flash } = usePage<PageProps>().props;
    const event = flash?.game_event;
    const [visible, setVisible] = useState(false);
    const [eventKey, setEventKey] = useState('');

    useEffect(() => {
        if (!event || !gameCharacter) return;

        const key = JSON.stringify(event);

        if (key === eventKey) return;

        setEventKey(key);
        setVisible(true);

        const timer = window.setTimeout(() => setVisible(false), 4200);

        return () => window.clearTimeout(timer);
    }, [event, eventKey, gameCharacter]);

    if (!visible || !event || !gameCharacter) return null;

    const isQuest = event.type === 'quest_complete';

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/20 p-4 backdrop-blur-[2px] md:items-center">
            <div className="bg-background relative w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 z-20 rounded-full"
                    onClick={() => setVisible(false)}
                    aria-label="Close game result"
                >
                    <X />
                </Button>

                <div className="grid gap-5 p-6 md:grid-cols-[180px_1fr] md:p-8">
                    <div className="flex items-center justify-center rounded-3xl bg-zinc-950 p-4 text-white">
                        <CharacterSprite
                            character={gameCharacter}
                            state={isQuest ? 'attack' : 'celebrate'}
                            className="size-36"
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                            {isQuest ? 'Quest cleared' : 'Progress recorded'}
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                            {isQuest
                                ? 'Your hero strikes.'
                                : 'Momentum gained.'}
                        </h2>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {(event.xp ?? 0) > 0 && (
                                <RewardChip
                                    icon={<Sparkles />}
                                    text={'+' + event.xp + ' XP'}
                                />
                            )}
                            {(event.gold ?? 0) > 0 && (
                                <RewardChip
                                    icon={<Coins />}
                                    text={'+' + event.gold + ' gold'}
                                />
                            )}
                            {(event.gold_spent ?? 0) > 0 && (
                                <RewardChip
                                    icon={<Coins />}
                                    text={'-' + event.gold_spent + ' gold'}
                                />
                            )}
                        </div>

                        {event.loot && (
                            <div className="bg-muted/30 mt-5 rounded-2xl border p-4">
                                <div className="flex items-center gap-2">
                                    <Gem className="size-4" />
                                    <span className="text-xs font-semibold tracking-wide uppercase">
                                        Loot found
                                    </span>
                                </div>
                                <p className="mt-2 text-lg font-semibold">
                                    {event.loot.name}
                                </p>
                                <p className="text-muted-foreground mt-1 text-sm capitalize">
                                    {event.loot.rarity} · {event.loot.slot}
                                </p>
                            </div>
                        )}

                        {!!event.achievements?.length && (
                            <div className="mt-5 space-y-2">
                                {event.achievements.map((achievement) => (
                                    <div
                                        key={achievement.slug}
                                        className="flex items-start gap-3 rounded-2xl border p-3"
                                    >
                                        <div className="bg-muted flex size-9 items-center justify-center rounded-xl">
                                            <Trophy className="size-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {achievement.name}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                Achievement unlocked · +
                                                {achievement.xp} XP · +
                                                {achievement.gold} gold
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {event.type === 'equipment_changed' && (
                            <p className="text-muted-foreground mt-5 text-sm">
                                Equipment changed. Your layered hero sprite has
                                updated.
                            </p>
                        )}

                        {event.type === 'shop_purchase' && event.item?.name && (
                            <p className="text-muted-foreground mt-5 text-sm">
                                {event.item.name} is now in your inventory.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RewardChip({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <span className="bg-muted/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium">
            {icon}
            {text}
        </span>
    );
}
