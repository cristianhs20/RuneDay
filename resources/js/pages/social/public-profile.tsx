import { Head, Link, router } from '@inertiajs/react';
import {
    Backpack,
    Blocks,
    Download,
    ExternalLink,
    Shield,
    Sparkles,
    Swords,
    Trophy,
    UserMinus,
    UserPlus,
    UsersRound,
} from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import { CharacterSprite } from '@/components/game/character-sprite';
import { ActivityCard } from '@/components/social/activity-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PublicSocialProfile } from '@/types/social';

export default function PublicProfile(props: PublicSocialProfile) {
    const {
        profile,
        relationship,
        character,
        adventure,
        achievements,
        recent_activity,
    } = props;
    const heroRef = useRef<HTMLDivElement>(null);

    const shareProfile = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: character.name + ' on RuneDay',
                    text:
                        'Inspect ' +
                        character.name +
                        ' · Level ' +
                        character.level +
                        ' on RuneDay.',
                    url,
                });

                return;
            } catch {
                // Native share dismissal is intentionally silent.
            }
        }

        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied.');
    };

    const downloadCard = async () => {
        const svg = heroRef.current?.querySelector('svg');

        if (!svg) {
            toast.error('Hero preview is not ready yet.');

            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const context = canvas.getContext('2d');

        if (!context) return;

        context.fillStyle = '#09090b';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#18181b';
        roundRect(context, 48, 48, 1104, 534, 36);
        context.fill();

        const serialized = new XMLSerializer().serializeToString(svg);
        const image = new Image();
        image.src =
            'data:image/svg+xml;charset=utf-8,' +
            encodeURIComponent(serialized);

        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('Unable to render hero.'));
        });

        context.drawImage(image, 80, 125, 330, 330);

        context.fillStyle = '#a1a1aa';
        context.font = '600 24px sans-serif';
        context.fillText('RUNEDAY · LEVEL UP YOUR REAL LIFE', 455, 135);

        context.fillStyle = '#fafafa';
        context.font = '700 56px sans-serif';
        context.fillText(
            trimCanvasText(context, character.name, 650),
            455,
            215,
        );

        context.fillStyle = '#a1a1aa';
        context.font = '500 26px sans-serif';
        context.fillText(
            '@' +
                profile.handle +
                '  ·  Level ' +
                character.level +
                '  ·  ' +
                capitalize(character.lineage) +
                '  ·  ' +
                capitalize(character.archetype),
            455,
            260,
        );

        const metrics: Array<[string, number | string]> = [
            ['Friends', profile.friend_count],
            ['Gear score', character.stats?.gear_score ?? 'Private'],
            ['Renown', adventure?.renown ?? 'Private'],
            ['Bosses', adventure?.boss_victories ?? 'Private'],
        ];

        metrics.forEach(([label, value], index) => {
            const x = 455 + (index % 2) * 280;
            const y = 335 + Math.floor(index / 2) * 105;

            context.fillStyle = '#27272a';
            roundRect(context, x, y, 245, 78, 18);
            context.fill();

            context.fillStyle = '#fafafa';
            context.font = '700 28px sans-serif';
            context.fillText(String(value), x + 18, y + 34);

            context.fillStyle = '#71717a';
            context.font = '500 16px sans-serif';
            context.fillText(label.toUpperCase(), x + 18, y + 58);
        });

        context.fillStyle = '#71717a';
        context.font = '500 18px sans-serif';
        context.fillText('runeday · your real life powers your hero', 80, 540);

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png', 0.95),
        );

        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'runeday-' + profile.handle + '.png';
        link.click();
        URL.revokeObjectURL(url);

        toast.success('Share card created.');
    };

    return (
        <>
            <Head title={character.name + ' · RuneDay'}>
                <meta
                    name="description"
                    content={
                        'Inspect @' +
                        profile.handle +
                        ' · Level ' +
                        character.level +
                        ' on RuneDay.'
                    }
                />
            </Head>

            <div className="bg-background min-h-screen">
                <header className="border-b">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                        <Link
                            href="/"
                            className="text-lg font-semibold tracking-tight"
                        >
                            RuneDay
                        </Link>
                        <div className="flex gap-2">
                            {relationship === 'guest' ? (
                                <Button asChild variant="outline">
                                    <Link href="/login">Sign in</Link>
                                </Button>
                            ) : (
                                <Button asChild variant="outline">
                                    <Link href="/today">Open RuneDay</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 py-8 md:p-8 md:py-12">
                    <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
                        <Card className="overflow-hidden rounded-3xl">
                            <CardContent className="p-0">
                                <div
                                    ref={heroRef}
                                    className="flex min-h-[390px] items-center justify-center bg-zinc-950 p-8 text-white"
                                >
                                    <CharacterSprite
                                        character={character}
                                        className="size-72 max-w-full"
                                    />
                                </div>
                                <div className="border-t p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xl font-semibold">
                                                {character.name}
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                @{profile.handle} · Level{' '}
                                                {character.level} ·{' '}
                                                {capitalize(character.lineage)}{' '}
                                                ·{' '}
                                                {capitalize(
                                                    character.archetype,
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {profile.friend_count}
                                            </p>
                                            <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                                                Friends
                                            </p>
                                        </div>
                                    </div>

                                    {profile.bio && (
                                        <p className="text-muted-foreground mt-4 text-sm">
                                            {profile.bio}
                                        </p>
                                    )}

                                    <RelationshipActions
                                        handle={profile.handle}
                                        relationship={relationship}
                                        friendRequestsEnabled={
                                            profile.friend_requests_enabled
                                        }
                                    />

                                    {profile.shareable && (
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <Button
                                                variant="secondary"
                                                onClick={shareProfile}
                                            >
                                                <ExternalLink />
                                                Share
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={downloadCard}
                                            >
                                                <Download />
                                                Card PNG
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            {character.stats && (
                                <Card className="rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="size-4" />
                                            Hero stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                        <Metric
                                            label="Power"
                                            value={character.stats.power}
                                        />
                                        <Metric
                                            label="Guard"
                                            value={character.stats.guard}
                                        />
                                        <Metric
                                            label="Focus"
                                            value={character.stats.focus}
                                        />
                                        <Metric
                                            label="Luck"
                                            value={character.stats.luck}
                                        />
                                        <Metric
                                            label="Gear"
                                            value={character.stats.gear_score}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {adventure && (
                                <Card className="rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Swords className="size-4" />
                                            Adventure
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        <Metric
                                            label="Renown"
                                            value={adventure.renown}
                                        />
                                        <Metric
                                            label="Victories"
                                            value={adventure.victories}
                                        />
                                        <Metric
                                            label="Bosses"
                                            value={adventure.boss_victories}
                                        />
                                        <Metric
                                            label="Damage"
                                            value={adventure.total_damage}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="rounded-3xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Backpack className="size-4" />
                                        Equipment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-2 sm:grid-cols-2">
                                    {[
                                        'weapon',
                                        'head',
                                        'chest',
                                        'feet',
                                        'back',
                                        'accessory',
                                    ].map((slot) => {
                                        const item = character.equipment[slot];

                                        return (
                                            <div
                                                key={slot}
                                                className="rounded-2xl border p-3"
                                            >
                                                <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                                                    {slot}
                                                </p>
                                                <p className="mt-1 font-medium">
                                                    {item?.name ?? 'Empty'}
                                                </p>
                                                {item && (
                                                    <p className="text-muted-foreground mt-1 text-xs capitalize">
                                                        {item.rarity}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {achievements.length > 0 && (
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="size-4" />
                                    Recent achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.slug}
                                        className="rounded-2xl border p-4"
                                    >
                                        <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                                            <Trophy className="size-4" />
                                        </div>
                                        <p className="mt-3 font-semibold">
                                            {achievement.name}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {achievement.description}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>Recent milestones</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recent_activity.length === 0 ? (
                                <div className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
                                    No visible social milestones yet.
                                </div>
                            ) : (
                                recent_activity.map((activity) => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <footer className="text-muted-foreground flex flex-col items-center justify-between gap-3 border-t py-6 text-xs sm:flex-row">
                        <span>
                            RuneDay shares game progress, not private task
                            content.
                        </span>
                        <Link
                            href="/"
                            className="hover:text-foreground inline-flex items-center gap-1 font-medium"
                        >
                            Level up your real life
                            <Sparkles className="size-3.5" />
                        </Link>
                    </footer>
                </main>
            </div>
        </>
    );
}

function RelationshipActions({
    handle,
    relationship,
    friendRequestsEnabled,
}: {
    handle: string;
    relationship: PublicSocialProfile['relationship'];
    friendRequestsEnabled: boolean;
}) {
    if (relationship === 'self') {
        return (
            <Button asChild className="mt-5 w-full">
                <Link href="/social/profile">Edit social profile</Link>
            </Button>
        );
    }

    if (relationship === 'guest') {
        return (
            <Button asChild className="mt-5 w-full">
                <Link href="/login">
                    <UserPlus />
                    Sign in to connect
                </Link>
            </Button>
        );
    }

    if (relationship === 'friends') {
        return (
            <div className="mt-5 grid grid-cols-2 gap-2">
                <Button variant="secondary" disabled>
                    <UsersRound />
                    Friends
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        if (
                            window.confirm(
                                'Remove @' + handle + ' from your friends?',
                            )
                        ) {
                            router.delete('/friends/' + handle, {
                                preserveScroll: true,
                            });
                        }
                    }}
                >
                    <UserMinus />
                    Remove
                </Button>
                <Button
                    variant="ghost"
                    className="text-muted-foreground col-span-2"
                    onClick={() => {
                        if (
                            window.confirm(
                                'Block @' +
                                    handle +
                                    '? This also removes the friendship.',
                            )
                        ) {
                            router.post('/social/blocks/' + handle, {});
                        }
                    }}
                >
                    <Blocks />
                    Block
                </Button>
            </div>
        );
    }

    if (relationship === 'outgoing') {
        return (
            <Button className="mt-5 w-full" variant="secondary" disabled>
                Friend request pending
            </Button>
        );
    }

    if (relationship === 'incoming') {
        return (
            <Button asChild className="mt-5 w-full">
                <Link href="/friends">Respond to friend request</Link>
            </Button>
        );
    }

    if (relationship === 'none') {
        return (
            <Button
                className="mt-5 w-full"
                disabled={!friendRequestsEnabled}
                onClick={() =>
                    router.post(
                        '/friend-requests',
                        { identifier: handle },
                        { preserveScroll: true },
                    )
                }
            >
                <UserPlus />
                {friendRequestsEnabled
                    ? 'Add friend'
                    : 'Friend requests disabled'}
            </Button>
        );
    }

    return null;
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border p-3 text-center">
            <p className="text-xl font-semibold">{value}</p>
            <p className="text-muted-foreground mt-1 text-[10px] font-semibold tracking-wide uppercase">
                {label}
            </p>
        </div>
    );
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function roundRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
}

function trimCanvasText(
    context: CanvasRenderingContext2D,
    value: string,
    maxWidth: number,
): string {
    if (context.measureText(value).width <= maxWidth) return value;

    let result = value;

    while (
        result.length > 1 &&
        context.measureText(result + '…').width > maxWidth
    ) {
        result = result.slice(0, -1);
    }

    return result + '…';
}
