import { Head, router, useForm } from '@inertiajs/react';
import { Check, Plus, Repeat2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Difficulty } from '@/lib/runeday';
import { rewards } from '@/lib/runeday';

type Daily = {
    id: number;
    title: string;
    notes?: string | null;
    difficulty: Difficulty;
    frequency: 'daily' | 'weekly';
    days_of_week?: number[] | null;
    starts_on?: string | null;
    ends_on?: string | null;
    due_today: boolean;
    completed_today: boolean;
};

const weekDays = [
    [1, 'Mon'],
    [2, 'Tue'],
    [3, 'Wed'],
    [4, 'Thu'],
    [5, 'Fri'],
    [6, 'Sat'],
    [7, 'Sun'],
] as const;

export default function Dailies({ dailies }: { dailies: Daily[] }) {
    const form = useForm({
        title: '',
        notes: '',
        difficulty: 'normal' as Difficulty,
        frequency: 'daily' as 'daily' | 'weekly',
        days_of_week: [] as number[],
        starts_on: '',
        ends_on: '',
        is_active: true,
    });

    const toggleDay = (day: number) => {
        form.setData(
            'days_of_week',
            form.data.days_of_week.includes(day)
                ? form.data.days_of_week.filter((item) => item !== day)
                : [...form.data.days_of_week, day],
        );
    };

    const due = dailies.filter(
        (daily) => daily.due_today && !daily.completed_today,
    );
    const complete = dailies.filter((daily) => daily.completed_today);
    const later = dailies.filter((daily) => !daily.due_today);

    return (
        <>
            <Head title="Dailies" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Consistency over perfection
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Dailies
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Recurring quests give your routine structure. Missing
                        one never removes XP.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Repeat2 className="size-4" />
                                    Due today
                                    <span className="text-muted-foreground ml-auto text-sm font-normal">
                                        {due.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {due.length === 0 && (
                                    <div className="text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
                                        All recurring quests for today are
                                        complete.
                                    </div>
                                )}
                                {due.map((daily) => (
                                    <DailyRow key={daily.id} daily={daily} />
                                ))}
                            </CardContent>
                        </Card>

                        {complete.length > 0 && (
                            <Card className="rounded-3xl">
                                <CardHeader>
                                    <CardTitle>Completed today</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {complete.map((daily) => (
                                        <DailyRow
                                            key={daily.id}
                                            daily={daily}
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {later.length > 0 && (
                            <Card className="rounded-3xl">
                                <CardHeader>
                                    <CardTitle>
                                        Scheduled for other days
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {later.map((daily) => (
                                        <DailyRow
                                            key={daily.id}
                                            daily={daily}
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Card className="h-fit rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="size-4" /> New daily
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="space-y-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post('/dailies', {
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
                                    placeholder="Read for 20 minutes"
                                />
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
                                            {difficulty} ·{' '}
                                            {rewards[difficulty].xp} XP
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                                    value={form.data.frequency}
                                    onChange={(event) =>
                                        form.setData(
                                            'frequency',
                                            event.target.value as
                                                | 'daily'
                                                | 'weekly',
                                        )
                                    }
                                >
                                    <option value="daily">Every day</option>
                                    <option value="weekly">
                                        Selected weekdays
                                    </option>
                                </select>

                                {form.data.frequency === 'weekly' && (
                                    <div className="grid grid-cols-7 gap-1">
                                        {weekDays.map(([day, label]) => {
                                            const selected =
                                                form.data.days_of_week.includes(
                                                    day,
                                                );
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    className={
                                                        selected
                                                            ? 'bg-foreground text-background rounded-lg px-1 py-2 text-xs'
                                                            : 'rounded-lg border px-1 py-2 text-xs'
                                                    }
                                                    onClick={() =>
                                                        toggleDay(day)
                                                    }
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    disabled={
                                        form.processing ||
                                        !form.data.title.trim() ||
                                        (form.data.frequency === 'weekly' &&
                                            form.data.days_of_week.length === 0)
                                    }
                                >
                                    Create daily
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function DailyRow({ daily }: { daily: Daily }) {
    const schedule =
        daily.frequency === 'daily'
            ? 'Every day'
            : weekDays
                  .filter(([day]) => daily.days_of_week?.includes(day))
                  .map(([, label]) => label)
                  .join(' · ');

    return (
        <div className="flex items-center gap-3 rounded-2xl border p-4">
            <Button
                variant={daily.completed_today ? 'secondary' : 'outline'}
                size="icon"
                className="rounded-full"
                disabled={!daily.due_today || daily.completed_today}
                onClick={() =>
                    router.post(
                        `/dailies/${daily.id}/complete`,
                        {},
                        { preserveScroll: true },
                    )
                }
                aria-label={`Complete ${daily.title}`}
            >
                <Check />
            </Button>
            <div className="min-w-0 flex-1">
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
                    {schedule} · {rewards[daily.difficulty].xp} XP
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                aria-label={`Archive ${daily.title}`}
                onClick={() =>
                    router.delete(`/dailies/${daily.id}`, {
                        preserveScroll: true,
                    })
                }
            >
                <Trash2 />
            </Button>
        </div>
    );
}
