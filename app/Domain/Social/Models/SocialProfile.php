<?php

namespace App\Domain\Social\Models;

use App\Domain\Social\Enums\SocialVisibility;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $handle
 * @property string $friend_code
 * @property string|null $bio
 * @property SocialVisibility $profile_visibility
 * @property SocialVisibility $activity_visibility
 * @property bool $friend_requests_enabled
 * @property bool $show_adventure
 * @property bool $show_stats
 * @property bool $show_achievements
 */
class SocialProfile extends Model
{
    protected $attributes = [
        'profile_visibility' => 'friends',
        'activity_visibility' => 'friends',
        'friend_requests_enabled' => true,
        'show_adventure' => true,
        'show_stats' => true,
        'show_achievements' => true,
    ];

    protected $fillable = [
        'user_id', 'handle', 'friend_code', 'bio',
        'profile_visibility', 'activity_visibility',
        'friend_requests_enabled', 'show_adventure',
        'show_stats', 'show_achievements',
    ];

    protected function casts(): array
    {
        return [
            'profile_visibility' => SocialVisibility::class,
            'activity_visibility' => SocialVisibility::class,
            'friend_requests_enabled' => 'boolean',
            'show_adventure' => 'boolean',
            'show_stats' => 'boolean',
            'show_achievements' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'handle';
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
