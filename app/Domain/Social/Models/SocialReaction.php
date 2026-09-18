<?php

namespace App\Domain\Social\Models;

use App\Domain\Social\Enums\ReactionType;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $activity_id
 * @property int $user_id
 * @property ReactionType $type
 */
class SocialReaction extends Model
{
    protected $fillable = ['activity_id', 'user_id', 'type'];

    protected function casts(): array
    {
        return ['type' => ReactionType::class];
    }

    /** @return BelongsTo<SocialActivity, $this> */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(SocialActivity::class, 'activity_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
