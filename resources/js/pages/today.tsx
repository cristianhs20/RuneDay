import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Check,
    Coins,
    Flame,
    Plus,
    Repeat2,
    Sparkles,
    Sword,
    TimerReset,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Difficulty, Quest } from '@/lib/runeday';
import { formatDateTime, rewards } from '@/lib/runeday';

type Profile = {
    level: number;
    xp: number;
    gold: number;
    total_xp: number;
};

type Daily = {
    id: number;
    title: string;
    difficulty: Difficulty;
    completed_today: boolean;
};

type TodayStats = {
    completed_today: number;
    focus_minutes_today: number;
    habit_logs_today: number;
};

const localDateTimeNow = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    return now.toISOString().slice(0, 16);
};

export default function Today({
    profile,
    tasks,
    dailies,
    stats,
}: {
    profile: Profile;
    tasks: Quest[];
    dailies: Daily[];
    stats: TodayStats;
}) {
    const form = useForm({
        title: '',
        difficulty: 'normal' as Difficulty,
        priority: 2,
        notes: '',
        due_at: localDateTimeNow(),
        remind_at: '',
        estimate_minutes: '',
        project_id: '',
        parent_id: '',
    });

    const addQuest = (event: React.FormEvent) => {
        event.preventDefault();
        form.post('/tasks', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title="Today" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <section className="overflow-hidden rounded-3xl border bg-zinc-950 p-6 text-white shadow-sm md:p-8">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-emerald-300 uppercase">
                                RuneDay · Today
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                Your real life powers your hero.
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                                Complete meaningful quests, reinforce routines
                                and protect time for focused work.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <Stat
                                icon={<Sword />}
                                label="Level"
                                value={profile.level}
                            />
                            <Stat
                                icon={<Sparkles />}
                                label="XP"
                                value={profile.xp}
                            />
                            <Stat
                                icon={<Coins />}
                                label="Gold"
                                value={profile.gold}
                            />
                        </div>
                    </div>
                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-emerald-400 transition-all"
                            style={{ width: `${Math.min(profile.xp, 100)}%` }}
                        />
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                    <Metric
                        icon={<Check />}
                        value={stats.completed_today}
                        label="quests completed"
                    />
                    <Metric
                        icon={<TimerReset />}
                        value={stats.focus_minutes_today}
                        label="focus minutes"
                    />
                    <Metric
                        icon={<Flame />}
                        value={stats.habit_logs_today}
                        label="habit logs"
                    />
                </section>

                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Today&apos;s quests</span>
                                    <Link
                                        href="/quests"
                                        className="text-muted-foreground hover:text-foreground text-sm font-normal"
                                    >
                                        View all
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {tasks.length === 0 && (
                                    <Empty message="No quests due. Pull something from your Inbox or enjoy the victory." />
                                )}
                                {tasks.map((task) => {
                                    const reward = rewards[task.difficulty];
                                    return (
                                        <div
                                            key={task.id}
                                            className="hover:bg-muted/40 flex items-center gap-4 rounded-2xl border p-4 transition"
                                        >
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-full"
                                                onClick={() =>
                                                    router.post(
                                                        `/tasks/${task.id}/complete`,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                <Check />
                                            </Button>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate font-medium">
                                                        {task.title}
                                                    </p>
                                                    {task.project && (
                                                        <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                                            {task.project.title}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="capitalize">
                                                        {task.difficulty}
                                                    </span>
                                                    {task.estimate_minutes && (
                                                        <span>
                                                            ·{' '}
                                                            {
                                                                task.estimate_minutes
                                                            }{' '}
                                                            min
                                                        </span>
                                                    )}
                                                    <span>
                                                        · +{reward.xp} XP
                                                    </span>
                                                    <span>
                                                        · +{reward.gold} gold
                                                    </span>
                                                    {task.due_at && (
                                                        <span>
                                                            ·{' '}
                                                            {formatDateTime(
                                                                task.due_at,
                                                            )}
                                                        </span>
                                                    )}
                                                    {!!task.open_subtasks_count && (
                                                        <span>
                                                            ·{' '}
                                                            {
                                                                task.open_subtasks_count
                                                            }{' '}
                                                            subtasks open
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Repeat2 className="size-4" />
                                    Today&apos;s dailies
                                    <Link
                                        href="/dailies"
                                        className="text-muted-foreground hover:text-foreground ml-auto text-sm font-normal"
                                    >
                                        Manage
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {dailies.length === 0 && (
                                    <Empty message="No recurring quests are scheduled today." />
                                )}
                                {dailies.map((daily) => (
                                    <div
                                        key={daily.id}
                                        className="flex items-center gap-3 rounded-2xl border p-4"
                                    >
                                        <Button
                                            variant={
                                                daily.completed_today
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                            size="icon"
                                            className="rounded-full"
                                            disabled={daily.completed_today}
                                            onClick={() =>
                                                router.post(
                                                    `/dailies/${daily.id}/complete`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <Check />
                                        </Button>
                                        <div className="flex-1">
                                            <p
                                                className={
                                                    daily.completed_today
                                                        ? 'font-medium line-through opacity-60'
                                                        : 'font-medium'
                                                }
                                            >
                                                {daily.title}
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                +{rewards[daily.difficulty].xp}{' '}
                                                XP · recurring quest
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="size-4" /> Quick quest
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={addQuest} className="space-y-4">
                                    <Input
                                        value={form.data.title}
                                        onChange={(event) =>
                                            form.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="What will you conquer?"
                                    />
                                    <select
                                        className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                                        value={form.data.difficulty}
                                        onChange={(event) =>
                                            form.setData(
                                                'difficulty',
                                                event.target
                                                    .value as Difficulty,
                                            )
                                        }
                                    >
                                        {(
                                            [
                                                'easy',
                                                'normal',
                                                'hard',
                                                'epic',
                                            ] as Difficulty[]
                                        ).map((difficulty) => (
                                            <option
                                                key={difficulty}
                                                value={difficulty}
                                            >
                                                {difficulty} ·{' '}
                                                {rewards[difficulty].xp} XP
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="1440"
                                        value={form.data.estimate_minutes}
                                        onChange={(event) =>
                                            form.setData(
                                                'estimate_minutes',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Estimated minutes"
                                    />
                                    <Button
                                        className="w-full"
                                        disabled={
                                            form.processing ||
                                            !form.data.title.trim()
                                        }
                                    >
                                        <Plus /> Add quest
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Next action</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="justify-start"
                                >
                                    <Link href="/inbox">Capture to Inbox</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="justify-start"
                                >
                                    <Link href="/focus">
                                        Start a focus session
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="justify-start"
                                >
                                    <Link href="/habits">Log a habit</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function Stat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="min-w-20 rounded-2xl bg-white/5 px-3 py-3">
            <div className="mx-auto mb-1 flex size-4 items-center justify-center text-emerald-300">
                {icon}
            </div>
            <div className="text-lg font-semibold">{value}</div>
            <div className="text-[10px] tracking-wider text-zinc-500 uppercase">
                {label}
            </div>
        </div>
    );
}

function Metric({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
}) {
    return (
        <div className="bg-card flex items-center gap-3 rounded-2xl border p-4">
            <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                {icon}
            </div>
            <div>
                <div className="text-xl font-semibold">{value}</div>
                <div className="text-muted-foreground text-xs">{label}</div>
            </div>
        </div>
    );
}

function Empty({ message }: { message: string }) {
    return (
        <div className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            {message}
        </div>
    );
}
