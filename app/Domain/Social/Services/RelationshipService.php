<?php

namespace App\Domain\Social\Services;

use App\Domain\Social\Enums\FriendRequestStatus;
use App\Domain\Social\Models\FriendRequest;
use App\Domain\Social\Models\Friendship;
use App\Domain\Social\Models\SocialBlock;
use App\Domain\Social\Models\SocialProfile;
use App\Models\User;
use App\Notifications\Social\FriendAcceptedNotification;
use App\Notifications\Social\FriendRequestNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RelationshipService
{
    public function __construct(private readonly SocialProfileService $profiles) {}

    /**
     * @return array<int, int>
     */
    public function friendIds(User $user): array
    {
        return Friendship::query()
            ->where('user_low_id', $user->id)
            ->orWhere('user_high_id', $user->id)
            ->get()
            ->map(fn (Friendship $friendship) => $friendship->user_low_id === $user->id
                ? $friendship->user_high_id
                : $friendship->user_low_id)
            ->values()
            ->all();
    }

    public function areFriends(User $first, User $second): bool
    {
        [$low, $high] = $this->pair($first->id, $second->id);

        return Friendship::query()
            ->where('user_low_id', $low)
            ->where('user_high_id', $high)
            ->exists();
    }

    public function isBlockedBetween(User $first, User $second): bool
    {
        return SocialBlock::query()
            ->where(function ($query) use ($first, $second) {
                $query->where('blocker_id', $first->id)
                    ->where('blocked_id', $second->id);
            })
            ->orWhere(function ($query) use ($first, $second) {
                $query->where('blocker_id', $second->id)
                    ->where('blocked_id', $first->id);
            })
            ->exists();
    }

    public function sendRequest(User $sender, string $identifier): FriendRequest
    {
        return DB::transaction(function () use ($sender, $identifier) {
            $targetProfile = $this->findProfile($identifier);
            $receiver = $targetProfile->user()->firstOrFail();

            if ($receiver->id === $sender->id) {
                throw ValidationException::withMessages([
                    'identifier' => 'You cannot send a friend request to yourself.',
                ]);
            }

            if ($this->isBlockedBetween($sender, $receiver)) {
                throw ValidationException::withMessages([
                    'identifier' => 'This connection is unavailable.',
                ]);
            }

            if ($this->areFriends($sender, $receiver)) {
                throw ValidationException::withMessages([
                    'identifier' => 'You are already friends.',
                ]);
            }

            if (! $targetProfile->friend_requests_enabled) {
                throw ValidationException::withMessages([
                    'identifier' => 'This hero is not accepting friend requests.',
                ]);
            }

            $reverse = FriendRequest::query()
                ->where('sender_id', $receiver->id)
                ->where('receiver_id', $sender->id)
                ->where('status', FriendRequestStatus::Pending->value)
                ->lockForUpdate()
                ->first();

            if ($reverse) {
                $this->accept($sender, $reverse);

                return $reverse->fresh();
            }

            $request = FriendRequest::query()
                ->where('sender_id', $sender->id)
                ->where('receiver_id', $receiver->id)
                ->lockForUpdate()
                ->first();

            if ($request?->status === FriendRequestStatus::Pending) {
                return $request;
            }

            if ($request) {
                $request->forceFill([
                    'status' => FriendRequestStatus::Pending->value,
                    'responded_at' => null,
                ])->save();
            } else {
                $request = FriendRequest::create([
                    'sender_id' => $sender->id,
                    'receiver_id' => $receiver->id,
                    'status' => FriendRequestStatus::Pending->value,
                ]);
            }

            $receiver->notify(new FriendRequestNotification(
                $this->profiles->for($sender),
            ));

            return $request;
        });
    }

    public function accept(User $receiver, FriendRequest $request): Friendship
    {
        return DB::transaction(function () use ($receiver, $request) {
            $request = FriendRequest::query()
                ->lockForUpdate()
                ->findOrFail($request->id);

            abort_unless($request->receiver_id === $receiver->id, 403);

            if ($request->status === FriendRequestStatus::Accepted) {
                [$low, $high] = $this->pair(
                    $request->sender_id,
                    $request->receiver_id,
                );

                return Friendship::query()
                    ->where('user_low_id', $low)
                    ->where('user_high_id', $high)
                    ->firstOrFail();
            }

            if ($request->status !== FriendRequestStatus::Pending) {
                throw ValidationException::withMessages([
                    'friend_request' => 'This friend request is no longer pending.',
                ]);
            }

            if ($this->isBlockedBetween(
                $request->sender()->firstOrFail(),
                $receiver,
            )) {
                throw ValidationException::withMessages([
                    'friend_request' => 'This connection is unavailable.',
                ]);
            }

            [$low, $high] = $this->pair(
                $request->sender_id,
                $request->receiver_id,
            );

            $friendship = Friendship::firstOrCreate(
                [
                    'user_low_id' => $low,
                    'user_high_id' => $high,
                ],
                ['accepted_at' => now()],
            );

            $request->forceFill([
                'status' => FriendRequestStatus::Accepted->value,
                'responded_at' => now(),
            ])->save();

            FriendRequest::query()
                ->where('sender_id', $receiver->id)
                ->where('receiver_id', $request->sender_id)
                ->where('status', FriendRequestStatus::Pending->value)
                ->update([
                    'status' => FriendRequestStatus::Accepted->value,
                    'responded_at' => now(),
                ]);

            $sender = $request->sender()->firstOrFail();
            $sender->notify(new FriendAcceptedNotification(
                $this->profiles->for($receiver),
            ));

            return $friendship;
        });
    }

    public function decline(User $receiver, FriendRequest $request): FriendRequest
    {
        abort_unless($request->receiver_id === $receiver->id, 403);

        if ($request->status !== FriendRequestStatus::Pending) {
            throw ValidationException::withMessages([
                'friend_request' => 'This friend request is no longer pending.',
            ]);
        }

        $request->forceFill([
            'status' => FriendRequestStatus::Declined->value,
            'responded_at' => now(),
        ])->save();

        return $request->fresh();
    }

    public function cancel(User $sender, FriendRequest $request): FriendRequest
    {
        abort_unless($request->sender_id === $sender->id, 403);

        if ($request->status === FriendRequestStatus::Pending) {
            $request->forceFill([
                'status' => FriendRequestStatus::Canceled->value,
                'responded_at' => now(),
            ])->save();
        }

        return $request->fresh();
    }

    public function removeFriend(User $user, User $friend): void
    {
        [$low, $high] = $this->pair($user->id, $friend->id);

        Friendship::query()
            ->where('user_low_id', $low)
            ->where('user_high_id', $high)
            ->delete();
    }

    public function block(User $blocker, User $blocked): void
    {
        if ($blocker->id === $blocked->id) {
            throw ValidationException::withMessages([
                'user' => 'You cannot block yourself.',
            ]);
        }

        DB::transaction(function () use ($blocker, $blocked) {
            SocialBlock::firstOrCreate([
                'blocker_id' => $blocker->id,
                'blocked_id' => $blocked->id,
            ]);

            $this->removeFriend($blocker, $blocked);

            FriendRequest::query()
                ->where(function ($pairQuery) use ($blocker, $blocked) {
                    $pairQuery
                        ->where(function ($query) use ($blocker, $blocked) {
                            $query->where('sender_id', $blocker->id)
                                ->where('receiver_id', $blocked->id);
                        })
                        ->orWhere(function ($query) use ($blocker, $blocked) {
                            $query->where('sender_id', $blocked->id)
                                ->where('receiver_id', $blocker->id);
                        });
                })
                ->where('status', FriendRequestStatus::Pending->value)
                ->update([
                    'status' => FriendRequestStatus::Canceled->value,
                    'responded_at' => now(),
                ]);
        });
    }

    public function unblock(User $blocker, User $blocked): void
    {
        SocialBlock::query()
            ->where('blocker_id', $blocker->id)
            ->where('blocked_id', $blocked->id)
            ->delete();
    }

    public function relationshipState(?User $viewer, User $target): string
    {
        if (! $viewer) {
            return 'guest';
        }

        if ($viewer->id === $target->id) {
            return 'self';
        }

        if ($this->isBlockedBetween($viewer, $target)) {
            return SocialBlock::query()
                ->where('blocker_id', $viewer->id)
                ->where('blocked_id', $target->id)
                ->exists()
                    ? 'blocked'
                    : 'blocked_by';
        }

        if ($this->areFriends($viewer, $target)) {
            return 'friends';
        }

        if (FriendRequest::query()
            ->where('sender_id', $viewer->id)
            ->where('receiver_id', $target->id)
            ->where('status', FriendRequestStatus::Pending->value)
            ->exists()) {
            return 'outgoing';
        }

        if (FriendRequest::query()
            ->where('sender_id', $target->id)
            ->where('receiver_id', $viewer->id)
            ->where('status', FriendRequestStatus::Pending->value)
            ->exists()) {
            return 'incoming';
        }

        return 'none';
    }

    public function findProfile(string $identifier): SocialProfile
    {
        $normalized = trim($identifier);

        $profile = SocialProfile::query()
            ->whereRaw('lower(handle) = ?', [strtolower(ltrim($normalized, '@'))])
            ->orWhere('friend_code', strtoupper($normalized))
            ->first();

        if (! $profile) {
            throw ValidationException::withMessages([
                'identifier' => 'No RuneDay hero was found with that handle or friend code.',
            ]);
        }

        return $profile;
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function pair(int $first, int $second): array
    {
        return $first < $second
            ? [$first, $second]
            : [$second, $first];
    }
}
