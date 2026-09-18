import type { AdventureCombatResult } from '@/types/adventure';

export type GameAppearance = {
    body: 'type_a' | 'type_b';
    skin_tone: 'moon' | 'sun' | 'bronze' | 'deep';
    hair_style: 'short' | 'wild' | 'braid' | 'crest' | 'none';
    hair_color: 'onyx' | 'chestnut' | 'blonde' | 'silver' | 'ember';
    eye_color: 'emerald' | 'azure' | 'amber' | 'violet';
};

export type EquippedVisual = {
    inventory_item_id: number;
    slug: string;
    name: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
    visual_key: string;
    stats: Record<string, number>;
};

export type GameCharacter = {
    created: boolean;
    name: string;
    archetype: 'wanderer' | 'warden' | 'rogue' | 'arcanist';
    appearance: GameAppearance;
    level: number;
    xp: number;
    total_xp: number;
    gold: number;
    equipment: Record<string, EquippedVisual>;
    stats: {
        power: number;
        guard: number;
        focus: number;
        luck: number;
        gear_score: number;
    };
};

export type GameLoot = {
    inventory_item_id: number;
    slug: string;
    name: string;
    description?: string | null;
    slot?: string | null;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
    visual_key: string;
    stats: Record<string, number>;
};

export type AchievementUnlock = {
    slug: string;
    name: string;
    description: string;
    icon: string;
    xp: number;
    gold: number;
};

export type GameEvent = {
    type:
        | 'quest_complete'
        | 'focus_complete'
        | 'habit_logged'
        | 'equipment_changed'
        | 'shop_purchase'
        | 'encounter_started';
    xp?: number;
    gold?: number;
    loot?: GameLoot | null;
    achievements?: AchievementUnlock[];
    slot?: string;
    item?: Partial<GameLoot>;
    gold_spent?: number;
    combat?: AdventureCombatResult | null;
};
