import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type NotificationItem = {
    id: string;
    data: {
        kind?: string;
        title?: string;
        body?: string;
        task_id?: number;
        due_at?: string | null;
    };
    read_at: string | null;
    created_at: string | null;
};

export default function Notifications({
    notifications,
}: {
    notifications: NotificationItem[];
}) {
    const unread = notifications.filter((item) => !item.read_at).length;

    return (
        <>
            <Head title="Notifications" />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Never lose the next quest
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Notifications
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {unread > 0
                                ? unread +
                                  ' unread reminder' +
                                  (unread === 1 ? '' : 's')
                                : 'You are all caught up.'}
                        </p>
                    </div>
                    {unread > 0 && (
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.post(
                                    '/notifications/read-all',
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <CheckCheck />
                            Mark all read
                        </Button>
                    )}
                </header>

                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="size-4" />
                            Recent
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {notifications.length === 0 && (
                            <div className="text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
                                Quest reminders will appear here.
                            </div>
                        )}

                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                className={
                                    item.read_at
                                        ? 'rounded-2xl border p-4 opacity-60'
                                        : 'bg-muted/30 rounded-2xl border p-4'
                                }
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                                        <Clock3 className="size-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">
                                            {item.data.title ??
                                                'RuneDay reminder'}
                                        </p>
                                        <p className="mt-1 text-sm">
                                            {item.data.body ??
                                                'A quest needs your attention.'}
                                        </p>
                                        {item.created_at && (
                                            <p className="text-muted-foreground mt-2 text-xs">
                                                {new Intl.DateTimeFormat(
                                                    undefined,
                                                    {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    },
                                                ).format(
                                                    new Date(item.created_at),
                                                )}
                                            </p>
                                        )}
                                    </div>
                                    {!item.read_at && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                router.post(
                                                    '/notifications/' +
                                                        item.id +
                                                        '/read',
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            Mark read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
