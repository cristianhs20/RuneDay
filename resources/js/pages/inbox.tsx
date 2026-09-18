import { Head, router, useForm } from '@inertiajs/react';
import { Check, Inbox as InboxIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Project, Quest } from '@/lib/runeday';
import { rewards } from '@/lib/runeday';

export default function Inbox({
    tasks,
    projects,
}: {
    tasks: Quest[];
    projects: Project[];
}) {
    const form = useForm({
        title: '',
        difficulty: 'normal',
        priority: 2,
        notes: '',
        due_at: '',
        remind_at: '',
        estimate_minutes: '',
        project_id: '',
        parent_id: '',
    });

    const capture = (event: React.FormEvent) => {
        event.preventDefault();
        form.post('/tasks', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const planTask = (task: Quest, projectId: string, dueAt: string) => {
        router.put(
            `/tasks/${task.id}`,
            {
                title: task.title,
                notes: task.notes ?? '',
                difficulty: task.difficulty,
                priority: task.priority,
                estimate_minutes: task.estimate_minutes ?? null,
                project_id: projectId || null,
                parent_id: task.parent_id ?? null,
                due_at: dueAt || null,
                remind_at: task.remind_at ?? null,
            },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Inbox" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">
                        Quick capture
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Inbox
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Capture first. Decide when and where it belongs later.
                    </p>
                </header>

                <Card className="rounded-3xl">
                    <CardContent className="pt-6">
                        <form onSubmit={capture} className="flex gap-3">
                            <Input
                                value={form.data.title}
                                onChange={(event) =>
                                    form.setData('title', event.target.value)
                                }
                                placeholder="What is on your mind?"
                                autoFocus
                            />
                            <Button
                                disabled={
                                    form.processing || !form.data.title.trim()
                                }
                            >
                                Capture
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <InboxIcon className="size-4" />
                            Unplanned quests
                            <span className="text-muted-foreground ml-auto text-sm font-normal">
                                {tasks.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tasks.length === 0 && (
                            <div className="text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
                                Inbox zero. Everything has a place.
                            </div>
                        )}

                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="rounded-2xl border p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full"
                                        aria-label={`Complete ${task.title}`}
                                        onClick={() =>
                                            router.post(
                                                `/tasks/${task.id}/complete`,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <Check />
                                    </Button>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">
                                            {task.title}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs capitalize">
                                            {task.difficulty} · +
                                            {rewards[task.difficulty].xp} XP
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Delete ${task.title}`}
                                        onClick={() =>
                                            router.delete(`/tasks/${task.id}`, {
                                                preserveScroll: true,
                                            })
                                        }
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>

                                <div className="mt-4 grid gap-2 border-t pt-4 md:grid-cols-[1fr_1fr_auto]">
                                    <select
                                        className="bg-background h-10 rounded-md border px-3 text-sm"
                                        defaultValue=""
                                        onChange={(event) =>
                                            planTask(
                                                task,
                                                event.target.value,
                                                '',
                                            )
                                        }
                                    >
                                        <option value="">
                                            Assign campaign…
                                        </option>
                                        {projects.map((project) => (
                                            <option
                                                key={project.id}
                                                value={project.id}
                                            >
                                                {project.title}
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        type="datetime-local"
                                        aria-label="Schedule quest"
                                        onBlur={(event) =>
                                            event.target.value &&
                                            planTask(
                                                task,
                                                '',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={() => router.visit('/quests')}
                                    >
                                        Plan later
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
