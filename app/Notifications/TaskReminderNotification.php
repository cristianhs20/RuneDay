<?php

namespace App\Notifications;

use App\Domain\Productivity\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskReminderNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Task $task) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'task_reminder',
            'title' => 'Quest reminder',
            'body' => $this->task->title,
            'task_id' => $this->task->id,
            'due_at' => $this->task->due_at?->toISOString(),
        ];
    }
}
