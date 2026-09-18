import type { AdventureCombatResult } from '@/types/adventure';
import type { GuildProgressResult } from '@/types/guild';

export type CharacterLineage = 'human' | 'elf' | 'skeleton' | 'ogre';

export type CharacterBodyFrame = 'broad' | 'lean' | 'heavy';

export type CharacterView = 'front' | 'side' | 'back';

export type GameAppearance = {
    body: CharacterBodyFrame;
    skin_tone:
        | 'none'
        | 'moon'
        | 'sun'
        | 'bronze'
        | 'deep'
        | 'moss'
        | 'ochre'
        | 'stone';
    bone_tone: 'none' | 'ivory' | 'aged' | 'ash' | 'obsidian';
    hair_style: 'short' | 'wild' | 'braid' | 'crest' | 'none';
    hair_color: 'onyx' | 'chestnut' | 'blonde' | 'silver' | 'ember';
    eye_color: 'emerald' | 'azure' | 'amber' | 'violet';
    eye_glow: 'none' | 'azure' | 'emerald' | 'amber' | 'violet' | 'ember';
    face_style:
        | 'balanced'
        | 'strong'
        | 'soft'
        | 'refined'
        | 'angular'
        | 'serene'
        | 'classic_skull'
        | 'narrow_skull'
        | 'ancient_skull'
        | 'brute'
        | 'elder'
        | 'scarred';
    ear_style:
        | 'standard'
        | 'long'
        | 'swept'
        | 'high'
        | 'none'
        | 'small'
        | 'torn';
    jaw_style:
        | 'standard'
        | 'refined'
        | 'intact'
        | 'cracked'
        | 'missing'
        | 'broad'
        | 'tusked';
    horn_style: 'none' | 'short' | 'swept';
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
    lineage: CharacterLineage;
    character_system_version: string;
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
        | 'encounter_started'
        | 'guild_raid_started';
    xp?: number;
    gold?: number;
    loot?: GameLoot | null;
    achievements?: AchievementUnlock[];
    slot?: string;
    item?: Partial<GameLoot>;
    gold_spent?: number;
    combat?: AdventureCombatResult | null;
    guild?: GuildProgressResult | null;
};
