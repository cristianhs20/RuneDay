<?php

namespace Tests\Feature;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Guild\Enums\GuildRaidStatus;
use App\Domain\Guild\Enums\GuildRole;
use App\Domain\Guild\Models\Guild;
use App\Domain\Guild\Models\GuildContribution;
use App\Domain\Guild\Models\GuildInvite;
use App\Domain\Guild\Models\GuildMember;
use App\Domain\Guild\Models\GuildRaid;
use App\Domain\Guild\Models\GuildRaidContribution;
use App\Domain\Guild\Models\GuildXpTransaction;
use App\Domain\Guild\Models\RaidBoss;
use App\Domain\Guild\Services\GuildHallService;
use App\Domain\Guild\Services\GuildMembershipService;
use App\Domain\Guild\Services\GuildRaidSettlementService;
use App\Domain\Productivity\Models\Task;
use App\Domain\Social\Models\Friendship;
use App\Domain\Social\Models\SocialProfile;
use App\Domain\Social\Services\SocialProfileService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase5GuildTest extends TestCase
{
    use RefreshDatabase;

    public function test_phase_five_catalog_and_hall_tiers_are_available(): void
    {
        $this->assertSame(3, RaidBoss::count());

        $tiers = app(GuildHallService::class)->tiers();

        $this->assertCount(5, $tiers);
        $this->assertSame('Camp', $tiers[0]['name']);
        $this->assertSame('Castle', $tiers[4]['name']);
        $this->assertSame(7500, $tiers[4]['min_xp']);
    }

    public function test_created_hero_can_found_one_guild_and_becomes_leader(): void
    {
        [$user] = $this->heroUser('Guild Founder');

        $this->actingAs($user)->post('/guild', [
            'name' => 'Dawnward',
            'tag' => 'DAWN',
            'description' => 'Progress together.',
        ])->assertRedirect('/guild');

        $guild = Guild::firstOrFail();
        $member = GuildMember::where('user_id', $user->id)->firstOrFail();

        $this->assertSame($user->id, $guild->leader_id);
        $this->assertSame(GuildRole::Leader, $member->role);
        $this->assertSame(0, $guild->total_xp);

        $this->actingAs($user)->post('/guild', [
            'name' => 'Second Guild',
            'tag' => 'TWO',
        ])->assertSessionHasErrors('guild');

        $this->assertSame(1, Guild::count());
        $this->assertSame(1, GuildMember::count());
    }

    public function test_guild_invite_requires_friendship_and_can_be_accepted_once(): void
    {
        [$leader] = $this->heroUser('Guild Leader');
        [$friend, $friendProfile] = $this->heroUser('Guild Friend');

        $guild = $this->createGuild($leader);

        $this->actingAs($leader)
            ->post('/guild/invites/'.$friendProfile->handle)
            ->assertSessionHasErrors('friend');

        $this->makeFriends($leader, $friend);

        $this->actingAs($leader)
            ->post('/guild/invites/'.$friendProfile->handle)
            ->assertRedirect();

        $invite = GuildInvite::firstOrFail();

        $this->assertTrue(
            $friend->notifications->contains(
                fn ($notification) => ($notification->data['kind'] ?? null)
                    === 'guild_invite',
            ),
        );

        $this->actingAs($friend)
            ->post("/guild/invites/{$invite->id}/accept")
            ->assertRedirect('/guild');

        $member = GuildMember::where('user_id', $friend->id)->firstOrFail();

        $this->assertSame($guild->id, $member->guild_id);
        $this->assertSame(GuildRole::Member, $member->role);
        $this->assertSame('accepted', $invite->fresh()->status->value);

        $this->actingAs($friend)
            ->post("/guild/invites/{$invite->id}/accept")
            ->assertSessionHasErrors('invite');

        $this->assertSame(
            1,
            GuildMember::where('user_id', $friend->id)->count(),
        );

        $leader->refresh();
        $this->assertTrue(
            $leader->notifications->contains(
                fn ($notification) => ($notification->data['kind'] ?? null)
                    === 'guild_joined',
            ),
        );
    }

    public function test_accepting_one_guild_invite_cancels_other_pending_invites(): void
    {
        [$firstLeader] = $this->heroUser('First Leader');
        [$secondLeader] = $this->heroUser('Second Leader');
        [$target, $targetProfile] = $this->heroUser('Target Hero');

        $firstGuild = $this->createGuild($firstLeader, 'First Guild', 'ONE');
        $secondGuild = $this->createGuild($secondLeader, 'Second Guild', 'TWO');

        $this->makeFriends($firstLeader, $target);
        $this->makeFriends($secondLeader, $target);

        app(GuildMembershipService::class)->invite(
            $firstLeader,
            $targetProfile,
        );
        app(GuildMembershipService::class)->invite(
            $secondLeader,
            $targetProfile,
        );

        $firstInvite = GuildInvite::where('guild_id', $firstGuild->id)
            ->firstOrFail();
        $secondInvite = GuildInvite::where('guild_id', $secondGuild->id)
            ->firstOrFail();

        $this->actingAs($target)
            ->post("/guild/invites/{$firstInvite->id}/accept")
            ->assertRedirect('/guild');

        $this->assertSame('accepted', $firstInvite->fresh()->status->value);
        $this->assertSame('canceled', $secondInvite->fresh()->status->value);
        $this->assertSame(
            $firstGuild->id,
            GuildMember::where('user_id', $target->id)
                ->value('guild_id'),
        );
    }

    public function test_leader_can_promote_and_transfer_leadership_then_leave(): void
    {
        [$leader] = $this->heroUser('Original Leader');
        [$memberUser] = $this->heroUser('Future Leader');

        $guild = $this->createGuild($leader);
        $member = $this->addMember($guild, $memberUser);

        $this->actingAs($leader)
            ->put("/guild/members/{$member->id}/role", [
                'role' => 'officer',
            ])
            ->assertRedirect();

        $this->assertSame(
            GuildRole::Officer,
            $member->fresh()->role,
        );

        $this->actingAs($leader)
            ->post("/guild/members/{$member->id}/transfer-leadership")
            ->assertRedirect();

        $this->assertSame($memberUser->id, $guild->fresh()->leader_id);
        $this->assertSame(
            GuildRole::Leader,
            $member->fresh()->role,
        );
        $this->assertSame(
            GuildRole::Officer,
            GuildMember::where('user_id', $leader->id)
                ->firstOrFail()
                ->role,
        );

        $this->actingAs($leader)
            ->delete('/guild/membership')
            ->assertRedirect('/guild');

        $this->assertDatabaseMissing('guild_members', [
            'user_id' => $leader->id,
        ]);
    }

    public function test_current_leader_cannot_leave_without_transfer_or_disband(): void
    {
        [$leader] = $this->heroUser('Locked Leader');
        $this->createGuild($leader);

        $this->actingAs($leader)
            ->delete('/guild/membership')
            ->assertSessionHasErrors('guild');

        $this->assertDatabaseHas('guild_members', [
            'user_id' => $leader->id,
            'role' => 'leader',
        ]);
    }

    public function test_officer_can_invite_and_remove_member_but_not_another_officer(): void
    {
        [$leader] = $this->heroUser('Role Leader');
        [$officerUser] = $this->heroUser('Officer Hero');
        [$memberUser] = $this->heroUser('Regular Hero');
        [$invitee, $inviteeProfile] = $this->heroUser('Invitee Hero');

        $guild = $this->createGuild($leader);
        $officer = $this->addMember($guild, $officerUser, GuildRole::Officer);
        $member = $this->addMember($guild, $memberUser);

        $this->makeFriends($officerUser, $invitee);

        $this->actingAs($officerUser)
            ->post('/guild/invites/'.$inviteeProfile->handle)
            ->assertRedirect();

        $this->actingAs($officerUser)
            ->delete("/guild/members/{$member->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('guild_members', [
            'id' => $member->id,
        ]);

        $secondOfficerUser = $this->heroUser('Second Officer')[0];
        $secondOfficer = $this->addMember(
            $guild,
            $secondOfficerUser,
            GuildRole::Officer,
        );

        $this->actingAs($officerUser)
            ->delete("/guild/members/{$secondOfficer->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('guild_members', [
            'id' => $officer->id,
        ]);
        $this->assertDatabaseHas('guild_members', [
            'id' => $secondOfficer->id,
        ]);
    }

    public function test_completed_task_grants_guild_xp_once_and_upgrades_hall(): void
    {
        [$leader] = $this->heroUser('Hall Builder');
        $guild = $this->createGuild($leader);
        $guild->forceFill(['total_xp' => 495])->save();

        $task = Task::create([
            'user_id' => $leader->id,
            'title' => 'Private hard work',
            'difficulty' => 'hard',
            'priority' => 3,
        ]);

        $this->actingAs($leader)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $guild->refresh();
        $member = GuildMember::where('user_id', $leader->id)->firstOrFail();
        $contribution = GuildContribution::where('task_id', $task->id)
            ->firstOrFail();

        $this->assertSame(507, $guild->total_xp);
        $this->assertSame(12, $contribution->guild_xp);
        $this->assertSame(12, $member->contribution_xp);
        $this->assertSame(1, $member->contribution_tasks);
        $this->assertSame(
            2,
            app(GuildHallService::class)->for($guild)['level'],
        );

        $this->actingAs($leader)->post("/tasks/{$task->id}/complete");

        $this->assertSame(
            1,
            GuildContribution::where('task_id', $task->id)->count(),
        );
        $this->assertSame(
            1,
            GuildXpTransaction::query()
                ->where('source_type', 'task_completion')
                ->where('source_id', $task->id)
                ->count(),
        );
    }

    public function test_daily_cap_zeroes_guild_xp_and_active_raid_damage(): void
    {
        [$leader] = $this->heroUser('Capped Raider');
        $guild = $this->createGuild($leader);
        $boss = RaidBoss::where('slug', 'briar-colossus')->firstOrFail();

        $this->actingAs($leader)
            ->post("/guild/raids/{$boss->id}")
            ->assertRedirect();

        foreach (range(1, 20) as $index) {
            RewardTransaction::create([
                'user_id' => $leader->id,
                'source_type' => 'task_completion',
                'source_id' => 70000 + $index,
                'xp_delta' => 15,
                'gold_delta' => 5,
                'metadata' => ['test' => true],
            ]);
        }

        $raid = GuildRaid::where('guild_id', $guild->id)
            ->where('status', 'active')
            ->firstOrFail();
        $hpBefore = $raid->hp_remaining;

        $task = Task::create([
            'user_id' => $leader->id,
            'title' => 'Capped guild quest',
            'difficulty' => 'epic',
            'priority' => 4,
        ]);

        $this->actingAs($leader)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $guildContribution = GuildContribution::where('task_id', $task->id)
            ->firstOrFail();
        $raidContribution = GuildRaidContribution::where('task_id', $task->id)
            ->firstOrFail();

        $this->assertSame(0, $guildContribution->guild_xp);
        $this->assertSame(0, $raidContribution->damage);
        $this->assertSame(0.0, $raidContribution->reward_factor);
        $this->assertSame($hpBefore, $raid->fresh()->hp_remaining);
    }

    public function test_raid_requires_hall_tier_and_only_one_can_be_active(): void
    {
        [$leader] = $this->heroUser('Raid Leader');
        $this->createGuild($leader);

        $lockedBoss = RaidBoss::where('slug', 'ashen-behemoth')->firstOrFail();
        $openBoss = RaidBoss::where('slug', 'briar-colossus')->firstOrFail();

        $this->actingAs($leader)
            ->post("/guild/raids/{$lockedBoss->id}")
            ->assertSessionHasErrors('raid');

        $this->actingAs($leader)
            ->post("/guild/raids/{$openBoss->id}")
            ->assertRedirect();

        $this->actingAs($leader)
            ->post("/guild/raids/{$openBoss->id}")
            ->assertSessionHasErrors('raid');

        $this->assertSame(
            1,
            GuildRaid::where('status', 'active')->count(),
        );
    }

    public function test_regular_member_cannot_start_raid_but_officer_can(): void
    {
        [$leader] = $this->heroUser('Raid Founder');
        [$memberUser] = $this->heroUser('Raid Member');
        [$officerUser] = $this->heroUser('Raid Officer');

        $guild = $this->createGuild($leader);
        $this->addMember($guild, $memberUser);
        $this->addMember($guild, $officerUser, GuildRole::Officer);

        $boss = RaidBoss::where('slug', 'briar-colossus')->firstOrFail();

        $this->actingAs($memberUser)
            ->post("/guild/raids/{$boss->id}")
            ->assertForbidden();

        $this->actingAs($officerUser)
            ->post("/guild/raids/{$boss->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('guild_raids', [
            'guild_id' => $guild->id,
            'status' => 'active',
        ]);
    }

    public function test_real_task_deals_one_idempotent_raid_turn(): void
    {
        [$leader] = $this->heroUser('Raid Worker');
        $guild = $this->createGuild($leader);
        $boss = RaidBoss::where('slug', 'briar-colossus')->firstOrFail();

        $this->actingAs($leader)
            ->post("/guild/raids/{$boss->id}")
            ->assertRedirect();

        $task = Task::create([
            'user_id' => $leader->id,
            'title' => 'Do meaningful real work',
            'difficulty' => 'hard',
            'priority' => 3,
        ]);

        $this->actingAs($leader)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $turn = GuildRaidContribution::where('task_id', $task->id)
            ->firstOrFail();
        $raid = GuildRaid::where('guild_id', $guild->id)->firstOrFail();

        $this->assertGreaterThan(0, $turn->damage);
        $damage = $raid->total_damage;

        $this->actingAs($leader)->post("/tasks/{$task->id}/complete");

        $this->assertSame(
            1,
            GuildRaidContribution::where('task_id', $task->id)->count(),
        );
        $this->assertSame($damage, $raid->fresh()->total_damage);
    }

    public function test_expired_raid_does_not_receive_future_task_damage(): void
    {
        [$leader] = $this->heroUser('Late Raider');
        $guild = $this->createGuild($leader);
        $boss = RaidBoss::where('slug', 'briar-colossus')->firstOrFail();

        $raid = GuildRaid::create([
            'guild_id' => $guild->id,
            'raid_boss_id' => $boss->id,
            'status' => 'active',
            'hp_remaining' => $boss->max_hp,
            'started_at' => now()->subDays(4),
            'ends_at' => now()->subMinute(),
        ]);

        $task = Task::create([
            'user_id' => $leader->id,
            'title' => 'Task after raid deadline',
            'difficulty' => 'normal',
            'priority' => 2,
        ]);

        $this->actingAs($leader)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $this->assertSame(
            GuildRaidStatus::Expired,
            $raid->fresh()->status,
        );
        $this->assertDatabaseMissing('guild_raid_contributions', [
            'task_id' => $task->id,
        ]);
        $this->assertDatabaseHas('guild_contributions', [
            'task_id' => $task->id,
        ]);
    }

    public function test_raid_victory_rewards_only_damage_contributors_once(): void
    {
        [$leader] = $this->heroUser('Raid Finisher');
        [$idleMember] = $this->heroUser('Idle Member');

        $guild = $this->createGuild($leader);
        $this->addMember($guild, $idleMember);

        $boss = RaidBoss::where('slug', 'briar-colossus')->firstOrFail();

        $this->actingAs($leader)
            ->post("/guild/raids/{$boss->id}")
            ->assertRedirect();

        $raid = GuildRaid::where('guild_id', $guild->id)
            ->where('status', 'active')
            ->firstOrFail();
        $raid->forceFill(['hp_remaining' => 1])->save();

        $task = Task::create([
            'user_id' => $leader->id,
            'title' => 'Finish the guild raid',
            'difficulty' => 'easy',
            'priority' => 2,
        ]);

        $this->actingAs($leader)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $raid->refresh();

        $this->assertSame(GuildRaidStatus::Victory, $raid->status);
        $this->assertNotNull($raid->settled_at);

        $this->assertDatabaseHas('reward_transactions', [
            'user_id' => $leader->id,
            'source_type' => 'guild_raid_victory',
            'source_id' => $raid->id,
            'xp_delta' => $boss->reward_member_xp,
            'gold_delta' => $boss->reward_member_gold,
        ]);
        $this->assertDatabaseMissing('reward_transactions', [
            'user_id' => $idleMember->id,
            'source_type' => 'guild_raid_victory',
            'source_id' => $raid->id,
        ]);
        $this->assertDatabaseHas('guild_xp_transactions', [
            'guild_id' => $guild->id,
            'source_type' => 'raid_victory',
            'source_id' => $raid->id,
            'xp_delta' => $boss->reward_guild_xp,
        ]);

        $leader->refresh();
        $this->assertTrue(
            $leader->notifications->contains(
                fn ($notification) => ($notification->data['kind'] ?? null)
                    === 'guild_raid_victory',
            ),
        );

        $result = app(GuildRaidSettlementService::class)->settle($raid);

        $this->assertSame(0, $result['guild_xp']);
        $this->assertSame(
            1,
            RewardTransaction::query()
                ->where('user_id', $leader->id)
                ->where('source_type', 'guild_raid_victory')
                ->where('source_id', $raid->id)
                ->count(),
        );
    }

    public function test_guild_page_renders_for_member_and_non_member(): void
    {
        [$member] = $this->heroUser('Guild Page Member');
        [$outsider] = $this->heroUser('Guild Page Outsider');

        $this->createGuild($member);

        $this->actingAs($member)->get('/guild')->assertOk();
        $this->actingAs($outsider)->get('/guild')->assertOk();
    }

    /**
     * @return array{0: User, 1: SocialProfile}
     */
    private function heroUser(
        string $name,
        int $level = 1,
    ): array {
        $user = User::factory()->create([
            'name' => $name,
            'email_verified_at' => now(),
        ]);

        $profile = app(SocialProfileService::class)->for($user);

        CharacterProfile::create([
            'user_id' => $user->id,
            'character_name' => $name,
            'archetype' => 'wanderer',
            'appearance' => CharacterProfile::defaultAppearance(),
            'character_created_at' => now(),
            'level' => $level,
            'xp' => 0,
            'total_xp' => max(0, ($level - 1) * 100),
            'gold' => 0,
        ]);

        return [$user, $profile];
    }

    private function createGuild(
        User $leader,
        string $name = 'Rune Wardens',
        string $tag = 'RUNE',
    ): Guild {
        return app(GuildMembershipService::class)->createGuild(
            $leader,
            [
                'name' => $name,
                'tag' => $tag,
                'description' => 'A test guild.',
            ],
        );
    }

    private function addMember(
        Guild $guild,
        User $user,
        GuildRole $role = GuildRole::Member,
    ): GuildMember {
        return GuildMember::create([
            'guild_id' => $guild->id,
            'user_id' => $user->id,
            'role' => $role->value,
            'joined_at' => now(),
        ]);
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
