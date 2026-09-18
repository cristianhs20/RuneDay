<?php

namespace App\Console\Commands;

use App\Domain\Productivity\Models\Task;
use App\Notifications\TaskReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendDueTaskReminders extends Command
{
    protected $signature = 'runeday:send-reminders';

    protected $description = 'Send due RuneDay quest reminders once.';

    public function handle(): int
    {
        Task::query()
            ->whereNull('completed_at')
            ->whereNull('reminder_sent_at')
            ->whereNotNull('remind_at')
            ->where('remind_at', '<=', now())
            ->orderBy('id')
            ->chunkById(100, function ($tasks): void {
                foreach ($tasks as $task) {
                    DB::transaction(function () use ($task): void {
                        $locked = Task::query()->lockForUpdate()->find($task->id);

                        if (! $locked || $locked->completed_at || $locked->reminder_sent_at || ! $locked->remind_at || $locked->remind_at->isFuture()) {
                            return;
                        }

                        $locked->user()->firstOrFail()->notify(new TaskReminderNotification($locked));
                        $locked->forceFill(['reminder_sent_at' => now()])->save();
                    });
                }
            });

        return self::SUCCESS;
    }
}
