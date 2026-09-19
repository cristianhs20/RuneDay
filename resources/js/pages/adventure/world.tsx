import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    Coins,
    Crown,
    LockKeyhole,
    Map,
    Shield,
    Sparkles,
    Swords,
    Trophy,
} from 'lucide-react';
import { EnemySprite } from '@/components/adventure/enemy-sprite';
import { ProductionCharacter } from '@/components/game/production-character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
    ActiveEncounter,
    AdventureEnemy,
    AdventureRegion,
    AdventureWorld,
} from '@/types/adventure';
import type { GameCharacter } from '@/types/game';

export default function World({
    world,
    character,
}: {
    world: AdventureWorld;
    character: GameCharacter;
}) {
    if (!character.created) {
        return (
            <>
                <Head title="World" />
                <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center p-4 md:p-8">
                    <Card className="w-full rounded-3xl">
                        <CardContent className="flex flex-col items-center p-10 text-center">
                            <div className="bg-muted flex size-16 items-center justify-center rounded-2xl">
                                <Map className="size-7" />
                            </div>
                            <h1 className="mt-5 text-3xl font-semibold tracking-tight">
                                Your world is waiting.
                            </h1>
                            <p className="text-muted-foreground mt-3 max-w-lg text-sm">
                                Create your hero first. Adventure progression is
                                tied to the same character you improve through
                                real quests.
                            </p>
                            <Button asChild className="mt-6">
                                <Link href="/character">Create hero</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="World" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Phase 3 · Adventure PvE
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        World
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Your real quests are your attacks. Choose an encounter,
                        then return to your actual work.
                    </p>
                </header>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric
                        icon={<Sparkles />}
                        label="Renown"
                        value={world.profile.renown}
                    />
                    <Metric
                        icon={<Swords />}
                        label="Victories"
                        value={world.profile.victories}
                    />
                    <Metric
                        icon={<Crown />}
                        label="Bosses"
                        value={world.profile.boss_victories}
                    />
                    <Metric
                        icon={<Shield />}
                        label="Total damage"
                        value={world.profile.total_damage}
                    />
                </section>

                {world.active_encounter ? (
                    <ActiveEncounterCard
                        encounter={world.active_encounter}
                        character={character}
                    />
                ) : (
                    <Card className="rounded-3xl border-dashed">
                        <CardContent className="flex flex-col items-center px-6 py-10 text-center">
                            <Swords className="text-muted-foreground size-7" />
                            <p className="mt-3 font-medium">
                                No active encounter
                            </p>
                            <p className="text-muted-foreground mt-1 max-w-lg text-sm">
                                Pick an unlocked enemy below. Once the encounter
                                starts, completing real quests will damage it.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6">
                    {world.regions.map((region, index) => (
                        <RegionCard
                            key={region.id}
                            region={region}
                            activeEncounter={world.active_encounter ?? null}
                            character={character}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

function ActiveEncounterCard({
    encounter,
    character,
}: {
    encounter: ActiveEncounter;
    character: GameCharacter;
}) {
    return (
        <Card className="overflow-hidden rounded-3xl border-2">
            <CardHeader className="border-b">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Active encounter · {encounter.region.name}
                        </p>
                        <CardTitle className="mt-1">
                            {encounter.enemy.name}
                        </CardTitle>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.delete(
                                '/adventure/encounters/' + encounter.id,
                                { preserveScroll: true },
                            )
                        }
                    >
                        Abandon encounter
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid bg-zinc-950 text-white md:grid-cols-[1fr_auto_1fr]">
                    <div className="flex min-h-64 flex-col items-center justify-center p-6">
                        <ProductionCharacter
                            character={character}
                            className="size-44"
                        />
                        <p className="mt-2 font-medium">{character.name}</p>
                        <HealthBar
                            value={encounter.hero_hp_remaining}
                            max={encounter.hero_max_hp}
                            label="Hero HP"
                        />
                    </div>

                    <div className="hidden items-center justify-center px-4 text-zinc-500 md:flex">
                        <Swords className="size-7" />
                    </div>

                    <div className="flex min-h-64 flex-col items-center justify-center p-6">
                        <EnemySprite
                            visualKey={encounter.enemy.visual_key}
                            className="size-44"
                        />
                        <p className="mt-2 font-medium">
                            {encounter.enemy.name}
                        </p>
                        <HealthBar
                            value={encounter.enemy_hp_remaining}
                            max={encounter.enemy.max_hp}
                            label="Enemy HP"
                        />
                    </div>
                </div>

                <div className="grid gap-4 border-t p-5 lg:grid-cols-[1fr_320px]">
                    <div>
                        <p className="font-medium">
                            Your next completed quest attacks.
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Power increases damage, Guard reduces the
                            counterattack, and Focus/Luck raise critical chance.
                            If HP reaches zero, your hero camps automatically
                            and keeps all enemy damage progress.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border px-3 py-1 text-xs">
                                {encounter.turns} turns
                            </span>
                            <span className="rounded-full border px-3 py-1 text-xs">
                                {encounter.damage_dealt} damage dealt
                            </span>
                            <span className="rounded-full border px-3 py-1 text-xs">
                                {encounter.rests} camp rests
                            </span>
                        </div>

                        <Button asChild className="mt-5">
                            <Link href="/today">Go complete a quest</Link>
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Recent combat</p>
                        {encounter.recent_actions.length === 0 ? (
                            <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                                No attacks yet.
                            </p>
                        ) : (
                            encounter.recent_actions.map((action) => (
                                <div
                                    key={action.id}
                                    className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                                >
                                    <span>
                                        {action.capped
                                            ? 'Reward cap'
                                            : action.critical
                                              ? 'Critical hit'
                                              : 'Attack'}
                                    </span>
                                    <span className="font-medium">
                                        {action.capped
                                            ? '0'
                                            : '-' + action.damage + ' HP'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RegionCard({
    region,
    activeEncounter,
    character,
    index,
}: {
    region: AdventureRegion;
    activeEncounter: ActiveEncounter | null;
    character: GameCharacter;
    index: number;
}) {
    const palette = [
        'from-emerald-950 to-zinc-950',
        'from-orange-950 to-zinc-950',
        'from-indigo-950 to-zinc-950',
    ][index % 3];

    const bossProgress = Math.min(
        100,
        Math.round(
            (region.progress.enemy_victories /
                region.progress.boss_required_victories) *
                100,
        ),
    );

    return (
        <Card className="overflow-hidden rounded-3xl">
            <div
                className={'bg-gradient-to-br p-6 text-white md:p-8 ' + palette}
            >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <div className="flex items-center gap-2">
                            {!region.unlocked && (
                                <LockKeyhole className="size-4" />
                            )}
                            {region.progress.boss_defeated && (
                                <Check className="size-4 text-emerald-300" />
                            )}
                            <p className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase">
                                Region {index + 1}
                            </p>
                        </div>
                        <h2 className="mt-2 text-2xl font-semibold">
                            {region.name}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-white/65">
                            {region.description}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                        {!region.unlocked
                            ? 'Requires level ' +
                              region.min_level +
                              ' + previous boss'
                            : region.progress.boss_defeated
                              ? 'Region cleared'
                              : region.boss_unlocked
                                ? 'Boss unlocked'
                                : region.progress.enemy_victories +
                                  ' / ' +
                                  region.progress.boss_required_victories +
                                  ' victories to boss'}
                    </div>
                </div>

                {region.unlocked && !region.progress.boss_defeated && (
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-white/70 transition-all"
                            style={{ width: bossProgress + '%' }}
                        />
                    </div>
                )}
            </div>

            <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_330px]">
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <p className="font-medium">Encounters</p>
                        {!region.unlocked && (
                            <span className="text-muted-foreground text-xs">
                                Locked
                            </span>
                        )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        {region.enemies.map((enemy) => (
                            <EnemyCard
                                key={enemy.slug}
                                enemy={enemy}
                                activeEncounter={activeEncounter}
                                heroLevel={character.level}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <p className="mb-3 font-medium">Region quests</p>
                    <div className="space-y-2">
                        {region.objectives.map((objective) => {
                            const percent = Math.min(
                                100,
                                Math.round(
                                    (objective.progress / objective.threshold) *
                                        100,
                                ),
                            );

                            return (
                                <div
                                    key={objective.slug}
                                    className={
                                        objective.claimed
                                            ? 'rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-3'
                                            : 'rounded-2xl border p-3'
                                    }
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-muted flex size-9 items-center justify-center rounded-xl">
                                            {objective.claimed ? (
                                                <Check className="size-4" />
                                            ) : (
                                                <Trophy className="size-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">
                                                {objective.name}
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {objective.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
                                        <div
                                            className="bg-foreground h-full rounded-full"
                                            style={{
                                                width: percent + '%',
                                            }}
                                        />
                                    </div>
                                    <div className="text-muted-foreground mt-2 flex items-center justify-between text-[11px]">
                                        <span>
                                            {objective.progress} /{' '}
                                            {objective.threshold}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1">
                                                <Coins className="size-3" />+
                                                {objective.reward_gold}
                                            </span>
                                            <span>
                                                +{objective.reward_renown}{' '}
                                                renown
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function EnemyCard({
    enemy,
    activeEncounter,
}: {
    enemy: AdventureEnemy;
    activeEncounter: ActiveEncounter | null;
    heroLevel: number;
}) {
    const active = activeEncounter?.enemy.slug === enemy.slug;
    const anotherActive = activeEncounter !== null && !active;

    return (
        <div
            className={
                enemy.unlocked
                    ? 'flex flex-col rounded-2xl border p-4'
                    : 'bg-muted/20 flex flex-col rounded-2xl border p-4 opacity-60'
            }
        >
            <div className="flex h-32 items-center justify-center rounded-xl bg-zinc-950 text-white">
                {enemy.unlocked ? (
                    <EnemySprite
                        visualKey={enemy.visual_key}
                        className="size-28"
                    />
                ) : (
                    <LockKeyhole className="size-6 text-zinc-600" />
                )}
            </div>

            <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                    <p className="font-semibold">{enemy.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                        {enemy.type}
                    </p>
                </div>
                {enemy.wins ? (
                    <span className="bg-muted rounded-full px-2 py-1 text-[10px]">
                        {enemy.wins} wins
                    </span>
                ) : null}
            </div>

            <div className="text-muted-foreground mt-3 grid grid-cols-3 gap-1 text-center text-[10px]">
                <div className="rounded-lg border p-1.5">
                    <strong className="text-foreground block">
                        {enemy.max_hp}
                    </strong>
                    HP
                </div>
                <div className="rounded-lg border p-1.5">
                    <strong className="text-foreground block">
                        {enemy.attack}
                    </strong>
                    ATK
                </div>
                <div className="rounded-lg border p-1.5">
                    <strong className="text-foreground block">
                        {enemy.defense}
                    </strong>
                    DEF
                </div>
            </div>

            <Button
                className="mt-4 w-full"
                variant={enemy.type === 'boss' ? 'default' : 'secondary'}
                disabled={!enemy.unlocked || anotherActive || active}
                onClick={() =>
                    enemy.id &&
                    router.post(
                        '/adventure/enemies/' + enemy.id + '/encounter',
                        {},
                        { preserveScroll: true },
                    )
                }
            >
                {active
                    ? 'Active encounter'
                    : !enemy.unlocked
                      ? enemy.type === 'boss'
                          ? 'Boss locked'
                          : 'Locked'
                      : anotherActive
                        ? 'Finish current encounter'
                        : enemy.type === 'boss'
                          ? 'Challenge boss'
                          : 'Start encounter'}
            </Button>
        </div>
    );
}

function HealthBar({
    value,
    max,
    label,
}: {
    value: number;
    max: number;
    label: string;
}) {
    const percent = Math.max(0, Math.min(100, (value / max) * 100));

    return (
        <div className="mt-3 w-full max-w-56">
            <div className="mb-1 flex items-center justify-between text-[10px] text-zinc-400">
                <span>{label}</span>
                <span>
                    {value} / {max}
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-white/75 transition-all"
                    style={{ width: percent + '%' }}
                />
            </div>
        </div>
    );
}

function Metric({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="bg-card flex items-center gap-3 rounded-2xl border p-4">
            <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                {icon}
            </div>
            <div>
                <p className="text-xl font-semibold">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
            </div>
        </div>
    );
}