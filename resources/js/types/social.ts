import type { GameAppearance, EquippedVisual } from '@/types/game';

export type SocialPerson = {
    handle: string;
    name: string;
    level: number;
    archetype: 'wanderer' | 'warden' | 'rogue' | 'arcanist';
    appearance: GameAppearance;
    equipment: Record<string, EquippedVisual>;
    renown: number | null;
    boss_victories: number | null;
};

export type SocialProfileSettings = {
    handle: string;
    friend_code: string;
    bio?: string | null;
    profile_visibility: 'public' | 'friends' | 'private';
    activity_visibility: 'public' | 'friends' | 'private';
    friend_requests_enabled: boolean;
    show_adventure: boolean;
    show_stats: boolean;
    show_achievements: boolean;
};

export type SocialRequest = {
    id: number;
    person: SocialPerson;
};

export type SocialReactionCounts = {
    cheer: number;
    fire: number;
    sword: number;
    crown: number;
};

export type SocialActivity = {
    id: number;
    type: string;
    data: Record<string, unknown>;
    created_at?: string | null;
    actor: Pick<
        SocialPerson,
        'handle' | 'name' | 'level' | 'archetype' | 'appearance' | 'equipment'
    >;
    reactions: SocialReactionCounts;
    viewer_reaction?: 'cheer' | 'fire' | 'sword' | 'crown' | null;
    can_react: boolean;
};

export type PublicSocialProfile = {
    profile: {
        handle: string;
        bio?: string | null;
        profile_visibility: 'public' | 'friends' | 'private';
        friend_requests_enabled: boolean;
        friend_count: number;
        shareable: boolean;
    };
    relationship:
        | 'guest'
        | 'self'
        | 'friends'
        | 'outgoing'
        | 'incoming'
        | 'blocked'
        | 'blocked_by'
        | 'none';
    character: {
        created: boolean;
        name: string;
        archetype: 'wanderer' | 'warden' | 'rogue' | 'arcanist';
        appearance: GameAppearance;
        level: number;
        equipment: Record<string, EquippedVisual>;
        stats?: {
            power: number;
            guard: number;
            focus: number;
            luck: number;
            gear_score: number;
        } | null;
    };
    adventure?: {
        renown: number;
        victories: number;
        boss_victories: number;
        total_damage: number;
    } | null;
    achievements: Array<{
        slug: string;
        name: string;
        description: string;
        icon: string;
        unlocked_at: string;
    }>;
    recent_activity: SocialActivity[];
};
