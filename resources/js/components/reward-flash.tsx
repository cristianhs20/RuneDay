import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { GameEvent } from '@/types/game';

type Flash = {
    success?: string | null;
    reward?: { xp: number; gold: number } | null;
    game_event?: GameEvent | null;
};

export function RewardFlash() {
    const { flash } = usePage<{ flash?: Flash }>().props;

    useEffect(() => {
        if (flash?.game_event) {
            return;
        }

        if (flash?.reward && (flash.reward.xp > 0 || flash.reward.gold > 0)) {
            const parts = [
                flash.reward.xp > 0 ? '+' + flash.reward.xp + ' XP' : null,
                flash.reward.gold > 0
                    ? '+' + flash.reward.gold + ' gold'
                    : null,
            ].filter(Boolean);

            toast.success(parts.join(' · '), {
                description: 'Your hero grew stronger.',
            });
        } else if (flash?.reward) {
            toast.info('Quest complete', {
                description: 'Daily reward cap reached. Progress still counts.',
            });
        }
    }, [flash?.game_event, flash?.reward]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    return null;
}
