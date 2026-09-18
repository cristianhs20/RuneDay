<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\ItemDefinition;
use App\Domain\Social\Services\SocialActivityPublisher;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CharacterCreationService
{
    public function __construct(
        private readonly InventoryGrantService $inventory,
        private readonly EquipmentService $equipment,
        private readonly SocialActivityPublisher $social,
    ) {}

    /**
     * @param  array<string, string>  $appearance
     */
    public function save(
        User $user,
        string $name,
        string $archetype,
        array $appearance,
    ): CharacterProfile {
        return DB::transaction(function () use ($user, $name, $archetype, $appearance) {
            $profile = CharacterProfile::firstOrCreate(
                ['user_id' => $user->id],
                ['appearance' => CharacterProfile::defaultAppearance()],
            );

            $firstCreation = $profile->character_created_at === null;

            $profile->forceFill([
                'character_name' => $name,
                'archetype' => $archetype,
                'appearance' => $appearance,
                'character_created_at' => $profile->character_created_at ?? now(),
            ])->save();

            if ($firstCreation) {
                foreach (['training-sword', 'linen-tunic'] as $slug) {
                    $item = ItemDefinition::query()->where('slug', $slug)->firstOrFail();
                    $inventoryItem = $this->inventory->grant(
                        $user->id,
                        $item,
                        'starter',
                        'character_creation',
                        $profile->id,
                    );
                    $this->equipment->equip($user, $inventoryItem);
                }

                $this->social->publish(
                    $user,
                    'hero_created',
                    'character_creation',
                    $profile->id,
                    [
                        'hero_name' => $name,
                        'archetype' => $archetype,
                    ],
                );
            }

            return $profile->fresh();
        });
    }
}
