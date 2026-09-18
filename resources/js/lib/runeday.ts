export type Difficulty = 'easy' | 'normal' | 'hard' | 'epic';

export const rewards: Record<Difficulty, { xp: number; gold: number }> = {
    easy: { xp: 15, gold: 5 },
    normal: { xp: 30, gold: 10 },
    hard: { xp: 60, gold: 20 },
    epic: { xp: 120, gold: 40 },
};

export const difficultyLabels: Record<Difficulty, string> = {
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    epic: 'Epic',
};

export type Project = {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    due_at?: string | null;
    open_tasks_count?: number;
};

export type Quest = {
    id: number;
    project_id?: number | null;
    parent_id?: number | null;
    title: string;
    notes?: string | null;
    status?: string;
    difficulty: Difficulty;
    priority: number;
    due_at?: string | null;
    remind_at?: string | null;
    estimate_minutes?: number | null;
    completed_at?: string | null;
    open_subtasks_count?: number;
    project?: Pick<Project, 'id' | 'title'> | null;
    subtasks?: Quest[];
};

export const formatDateTime = (value?: string | null) => {
    if (!value) return null;

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};
