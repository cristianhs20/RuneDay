import { Head, router } from '@inertiajs/react';
import { Pause, Play, RotateCcw, TimerReset } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TaskOption = {
    id: number;
    title: string;
};

type FocusSession = {
    id: number;
    duration_minutes: number;
    completed_at: string;
    mode: string;
    task?: TaskOption | null;
};

const presets = [25, 50, 90];

export default function Focus({
    sessions,
    todayMinutes,
    tasks,
}: {
    sessions: FocusSession[];
    todayMinutes: number;
    tasks: TaskOption[];
}) {
    const [duration, setDuration] = useState(25);
    const [remaining, setRemaining] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [taskId, setTaskId] = useState('');
    const completing = useRef(false);

    useEffect(() => {
        if (!running) return;

        const timer = window.setInterval(() => {
            setRemaining((value) => Math.max(0, value - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [running]);

    useEffect(() => {
        if (!running || remaining !== 0 || completing.current) return;

        completing.current = true;
        setRunning(false);
        router.post(
            '/focus-sessions',
            {
                duration_minutes: duration,
                task_id: taskId || null,
                mode: duration === 25 ? 'pomodoro' : 'focus',
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    completing.current = false;
                    setRemaining(duration * 60);
                },
            },
        );
    }, [duration, remaining, running, taskId]);

    const elapsed = duration * 60 - remaining;
    const progress = useMemo(
        () => Math.min(100, Math.max(0, (elapsed / (duration * 60)) * 100)),
        [duration, elapsed],
    );

    const selectDuration = (minutes: number) => {
        if (running) return;
        setDuration(minutes);
        setRemaining(minutes * 60);
    };

    const reset = () => {
        setRunning(false);
        setRemaining(duration * 60);
    };

    const clock = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(
        remaining % 60,
    ).padStart(2, '0')}`;

    return (
        <>
            <Head title="Focus" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Do the work, then earn the reward
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Focus
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        A quiet timer linked to your quests. RuneDay rewards
                        completed focus time, not time spent browsing the app.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <Card className="overflow-hidden rounded-3xl">
                        <CardContent className="p-6 md:p-10">
                            <div className="mx-auto max-w-xl text-center">
                                <div className="mb-6 flex justify-center gap-2">
                                    {presets.map((minutes) => (
                                        <Button
                                            key={minutes}
                                            variant={
                                                duration === minutes
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                selectDuration(minutes)
                                            }
                                            disabled={running}
                                        >
                                            {minutes} min
                                        </Button>
                                    ))}
                                </div>

                                <div className="border-muted relative mx-auto mb-8 flex aspect-square max-w-sm items-center justify-center rounded-full border-[12px]">
                                    <div
                                        className="absolute inset-[-12px] rounded-full border-[12px] border-emerald-500 transition-all"
                                        style={{
                                            clipPath: `inset(${100 - progress}% 0 0 0)`,
                                        }}
                                        aria-hidden="true"
                                    />
                                    <div className="relative z-10">
                                        <TimerReset className="mx-auto mb-4 size-7 text-emerald-500" />
                                        <div className="font-mono text-6xl font-semibold tracking-tight md:text-7xl">
                                            {clock}
                                        </div>
                                        <p className="text-muted-foreground mt-3 text-sm">
                                            {running
                                                ? 'Stay with the quest.'
                                                : 'Ready when you are.'}
                                        </p>
                                    </div>
                                </div>

                                <select
                                    className="bg-background mx-auto mb-6 h-10 w-full max-w-sm rounded-md border px-3 text-sm"
                                    value={taskId}
                                    disabled={running}
                                    onChange={(event) =>
                                        setTaskId(event.target.value)
                                    }
                                >
                                    <option value="">
                                        Focus without a linked quest
                                    </option>
                                    {tasks.map((task) => (
                                        <option key={task.id} value={task.id}>
                                            {task.title}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex justify-center gap-3">
                                    <Button
                                        size="lg"
                                        onClick={() =>
                                            setRunning((value) => !value)
                                        }
                                    >
                                        {running ? <Pause /> : <Play />}
                                        {running
                                            ? 'Pause'
                                            : elapsed > 0
                                              ? 'Resume'
                                              : 'Start focus'}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={reset}
                                    >
                                        <RotateCcw /> Reset
                                    </Button>
                                </div>

                                <p className="text-muted-foreground mt-5 text-xs">
                                    Complete the timer to record the session and
                                    receive its progression reward.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Today</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-semibold">
                                    {todayMinutes}
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    focused minutes
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Recent sessions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {sessions.length === 0 && (
                                    <p className="text-muted-foreground text-sm">
                                        Your completed focus sessions will
                                        appear here.
                                    </p>
                                )}
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="rounded-2xl border p-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium">
                                                {session.duration_minutes} min
                                            </span>
                                            <span className="text-muted-foreground text-xs capitalize">
                                                {session.mode}
                                            </span>
                                        </div>
                                        {session.task && (
                                            <p className="text-muted-foreground mt-1 truncate text-xs">
                                                {session.task.title}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
