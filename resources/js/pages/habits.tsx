import { Head, router, useForm } from '@inertiajs/react';
import { Flame, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Difficulty } from '@/lib/runeday';
import { rewards } from '@/lib/runeday';

type HabitMode = 'positive' | 'negative' | 'neutral' | 'both';

type Habit = {
    id: number;
    title: string;
    notes?: string | null;
    mode: HabitMode;
    difficulty: Difficulty;
    today: {
        positive: number;
        negative: number;
        neutral: number;
    };
    last_7_days: number;
};

export default function Habits({ habits }: { habits: Habit[] }) {
    const form = useForm({
        title: '',
        notes: '',
        mode: 'positive' as HabitMode,
        difficulty: 'easy' as Difficulty,
        is_active: true,
    });

    return (
        <>
            <Head title="Habits" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Small actions compound
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Habits
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Track wins, slips or simple counters without punishing
                        your character for an imperfect day.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flame className="size-4" />
                                Your habits
                                <span className="text-muted-foreground ml-auto text-sm font-normal">
                                    {habits.length}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {habits.length === 0 && (
                                <div className="text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
                                    Create a habit you want to reinforce or
                                    simply observe.
                                </div>
                            )}
                            {habits.map((habit) => (
                                <HabitRow key={habit.id} habit={habit} />
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="h-fit rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="size-4" /> New habit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="space-y-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post('/habits', {
                                        preserveScroll: true,
                                        onSuccess: () => form.reset(),
                                    });
                                }}
                            >
                                <Input
                                    value={form.data.title}
                                    onChange={(event) =>
                                        form.setData(
                                            'title',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Practice English"
                                />
                                <select
                                    className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                                    value={form.data.mode}
                                    onChange={(event) =>
                                        form.setData(
                                            'mode',
                                            event.target.value as HabitMode,
                                        )
                                    }
                                >
                                    <option value="positive">
                                        Positive · reinforce a win
                                    </option>
                                    <option value="negative">
                                        Negative · observe a slip
                                    </option>
                                    <option value="neutral">
                                        Neutral · simple counter
                                    </option>
                                    <option value="both">
                                        Both · wins and slips
                                    </option>
                                </select>
                                <select
                                    className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                                    value={form.data.difficulty}
                                    onChange={(event) =>
                                        form.setData(
                                            'difficulty',
                                            event.target.value as Difficulty,
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
                                            {difficulty}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    className="w-full"
                                    disabled={
                                        form.processing ||
                                        !form.data.title.trim()
                                    }
                                >
                                    Create habit
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function HabitRow({ habit }: { habit: Habit }) {
    const totalToday =
        habit.today.positive + habit.today.negative + habit.today.neutral;

    const log = (direction: 'positive' | 'negative' | 'neutral') =>
        router.post(
            `/habits/${habit.id}/log`,
            { direction },
            { preserveScroll: true },
        );

    return (
        <div className="rounded-2xl border p-4">
            <div className="flex items-start gap-4">
                <div className="bg-muted flex size-11 items-center justify-center rounded-2xl">
                    <Flame className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{habit.title}</p>
                        <span className="bg-muted rounded-full px-2 py-0.5 text-[11px] capitalize">
                            {habit.mode}
                        </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {totalToday} today · {habit.last_7_days} logs in 7 days
                        {habit.mode !== 'negative' && habit.mode !== 'neutral'
                            ? ` · first positive today can earn up to ${Math.max(
                                  5,
                                  Math.floor(rewards[habit.difficulty].xp / 2),
                              )} XP`
                            : ''}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Archive ${habit.title}`}
                    onClick={() =>
                        router.delete(`/habits/${habit.id}`, {
                            preserveScroll: true,
                        })
                    }
                >
                    <Trash2 />
                </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {(habit.mode === 'positive' || habit.mode === 'both') && (
                    <Button variant="secondary" onClick={() => log('positive')}>
                        <Plus />
                        Win{' '}
                        {habit.today.positive > 0 &&
                            `· ${habit.today.positive}`}
                    </Button>
                )}
                {(habit.mode === 'negative' || habit.mode === 'both') && (
                    <Button variant="outline" onClick={() => log('negative')}>
                        <Minus />
                        Slip{' '}
                        {habit.today.negative > 0 &&
                            `· ${habit.today.negative}`}
                    </Button>
                )}
                {habit.mode === 'neutral' && (
                    <Button variant="secondary" onClick={() => log('neutral')}>
                        <Plus />
                        Log{' '}
                        {habit.today.neutral > 0 && `· ${habit.today.neutral}`}
                    </Button>
                )}
            </div>
        </div>
    );
}
