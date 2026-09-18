import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Castle,
    Check,
    Coins,
    Crown,
    DoorOpen,
    Settings,
    Shield,
    Sparkles,
    Swords,
    Trash2,
    UserPlus,
    UsersRound,
    X,
} from 'lucide-react';
import { CharacterSprite } from '@/components/game/character-sprite';
import { GuildHallVisual } from '@/components/guild/guild-hall-visual';
import { RaidBossSprite } from '@/components/guild/raid-boss-sprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type {
    ActiveGuildRaid,
    GuildHero,
    GuildIncomingInvite,
    GuildMemberView,
    GuildRaidBoss,
    GuildSnapshot,
} from '@/types/guild';

export default function GuildPage({
    membership,
    incoming_invites,
    guild,
}: GuildSnapshot) {
    if (!membership || !guild) {
        return <NoGuild incomingInvites={incoming_invites} />;
    }

    const settingsForm = useForm({
        name: guild.name,
        tag: guild.tag,
        description: guild.description ?? '',
    });

    return (
        <>
            <Head title="Guild" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Phase 5 · Guilds
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        [{guild.tag}] {guild.name}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Every real quest can strengthen your Guild Hall and,
                        when a raid is active, become a cooperative attack.
                    </p>
                </header>

                <section className="grid gap-6 lg:grid-cols-[390px_1fr]">
                    <Card className="overflow-hidden rounded-3xl">
                        <CardContent className="p-0">
                            <div className="flex min-h-[300px] items-center justify-center bg-zinc-950 p-6 text-white">
                                <GuildHallVisual
                                    hall={guild.hall}
                                    className="w-full max-w-80"
                                />
                            </div>
                            <div className="border-t p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
                                            Guild Hall · Tier {guild.hall.level}
                                        </p>
                                        <p className="mt-1 text-xl font-semibold">
                                            {guild.hall.name}
                                        </p>
                                    </div>
                                    <span className="rounded-full border px-3 py-1 text-xs capitalize">
                                        {membership.role}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            {guild.total_xp} Guild XP
                                        </span>
                                        <span>
                                            {guild.hall.next_xp
                                                ? guild.hall.next_xp +
                                                  ' next tier'
                                                : 'Max tier'}
                                        </span>
                                    </div>
                                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                                        <div
                                            className="bg-foreground h-full rounded-full transition-all"
                                            style={{
                                                width:
                                                    guild.hall
                                                        .progress_percent + '%',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                                    <GuildMetric
                                        label="Members"
                                        value={
                                            guild.member_count +
                                            '/' +
                                            guild.hall.member_capacity
                                        }
                                    />
                                    <GuildMetric
                                        label="Guild XP"
                                        value={guild.total_xp}
                                    />
                                    <GuildMetric
                                        label="Hall"
                                        value={guild.hall.level}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <RaidSection
                        raid={guild.active_raid ?? null}
                        bosses={guild.raid_bosses}
                        canStart={membership.can_manage_invites}
                        isLeader={membership.is_leader}
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UsersRound className="size-4" />
                                Guild roster
                                <span className="text-muted-foreground ml-auto text-sm font-normal">
                                    {guild.members.length} heroes
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            {guild.members.map((member) => (
                                <MemberCard
                                    key={member.id}
                                    member={member}
                                    selfRole={membership.role}
                                    canManageRoles={membership.can_manage_roles}
                                />
                            ))}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {membership.can_manage_invites && (
                            <InvitePanel
                                friends={guild.invitable_friends}
                                pending={guild.pending_invites}
                            />
                        )}

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Recent contributions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {guild.recent_contributions.length === 0 ? (
                                    <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
                                        Complete quests to start building the
                                        Hall.
                                    </p>
                                ) : (
                                    guild.recent_contributions.map(
                                        (contribution) => (
                                            <div
                                                key={contribution.id}
                                                className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {contribution.name}
                                                    </p>
                                                    <p className="text-muted-foreground text-[11px]">
                                                        @{contribution.handle}
                                                        {contribution.difficulty
                                                            ? ' · ' +
                                                              contribution.difficulty
                                                            : ''}
                                                    </p>
                                                </div>
                                                <span
                                                    className={
                                                        contribution.capped
                                                            ? 'text-muted-foreground text-xs'
                                                            : 'text-xs font-semibold'
                                                    }
                                                >
                                                    +{contribution.guild_xp} GXP
                                                </span>
                                            </div>
                                        ),
                                    )
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {membership.is_leader && (
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="size-4" />
                                Guild settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="grid gap-4 lg:grid-cols-[1fr_150px_2fr_auto]"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    settingsForm.put('/guild/' + guild.slug, {
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">
                                        Name
                                    </label>
                                    <Input
                                        value={settingsForm.data.name}
                                        onChange={(event) =>
                                            settingsForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">
                                        Tag
                                    </label>
                                    <Input
                                        value={settingsForm.data.tag}
                                        maxLength={5}
                                        onChange={(event) =>
                                            settingsForm.setData(
                                                'tag',
                                                event.target.value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9]/g, ''),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">
                                        Description
                                    </label>
                                    <Input
                                        value={settingsForm.data.description}
                                        onChange={(event) =>
                                            settingsForm.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    className="self-end"
                                    disabled={settingsForm.processing}
                                >
                                    Save
                                </Button>
                            </form>

                            <div className="mt-6 border-t pt-5">
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Disband this guild permanently? Members, Hall XP and raid history will be deleted.',
                                            )
                                        ) {
                                            router.delete('/guild');
                                        }
                                    }}
                                >
                                    <Trash2 />
                                    Disband guild
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!membership.is_leader && (
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Leave this guild? Your historical contribution ledger remains with the guild.',
                                    )
                                ) {
                                    router.delete('/guild/membership');
                                }
                            }}
                        >
                            <DoorOpen />
                            Leave guild
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

function NoGuild({
    incomingInvites,
}: {
    incomingInvites: GuildIncomingInvite[];
}) {
    const form = useForm({
        name: '',
        tag: '',
        description: '',
        guild: '',
    });

    return (
        <>
            <Head title="Guild" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Phase 5 · Guilds
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Guilds
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Join friends around a shared Guild Hall. Your real work
                        becomes collective progression and raid damage.
                    </p>
                </header>

                {incomingInvites.length > 0 && (
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>Guild invitations</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            {incomingInvites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="rounded-2xl border p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">
                                                [{invite.guild.tag}]{' '}
                                                {invite.guild.name}
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                Invited by @
                                                {invite.inviter.handle} ·{' '}
                                                {invite.guild.hall.name}
                                            </p>
                                        </div>
                                        <Castle className="text-muted-foreground size-5" />
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.post(
                                                    '/guild/invites/' +
                                                        invite.id +
                                                        '/accept',
                                                )
                                            }
                                        >
                                            <Check />
                                            Join
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                router.post(
                                                    '/guild/invites/' +
                                                        invite.id +
                                                        '/decline',
                                                )
                                            }
                                        >
                                            <X />
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card className="overflow-hidden rounded-3xl">
                    <div className="grid lg:grid-cols-[1fr_1.1fr]">
                        <div className="flex min-h-80 items-center justify-center bg-zinc-950 p-8 text-white">
                            <GuildHallVisual
                                hall={{
                                    level: 1,
                                    key: 'camp',
                                    name: 'Camp',
                                    min_xp: 0,
                                    next_xp: 500,
                                    member_capacity: 10,
                                    progress_percent: 0,
                                }}
                                className="w-full max-w-80"
                            />
                        </div>
                        <CardContent className="p-6 md:p-8">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                                Found a guild
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold">
                                Start with a Camp.
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Every member's productive quests build toward a
                                Tavern, Guild Hall, Fortress and eventually a
                                Castle.
                            </p>

                            <form
                                className="mt-6 space-y-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post('/guild');
                                }}
                            >
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Guild name
                                    </label>
                                    <Input
                                        value={form.data.name}
                                        placeholder="The Dawnward"
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Tag
                                    </label>
                                    <Input
                                        value={form.data.tag}
                                        maxLength={5}
                                        placeholder="DAWN"
                                        onChange={(event) =>
                                            form.setData(
                                                'tag',
                                                event.target.value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9]/g, ''),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Description
                                    </label>
                                    <textarea
                                        value={form.data.description}
                                        maxLength={500}
                                        placeholder="What kind of guild are you building?"
                                        onChange={(event) =>
                                            form.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        className="bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                                    />
                                </div>
                                {(form.errors.name ||
                                    form.errors.tag ||
                                    form.errors.guild) && (
                                    <p className="text-destructive text-sm">
                                        {form.errors.name ??
                                            form.errors.tag ??
                                            form.errors.guild}
                                    </p>
                                )}
                                <Button
                                    className="w-full"
                                    disabled={
                                        form.processing ||
                                        form.data.name.trim().length < 3 ||
                                        form.data.tag.trim().length < 2
                                    }
                                >
                                    <Castle />
                                    Found guild
                                </Button>
                            </form>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </>
    );
}

function RaidSection({
    raid,
    bosses,
    canStart,
    isLeader,
}: {
    raid: ActiveGuildRaid | null;
    bosses: GuildRaidBoss[];
    canStart: boolean;
    isLeader: boolean;
}) {
    if (raid) {
        const percent = Math.max(
            0,
            Math.min(100, (raid.hp_remaining / raid.max_hp) * 100),
        );

        return (
            <Card className="overflow-hidden rounded-3xl border-2">
                <CardHeader className="border-b">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                                Active guild raid
                            </p>
                            <CardTitle className="mt-1">
                                {raid.boss.name}
                            </CardTitle>
                        </div>
                        {isLeader && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            'Abandon this raid? Current raid damage will not carry to another raid.',
                                        )
                                    ) {
                                        router.delete(
                                            '/guild/raids/' + raid.id,
                                            { preserveScroll: true },
                                        );
                                    }
                                }}
                            >
                                Abandon
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid bg-zinc-950 text-white md:grid-cols-[280px_1fr]">
                        <div className="flex min-h-64 items-center justify-center p-6">
                            <RaidBossSprite
                                visualKey={raid.boss.visual_key}
                                className="size-52"
                            />
                        </div>
                        <div className="flex flex-col justify-center p-6">
                            <p className="text-sm text-zinc-400">
                                Every completed quest from a guild member
                                attacks this boss.
                            </p>
                            <div className="mt-5">
                                <div className="mb-1 flex justify-between text-xs text-zinc-400">
                                    <span>Raid HP</span>
                                    <span>
                                        {raid.hp_remaining} / {raid.max_hp}
                                    </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-white/80"
                                        style={{
                                            width: percent + '%',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/15 px-3 py-1 text-xs">
                                    {raid.total_damage} damage
                                </span>
                                <span className="rounded-full border border-white/15 px-3 py-1 text-xs">
                                    Ends {formatDeadline(raid.ends_at)}
                                </span>
                            </div>
                            <Button asChild className="mt-5 w-fit">
                                <Link href="/today">
                                    <Swords />
                                    Complete a quest
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-5 p-5 md:grid-cols-[1fr_280px]">
                        <div>
                            <p className="font-medium">Victory rewards</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <RewardPill
                                    icon={<Sparkles />}
                                    text={
                                        '+' +
                                        raid.boss.reward_guild_xp +
                                        ' Guild XP'
                                    }
                                />
                                <RewardPill
                                    icon={<Sparkles />}
                                    text={
                                        '+' +
                                        raid.boss.reward_member_xp +
                                        ' XP / contributor'
                                    }
                                />
                                <RewardPill
                                    icon={<Coins />}
                                    text={
                                        '+' +
                                        raid.boss.reward_member_gold +
                                        ' gold / contributor'
                                    }
                                />
                            </div>
                            <p className="text-muted-foreground mt-3 text-xs">
                                Only members who dealt raid damage receive the
                                personal XP/gold reward.
                            </p>
                        </div>

                        <div>
                            <p className="font-medium">Damage board</p>
                            <div className="mt-2 space-y-2">
                                {raid.contributions.length === 0 ? (
                                    <p className="text-muted-foreground rounded-xl border border-dashed p-3 text-xs">
                                        No raid turns yet.
                                    </p>
                                ) : (
                                    raid.contributions.map((row, index) => (
                                        <div
                                            key={row.user_id}
                                            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                                        >
                                            <span className="text-muted-foreground w-5 text-xs">
                                                #{index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {row.name}
                                                </p>
                                                <p className="text-muted-foreground text-[10px]">
                                                    {row.turns} turns
                                                </p>
                                            </div>
                                            <span className="font-semibold">
                                                {row.damage}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle>Guild raids</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">
                    A Leader or Officer can open one raid at a time. Higher Hall
                    tiers unlock stronger bosses and larger collective rewards.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {bosses.map((boss) => (
                        <div
                            key={boss.id}
                            className={
                                boss.unlocked
                                    ? 'flex flex-col rounded-2xl border p-4'
                                    : 'bg-muted/20 flex flex-col rounded-2xl border p-4 opacity-60'
                            }
                        >
                            <div className="flex h-36 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                <RaidBossSprite
                                    visualKey={boss.visual_key}
                                    className="size-30"
                                />
                            </div>
                            <p className="mt-3 font-semibold">{boss.name}</p>
                            <p className="text-muted-foreground mt-1 flex-1 text-xs">
                                {boss.description}
                            </p>
                            <div className="text-muted-foreground mt-3 flex justify-between text-[11px]">
                                <span>{boss.max_hp} HP</span>
                                <span>Hall {boss.min_hall_level}+</span>
                            </div>
                            <Button
                                className="mt-4 w-full"
                                disabled={!boss.unlocked || !canStart}
                                onClick={() =>
                                    router.post(
                                        '/guild/raids/' + boss.id,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                {!boss.unlocked
                                    ? 'Hall locked'
                                    : !canStart
                                      ? 'Officer required'
                                      : 'Start raid'}
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function MemberCard({
    member,
    selfRole,
    canManageRoles,
}: {
    member: GuildMemberView;
    selfRole: 'leader' | 'officer' | 'member';
    canManageRoles: boolean;
}) {
    const canKick =
        !member.is_self &&
        member.role !== 'leader' &&
        (selfRole === 'leader' ||
            (selfRole === 'officer' && member.role === 'member'));

    return (
        <div className="rounded-2xl border p-4">
            <div className="flex items-start gap-3">
                <Link
                    href={'/u/' + member.handle}
                    className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 text-white"
                >
                    <CharacterSprite character={member} className="size-14" />
                </Link>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href={'/u/' + member.handle}
                            className="truncate font-semibold hover:underline"
                        >
                            {member.name}
                        </Link>
                        {member.role === 'leader' && (
                            <Crown className="size-3.5" />
                        )}
                        {member.role === 'officer' && (
                            <Shield className="size-3.5" />
                        )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        @{member.handle} · Level {member.level} ·{' '}
                        {capitalize(member.lineage)} ·{' '}
                        <span className="capitalize">{member.role}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full border px-2 py-1 text-[10px]">
                            {member.contribution_xp} GXP
                        </span>
                        <span className="rounded-full border px-2 py-1 text-[10px]">
                            {member.contribution_tasks} quests
                        </span>
                        <span className="rounded-full border px-2 py-1 text-[10px]">
                            {member.raid_damage} raid dmg
                        </span>
                    </div>
                </div>
            </div>

            {(canManageRoles || canKick) &&
                !member.is_self &&
                member.role !== 'leader' && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                        {canManageRoles && (
                            <>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        router.put(
                                            '/guild/members/' +
                                                member.id +
                                                '/role',
                                            {
                                                role:
                                                    member.role === 'officer'
                                                        ? 'member'
                                                        : 'officer',
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    {member.role === 'officer'
                                        ? 'Demote'
                                        : 'Promote officer'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Transfer guild leadership to ' +
                                                    member.name +
                                                    '? You will become an Officer.',
                                            )
                                        ) {
                                            router.post(
                                                '/guild/members/' +
                                                    member.id +
                                                    '/transfer-leadership',
                                                {},
                                                {
                                                    preserveScroll: true,
                                                },
                                            );
                                        }
                                    }}
                                >
                                    Transfer leader
                                </Button>
                            </>
                        )}
                        {canKick && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            'Remove ' +
                                                member.name +
                                                ' from the guild?',
                                        )
                                    ) {
                                        router.delete(
                                            '/guild/members/' + member.id,
                                            {
                                                preserveScroll: true,
                                            },
                                        );
                                    }
                                }}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                )}
        </div>
    );
}

function InvitePanel({
    friends,
    pending,
}: {
    friends: GuildHero[];
    pending: Array<{
        id: number;
        handle: string;
        name: string;
    }>;
}) {
    return (
        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="size-4" />
                    Invite friends
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {friends.length === 0 ? (
                    <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                        No eligible friends right now. Guild invites are
                        intentionally limited to accepted RuneDay friends.
                    </p>
                ) : (
                    friends.slice(0, 8).map((friend) => (
                        <div
                            key={friend.handle}
                            className="flex items-center gap-3 rounded-xl border p-3"
                        >
                            <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-zinc-950 text-white">
                                <CharacterSprite
                                    character={friend}
                                    className="size-9"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {friend.name}
                                </p>
                                <p className="text-muted-foreground text-[11px]">
                                    @{friend.handle} · Level {friend.level}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.post(
                                        '/guild/invites/' + friend.handle,
                                        {},
                                        {
                                            preserveScroll: true,
                                        },
                                    )
                                }
                            >
                                Invite
                            </Button>
                        </div>
                    ))
                )}

                {pending.length > 0 && (
                    <div className="border-t pt-3">
                        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                            Pending
                        </p>
                        {pending.map((invite) => (
                            <div
                                key={invite.id}
                                className="flex items-center justify-between gap-3 py-2 text-sm"
                            >
                                <span>
                                    {invite.name}{' '}
                                    <span className="text-muted-foreground">
                                        @{invite.handle}
                                    </span>
                                </span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                        router.delete(
                                            '/guild/invites/' + invite.id,
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    Cancel
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function GuildMetric({
    label,
    value,
}: {
    label: string;
    value: number | string;
}) {
    return (
        <div className="rounded-xl border p-2.5">
            <p className="font-semibold">{value}</p>
            <p className="text-muted-foreground mt-1 text-[9px] font-semibold tracking-wide uppercase">
                {label}
            </p>
        </div>
    );
}

function RewardPill({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
            {icon}
            {text}
        </span>
    );
}

function formatDeadline(value: string): string {
    const target = new Date(value).getTime();
    const now = Date.now();
    const hours = Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60)));

    if (hours < 24) {
        return 'in ' + hours + 'h';
    }

    return 'in ' + Math.ceil(hours / 24) + 'd';
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
