import { Head } from '@inertiajs/react';
import { CheckSquare2, Coins, Flame, Sparkles, TimerReset } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Day = {
    date: string;
    label: string;
    quests: number;
    focus_minutes: number;
    habit_logs: number;
    xp: number;
};

type Totals = {
    quests: number;
    focus_minutes: number;
    habit_logs: number;
    xp: number;
    gold: number;
};

export default function Insights({
    days,
    totals,
    timezone,
}: {
    days: Day[];
    totals: Totals;
    timezone: string;
}) {
    const maxActivity = Math.max(
        1,
        ...days.map(
            (day) =>
                day.quests + day.habit_logs + Math.ceil(day.focus_minutes / 25),
        ),
    );

    return (
        <>
            <Head title="Insights" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Last 7 days · {timezone}
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Progress
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Measure what RuneDay is supposed to improve: real
                        actions completed, not time spent inside the app.
                    </p>
                </header>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Metric
                        icon={<CheckSquare2 />}
                        value={totals.quests}
                        label="quests"
                    />
                    <Metric
                        icon={<TimerReset />}
                        value={totals.focus_minutes}
                        label="focus min"
                    />
                    <Metric
                        icon={<Flame />}
                        value={totals.habit_logs}
                        label="habit logs"
                    />
                    <Metric
                        icon={<Sparkles />}
                        value={totals.xp}
                        label="XP earned"
                    />
                    <Metric
                        icon={<Coins />}
                        value={totals.gold}
                        label="gold earned"
                    />
                </section>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Weekly rhythm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-2 md:gap-4">
                            {days.map((day) => {
                                const activity =
                                    day.quests +
                                    day.habit_logs +
                                    Math.ceil(day.focus_minutes / 25);
                                const height = Math.max(
                                    8,
                                    Math.round((activity / maxActivity) * 100),
                                );

                                return (
                                    <div
                                        key={day.date}
                                        className="flex min-w-0 flex-col items-center"
                                    >
                                        <div className="bg-muted/40 flex h-48 w-full items-end justify-center rounded-2xl p-2">
                                            <div
                                                className="bg-foreground w-full max-w-12 rounded-xl transition-all"
                                                style={{ height: height + '%' }}
                                                title={
                                                    activity +
                                                    ' activity points'
                                                }
                                            />
                                        </div>
                                        <p className="mt-2 text-xs font-medium">
                                            {day.label}
                                        </p>
                                        <p className="text-muted-foreground text-[10px]">
                                            {day.quests}Q · {day.focus_minutes}m
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>Quest consistency</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {days.map((day) => (
                                <DayRow
                                    key={day.date}
                                    label={day.label}
                                    value={day.quests}
                                    suffix="quests"
                                />
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>Focus consistency</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {days.map((day) => (
                                <DayRow
                                    key={day.date}
                                    label={day.label}
                                    value={day.focus_minutes}
                                    suffix="min"
                                />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
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

function DayRow({
    label,
    value,
    suffix,
}: {
    label: string;
    value: number;
    suffix: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border px-3 py-2">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-muted-foreground text-sm">
                {value} {suffix}
            </span>
        </div>
    );
}
