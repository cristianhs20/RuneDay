import { Link, router } from '@inertiajs/react';
import { Crown, Flame, PartyPopper, Swords } from 'lucide-react';
import { CharacterSprite } from '@/components/game/character-sprite';
import type { SocialActivity } from '@/types/social';

const reactionMeta = {
    cheer: { icon: PartyPopper, label: 'Cheer' },
    fire: { icon: Flame, label: 'Fire' },
    sword: { icon: Swords, label: 'Sword' },
    crown: { icon: Crown, label: 'Crown' },
} as const;

export function ActivityCard({ activity }: { activity: SocialActivity }) {
    const message = activityMessage(activity);

    return (
        <article className="bg-card rounded-2xl border p-4">
            <div className="flex items-start gap-3">
                <Link
                    href={'/u/' + activity.actor.handle}
                    className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 text-white"
                >
                    <CharacterSprite
                        character={activity.actor}
                        className="size-11"
                    />
                </Link>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                            href={'/u/' + activity.actor.handle}
                            className="font-semibold hover:underline"
                        >
                            {activity.actor.name}
                        </Link>
                        <span className="text-muted-foreground text-xs">
                            @{activity.actor.handle}
                        </span>
                        <span className="bg-muted rounded-full px-2 py-0.5 text-[10px]">
                            Lv. {activity.actor.level}
                        </span>
                    </div>

                    <p className="mt-2 text-sm">{message}</p>

                    {activity.created_at && (
                        <p className="text-muted-foreground mt-2 text-[11px]">
                            {new Intl.DateTimeFormat(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            }).format(new Date(activity.created_at))}
                        </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {(
                            Object.keys(reactionMeta) as Array<
                                keyof typeof reactionMeta
                            >
                        ).map((type) => {
                            const meta = reactionMeta[type];
                            const Icon = meta.icon;
                            const count = activity.reactions[type] ?? 0;
                            const active = activity.viewer_reaction === type;

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    disabled={!activity.can_react}
                                    className={
                                        active
                                            ? 'bg-foreground text-background inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium'
                                            : 'text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition disabled:cursor-default disabled:opacity-60'
                                    }
                                    onClick={() =>
                                        router.post(
                                            '/social/activities/' +
                                                activity.id +
                                                '/reaction',
                                            { type },
                                            { preserveScroll: true },
                                        )
                                    }
                                    aria-label={
                                        meta.label +
                                        ' reaction, ' +
                                        count +
                                        ' total'
                                    }
                                >
                                    <Icon className="size-3.5" />
                                    {count > 0 && <span>{count}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </article>
    );
}

function activityMessage(activity: SocialActivity): string {
    const data = activity.data;

    switch (activity.type) {
        case 'hero_created':
            return (
                'created ' +
                stringValue(data.hero_name, 'a new hero') +
                ' · ' +
                capitalize(stringValue(data.lineage, 'human')) +
                ' ' +
                capitalize(stringValue(data.archetype, 'wanderer'))
            );
        case 'level_up':
            return (
                'reached level ' +
                numberValue(data.level, activity.actor.level) +
                '.'
            );
        case 'achievement_unlocked':
            return (
                'unlocked the achievement “' +
                stringValue(data.name, 'Milestone') +
                '”.'
            );
        case 'loot_found':
            return (
                'found ' +
                articleFor(stringValue(data.rarity, 'rare')) +
                ' ' +
                capitalize(stringValue(data.rarity, 'rare')) +
                ' item: ' +
                stringValue(data.name, 'mysterious gear') +
                '.'
            );
        case 'boss_victory':
            return (
                'defeated ' +
                stringValue(data.enemy, 'a boss') +
                ' in ' +
                stringValue(data.region, 'the world') +
                '.'
            );
        case 'region_unlocked':
            return (
                'unlocked the region ' +
                stringValue(data.region, 'Unknown Region') +
                '.'
            );
        default:
            return 'made meaningful progress in RuneDay.';
    }
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
    return typeof value === 'number' ? value : fallback;
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function articleFor(value: string): string {
    return /^[aeiou]/i.test(value) ? 'an' : 'a';
}
