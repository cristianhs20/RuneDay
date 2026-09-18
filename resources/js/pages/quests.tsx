import { Head, router, useForm } from '@inertiajs/react';
import { Check, ChevronDown, Plus, ScrollText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Difficulty, Project, Quest } from '@/lib/runeday';
import { formatDateTime, rewards, toLocalDateTimeInput } from '@/lib/runeday';

export default function Quests({
    tasks,
    projects,
}: {
    tasks: Quest[];
    projects: Project[];
}) {
    const taskForm = useForm({
        title: '',
        notes: '',
        difficulty: 'normal' as Difficulty,
        priority: 2,
        project_id: '',
        parent_id: '',
        due_at: '',
        remind_at: '',
        estimate_minutes: '',
    });

    const projectForm = useForm({
        title: '',
        description: '',
        due_at: '',
    });

    const createQuest = (event: React.FormEvent) => {
        event.preventDefault();
        taskForm.post('/tasks', {
            preserveScroll: true,
            onSuccess: () => taskForm.reset(),
        });
    };

    const createProject = (event: React.FormEvent) => {
        event.preventDefault();
        projectForm.post('/projects', {
            preserveScroll: true,
            onSuccess: () => projectForm.reset(),
        });
    };

    const openTasks = tasks.filter((task) => !task.completed_at);
    const completedTasks = tasks.filter((task) => task.completed_at);

    return (
        <>
            <Head title="Quests" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Plan your adventure
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Quests
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                            Serious task management underneath a progression
                            system that makes finishing work feel good.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/inbox')}
                    >
                        Open Inbox
                    </Button>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ScrollText className="size-4" />
                                    Active quests
                                    <span className="text-muted-foreground ml-auto text-sm font-normal">
                                        {openTasks.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {openTasks.length === 0 && (
                                    <EmptyState message="No active quests. Create the next thing worth conquering." />
                                )}
                                {openTasks.map((task) => (
                                    <QuestRow
                                        key={task.id}
                                        task={task}
                                        projects={projects}
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        {completedTasks.length > 0 && (
                            <Card className="rounded-3xl">
                                <CardHeader>
                                    <CardTitle>Recently completed</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {completedTasks.slice(0, 20).map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-3 rounded-2xl border p-4 opacity-70"
                                        >
                                            <Check className="size-4" />
                                            <span className="line-through">
                                                {task.title}
                                            </span>
                                            <span className="text-muted-foreground ml-auto text-xs">
                                                {task.project?.title ??
                                                    'No campaign'}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="size-4" />
                                    New quest
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={createQuest}
                                    className="space-y-3"
                                >
                                    <Input
                                        value={taskForm.data.title}
                                        onChange={(event) =>
                                            taskForm.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="What will you conquer?"
                                    />
                                    <textarea
                                        className="bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                                        value={taskForm.data.notes}
                                        onChange={(event) =>
                                            taskForm.setData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Notes (optional)"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            className="bg-background h-10 rounded-md border px-3 text-sm"
                                            value={taskForm.data.difficulty}
                                            onChange={(event) =>
                                                taskForm.setData(
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
                                        <select
                                            className="bg-background h-10 rounded-md border px-3 text-sm"
                                            value={taskForm.data.project_id}
                                            onChange={(event) =>
                                                taskForm.setData(
                                                    'project_id',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                No campaign
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
                                    </div>
                                    <Input
                                        type="datetime-local"
                                        value={taskForm.data.due_at}
                                        onChange={(event) =>
                                            taskForm.setData(
                                                'due_at',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground text-xs">
                                            Remind me
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={taskForm.data.remind_at}
                                            onChange={(event) =>
                                                taskForm.setData(
                                                    'remind_at',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="1440"
                                        value={taskForm.data.estimate_minutes}
                                        onChange={(event) =>
                                            taskForm.setData(
                                                'estimate_minutes',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Estimated minutes"
                                    />
                                    <Button
                                        className="w-full"
                                        disabled={
                                            taskForm.processing ||
                                            !taskForm.data.title.trim()
                                        }
                                    >
                                        <Plus /> Add quest
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Campaigns</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form
                                    onSubmit={createProject}
                                    className="space-y-2"
                                >
                                    <Input
                                        value={projectForm.data.title}
                                        onChange={(event) =>
                                            projectForm.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Launch RuneDay"
                                    />
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        disabled={
                                            projectForm.processing ||
                                            !projectForm.data.title.trim()
                                        }
                                    >
                                        Create campaign
                                    </Button>
                                </form>
                                <div className="space-y-2">
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="rounded-2xl border p-3"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium">
                                                    {project.title}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    {project.open_tasks_count ??
                                                        0}{' '}
                                                    open
                                                </span>
                                            </div>
                                            {project.due_at && (
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    {formatDateTime(
                                                        project.due_at,
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function QuestRow({ task, projects }: { task: Quest; projects: Project[] }) {
    return (
        <div className="rounded-2xl border p-4">
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
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-medium">{task.title}</p>
                        {task.project && (
                            <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                {task.project.title}
                            </span>
                        )}
                    </div>
                    <div className="text-muted-foreground mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="capitalize">{task.difficulty}</span>
                        <span>+{rewards[task.difficulty].xp} XP</span>
                        {task.estimate_minutes && (
                            <span>{task.estimate_minutes} min</span>
                        )}
                        {task.due_at && (
                            <span>{formatDateTime(task.due_at)}</span>
                        )}
                        {!!task.open_subtasks_count && (
                            <span>
                                {task.open_subtasks_count} subtasks open
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-3 ml-12 space-y-2 border-l pl-3">
                    {task.subtasks.map((subtask) => (
                        <div
                            key={subtask.id}
                            className="flex items-center gap-2 text-sm"
                        >
                            <button
                                className="flex size-6 items-center justify-center rounded-full border"
                                onClick={() =>
                                    !subtask.completed_at &&
                                    router.post(
                                        `/tasks/${subtask.id}/complete`,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                                aria-label={`Complete ${subtask.title}`}
                            >
                                {subtask.completed_at && (
                                    <Check className="size-3" />
                                )}
                            </button>
                            <span
                                className={
                                    subtask.completed_at
                                        ? 'line-through opacity-60'
                                        : ''
                                }
                            >
                                {subtask.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <details className="mt-3 ml-12">
                <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1 text-xs">
                    <ChevronDown className="size-3" />
                    Manage quest
                </summary>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <EditQuestForm task={task} projects={projects} />
                    <SubtaskForm task={task} />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive mt-2"
                    onClick={() =>
                        router.delete(`/tasks/${task.id}`, {
                            preserveScroll: true,
                        })
                    }
                >
                    <Trash2 /> Remove
                </Button>
            </details>
        </div>
    );
}

function EditQuestForm({
    task,
    projects,
}: {
    task: Quest;
    projects: Project[];
}) {
    const form = useForm({
        title: task.title,
        notes: task.notes ?? '',
        difficulty: task.difficulty,
        priority: task.priority,
        project_id: task.project_id ? String(task.project_id) : '',
        parent_id: task.parent_id ? String(task.parent_id) : '',
        due_at: toLocalDateTimeInput(task.due_at),
        remind_at: toLocalDateTimeInput(task.remind_at),
        estimate_minutes: task.estimate_minutes
            ? String(task.estimate_minutes)
            : '',
    });

    return (
        <form
            className="bg-muted/30 space-y-2 rounded-2xl p-3"
            onSubmit={(event) => {
                event.preventDefault();
                form.put(`/tasks/${task.id}`, { preserveScroll: true });
            }}
        >
            <p className="text-xs font-medium tracking-wide uppercase">Edit</p>
            <Input
                value={form.data.title}
                onChange={(event) => form.setData('title', event.target.value)}
            />
            <select
                className="bg-background h-9 w-full rounded-md border px-2 text-sm"
                value={form.data.project_id}
                onChange={(event) =>
                    form.setData('project_id', event.target.value)
                }
            >
                <option value="">No campaign</option>
                {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                        {project.title}
                    </option>
                ))}
            </select>
            <Input
                type="datetime-local"
                value={form.data.due_at}
                onChange={(event) => form.setData('due_at', event.target.value)}
            />
            <div className="space-y-1">
                <label className="text-muted-foreground text-xs">
                    Remind me
                </label>
                <Input
                    type="datetime-local"
                    value={form.data.remind_at}
                    onChange={(event) =>
                        form.setData('remind_at', event.target.value)
                    }
                />
            </div>
            <Button size="sm" disabled={form.processing}>
                Save changes
            </Button>
        </form>
    );
}

function SubtaskForm({ task }: { task: Quest }) {
    const form = useForm({
        title: '',
        notes: '',
        difficulty: 'easy' as Difficulty,
        priority: 1,
        project_id: task.project_id ? String(task.project_id) : '',
        parent_id: String(task.id),
        due_at: '',
        remind_at: '',
        estimate_minutes: '',
    });

    return (
        <form
            className="bg-muted/30 space-y-2 rounded-2xl p-3"
            onSubmit={(event) => {
                event.preventDefault();
                form.post('/tasks', {
                    preserveScroll: true,
                    onSuccess: () => form.reset('title'),
                });
            }}
        >
            <p className="text-xs font-medium tracking-wide uppercase">
                Add subtask
            </p>
            <Input
                value={form.data.title}
                onChange={(event) => form.setData('title', event.target.value)}
                placeholder="Small next step"
            />
            <Button
                size="sm"
                variant="secondary"
                disabled={form.processing || !form.data.title.trim()}
            >
                <Plus /> Add subtask
            </Button>
        </form>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
            {message}
        </div>
    );
}
