<?php

use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AdventureController;
use App\Http\Controllers\AdventureEncounterController;
use App\Http\Controllers\BestiaryController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\DailyController;
use App\Http\Controllers\FocusController;
use App\Http\Controllers\HabitController;
use App\Http\Controllers\InsightsController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TodayController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

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
});

require __DIR__.'/settings.php';
