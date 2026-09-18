import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Difficulty } from '@/lib/runeday';

type CalendarTask = {
    id: number;
    title: string;
    difficulty: Difficulty;
    due_at: string;
    completed_at?: string | null;
    project?: { id: number; title: string } | null;
};

type CalendarDaily = {
    id: number;
    title: string;
    frequency: 'daily' | 'weekly';
    days_of_week?: number[] | null;
};

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Calendar({
    month,
    monthLabel,
    tasks,
    dailies,
}: {
    month: string;
    monthLabel: string;
    tasks: CalendarTask[];
    dailies: CalendarDaily[];
}) {
    const cursor = new Date(`${month}-01T12:00:00`);
    const year = cursor.getFullYear();
    const monthIndex = cursor.getMonth();
    const firstDayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const tasksByDay = new Map<number, CalendarTask[]>();
    tasks.forEach((task) => {
        const day = new Date(task.due_at).getDate();
        tasksByDay.set(day, [...(tasksByDay.get(day) ?? []), task]);
    });

    const moveMonth = (delta: number) => {
        const next = new Date(year, monthIndex + delta, 1);
        const value = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
        router.visit(`/calendar?month=${value}`);
    };

    return (
        <>
            <Head title="Calendar" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            See the adventure ahead
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Calendar
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveMonth(-1)}
                        >
                            <ChevronLeft />
                        </Button>
                        <div className="min-w-36 text-center font-medium">
                            {monthLabel}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveMonth(1)}
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </header>

                <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                    <Card className="overflow-hidden rounded-3xl">
                        <CardContent className="p-0">
                            <div className="bg-muted/30 grid grid-cols-7 border-b">
                                {weekdayLabels.map((label) => (
                                    <div
                                        key={label}
                                        className="text-muted-foreground px-2 py-3 text-center text-xs font-medium"
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {Array.from({ length: firstDayOffset }).map(
                                    (_, index) => (
                                        <div
                                            key={`blank-${index}`}
                                            className="bg-muted/10 min-h-28 border-r border-b"
                                        />
                                    ),
                                )}
                                {Array.from({ length: daysInMonth }).map(
                                    (_, index) => {
                                        const day = index + 1;
                                        const events =
                                            tasksByDay.get(day) ?? [];
                                        const isToday =
                                            new Date().getFullYear() === year &&
                                            new Date().getMonth() ===
                                                monthIndex &&
                                            new Date().getDate() === day;

                                        return (
                                            <div
                                                key={day}
                                                className="min-h-28 border-r border-b p-2 md:min-h-36"
                                            >
                                                <div
                                                    className={
                                                        isToday
                                                            ? 'bg-foreground text-background mb-2 flex size-7 items-center justify-center rounded-full text-xs font-semibold'
                                                            : 'mb-2 flex size-7 items-center justify-center text-xs font-medium'
                                                    }
                                                >
                                                    {day}
                                                </div>
                                                <div className="space-y-1">
                                                    {events
                                                        .slice(0, 3)
                                                        .map((task) => (
                                                            <button
                                                                key={task.id}
                                                                className={
                                                                    task.completed_at
                                                                        ? 'bg-muted block w-full truncate rounded-md px-2 py-1 text-left text-[11px] line-through opacity-50'
                                                                        : 'bg-background block w-full truncate rounded-md border px-2 py-1 text-left text-[11px]'
                                                                }
                                                                onClick={() =>
                                                                    router.visit(
                                                                        '/quests',
                                                                    )
                                                                }
                                                                title={
                                                                    task.title
                                                                }
                                                            >
                                                                {task.title}
                                                            </button>
                                                        ))}
                                                    {events.length > 3 && (
                                                        <div className="text-muted-foreground px-1 text-[10px]">
                                                            +{events.length - 3}{' '}
                                                            more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-fit rounded-3xl">
                        <CardHeader>
                            <CardTitle>Recurring rhythm</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-muted-foreground text-sm">
                                Dailies stay visible here without generating
                                hundreds of duplicate calendar events.
                            </p>
                            {dailies.map((daily) => (
                                <div
                                    key={daily.id}
                                    className="rounded-2xl border p-3"
                                >
                                    <p className="font-medium">{daily.title}</p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {daily.frequency === 'daily'
                                            ? 'Every day'
                                            : (daily.days_of_week ?? [])
                                                  .map(
                                                      (day) =>
                                                          weekdayLabels[
                                                              day - 1
                                                          ],
                                                  )
                                                  .join(' · ')}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
