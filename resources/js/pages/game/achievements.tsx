import { Head } from '@inertiajs/react';
import { Check, Coins, Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Achievement = {
    slug: string;
    name: string;
    description: string;
    icon: string;
    threshold: number;
    progress: number;
    reward_xp: number;
    reward_gold: number;
    unlocked: boolean;
    unlocked_at?: string | null;
};

export default function Achievements({
    achievements,
}: {
    achievements: Achievement[];
}) {
    const unlocked = achievements.filter((achievement) => achievement.unlocked);

    return (
        <>
            <Head title="Achievements" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-muted-foreground text-sm">Milestones</p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Achievements
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Achievements reward sustained real-world progress. They
                        never require purchases.
                    </p>
                </header>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Summary label="Unlocked" value={unlocked.length} />
                    <Summary label="Total" value={achievements.length} />
                    <Summary
                        label="Completion"
                        value={
                            achievements.length > 0
                                ? Math.round(
                                      (unlocked.length / achievements.length) *
                                          100,
                                  )
                                : 0
                        }
                        suffix="%"
                    />
                </div>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="size-4" />
                            Milestones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                        {achievements.map((achievement) => {
                            const percent = Math.min(
                                100,
                                Math.round(
                                    (achievement.progress /
                                        achievement.threshold) *
                                        100,
                                ),
                            );

                            return (
                                <div
                                    key={achievement.slug}
                                    className={
                                        achievement.unlocked
                                            ? 'rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5 p-4'
                                            : 'rounded-2xl border p-4'
                                    }
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={
                                                achievement.unlocked
                                                    ? 'flex size-11 items-center justify-center rounded-xl bg-emerald-500/15'
                                                    : 'bg-muted flex size-11 items-center justify-center rounded-xl'
                                            }
                                        >
                                            {achievement.unlocked ? (
                                                <Check className="size-5" />
                                            ) : (
                                                <Trophy className="size-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="font-semibold">
                                                    {achievement.name}
                                                </p>
                                                {achievement.unlocked && (
                                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                        Unlocked
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {achievement.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                                {achievement.progress} /{' '}
                                                {achievement.threshold}
                                            </span>
                                            <span>{percent}%</span>
                                        </div>
                                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                                            <div
                                                className="bg-foreground h-full rounded-full transition-all"
                                                style={{
                                                    width: percent + '%',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {achievement.reward_xp > 0 && (
                                            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px]">
                                                <Sparkles className="size-3" />+
                                                {achievement.reward_xp} XP
                                            </span>
                                        )}
                                        {achievement.reward_gold > 0 && (
                                            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px]">
                                                <Coins className="size-3" />+
                                                {achievement.reward_gold} gold
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Summary({
    label,
    value,
    suffix = '',
}: {
    label: string;
    value: number;
    suffix?: string;
}) {
    return (
        <div className="bg-card rounded-2xl border p-4">
            <p className="text-2xl font-semibold">
                {value}
                {suffix}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
        </div>
    );
}
