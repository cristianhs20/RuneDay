import type { GameAppearance, EquippedVisual } from '@/types/game';

export type GuildHall = {
    level: number;
    key: 'camp' | 'tavern' | 'guild_hall' | 'fortress' | 'castle';
    name: string;
    min_xp: number;
    next_xp?: number | null;
    member_capacity: number;
    progress_percent: number;
};

export type GuildHero = {
    handle: string;
    name: string;
    level: number;
    archetype: 'wanderer' | 'warden' | 'rogue' | 'arcanist';
    appearance: GameAppearance;
    equipment: Record<string, EquippedVisual>;
};

export type GuildMemberView = GuildHero & {
    id: number;
    user_id: number;
    role: 'leader' | 'officer' | 'member';
    contribution_xp: number;
    contribution_tasks: number;
    raid_damage: number;
    joined_at: string;
    is_self: boolean;
};

export type GuildIncomingInvite = {
    id: number;
    guild: {
        slug: string;
        name: string;
        tag: string;
        total_xp: number;
        hall: GuildHall;
    };
    inviter: {
        handle: string;
        name: string;
    };
};

export type GuildRaidBoss = {
    id: number;
    slug: string;
    name: string;
    description: string;
    visual_key: string;
    max_hp: number;
    min_hall_level: number;
    duration_hours: number;
    reward_guild_xp: number;
    reward_member_xp: number;
    reward_member_gold: number;
    unlocked: boolean;
};

export type ActiveGuildRaid = {
    id: number;
    status: string;
    hp_remaining: number;
    max_hp: number;
    total_damage: number;
    started_at: string;
    ends_at: string;
    boss: {
        slug: string;
        name: string;
        description: string;
        visual_key: string;
        reward_guild_xp: number;
        reward_member_xp: number;
        reward_member_gold: number;
    };
    contributions: Array<{
        user_id: number;
        handle: string;
        name: string;
        damage: number;
        turns: number;
    }>;
};

export type GuildSnapshot = {
    membership?: {
        id: number;
        role: 'leader' | 'officer' | 'member';
        can_manage_invites: boolean;
        can_manage_roles: boolean;
        is_leader: boolean;
    } | null;
    incoming_invites: GuildIncomingInvite[];
    guild?: {
        id: number;
        slug: string;
        name: string;
        tag: string;
        description?: string | null;
        total_xp: number;
        member_count: number;
        hall: GuildHall;
        members: GuildMemberView[];
        invitable_friends: GuildHero[];
        pending_invites: Array<{
            id: number;
            handle: string;
            name: string;
        }>;
        active_raid?: ActiveGuildRaid | null;
        raid_bosses: GuildRaidBoss[];
        recent_contributions: Array<{
            id: number;
            handle: string;
            name: string;
            guild_xp: number;
            difficulty?: string | null;
            capped: boolean;
            created_at?: string | null;
        }>;
    } | null;
};

export type GuildProgressResult = {
    duplicate?: boolean;
    guild_id?: number;
    guild_tag?: string;
    guild_xp?: number;
    hall_upgraded?: boolean;
    hall?: GuildHall;
    raid?: {
        raid_id: number;
        duplicate?: boolean;
        capped: boolean;
        damage: number;
        critical: boolean;
        hp_remaining: number;
        max_hp: number;
        victory: boolean;
        boss: {
            slug: string;
            name: string;
            visual_key: string;
        };
        settlement?: {
            guild_xp: number;
            member_xp: number;
            member_gold: number;
            rewarded_members: number;
            hall_upgraded: boolean;
            hall: GuildHall;
        } | null;
    } | null;
};
