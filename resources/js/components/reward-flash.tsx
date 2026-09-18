import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Flash = {
    success?: string | null;
    reward?: { xp: number; gold: number } | null;
};

export function RewardFlash() {
    const { flash } = usePage<{ flash?: Flash }>().props;

    useEffect(() => {
        if (flash?.reward && (flash.reward.xp > 0 || flash.reward.gold > 0)) {
            const parts = [
                flash.reward.xp > 0 ? `+${flash.reward.xp} XP` : null,
                flash.reward.gold > 0 ? `+${flash.reward.gold} gold` : null,
            ].filter(Boolean);

            toast.success(parts.join(' · '), {
                description: 'Your hero grew stronger.',
            });
        } else if (flash?.reward) {
            toast.info('Quest complete', {
                description: 'Daily reward cap reached. Progress still counts.',
            });
        }
    }, [flash?.reward]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    return null;
}
