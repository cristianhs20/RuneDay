<?php

namespace App\Domain\Social\Models;

use App\Domain\Social\Enums\FriendRequestStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $sender_id
 * @property int $receiver_id
 * @property FriendRequestStatus $status
 * @property Carbon|null $responded_at
 */
class FriendRequest extends Model
{
    protected $fillable = [
        'sender_id', 'receiver_id', 'status', 'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => FriendRequestStatus::class,
            'responded_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /** @return BelongsTo<User, $this> */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
