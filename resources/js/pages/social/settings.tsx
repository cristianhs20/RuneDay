import { Head, Link, router, useForm } from '@inertiajs/react';
import { Clipboard, ExternalLink, Shield, UserRoundCog } from 'lucide-react';
import { toast } from 'sonner';
import { CharacterSprite } from '@/components/game/character-sprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { SocialPerson, SocialProfileSettings } from '@/types/social';

export default function SocialSettings({
    profile,
    blocked,
}: {
    profile: SocialProfileSettings;
    blocked: SocialPerson[];
}) {
    const form = useForm({
        handle: profile.handle,
        bio: profile.bio ?? '',
        profile_visibility: profile.profile_visibility,
        activity_visibility: profile.activity_visibility,
        friend_requests_enabled: profile.friend_requests_enabled,
        show_adventure: profile.show_adventure,
        show_stats: profile.show_stats,
        show_achievements: profile.show_achievements,
    });

    const save = (event: React.FormEvent) => {
        event.preventDefault();

        form.put('/social/profile', {
            preserveScroll: true,
        });
    };

    const copyFriendCode = async () => {
        await navigator.clipboard.writeText(profile.friend_code);
        toast.success('Friend code copied.');
    };

    const copyProfileLink = async () => {
        await navigator.clipboard.writeText(
            window.location.origin + '/u/' + form.data.handle,
        );
        toast.success('Profile link copied.');
    };

    return (
        <>
            <Head title="Social Profile" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Community privacy & identity
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Social Profile
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                            Decide exactly what friends or the public can see.
                            RuneDay never exposes your email, task titles, notes
                            or calendar through social profiles.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={'/u/' + profile.handle}>
                            <ExternalLink />
                            Preview profile
                        </Link>
                    </Button>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserRoundCog className="size-4" />
                                Identity & visibility
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={save} className="space-y-6">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="social-handle"
                                        className="text-sm font-medium"
                                    >
                                        Handle
                                    </label>
                                    <div className="relative">
                                        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                                            @
                                        </span>
                                        <Input
                                            id="social-handle"
                                            value={form.data.handle}
                                            onChange={(event) =>
                                                form.setData(
                                                    'handle',
                                                    event.target.value
                                                        .toLowerCase()
                                                        .replace(
                                                            /[^a-z0-9_]/g,
                                                            '',
                                                        ),
                                                )
                                            }
                                            className="pl-7"
                                            maxLength={24}
                                        />
                                    </div>
                                    {form.errors.handle && (
                                        <p className="text-destructive text-sm">
                                            {form.errors.handle}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="social-bio"
                                        className="text-sm font-medium"
                                    >
                                        Bio
                                    </label>
                                    <textarea
                                        id="social-bio"
                                        value={form.data.bio}
                                        onChange={(event) =>
                                            form.setData(
                                                'bio',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={180}
                                        placeholder="What kind of hero are you becoming?"
                                        className="bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                                    />
                                    <div className="text-muted-foreground flex justify-between text-xs">
                                        <span>
                                            No task details are shown here
                                            automatically.
                                        </span>
                                        <span>{form.data.bio.length}/180</span>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <VisibilitySelect
                                        label="Profile visibility"
                                        value={form.data.profile_visibility}
                                        onChange={(value) =>
                                            form.setData(
                                                'profile_visibility',
                                                value,
                                            )
                                        }
                                        description="Controls who can inspect your hero profile."
                                    />
                                    <VisibilitySelect
                                        label="Activity visibility"
                                        value={form.data.activity_visibility}
                                        onChange={(value) =>
                                            form.setData(
                                                'activity_visibility',
                                                value,
                                            )
                                        }
                                        description="Changing this updates previous RuneDay milestone posts too."
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <ToggleRow
                                        title="Accept friend requests"
                                        description="People still need your exact handle or friend code."
                                        checked={
                                            form.data.friend_requests_enabled
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'friend_requests_enabled',
                                                value,
                                            )
                                        }
                                    />
                                    <ToggleRow
                                        title="Show Adventure progress"
                                        description="Renown, victories, bosses and total damage."
                                        checked={form.data.show_adventure}
                                        onChange={(value) =>
                                            form.setData(
                                                'show_adventure',
                                                value,
                                            )
                                        }
                                    />
                                    <ToggleRow
                                        title="Show hero stats"
                                        description="Power, Guard, Focus, Luck and Gear Score."
                                        checked={form.data.show_stats}
                                        onChange={(value) =>
                                            form.setData('show_stats', value)
                                        }
                                    />
                                    <ToggleRow
                                        title="Show achievements"
                                        description="Displays your latest unlocked milestones."
                                        checked={form.data.show_achievements}
                                        onChange={(value) =>
                                            form.setData(
                                                'show_achievements',
                                                value,
                                            )
                                        }
                                    />
                                </div>

                                <Button
                                    className="w-full"
                                    disabled={
                                        form.processing ||
                                        form.data.handle.length < 3
                                    }
                                >
                                    Save social profile
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Friend code
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <button
                                    type="button"
                                    onClick={copyFriendCode}
                                    className="hover:bg-muted/40 flex w-full items-center justify-between rounded-2xl border p-4 text-left transition"
                                >
                                    <div>
                                        <p className="font-mono text-xl font-semibold tracking-[0.18em]">
                                            {profile.friend_code}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Stable private invite code.
                                        </p>
                                    </div>
                                    <Clipboard className="size-4" />
                                </button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Share profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {form.data.profile_visibility === 'public' ? (
                                    <div className="space-y-3">
                                        <p className="text-muted-foreground text-sm">
                                            Anyone with your link can inspect
                                            the fields you enabled above.
                                        </p>
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            onClick={copyProfileLink}
                                        >
                                            <Clipboard />
                                            Copy public link
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed p-4">
                                        <p className="text-sm font-medium">
                                            Public sharing is off
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Set Profile visibility to Public if
                                            you want an external share link.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Shield className="size-4" />
                                    Blocked heroes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {blocked.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        No blocked heroes.
                                    </p>
                                ) : (
                                    blocked.map((person) => (
                                        <div
                                            key={person.handle}
                                            className="flex items-center gap-3 rounded-xl border p-3"
                                        >
                                            <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-zinc-950 text-white">
                                                <CharacterSprite
                                                    character={person}
                                                    className="size-9"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    @{person.handle}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    router.delete(
                                                        '/social/blocks/' +
                                                            person.handle,
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                Unblock
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function VisibilitySelect({
    label,
    value,
    onChange,
    description,
}: {
    label: string;
    value: 'public' | 'friends' | 'private';
    onChange: (value: 'public' | 'friends' | 'private') => void;
    description: string;
}) {
    return (
        <div className="space-y-2 rounded-2xl border p-4">
            <label className="text-sm font-medium">{label}</label>
            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value as 'public' | 'friends' | 'private',
                    )
                }
                className="bg-background h-10 w-full rounded-md border px-3 text-sm"
            >
                <option value="friends">Friends only</option>
                <option value="public">Public</option>
                <option value="private">Only me</option>
            </select>
            <p className="text-muted-foreground text-xs">{description}</p>
        </div>
    );
}

function ToggleRow({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border p-4">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                    {description}
                </p>
            </div>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="size-4"
            />
        </label>
    );
}
