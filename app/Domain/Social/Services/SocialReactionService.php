<?php

namespace App\Domain\Social\Services;

use App\Domain\Social\Enums\ReactionType;
use App\Domain\Social\Models\SocialActivity;
use App\Domain\Social\Models\SocialReaction;
use App\Models\User;
use App\Notifications\Social\SocialReactionNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SocialReactionService
{
    public function __construct(
        private readonly SocialPrivacyService $privacy,
        private readonly SocialProfileService $profiles,
    ) {}

    /**
     * @return array{active: bool, type: string|null}
     */
    public function toggle(
        User $user,
        SocialActivity $activity,
        ReactionType $type,
    ): array {
        if (! $this->privacy->canViewActivity($user, $activity)) {
            abort(404);
        }

        if ($activity->user_id === $user->id) {
            throw ValidationException::withMessages([
                'reaction' => 'You cannot react to your own activity.',
            ]);
        }

        return DB::transaction(function () use ($user, $activity, $type) {
            $existing = SocialReaction::query()
                ->where('activity_id', $activity->id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if ($existing?->type === $type) {
                $existing->delete();

                return ['active' => false, 'type' => null];
            }

            $isNewReaction = $existing === null;

            $reaction = SocialReaction::updateOrCreate(
                [
                    'activity_id' => $activity->id,
                    'user_id' => $user->id,
                ],
                ['type' => $type->value],
            );

            if ($isNewReaction) {
                $actor = $activity->user()->firstOrFail();
                $actor->notify(new SocialReactionNotification(
                    $this->profiles->for($user),
                    $type->value,
                    $activity->type,
                ));
            }

            return [
                'active' => true,
                'type' => $reaction->type->value,
            ];
        });
    }
}
