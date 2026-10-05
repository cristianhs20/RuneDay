/**
 * RuneDay Sprite Forge — composer.
 *
 * Builds one 64×64 frame: rig → anatomy → equipment → outline → FX.
 * Frames are deterministic and cached by their full appearance key.
 */

import type {
    CharacterLineage,
    CharacterView,
    EquippedVisual,
    GameAppearance,
    GameCharacter,
} from '@/types/game';
import {
    paintArm,
    paintEars,
    paintHair,
    paintHand,
    paintHead,
    paintHorns,
    paintLeg,
    paintNeck,
    paintTorso,
    type Ctx,
} from './anatomy';
import { gearFor, sword, swordFor, type GearDef, type GearPhase } from './gear';
import { forgePalette } from './palette';
import { ellipse, hex, Raster, rgba } from './raster';
import {
    bodyProfile,
    buildRig,
    CELL,
    STATE_TIMING,
    type ForgeState,
} from './rig';

export const FORGE_ENGINE_ID = 'runeday-sprite-forge' as const;
export const FORGE_ENGINE_VERSION = '4.0.0' as const;

export type ForgeCharacter = {
    lineage?: CharacterLineage;
    archetype: GameCharacter['archetype'];
    appearance: GameAppearance;
    equipment: Partial<
        Record<string, Pick<EquippedVisual, 'visual_key'> | null>
    >;
};

export type ForgeFrameRequest = {
    character: ForgeCharacter;
    view: CharacterView;
    state: ForgeState;
    frame: number;
};

const GEAR_SLOTS = [
    'back',
    'legs',
    'feet',
    'chest',
    'shoulder',
    'head',
    'neck',
    'accessory',
    'waist',
    'hands',
    'offhand',
] as const;

function gearList(character: ForgeCharacter): GearDef[] {
    const list: GearDef[] = [];

    for (const slot of GEAR_SLOTS) {
        const def = gearFor(character.equipment[slot]?.visual_key, slot);
        if (def) list.push(def);
    }

    return list;
}

function run(ctx: Ctx, gear: GearDef[], phase: GearPhase): void {
    for (const g of gear) g.paint[phase]?.(ctx);
}

export function renderFrame(request: ForgeFrameRequest): Raster {
    const { character, view } = request;
    const lineage = character.lineage ?? 'human';
    const appearance = character.appearance;
    const profile = bodyProfile(lineage, appearance.body);
    const timing = STATE_TIMING[request.state];
    const rig = buildRig(
        profile,
        view,
        request.state,
        request.frame % timing.frames,
    );
    const pal = forgePalette(lineage, appearance, character.archetype);
    const gear = gearList(character);
    const sprite = new Raster(CELL, CELL);

    const ctx: Ctx = {
        r: sprite,
        rig,
        pal,
        ap: appearance,
        lineage,
        archetype: character.archetype,
        view,
        hooded: gear.some((g) => g.covers?.head),
        chestCovered: gear.some((g) => g.covers?.chest),
        feetCovered: gear.some((g) => g.covers?.feet),
    };

    const chest = gear.find((g) => g.slot === 'chest');
    const sleeveRamp = chest?.sleeve?.();
    const sleeve =
        lineage !== 'skeleton' &&
        lineage !== 'ogre' &&
        (!ctx.chestCovered || Boolean(sleeveRamp));
    const withSleeve = (fn: () => void) => {
        const cloth = pal.cloth;
        if (sleeveRamp) pal.cloth = sleeveRamp;
        fn();
        pal.cloth = cloth;
    };

    const weapon = swordFor(character.equipment.weapon?.visual_key);
    const armsOverHead =
        request.state === 'celebrate' || request.state === 'cast';

    const legs = () => {
        if (view === 'side') {
            paintLeg(ctx, rig.legA, -1, true);
            paintLeg(ctx, rig.legB, 1, false);
        } else {
            paintLeg(ctx, rig.legA, -1, false);
            paintLeg(ctx, rig.legB, 1, false);
        }
        run(ctx, gear, 'feet');
        run(ctx, gear, 'legs');
    };

    const head = () => {
        paintNeck(ctx);
        run(ctx, gear, 'headBehind');
        paintHair(ctx, 'back');
        paintHead(ctx);
        paintHair(ctx, 'front');
        if (!ctx.hooded) paintEars(ctx, 'front');
        paintHorns(ctx);
        run(ctx, gear, 'head');
    };

    const weaponArm = rig.weaponArm === 'A' ? rig.armA : rig.armB;

    if (view === 'front') {
        run(ctx, gear, 'behind');
        if (!armsOverHead) paintHair(ctx, 'back');
        legs();
        paintTorso(ctx);
        run(ctx, gear, 'torso');
        run(ctx, gear, 'neck');
        if (!armsOverHead) head();
        withSleeve(() => {
            paintArm(ctx, rig.armA, false, sleeve);
            paintArm(ctx, rig.armB, false, sleeve);
        });
        run(ctx, gear, 'shoulders');
        if (armsOverHead) head();
        if (weapon) sword(ctx, weapon);
        else paintHand(ctx, weaponArm, false);
    } else if (view === 'back') {
        if (weapon) sword(ctx, weapon);
        legs();
        paintTorso(ctx);
        run(ctx, gear, 'torso');
        withSleeve(() => {
            paintArm(ctx, rig.armA, false, sleeve);
            paintArm(ctx, rig.armB, false, sleeve);
        });
        run(ctx, gear, 'shoulders');
        run(ctx, gear, 'over');
        head();
        if (weapon) paintHand(ctx, weaponArm, false);
    } else {
        // Side view, facing right. A = far limbs, B = near limbs.
        withSleeve(() => paintArm(ctx, rig.armA, true, sleeve));
        run(ctx, gear, 'behind');
        paintHair(ctx, 'back');
        legs();
        paintTorso(ctx);
        run(ctx, gear, 'torso');
        run(ctx, gear, 'neck');
        head();
        withSleeve(() => paintArm(ctx, rig.armB, false, sleeve));
        run(ctx, gear, 'shoulders');
        if (weapon) sword(ctx, weapon);
    }

    sprite.outline();

    // Final frame: ground shadow → outlined sprite → FX/glow.
    const out = new Raster(CELL, CELL);
    const shadowWidth = profile.frame === 'heavy' ? 13 : 10;
    const lift = Math.max(0, -rig.lift);
    const shadowScale = 1 - lift * 0.08;
    out.fill(
        ellipse(rig.centre, 58, shadowWidth * shadowScale, 1.6),
        rgba(9, 11, 16, 70),
        9,
    );
    out.blit(sprite);

    const fxCtx: Ctx = { ...ctx, r: out };
    run(fxCtx, gear, 'glow');
    paintFx(fxCtx, weapon?.glow);

    if (rig.fx === 'hurt')
        out.tint(hex('#ff3b3b'), rig.fxPhase === 0 ? 0.45 : 0.25);

    if (lineage === 'skeleton' && view !== 'back') {
        const glow = pal.glow ?? hex('#71c8ff');
        const [r, g, b] = [(glow >>> 16) & 255, (glow >>> 8) & 255, glow & 255];
        const { x, y } = rig.head;
        const eyes =
            view === 'side' ? [x + profile.head.rx - 2] : [x - 3, x + 3];
        for (const ex of eyes) {
            out.set(Math.round(ex), Math.round(y - 1), rgba(r, g, b, 90), 9);
        }
    }

    return out;
}

function paintFx(ctx: Ctx, weaponGlow?: number): void {
    const { r, rig } = ctx;
    const arm = rig.weaponArm === 'A' ? rig.armA : rig.armB;

    if (rig.fx === 'slash') {
        const c = weaponGlow ?? hex('#f2f5ff');
        const [cr, cg, cb] = [(c >>> 16) & 255, (c >>> 8) & 255, c & 255];
        const cx = arm.root.x;
        const cy = arm.root.y;
        const radius = 14;
        const dir = ctx.view === 'front' ? -1 : 1;
        const start = rig.fxPhase === 0 ? -0.2 : 0.4;
        for (let i = 0; i < 12; i++) {
            const t = start + i * 0.13;
            const x = cx + dir * Math.sin(t) * radius;
            const y = cy - Math.cos(t) * radius * 0.4 + i * 1.1;
            r.set(
                Math.round(x),
                Math.round(y),
                rgba(cr, cg, cb, 220 - i * 12),
                9,
            );
            r.set(
                Math.round(x - dir),
                Math.round(y),
                rgba(cr, cg, cb, 120 - i * 8),
                9,
            );
        }
    }

    if (rig.fx === 'cast') {
        const archetypeColor: Record<string, number> = {
            wanderer: hex('#9fd3ff'),
            warden: hex('#8be0a8'),
            rogue: hex('#c7b8ff'),
            arcanist: hex('#c79bff'),
        };
        const c = archetypeColor[ctx.archetype] ?? hex('#c79bff');
        const [cr, cg, cb] = [(c >>> 16) & 255, (c >>> 8) & 255, c & 255];
        const hx = (rig.armA.end.x + rig.armB.end.x) / 2;
        const hy = Math.min(rig.armA.end.y, rig.armB.end.y) - 2;
        const size = 1.5 + (rig.fxPhase % 4) * 0.6;
        for (const p of ellipse(hx, hy, size, size)) {
            const d = Math.hypot(p.x - hx, p.y - hy) / size;
            r.set(
                p.x,
                p.y,
                rgba(
                    cr + (255 - cr) * (1 - d),
                    cg + (255 - cg) * (1 - d),
                    cb + (255 - cb) * (1 - d),
                    230 - d * 120,
                ),
                9,
            );
        }
        for (let i = 0; i < 6; i++) {
            const t = (i / 6) * Math.PI * 2 + rig.fxPhase * 0.6;
            r.set(
                Math.round(hx + Math.cos(t) * (size + 3)),
                Math.round(hy + Math.sin(t) * (size + 2)),
                rgba(cr, cg, cb, 170),
                9,
            );
        }
    }

    if (rig.fx === 'sparkle') {
        const c = hex('#f6d36b');
        const [cr, cg, cb] = [(c >>> 16) & 255, (c >>> 8) & 255, c & 255];
        const spots = [
            [-14, -2],
            [13, 4],
            [-10, 12],
            [15, -8],
            [-16, 18],
            [11, 16],
        ];
        spots.forEach(([dx, dy], i) => {
            if ((i + rig.fxPhase) % 2 !== 0) return;
            const x = rig.centre + dx;
            const y = rig.head.y + dy;
            r.set(x, y, rgba(cr, cg, cb, 255), 9);
            for (const [ox, oy] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ])
                r.set(x + ox, y + oy, rgba(cr, cg, cb, 140), 9);
        });
    }
}

/* ------------------------------------------------------------------ */
/* Cache                                                               */
/* ------------------------------------------------------------------ */

const cache = new Map<string, Raster>();
const CACHE_LIMIT = 600;

export function frameKey(request: ForgeFrameRequest): string {
    const c = request.character;
    const equipment = Object.keys(c.equipment)
        .sort()
        .map((slot) => slot + '=' + (c.equipment[slot]?.visual_key ?? ''))
        .join(',');

    return [
        c.lineage ?? 'human',
        c.archetype,
        JSON.stringify(c.appearance),
        equipment,
        request.view,
        request.state,
        request.frame,
    ].join('|');
}

export function cachedFrame(request: ForgeFrameRequest): Raster {
    const key = frameKey(request);
    const hit = cache.get(key);
    if (hit) return hit;

    const raster = renderFrame(request);
    if (cache.size >= CACHE_LIMIT) {
        const first = cache.keys().next().value;
        if (first !== undefined) cache.delete(first);
    }
    cache.set(key, raster);

    return raster;
}

export { STATE_TIMING, type ForgeState };
