import { ForgeSprite } from '@/components/game/forge-sprite';
import type { ForgeState } from '@/game/forge/rig';
import type { CharacterView, GameCharacter } from '@/types/game';

type Props = {
    character: {
        appearance: GameCharacter['appearance'];
        equipment: GameCharacter['equipment'];
        archetype: GameCharacter['archetype'];
        lineage?: GameCharacter['lineage'];
    };
    state?: ForgeState;
    view?: CharacterView;
    className?: string;
};

/**
 * Every product surface renders heroes through the Sprite Forge, for all
 * lineages, views and animation states.
 */
export function ProductionCharacter({
    character,
    state = 'idle',
    view = 'front',
    className = '',
}: Props) {
    return (
        <ForgeSprite
            character={{
                lineage: character.lineage ?? 'human',
                archetype: character.archetype,
                appearance: character.appearance,
                equipment: character.equipment,
            }}
            state={state}
            view={view}
            className={className}
        />
    );
}
