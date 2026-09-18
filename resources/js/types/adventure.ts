export type AdventureEnemy = {
    id?: number;
    slug: string;
    name: string;
    description?: string;
    type: 'normal' | 'elite' | 'boss';
    visual_key: string;
    max_hp: number;
    attack: number;
    defense: number;
    reward_gold?: number;
    reward_renown?: number;
    unlocked?: boolean;
    encountered?: boolean;
    wins?: number;
};

export type AdventureObjective = {
    id: number;
    slug: string;
    name: string;
    description: string;
    threshold: number;
    progress: number;
    reward_gold: number;
    reward_renown: number;
    claimed: boolean;
};

export type AdventureRegion = {
    id: number;
    slug: string;
    name: string;
    description: string;
    visual_key: string;
    min_level: number;
    unlocked: boolean;
    boss_unlocked: boolean;
    progress: {
        enemy_victories: number;
        boss_required_victories: number;
        boss_defeated: boolean;
    };
    enemies: AdventureEnemy[];
    objectives: AdventureObjective[];
};

export type AdventureCombatRewards = {
    gold: number;
    renown: number;
    boss_item?: {
        inventory_item_id: number;
        slug: string;
        name: string;
        rarity: string;
        slot?: string | null;
        visual_key: string;
        stats: Record<string, number>;
    } | null;
    objectives: Array<{
        slug: string;
        name: string;
        description: string;
        gold: number;
        renown: number;
    }>;
    unlocked_region?: {
        slug: string;
        name: string;
        min_level: number;
    } | null;
};

export type AdventureCombatResult = {
    encounter_id: number;
    duplicate?: boolean;
    capped: boolean;
    damage: number;
    critical: boolean;
    enemy_damage: number;
    enemy_hp_remaining: number;
    enemy_max_hp: number;
    hero_hp_remaining: number;
    hero_max_hp: number;
    rested: boolean;
    victory: boolean;
    enemy: Pick<AdventureEnemy, 'slug' | 'name' | 'type' | 'visual_key'>;
    rewards?: AdventureCombatRewards | null;
};

export type ActiveEncounter = {
    id: number;
    status: string;
    enemy_hp_remaining: number;
    hero_hp_remaining: number;
    hero_max_hp: number;
    damage_dealt: number;
    turns: number;
    rests: number;
    started_at: string;
    enemy: AdventureEnemy;
    region: {
        slug: string;
        name: string;
    };
    recent_actions: Array<{
        id: number;
        damage: number;
        critical: boolean;
        enemy_damage: number;
        rested: boolean;
        capped: boolean;
        created_at?: string | null;
    }>;
};

export type AdventureWorld = {
    profile: {
        renown: number;
        total_damage: number;
        victories: number;
        boss_victories: number;
    };
    active_encounter?: ActiveEncounter | null;
    regions: AdventureRegion[];
};
