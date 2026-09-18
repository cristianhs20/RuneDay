<?php

use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AdventureController;
use App\Http\Controllers\AdventureEncounterController;
use App\Http\Controllers\BestiaryController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\DailyController;
use App\Http\Controllers\FocusController;
use App\Http\Controllers\FriendRequestController;
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\GuildController;
use App\Http\Controllers\GuildInviteController;
use App\Http\Controllers\GuildMemberController;
use App\Http\Controllers\GuildRaidController;
use App\Http\Controllers\HabitController;
use App\Http\Controllers\InsightsController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PublicSocialProfileController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\SocialBlockController;
use App\Http\Controllers\SocialController;
use App\Http\Controllers\SocialProfileSettingsController;
use App\Http\Controllers\SocialReactionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TodayController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('u/{profile:handle}', PublicSocialProfileController::class)
    ->name('social.public');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', TodayController::class)->name('dashboard');
    Route::get('today', TodayController::class)->name('today');

    Route::get('inbox', [TaskController::class, 'inbox'])->name('inbox');
    Route::get('quests', [TaskController::class, 'index'])->name('quests.index');
    Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('tasks/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');

    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    Route::get('dailies', [DailyController::class, 'index'])->name('dailies.index');
    Route::post('dailies', [DailyController::class, 'store'])->name('dailies.store');
    Route::put('dailies/{daily}', [DailyController::class, 'update'])->name('dailies.update');
    Route::delete('dailies/{daily}', [DailyController::class, 'destroy'])->name('dailies.destroy');
    Route::post('dailies/{daily}/complete', [DailyController::class, 'complete'])->name('dailies.complete');

    Route::get('habits', [HabitController::class, 'index'])->name('habits.index');
    Route::post('habits', [HabitController::class, 'store'])->name('habits.store');
    Route::put('habits/{habit}', [HabitController::class, 'update'])->name('habits.update');
    Route::delete('habits/{habit}', [HabitController::class, 'destroy'])->name('habits.destroy');
    Route::post('habits/{habit}/log', [HabitController::class, 'log'])->name('habits.log');

    Route::get('focus', [FocusController::class, 'index'])->name('focus.index');
    Route::post('focus-sessions', [FocusController::class, 'store'])->name('focus.store');

    Route::get('calendar', CalendarController::class)->name('calendar');
    Route::get('insights', InsightsController::class)->name('insights');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');

    Route::get('character', [CharacterController::class, 'show'])->name('character.show');
    Route::put('character', [CharacterController::class, 'update'])->name('character.update');
    Route::inertia('character/style-lab', 'game/character-style-lab')->name('character.style-lab');
    Route::inertia('character/lineage-lab', 'game/character-lineage-lab')->name('character.lineage-lab');
    Route::inertia('character/sprite-v2-lab', 'game/sprite-v2-lab')->name('character.sprite-v2-lab');

    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('inventory/{inventoryItem}/equip', [InventoryController::class, 'equip'])->name('inventory.equip');
    Route::delete('equipment/{slot}', [InventoryController::class, 'unequip'])->name('inventory.unequip');

    Route::get('shop', [ShopController::class, 'index'])->name('shop.index');
    Route::post('shop/{item}/purchase', [ShopController::class, 'purchase'])->name('shop.purchase');

    Route::get('achievements', AchievementController::class)->name('achievements.index');

    Route::get('adventure', AdventureController::class)->name('adventure.index');
    Route::post('adventure/enemies/{enemy}/encounter', [AdventureEncounterController::class, 'store'])->name('adventure.encounters.store');
    Route::delete('adventure/encounters/{encounter}', [AdventureEncounterController::class, 'destroy'])->name('adventure.encounters.destroy');
    Route::get('bestiary', BestiaryController::class)->name('bestiary.index');

    Route::get('friends', SocialController::class)->name('social.index');
    Route::get('social/profile', [SocialProfileSettingsController::class, 'show'])->name('social.profile.show');
    Route::put('social/profile', [SocialProfileSettingsController::class, 'update'])->name('social.profile.update');

    Route::post('friend-requests', [FriendRequestController::class, 'store'])->middleware('throttle:10,1')->name('friend-requests.store');
    Route::post('friend-requests/{friendRequest}/accept', [FriendRequestController::class, 'accept'])->name('friend-requests.accept');
    Route::post('friend-requests/{friendRequest}/decline', [FriendRequestController::class, 'decline'])->name('friend-requests.decline');
    Route::delete('friend-requests/{friendRequest}', [FriendRequestController::class, 'cancel'])->name('friend-requests.cancel');

    Route::delete('friends/{profile:handle}', [FriendshipController::class, 'destroy'])->name('friends.destroy');
    Route::post('social/blocks/{profile:handle}', [SocialBlockController::class, 'store'])->name('social.blocks.store');
    Route::delete('social/blocks/{profile:handle}', [SocialBlockController::class, 'destroy'])->name('social.blocks.destroy');
    Route::post('social/activities/{activity}/reaction', [SocialReactionController::class, 'store'])->middleware('throttle:60,1')->name('social.reactions.store');

    Route::get('guild', [GuildController::class, 'index'])->name('guild.index');
    Route::post('guild', [GuildController::class, 'store'])->name('guild.store');
    Route::put('guild/{guild:slug}', [GuildController::class, 'update'])->name('guild.update');
    Route::delete('guild/membership', [GuildController::class, 'leave'])->name('guild.leave');
    Route::delete('guild', [GuildController::class, 'destroy'])->name('guild.destroy');

    Route::post('guild/invites/{profile:handle}', [GuildInviteController::class, 'store'])->name('guild.invites.store');
    Route::post('guild/invites/{guildInvite}/accept', [GuildInviteController::class, 'accept'])->name('guild.invites.accept');
    Route::post('guild/invites/{guildInvite}/decline', [GuildInviteController::class, 'decline'])->name('guild.invites.decline');
    Route::delete('guild/invites/{guildInvite}', [GuildInviteController::class, 'cancel'])->name('guild.invites.cancel');

    Route::put('guild/members/{guildMember}/role', [GuildMemberController::class, 'update'])->name('guild.members.role');
    Route::post('guild/members/{guildMember}/transfer-leadership', [GuildMemberController::class, 'transfer'])->name('guild.members.transfer');
    Route::delete('guild/members/{guildMember}', [GuildMemberController::class, 'destroy'])->name('guild.members.destroy');

    Route::post('guild/raids/{raidBoss}', [GuildRaidController::class, 'store'])->name('guild.raids.store');
    Route::delete('guild/raids/{guildRaid}', [GuildRaidController::class, 'destroy'])->name('guild.raids.destroy');
});

require __DIR__.'/settings.php';
