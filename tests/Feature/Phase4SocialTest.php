<?php

namespace Tests\Feature;

use App\Domain\Adventure\Models\Encounter;
use App\Domain\Adventure\Models\Enemy;
use App\Domain\Adventure\Models\Region;
use App\Domain\Adventure\Models\RegionProgress;
use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Productivity\Models\Task;
use App\Domain\Social\Enums\FriendRequestStatus;
use App\Domain\Social\Models\FriendRequest;
use App\Domain\Social\Models\Friendship;
use App\Domain\Social\Models\SocialActivity;
use App\Domain\Social\Models\SocialProfile;
use App\Domain\Social\Models\SocialReaction;
use App\Domain\Social\Services\SocialActivityPublisher;
use App\Domain\Social\Services\SocialDashboardService;
use App\Domain\Social\Services\SocialFeedService;
use App\Domain\Social\Services\SocialProfileService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase4SocialTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_social_profile_with_safe_defaults(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Social Hero',
            'email' => 'social@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect();

        $user = User::where('email', 'social@example.com')->firstOrFail();
        $profile = SocialProfile::where('user_id', $user->id)->firstOrFail();

        $this->assertSame('friends', $profile->profile_visibility->value);
        $this->assertSame('friends', $profile->activity_visibility->value);
        $this->assertTrue($profile->friend_requests_enabled);
        $this->assertSame(8, strlen($profile->friend_code));
        $this->assertMatchesRegularExpression(
            '/^[a-z0-9_]{3,24}$/',
            $profile->handle,
        );
    }

    public function test_friend_request_by_code_can_be_accepted_once(): void
    {
        [$sender, $senderProfile] = $this->socialUser('Sender Hero');
        [$receiver, $receiverProfile] = $this->socialUser('Receiver Hero');

        $this->actingAs($sender)
            ->post('/friend-requests', [
                'identifier' => $receiverProfile->friend_code,
            ])
            ->assertRedirect();

        $friendRequest = FriendRequest::firstOrFail();

        $this->assertSame(
            FriendRequestStatus::Pending,
            $friendRequest->status,
        );
        $this->assertTrue(
            $receiver->notifications->contains(
                fn ($notification) => ($notification->data['kind'] ?? null)
                    === 'friend_request',
            ),
        );

        $this->actingAs($receiver)
            ->post("/friend-requests/{$friendRequest->id}/accept")
            ->assertRedirect();

        [$low, $high] = $sender->id < $receiver->id
            ? [$sender->id, $receiver->id]
            : [$receiver->id, $sender->id];

        $this->assertDatabaseHas('friendships', [
            'user_low_id' => $low,
            'user_high_id' => $high,
        ]);
        $this->assertSame(1, Friendship::count());

        $sender->refresh();

        $this->assertTrue(
            $sender->notifications->contains(
                fn ($notification) => ($notification->data['kind'] ?? null)
                    === 'friend_accepted',
            ),
        );

        $this->actingAs($receiver)
            ->post("/friend-requests/{$friendRequest->id}/accept")
            ->assertRedirect();

        $this->assertSame(1, Friendship::count());
        $this->assertSame($senderProfile->user_id, $sender->id);
    }

    public function test_crossed_friend_requests_auto_accept_without_duplicate_friendship(): void
    {
        [$first, $firstProfile] = $this->socialUser('First');
        [$second, $secondProfile] = $this->socialUser('Second');

        $this->actingAs($first)->post('/friend-requests', [
            'identifier' => $secondProfile->handle,
        ])->assertRedirect();

        $this->actingAs($second)->post('/friend-requests', [
            'identifier' => $firstProfile->handle,
        ])->assertRedirect();

        $this->assertSame(1, Friendship::count());
        $this->assertSame(
            0,
            FriendRequest::query()
                ->where('status', FriendRequestStatus::Pending->value)
                ->count(),
        );
    }

    public function test_user_cannot_send_friend_request_to_self(): void
    {
        [$user, $profile] = $this->socialUser('Solo Hero');

        $this->actingAs($user)
            ->post('/friend-requests', [
                'identifier' => $profile->handle,
            ])
            ->assertSessionHasErrors('identifier');

        $this->assertDatabaseCount('friend_requests', 0);
    }

    public function test_profile_visibility_respects_guest_friend_and_private_access(): void
    {
        [$owner, $profile] = $this->socialUser('Private Hero');
        [$friend] = $this->socialUser('Friend Hero');

        $this->get('/u/'.$profile->handle)->assertNotFound();

        $this->makeFriends($owner, $friend);

        $this->actingAs($friend)
            ->get('/u/'.$profile->handle)
            ->assertOk();

        $profile->update(['profile_visibility' => 'public']);

        $this->app['auth']->forgetGuards();
        $this->get('/u/'.$profile->handle)->assertOk();

        $profile->update(['profile_visibility' => 'private']);

        $this->actingAs($friend)
            ->get('/u/'.$profile->handle)
            ->assertNotFound();

        $this->actingAs($owner)
            ->get('/u/'.$profile->handle)
            ->assertOk();
    }

    public function test_block_removes_friendship_and_hides_even_public_profile(): void
    {
        [$first] = $this->socialUser('First Blocker');
        [$second, $secondProfile] = $this->socialUser(
            'Second Blocked',
            'public',
        );

        $this->makeFriends($first, $second);

        $this->actingAs($first)
            ->post('/social/blocks/'.$secondProfile->handle)
            ->assertRedirect();

        $this->assertDatabaseCount('friendships', 0);
        $this->assertDatabaseHas('social_blocks', [
            'blocker_id' => $first->id,
            'blocked_id' => $second->id,
        ]);

        $this->actingAs($first)
            ->get('/u/'.$secondProfile->handle)
            ->assertNotFound();

        $firstProfile = SocialProfile::where('user_id', $first->id)
            ->firstOrFail();
        $firstProfile->update(['profile_visibility' => 'public']);

        $this->actingAs($second)
            ->get('/u/'.$firstProfile->handle)
            ->assertNotFound();
    }

    public function test_feed_contains_self_and_friends_but_not_public_strangers(): void
    {
        [$viewer] = $this->socialUser('Viewer');
        [$friend] = $this->socialUser('Friend');
        [$stranger, $strangerProfile] = $this->socialUser('Stranger');

        $this->makeFriends($viewer, $friend);

        $publisher = app(SocialActivityPublisher::class);

        $publisher->publish(
            $viewer,
            'level_up',
            'test_self',
            1,
            ['level' => 2],
        );
        $publisher->publish(
            $friend,
            'achievement_unlocked',
            'test_friend',
            2,
            ['name' => 'Friend Milestone'],
        );

        $strangerProfile->update(['activity_visibility' => 'public']);
        $publisher->publish(
            $stranger,
            'boss_victory',
            'test_stranger',
            3,
            ['enemy' => 'Public Boss'],
        );

        $feed = app(SocialFeedService::class)->for($viewer);

        $handles = collect($feed)
            ->pluck('actor.handle')
            ->unique()
            ->values()
            ->all();

        $this->assertContains(
            SocialProfile::where('user_id', $viewer->id)->value('handle'),
            $handles,
        );
        $this->assertContains(
            SocialProfile::where('user_id', $friend->id)->value('handle'),
            $handles,
        );
        $this->assertNotContains($strangerProfile->handle, $handles);
    }

    public function test_friend_can_toggle_one_reaction_and_actor_is_notified(): void
    {
        [$actor] = $this->socialUser('Actor');
        [$friend] = $this->socialUser('Reactor');

        $this->makeFriends($actor, $friend);

        $activity = app(SocialActivityPublisher::class)->publish(
            $actor,
            'achievement_unlocked',
            'test_reaction',
            1,
            ['name' => 'Big Win'],
        );

        $this->actingAs($friend)
            ->post("/social/activities/{$activity->id}/reaction", [
                'type' => 'fire',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('social_reactions', [
            'activity_id' => $activity->id,
            'user_id' => $friend->id,
            'type' => 'fire',
        ]);

        $actor->refresh();

        $this->assertTrue(
            $actor->notifications->contains(
                fn ($notification) => ($notification->data['kind'] ?? null)
                    === 'social_reaction',
            ),
        );

        $this->actingAs($friend)
            ->post("/social/activities/{$activity->id}/reaction", [
                'type' => 'fire',
            ])
            ->assertRedirect();

        $this->assertSame(0, SocialReaction::count());
    }

    public function test_stranger_cannot_react_to_friends_only_activity(): void
    {
        [$actor] = $this->socialUser('Private Actor');
        [$stranger] = $this->socialUser('Random Viewer');

        $activity = app(SocialActivityPublisher::class)->publish(
            $actor,
            'level_up',
            'private_activity',
            1,
            ['level' => 4],
        );

        $this->actingAs($stranger)
            ->post("/social/activities/{$activity->id}/reaction", [
                'type' => 'cheer',
            ])
            ->assertNotFound();

        $this->assertDatabaseCount('social_reactions', 0);
    }

    public function test_changing_activity_visibility_updates_existing_posts(): void
    {
        [$user, $profile] = $this->socialUser('Visibility Hero');

        $activity = app(SocialActivityPublisher::class)->publish(
            $user,
            'level_up',
            'visibility_test',
            1,
            ['level' => 2],
        );

        $this->assertSame('friends', $activity->visibility->value);

        $this->actingAs($user)
            ->put('/social/profile', [
                'handle' => $profile->handle,
                'bio' => '',
                'profile_visibility' => 'friends',
                'activity_visibility' => 'private',
                'friend_requests_enabled' => true,
                'show_adventure' => true,
                'show_stats' => true,
                'show_achievements' => true,
            ])
            ->assertRedirect();

        $this->assertSame(
            'private',
            $activity->fresh()->visibility->value,
        );
    }

    public function test_hero_creation_and_first_achievement_publish_safe_social_activity(): void
    {
        [$user] = $this->socialUser('Publisher Hero');

        $this->actingAs($user)->put('/character', [
            'character_name' => 'Astra',
            'archetype' => 'warden',
            'appearance' => CharacterProfile::defaultAppearance(),
        ])->assertRedirect();

        $heroActivity = SocialActivity::query()
            ->where('user_id', $user->id)
            ->where('type', 'hero_created')
            ->firstOrFail();

        $this->assertSame('Astra', $heroActivity->data['hero_name']);
        $this->assertArrayNotHasKey('task_title', $heroActivity->data);
        $this->assertArrayNotHasKey('notes', $heroActivity->data);

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Private task title that must never enter social data',
            'difficulty' => 'normal',
            'priority' => 2,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $achievementActivity = SocialActivity::query()
            ->where('user_id', $user->id)
            ->where('type', 'achievement_unlocked')
            ->firstOrFail();

        $this->assertArrayNotHasKey(
            'task_title',
            $achievementActivity->data,
        );
        $this->assertStringNotContainsString(
            'Private task title',
            json_encode($achievementActivity->data),
        );
    }

    public function test_first_boss_clear_publishes_boss_and_region_milestones(): void
    {
        [$user] = $this->socialUser('Boss Social Hero');

        CharacterProfile::create([
            'user_id' => $user->id,
            'character_name' => 'Boss Social Hero',
            'archetype' => 'wanderer',
            'appearance' => CharacterProfile::defaultAppearance(),
            'character_created_at' => now(),
            'level' => 3,
            'xp' => 0,
            'total_xp' => 200,
            'gold' => 0,
        ]);

        $greenwild = Region::where('slug', 'greenwild-frontier')->firstOrFail();
        $boss = Enemy::where('slug', 'root-warden')->firstOrFail();

        RegionProgress::create([
            'user_id' => $user->id,
            'region_id' => $greenwild->id,
            'enemy_victories' => $greenwild->boss_unlock_victories,
        ]);

        $this->actingAs($user)
            ->post("/adventure/enemies/{$boss->id}/encounter")
            ->assertRedirect();

        $encounter = Encounter::where('user_id', $user->id)
            ->where('enemy_id', $boss->id)
            ->where('status', 'active')
            ->firstOrFail();
        $encounter->forceFill(['enemy_hp_remaining' => 1])->save();

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Private boss finishing task',
            'difficulty' => 'epic',
            'priority' => 4,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $this->assertDatabaseHas('social_activities', [
            'user_id' => $user->id,
            'type' => 'boss_victory',
            'source_type' => 'boss_victory',
            'source_id' => $encounter->id,
        ]);
        $this->assertDatabaseHas('social_activities', [
            'user_id' => $user->id,
            'type' => 'region_unlocked',
            'source_type' => 'region_unlock',
        ]);
    }

    public function test_public_profile_does_not_expose_gold_friend_code_or_task_content(): void
    {
        [$user, $profile] = $this->socialUser(
            'Public Hero',
            'public',
        );

        CharacterProfile::create([
            'user_id' => $user->id,
            'character_name' => 'Public Hero',
            'archetype' => 'rogue',
            'appearance' => CharacterProfile::defaultAppearance(),
            'character_created_at' => now(),
            'level' => 4,
            'gold' => 9999,
            'total_xp' => 300,
        ]);

        app(SocialActivityPublisher::class)->publish(
            $user,
            'level_up',
            'public_level',
            4,
            ['level' => 4],
        );

        $this->get('/u/'.$profile->handle)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('social/public-profile')
                ->where('profile.handle', $profile->handle)
                ->where('character.level', 4)
                ->missing('character.gold')
                ->missing('profile.friend_code')
            );
    }

    public function test_social_pages_render_for_verified_user(): void
    {
        [$user] = $this->socialUser('Social Pages');

        $this->actingAs($user)->get('/friends')->assertOk();
        $this->actingAs($user)->get('/social/profile')->assertOk();
    }

    public function test_party_standings_include_only_self_and_friends_by_level(): void
    {
        [$viewer] = $this->socialUser('Rank Viewer');
        [$friend, $friendProfile] = $this->socialUser('Rank Friend');
        [$stranger] = $this->socialUser('Rank Stranger');

        CharacterProfile::create([
            'user_id' => $viewer->id,
            'appearance' => CharacterProfile::defaultAppearance(),
            'level' => 2,
            'total_xp' => 100,
        ]);
        CharacterProfile::create([
            'user_id' => $friend->id,
            'appearance' => CharacterProfile::defaultAppearance(),
            'level' => 5,
            'total_xp' => 400,
        ]);
        CharacterProfile::create([
            'user_id' => $stranger->id,
            'appearance' => CharacterProfile::defaultAppearance(),
            'level' => 9,
            'total_xp' => 800,
        ]);

        $friendProfile->update(['show_adventure' => false]);
        $this->makeFriends($viewer, $friend);

        $dashboard = app(SocialDashboardService::class)
            ->for($viewer);

        $handles = collect($dashboard['leaderboard'])
            ->pluck('handle')
            ->all();

        $this->assertSame(
            SocialProfile::where('user_id', $friend->id)->value('handle'),
            $handles[0],
        );
        $this->assertCount(2, $handles);
        $this->assertNotContains(
            SocialProfile::where('user_id', $stranger->id)->value('handle'),
            $handles,
        );

        $friendRow = collect($dashboard['friends'])
            ->firstWhere('handle', $handles[0]);

        $this->assertNull($friendRow['renown']);
        $this->assertNull($friendRow['boss_victories']);
    }

    /**
     * @return array{0: User, 1: SocialProfile}
     */
    private function socialUser(
        string $name,
        string $profileVisibility = 'friends',
    ): array {
        $user = User::factory()->create([
            'name' => $name,
            'email_verified_at' => now(),
        ]);

        $profile = app(SocialProfileService::class)->for($user);
        $profile->update([
            'profile_visibility' => $profileVisibility,
        ]);

        return [$user, $profile->fresh()];
    }

    private function makeFriends(User $first, User $second): Friendship
    {
        [$low, $high] = $first->id < $second->id
            ? [$first->id, $second->id]
            : [$second->id, $first->id];

        return Friendship::create([
            'user_low_id' => $low,
            'user_high_id' => $high,
            'accepted_at' => now(),
        ]);
    }
}
