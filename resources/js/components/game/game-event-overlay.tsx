import { usePage } from '@inertiajs/react';
import {
    Coins,
    Crown,
    Castle,
    Gem,
    Map,
    Shield,
    Sparkles,
    Swords,
    Trophy,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { EnemySprite } from '@/components/adventure/enemy-sprite';
import { CharacterSprite } from '@/components/game/character-sprite';
import { RaidBossSprite } from '@/components/guild/raid-boss-sprite';
import { Button } from '@/components/ui/button';
import type { AdventureCombatResult } from '@/types/adventure';
import type { GameCharacter, GameEvent } from '@/types/game';
import type { GuildProgressResult } from '@/types/guild';

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

        const timer = window.setTimeout(
            () => setVisible(false),
            event.combat?.victory ? 7000 : 5000,
        );

        return () => window.clearTimeout(timer);
    }, [event, eventKey, gameCharacter]);

    if (!visible || !event || !gameCharacter) return null;

    const isQuest = event.type === 'quest_complete';
    const combat = event.combat ?? null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/25 p-4 backdrop-blur-[2px] md:items-center">
            <div
                className={
                    combat
                        ? 'bg-background relative w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl'
                        : 'bg-background relative w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl'
                }
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 z-20 rounded-full"
                    onClick={() => setVisible(false)}
                    aria-label="Close game result"
                >
                    <X />
                </Button>

                {combat ? (
                    <CombatEvent
                        event={event}
                        combat={combat}
                        character={gameCharacter}
                    />
                ) : (
                    <ProgressEvent
                        event={event}
                        character={gameCharacter}
                        isQuest={isQuest}
                    />
                )}
            </div>
        </div>
    );
}

function CombatEvent({
    event,
    combat,
    character,
}: {
    event: GameEvent;
    combat: AdventureCombatResult;
    character: GameCharacter;
}) {
    const started = event.type === 'encounter_started';
    const victory = combat.victory;
    const capped = combat.capped;
    const enemyHpPercent =
        (combat.enemy_hp_remaining / combat.enemy_max_hp) * 100;
    const heroHpPercent = (combat.hero_hp_remaining / combat.hero_max_hp) * 100;

    return (
        <>
            <div className="grid bg-zinc-950 text-white md:grid-cols-[1fr_auto_1fr]">
                <div className="flex min-h-52 flex-col items-center justify-center p-5">
                    <CharacterSprite
                        character={character}
                        state={
                            started ? 'idle' : victory ? 'celebrate' : 'attack'
                        }
                        className="size-36"
                    />
                    <CombatHp
                        label="Hero"
                        value={combat.hero_hp_remaining}
                        max={combat.hero_max_hp}
                        percent={heroHpPercent}
                    />
                </div>

                <div className="hidden items-center justify-center px-3 text-zinc-600 md:flex">
                    <Swords className="size-6" />
                </div>

                <div className="flex min-h-52 flex-col items-center justify-center p-5">
                    <EnemySprite
                        visualKey={combat.enemy.visual_key}
                        className={victory ? 'size-36 opacity-45' : 'size-36'}
                    />
                    <CombatHp
                        label={combat.enemy.name}
                        value={combat.enemy_hp_remaining}
                        max={combat.enemy_max_hp}
                        percent={enemyHpPercent}
                    />
                </div>
            </div>

            <div className="p-6 md:p-8">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                    {started
                        ? 'Encounter started'
                        : victory
                          ? 'Victory'
                          : capped
                            ? 'Adventure cap reached'
                            : combat.critical
                              ? 'Critical strike'
                              : 'Combat turn'}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    {started
                        ? combat.enemy.name + ' awaits your next real quest.'
                        : victory
                          ? combat.enemy.name + ' defeated.'
                          : capped
                            ? 'Productivity still counts. Combat rests for today.'
                            : 'Your hero dealt ' + combat.damage + ' damage.'}
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
                    {!started && combat.damage > 0 && (
                        <RewardChip
                            icon={<Swords />}
                            text={
                                combat.critical
                                    ? combat.damage + ' damage · CRIT'
                                    : combat.damage + ' damage'
                            }
                        />
                    )}
                    {!started && combat.enemy_damage > 0 && (
                        <RewardChip
                            icon={<Shield />}
                            text={'-' + combat.enemy_damage + ' hero HP'}
                        />
                    )}
                    {combat.rested && (
                        <RewardChip
                            icon={<Shield />}
                            text="Camp rest · HP restored"
                        />
                    )}
                </div>

                {started && (
                    <p className="text-muted-foreground mt-5 text-sm">
                        There is no attack button. Complete a real RuneDay quest
                        and that completion becomes your next combat turn.
                    </p>
                )}

                {combat.rewards && <VictoryRewards rewards={combat.rewards} />}

                {event.loot && (
                    <div className="bg-muted/30 mt-5 rounded-2xl border p-4">
                        <div className="flex items-center gap-2">
                            <Gem className="size-4" />
                            <span className="text-xs font-semibold tracking-wide uppercase">
                                Quest loot
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

                <AchievementList achievements={event.achievements ?? []} />
                <GuildProgressPanel guild={event.guild ?? null} />
            </div>
        </>
    );
}

function VictoryRewards({
    rewards,
}: {
    rewards: NonNullable<AdventureCombatResult['rewards']>;
}) {
    return (
        <div className="mt-5 space-y-3">
            <div className="rounded-2xl border bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2">
                    <Crown className="size-4" />
                    <span className="text-xs font-semibold tracking-wide uppercase">
                        Encounter rewards
                    </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {rewards.gold > 0 && (
                        <RewardChip
                            icon={<Coins />}
                            text={'+' + rewards.gold + ' gold'}
                        />
                    )}
                    {rewards.renown > 0 && (
                        <RewardChip
                            icon={<Sparkles />}
                            text={'+' + rewards.renown + ' renown'}
                        />
                    )}
                </div>

                {rewards.boss_item && (
                    <div className="bg-background/60 mt-3 rounded-xl border p-3">
                        <p className="text-xs font-semibold tracking-wide uppercase">
                            First-clear boss gear
                        </p>
                        <p className="mt-1 font-semibold">
                            {rewards.boss_item.name}
                        </p>
                        <p className="text-muted-foreground text-xs capitalize">
                            {rewards.boss_item.rarity} ·{' '}
                            {rewards.boss_item.slot}
                        </p>
                    </div>
                )}
            </div>

            {rewards.objectives.map((objective) => (
                <div
                    key={objective.slug}
                    className="flex items-start gap-3 rounded-2xl border p-3"
                >
                    <div className="bg-muted flex size-9 items-center justify-center rounded-xl">
                        <Trophy className="size-4" />
                    </div>
                    <div>
                        <p className="font-medium">{objective.name}</p>
                        <p className="text-muted-foreground text-xs">
                            Region quest complete · +{objective.gold} gold · +
                            {objective.renown} renown
                        </p>
                    </div>
                </div>
            ))}

            {rewards.unlocked_region && (
                <div className="flex items-start gap-3 rounded-2xl border border-violet-400/40 bg-violet-500/5 p-3">
                    <div className="bg-muted flex size-9 items-center justify-center rounded-xl">
                        <Map className="size-4" />
                    </div>
                    <div>
                        <p className="font-medium">New region unlocked</p>
                        <p className="text-muted-foreground text-xs">
                            {rewards.unlocked_region.name}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProgressEvent({
    event,
    character,
    isQuest,
}: {
    event: GameEvent;
    character: GameCharacter;
    isQuest: boolean;
}) {
    return (
        <div className="grid gap-5 p-6 md:grid-cols-[180px_1fr] md:p-8">
            <div className="flex items-center justify-center rounded-3xl bg-zinc-950 p-4 text-white">
                <CharacterSprite
                    character={character}
                    state={isQuest ? 'attack' : 'celebrate'}
                    className="size-36"
                />
            </div>

            <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                    {event.type === 'guild_raid_started'
                        ? 'Guild raid opened'
                        : isQuest
                          ? 'Quest cleared'
                          : 'Progress recorded'}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    {event.type === 'guild_raid_started'
                        ? 'Your guild has a new target.'
                        : isQuest
                          ? 'Your hero grows stronger.'
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

                <AchievementList achievements={event.achievements ?? []} />
                <GuildProgressPanel guild={event.guild ?? null} />

                {event.type === 'equipment_changed' && (
                    <p className="text-muted-foreground mt-5 text-sm">
                        Equipment changed. Your layered hero sprite has updated.
                    </p>
                )}

                {event.type === 'shop_purchase' && event.item?.name && (
                    <p className="text-muted-foreground mt-5 text-sm">
                        {event.item.name} is now in your inventory.
                    </p>
                )}
            </div>
        </div>
    );
}

function AchievementList({
    achievements,
}: {
    achievements: NonNullable<GameEvent['achievements']>;
}) {
    if (achievements.length === 0) return null;

    return (
        <div className="mt-5 space-y-2">
            {achievements.map((achievement) => (
                <div
                    key={achievement.slug}
                    className="flex items-start gap-3 rounded-2xl border p-3"
                >
                    <div className="bg-muted flex size-9 items-center justify-center rounded-xl">
                        <Trophy className="size-4" />
                    </div>
                    <div>
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-muted-foreground text-xs">
                            Achievement unlocked · +{achievement.xp} XP · +
                            {achievement.gold} gold
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function GuildProgressPanel({ guild }: { guild: GuildProgressResult | null }) {
    if (!guild) return null;

    const raid = guild.raid ?? null;
    const hasGuildXp = (guild.guild_xp ?? 0) > 0;

    return (
        <div className="mt-5 rounded-2xl border bg-sky-500/5 p-4">
            <div className="flex items-center gap-2">
                <Castle className="size-4" />
                <span className="text-xs font-semibold tracking-wide uppercase">
                    Guild progress
                </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {hasGuildXp && (
                    <RewardChip
                        icon={<Sparkles />}
                        text={'+' + guild.guild_xp + ' Guild XP'}
                    />
                )}
                {guild.hall_upgraded && guild.hall && (
                    <RewardChip
                        icon={<Castle />}
                        text={'Hall upgraded · ' + guild.hall.name}
                    />
                )}
                {raid && raid.damage > 0 && (
                    <RewardChip
                        icon={<Swords />}
                        text={
                            raid.critical
                                ? raid.damage + ' raid damage · CRIT'
                                : raid.damage + ' raid damage'
                        }
                    />
                )}
            </div>

            {raid && (
                <div className="bg-background/60 mt-3 rounded-xl border p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-16 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <RaidBossSprite
                                visualKey={raid.boss.visual_key}
                                className="size-14"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">{raid.boss.name}</p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {raid.capped
                                    ? 'Daily cap reached · 0 raid damage'
                                    : raid.victory
                                      ? 'Raid defeated'
                                      : raid.hp_remaining +
                                        ' / ' +
                                        raid.max_hp +
                                        ' HP remaining'}
                            </p>
                        </div>
                    </div>

                    {raid.settlement && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                            <RewardChip
                                icon={<Sparkles />}
                                text={
                                    '+' + raid.settlement.guild_xp + ' Guild XP'
                                }
                            />
                            <RewardChip
                                icon={<Sparkles />}
                                text={'+' + raid.settlement.member_xp + ' XP'}
                            />
                            <RewardChip
                                icon={<Coins />}
                                text={
                                    '+' + raid.settlement.member_gold + ' gold'
                                }
                            />
                            {raid.settlement.hall_upgraded && (
                                <RewardChip
                                    icon={<Castle />}
                                    text={
                                        'Hall upgraded · ' +
                                        raid.settlement.hall.name
                                    }
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CombatHp({
    label,
    value,
    max,
    percent,
}: {
    label: string;
    value: number;
    max: number;
    percent: number;
}) {
    return (
        <div className="mt-3 w-full max-w-44">
            <div className="mb-1 flex items-center justify-between text-[10px] text-zinc-400">
                <span>{label}</span>
                <span>
                    {value}/{max}
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-white/75 transition-all"
                    style={{ width: Math.max(0, Math.min(100, percent)) + '%' }}
                />
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
