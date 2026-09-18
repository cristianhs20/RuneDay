import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Check,
    Clipboard,
    Clock3,
    Plus,
    Settings,
    UserRoundPlus,
    UsersRound,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { CharacterSprite } from '@/components/game/character-sprite';
import { ActivityCard } from '@/components/social/activity-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type {
    SocialActivity,
    SocialPerson,
    SocialProfileSettings,
    SocialRequest,
} from '@/types/social';

export default function Social({
    profile,
    friends,
    incoming_requests,
    outgoing_requests,
    feed,
    leaderboard,
}: {
    profile: SocialProfileSettings;
    friends: SocialPerson[];
    incoming_requests: SocialRequest[];
    outgoing_requests: SocialRequest[];
    blocked: SocialPerson[];
    feed: SocialActivity[];
    leaderboard: SocialPerson[];
}) {
    const requestForm = useForm({
        identifier: '',
    });

    const sendRequest = (event: React.FormEvent) => {
        event.preventDefault();

        requestForm.post('/friend-requests', {
            preserveScroll: true,
            onSuccess: () => requestForm.reset(),
        });
    };

    const copyFriendCode = async () => {
        await navigator.clipboard.writeText(profile.friend_code);
        toast.success('Friend code copied.');
    };

    return (
        <>
            <Head title="Friends" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Phase 4 · Social
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Friends
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                            Build a party around real progress. RuneDay shares
                            milestones, never your task titles, notes or private
                            schedule.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={'/u/' + profile.handle}>
                                View profile
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/social/profile">
                                <Settings />
                                Social settings
                            </Link>
                        </Button>
                    </div>
                </header>

                <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserRoundPlus className="size-4" />
                                Add a friend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={sendRequest}
                                className="flex flex-col gap-3 sm:flex-row"
                            >
                                <Input
                                    value={requestForm.data.identifier}
                                    onChange={(event) =>
                                        requestForm.setData(
                                            'identifier',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="@handle or friend code"
                                    autoComplete="off"
                                />
                                <Button
                                    disabled={
                                        requestForm.processing ||
                                        requestForm.data.identifier.trim()
                                            .length < 3
                                    }
                                >
                                    <Plus />
                                    Send request
                                </Button>
                            </form>
                            {requestForm.errors.identifier && (
                                <p className="text-destructive mt-2 text-sm">
                                    {requestForm.errors.identifier}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Your friend code
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <button
                                type="button"
                                onClick={copyFriendCode}
                                className="hover:bg-muted/50 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition"
                            >
                                <div>
                                    <p className="font-mono text-lg font-semibold tracking-[0.16em]">
                                        {profile.friend_code}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Share this privately with someone you
                                        know.
                                    </p>
                                </div>
                                <Clipboard className="size-4" />
                            </button>
                        </CardContent>
                    </Card>
                </section>

                {(incoming_requests.length > 0 ||
                    outgoing_requests.length > 0) && (
                    <section className="grid gap-4 lg:grid-cols-2">
                        {incoming_requests.length > 0 && (
                            <Card className="rounded-3xl">
                                <CardHeader>
                                    <CardTitle>
                                        Incoming requests ·{' '}
                                        {incoming_requests.length}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {incoming_requests.map((request) => (
                                        <RequestRow
                                            key={request.id}
                                            request={request}
                                            direction="incoming"
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {outgoing_requests.length > 0 && (
                            <Card className="rounded-3xl">
                                <CardHeader>
                                    <CardTitle>
                                        Sent requests ·{' '}
                                        {outgoing_requests.length}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {outgoing_requests.map((request) => (
                                        <RequestRow
                                            key={request.id}
                                            request={request}
                                            direction="outgoing"
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </section>
                )}

                <section className="grid gap-6 xl:grid-cols-[1fr_430px]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UsersRound className="size-4" />
                                Your party
                                <span className="text-muted-foreground ml-auto text-sm font-normal">
                                    {friends.length} friends
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {friends.length === 0 ? (
                                <div className="text-muted-foreground rounded-2xl border border-dashed p-12 text-center text-sm">
                                    Add your first friend using a handle or
                                    friend code. There is no public people
                                    directory, so discovery stays intentional.
                                </div>
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {friends.map((friend) => (
                                        <FriendCard
                                            key={friend.handle}
                                            person={friend}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle>Party standings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {leaderboard.map((person, index) => (
                                    <Link
                                        key={person.handle}
                                        href={'/u/' + person.handle}
                                        className="hover:bg-muted/30 flex items-center gap-3 rounded-xl border px-3 py-2 transition"
                                    >
                                        <span className="text-muted-foreground w-6 text-center text-xs font-semibold">
                                            #{index + 1}
                                        </span>
                                        <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-zinc-950 text-white">
                                            <CharacterSprite
                                                character={person}
                                                className="size-8"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {person.name}
                                            </p>
                                            <p className="text-muted-foreground truncate text-[11px]">
                                                @{person.handle}
                                            </p>
                                        </div>
                                        <span className="rounded-full border px-2 py-1 text-[10px] font-medium">
                                            Lv. {person.level}
                                        </span>
                                    </Link>
                                ))}
                                <p className="text-muted-foreground pt-2 text-[11px]">
                                    Friendly level ranking only. No competitive
                                    rewards.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="h-fit rounded-3xl">
                            <CardHeader>
                                <CardTitle>Party activity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {feed.length === 0 ? (
                                    <div className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
                                        Milestones from you and your friends
                                        will appear here.
                                    </div>
                                ) : (
                                    feed.map((activity) => (
                                        <ActivityCard
                                            key={activity.id}
                                            activity={activity}
                                        />
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </>
    );
}

function FriendCard({ person }: { person: SocialPerson }) {
    return (
        <Link
            href={'/u/' + person.handle}
            className="hover:bg-muted/30 group flex items-center gap-4 rounded-2xl border p-4 transition"
        >
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 text-white">
                <CharacterSprite character={person} className="size-18" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{person.name}</p>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    @{person.handle}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border px-2 py-1 text-[10px]">
                        Lv. {person.level}
                    </span>
                    {person.renown !== null && (
                        <span className="rounded-full border px-2 py-1 text-[10px]">
                            {person.renown} renown
                        </span>
                    )}
                    {person.boss_victories !== null &&
                        person.boss_victories > 0 && (
                            <span className="rounded-full border px-2 py-1 text-[10px]">
                                {person.boss_victories} bosses
                            </span>
                        )}
                </div>
            </div>
        </Link>
    );
}

function RequestRow({
    request,
    direction,
}: {
    request: SocialRequest;
    direction: 'incoming' | 'outgoing';
}) {
    const person = request.person;

    return (
        <div className="flex items-center gap-3 rounded-2xl border p-3">
            <Link
                href={'/u/' + person.handle}
                className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 text-white"
            >
                <CharacterSprite character={person} className="size-11" />
            </Link>

            <div className="min-w-0 flex-1">
                <Link
                    href={'/u/' + person.handle}
                    className="truncate font-medium hover:underline"
                >
                    {person.name}
                </Link>
                <p className="text-muted-foreground truncate text-xs">
                    @{person.handle} · Level {person.level}
                </p>
            </div>

            {direction === 'incoming' ? (
                <div className="flex gap-1">
                    <Button
                        size="icon"
                        variant="secondary"
                        aria-label="Accept friend request"
                        onClick={() =>
                            router.post(
                                '/friend-requests/' + request.id + '/accept',
                                {},
                                { preserveScroll: true },
                            )
                        }
                    >
                        <Check />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Decline friend request"
                        onClick={() =>
                            router.post(
                                '/friend-requests/' + request.id + '/decline',
                                {},
                                { preserveScroll: true },
                            )
                        }
                    >
                        <X />
                    </Button>
                </div>
            ) : (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        router.delete('/friend-requests/' + request.id, {
                            preserveScroll: true,
                        })
                    }
                >
                    <Clock3 />
                    Pending
                </Button>
            )}
        </div>
    );
}
