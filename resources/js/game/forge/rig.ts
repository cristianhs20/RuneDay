/**
 * RuneDay Sprite Forge — rig.
 *
 * One humanoid skeleton per lineage/frame. Every layer (anatomy, hair,
 * equipment, FX) is positioned from the same joints, so armour and gear
 * fit all four lineages without hand-placed offsets.
 */

import type {
    CharacterBodyFrame,
    CharacterLineage,
    CharacterView,
} from '@/types/game';

export type ForgeState =
    | 'idle'
    | 'walk'
    | 'attack'
    | 'cast'
    | 'celebrate'
    | 'hurt';

export type Point = { x: number; y: number };

export type BodyProfile = {
    lineage: CharacterLineage;
    frame: CharacterBodyFrame;
    /** Head centre (between the eyes) and radii. */
    head: { x: number; y: number; rx: number; ry: number };
    neckY: number;
    shoulderY: number;
    shoulderHalf: number;
    chestHalf: number;
    waistY: number;
    waistHalf: number;
    hipY: number;
    hipHalf: number;
    /** Horizontal distance from centre to each hip joint. */
    legSpread: number;
    upperArm: number;
    foreArm: number;
    thigh: number;
    shin: number;
    armRadius: [number, number];
    legRadius: [number, number];
    handRadius: number;
    footLength: number;
    /** Half depth of the torso in side view. */
    depth: number;
    bony: boolean;
};

export type Limb = {
    root: Point;
    joint: Point;
    end: Point;
};

export type Rig = {
    profile: BodyProfile;
    view: CharacterView;
    centre: number;
    head: Point;
    neck: Point;
    shoulderY: number;
    waistY: number;
    hipY: number;
    /** Screen-left / screen-right limbs (front & back), or far / near (side). */
    armA: Limb;
    armB: Limb;
    legA: Limb;
    legB: Limb;
    /** Which arm holds the main weapon. */
    weaponArm: 'A' | 'B';
    /** Blade direction from the weapon hand, in radians (0 = pointing down). */
    weaponAngle: number;
    /** Vertical offset applied to the whole body this frame. */
    lift: number;
    fx: 'none' | 'cast' | 'slash' | 'sparkle' | 'hurt';
    fxPhase: number;
};

export const CELL = 64;
export const BASELINE = 58;

const profiles: Record<string, BodyProfile> = {
    'human:broad': {
        lineage: 'human',
        frame: 'broad',
        head: { x: 32, y: 15, rx: 6, ry: 6 },
        neckY: 22,
        shoulderY: 25,
        shoulderHalf: 8.5,
        chestHalf: 7.5,
        waistY: 36,
        waistHalf: 5.5,
        hipY: 40,
        hipHalf: 6.5,
        legSpread: 3.2,
        upperArm: 7,
        foreArm: 6.5,
        thigh: 8,
        shin: 8,
        armRadius: [2.1, 1.8],
        legRadius: [2.5, 2],
        handRadius: 1.8,
        footLength: 4,
        depth: 4.5,
        bony: false,
    },
    'human:lean': {
        lineage: 'human',
        frame: 'lean',
        head: { x: 32, y: 15, rx: 5.5, ry: 6 },
        neckY: 22,
        shoulderY: 25,
        shoulderHalf: 7,
        chestHalf: 6.2,
        waistY: 36,
        waistHalf: 4.6,
        hipY: 40,
        hipHalf: 5.5,
        legSpread: 2.7,
        upperArm: 7,
        foreArm: 6.5,
        thigh: 8,
        shin: 8,
        armRadius: [1.6, 1.4],
        legRadius: [2, 1.6],
        handRadius: 1.5,
        footLength: 4,
        depth: 3.8,
        bony: false,
    },
    'elf:broad': {
        lineage: 'elf',
        frame: 'broad',
        head: { x: 32, y: 14, rx: 5.5, ry: 6 },
        neckY: 21,
        shoulderY: 24,
        shoulderHalf: 8,
        chestHalf: 7,
        waistY: 35,
        waistHalf: 5,
        hipY: 39,
        hipHalf: 6,
        legSpread: 3,
        upperArm: 7.5,
        foreArm: 7,
        thigh: 8.5,
        shin: 8.5,
        armRadius: [1.9, 1.6],
        legRadius: [2.3, 1.8],
        handRadius: 1.6,
        footLength: 4,
        depth: 4.2,
        bony: false,
    },
    'elf:lean': {
        lineage: 'elf',
        frame: 'lean',
        head: { x: 32, y: 14, rx: 5, ry: 6 },
        neckY: 21,
        shoulderY: 24,
        shoulderHalf: 6.5,
        chestHalf: 5.8,
        waistY: 35,
        waistHalf: 4.3,
        hipY: 39,
        hipHalf: 5.2,
        legSpread: 2.6,
        upperArm: 7.5,
        foreArm: 7,
        thigh: 8.5,
        shin: 8.5,
        armRadius: [1.5, 1.3],
        legRadius: [1.9, 1.5],
        handRadius: 1.4,
        footLength: 4,
        depth: 3.6,
        bony: false,
    },
    'skeleton:broad': {
        lineage: 'skeleton',
        frame: 'broad',
        head: { x: 32, y: 15, rx: 6, ry: 6 },
        neckY: 22,
        shoulderY: 25,
        shoulderHalf: 8.5,
        chestHalf: 7,
        waistY: 35,
        waistHalf: 2,
        hipY: 39,
        hipHalf: 6,
        legSpread: 3.2,
        upperArm: 7,
        foreArm: 6.5,
        thigh: 8,
        shin: 8.5,
        armRadius: [1, 0.9],
        legRadius: [1.2, 1],
        handRadius: 1.5,
        footLength: 4,
        depth: 4,
        bony: true,
    },
    'skeleton:lean': {
        lineage: 'skeleton',
        frame: 'lean',
        head: { x: 32, y: 15, rx: 5.5, ry: 6 },
        neckY: 22,
        shoulderY: 25,
        shoulderHalf: 7.5,
        chestHalf: 6,
        waistY: 35,
        waistHalf: 1.8,
        hipY: 39,
        hipHalf: 5.2,
        legSpread: 2.8,
        upperArm: 7,
        foreArm: 6.5,
        thigh: 8,
        shin: 8.5,
        armRadius: [0.9, 0.8],
        legRadius: [1, 0.9],
        handRadius: 1.3,
        footLength: 4,
        depth: 3.6,
        bony: true,
    },
    'ogre:heavy': {
        lineage: 'ogre',
        frame: 'heavy',
        head: { x: 32, y: 17, rx: 7, ry: 6.2 },
        neckY: 23,
        shoulderY: 24,
        shoulderHalf: 12.5,
        chestHalf: 11,
        waistY: 37,
        waistHalf: 8,
        hipY: 41,
        hipHalf: 8.5,
        legSpread: 4.6,
        upperArm: 7.5,
        foreArm: 7,
        thigh: 7,
        shin: 6.5,
        armRadius: [3.2, 2.8],
        legRadius: [3.4, 2.9],
        handRadius: 3,
        footLength: 5,
        depth: 7.5,
        bony: false,
    },
};

export function bodyProfile(
    lineage: CharacterLineage,
    frame: CharacterBodyFrame,
): BodyProfile {
    if (lineage === 'ogre') return profiles['ogre:heavy'];

    const safeFrame = frame === 'heavy' ? 'broad' : frame;

    return profiles[lineage + ':' + safeFrame] ?? profiles['human:broad'];
}

/* ------------------------------------------------------------------ */
/* Poses                                                               */
/* ------------------------------------------------------------------ */

type LimbPose = { a: number; b: number };

type Pose = {
    dx: number;
    dy: number;
    lean: number;
    headDx: number;
    headDy: number;
    armA: LimbPose;
    armB: LimbPose;
    legA: LimbPose;
    legB: LimbPose;
    footLiftA: number;
    footLiftB: number;
    weaponAngle: number;
    fx: Rig['fx'];
    fxPhase: number;
};

export const STATE_TIMING: Record<
    ForgeState,
    { frames: number; fps: number; loop: boolean }
> = {
    idle: { frames: 4, fps: 4, loop: true },
    walk: { frames: 8, fps: 10, loop: true },
    attack: { frames: 6, fps: 12, loop: false },
    cast: { frames: 8, fps: 10, loop: false },
    celebrate: { frames: 6, fps: 9, loop: false },
    hurt: { frames: 4, fps: 10, loop: false },
};

function basePose(): Pose {
    return {
        dx: 0,
        dy: 0,
        lean: 0,
        headDx: 0,
        headDy: 0,
        armA: { a: -0.2, b: 0.22 },
        armB: { a: 0.2, b: -0.22 },
        legA: { a: 0.03, b: 0 },
        legB: { a: -0.03, b: 0 },
        footLiftA: 0,
        footLiftB: 0,
        weaponAngle: 0.5,
        fx: 'none',
        fxPhase: 0,
    };
}

/**
 * Poses are authored per view in screen space. For front/back, A is the
 * screen-left limb; for side (facing right), A is the far limb.
 */
function pose(state: ForgeState, frame: number, view: CharacterView): Pose {
    const p = basePose();
    const side = view === 'side';
    const back = view === 'back';

    if (side) {
        p.armA = { a: -0.08, b: 0.2 };
        p.armB = { a: 0.06, b: 0.25 };
        p.legA = { a: -0.06, b: 0 };
        p.legB = { a: 0.06, b: 0 };
        p.weaponAngle = 2.35; // blade forward and up, resting
    } else {
        // Blade points down and away from the body.
        p.weaponAngle = back ? 0.42 : -0.42;
    }

    switch (state) {
        case 'idle': {
            const breathe = [0, 0, 1, 1][frame % 4];
            p.dy = 0;
            p.headDy = breathe;
            p.lean = 0;
            p.armA.a -= breathe * 0.03;
            p.armB.a += breathe * 0.03;
            // Shoulders sink with the breath; hips stay planted.
            p.dx = 0;
            (p as Pose & { breathe?: number }).breathe = breathe;
            break;
        }
        case 'walk': {
            const t = (frame % 8) / 8;
            const s = Math.sin(t * Math.PI * 2);
            const bob = Math.abs(Math.cos(t * Math.PI * 2)) > 0.7 ? 0 : -1;
            p.dy = bob;

            if (side) {
                p.legA = { a: -s * 0.55, b: s > 0 ? 0.55 * s : 0 };
                p.legB = { a: s * 0.55, b: s < 0 ? -0.55 * s : 0 };
                p.armA = { a: s * 0.5, b: 0.3 };
                p.armB = { a: -s * 0.5, b: 0.3 };
                p.weaponAngle = 2.35 - s * 0.4;
            } else {
                p.footLiftA = Math.max(0, s) * 3;
                p.footLiftB = Math.max(0, -s) * 3;
                p.armA = { a: -0.2 + s * 0.1, b: 0.2 };
                p.armB = { a: 0.2 + s * 0.1, b: -0.2 };
                p.weaponAngle = (back ? 0.42 : -0.42) + s * 0.1;
            }
            break;
        }
        case 'attack': {
            const f = frame % 6;
            const raise = [-0.6, -2.3, -2.7, 0.9, 1.2, 0.4][f];
            const bend = [0.4, -0.4, -0.6, 0.1, 0.2, 0.2][f];
            const blade = [1.4, -2.6, -2.9, 1.7, 2.1, 0.9][f];
            p.dx = [0, -1, -1, 2, 2, 1][f];
            p.fx = f === 3 || f === 4 ? 'slash' : 'none';
            p.fxPhase = f - 3;

            if (side) {
                p.armB = { a: raise, b: bend };
                p.armA = { a: 0.4, b: 0.6 };
                p.weaponAngle = blade;
                p.legA = { a: -0.35, b: 0.3 };
                p.legB = { a: 0.45, b: 0 };
            } else if (back) {
                p.armB = { a: -raise * 0.9, b: -bend };
                p.weaponAngle = -blade;
                p.legA = { a: 0.15, b: 0 };
                p.legB = { a: -0.18, b: 0 };
            } else {
                p.armA = { a: raise * 0.9, b: bend };
                p.weaponAngle = blade;
                p.legA = { a: 0.18, b: 0 };
                p.legB = { a: -0.15, b: 0 };
            }
            break;
        }
        case 'cast': {
            const f = frame % 8;
            const lift = [0.3, 0.8, 1.3, 1.6, 1.6, 1.6, 1.2, 0.6][f];
            p.fx = f >= 2 ? 'cast' : 'none';
            p.fxPhase = f;
            p.headDy = f >= 3 && f <= 5 ? -1 : 0;

            if (side) {
                p.armB = { a: lift, b: -0.5 };
                p.armA = { a: lift * 0.8, b: -0.5 };
                p.weaponAngle = 2.6;
            } else {
                p.armA = { a: lift * 0.55, b: -lift * 0.9 };
                p.armB = { a: -lift * 0.55, b: lift * 0.9 };
                p.weaponAngle = back ? 0.9 : -0.9;
            }
            break;
        }
        case 'celebrate': {
            const f = frame % 6;
            const jump = [0, -2, -4, -4, -2, 0][f];
            p.dy = jump;
            p.fx = 'sparkle';
            p.fxPhase = f;

            if (side) {
                p.armA = { a: 2.6, b: 0.2 };
                p.armB = { a: 2.85, b: 0.1 };
                p.legA = { a: -0.2, b: jump < -1 ? 0.6 : 0 };
                p.legB = { a: 0.2, b: jump < -1 ? 0.5 : 0 };
                p.weaponAngle = Math.PI;
            } else {
                p.armA = { a: -2.55, b: -0.2 };
                p.armB = { a: 2.55, b: 0.2 };
                p.footLiftA = jump < -1 ? 2 : 0;
                p.footLiftB = jump < -1 ? 2 : 0;
                p.weaponAngle = Math.PI;
            }
            break;
        }
        case 'hurt': {
            const f = frame % 4;
            p.dx = [-2, -3, -2, -1][f];
            p.lean = [-1, -2, -1, 0][f];
            p.headDx = [-1, -1, -1, 0][f];
            p.fx = f < 2 ? 'hurt' : 'none';
            p.fxPhase = f;

            if (side) {
                p.armA = { a: 0.7, b: 0.6 };
                p.armB = { a: 0.5, b: 0.8 };
                p.weaponAngle = 1.8;
            } else {
                p.armA = { a: 0.5, b: -0.6 };
                p.armB = { a: -0.5, b: 0.6 };
            }
            break;
        }
    }

    return p;
}

function limb(
    root: Point,
    first: number,
    second: number,
    pose: LimbPose,
): Limb {
    const joint = {
        x: root.x + Math.sin(pose.a) * first,
        y: root.y + Math.cos(pose.a) * first,
    };
    const end = {
        x: joint.x + Math.sin(pose.a + pose.b) * second,
        y: joint.y + Math.cos(pose.a + pose.b) * second,
    };

    return { root, joint, end };
}

export function buildRig(
    profile: BodyProfile,
    view: CharacterView,
    state: ForgeState,
    frame: number,
): Rig {
    const p = pose(state, frame, view);
    if (view !== 'side' && profile.frame === 'heavy') {
        p.armA.a -= 0.12;
        p.armB.a += 0.12;
    }
    const breathe = (p as Pose & { breathe?: number }).breathe ?? 0;
    const centre = 32 + p.dx;
    const dy = p.dy;
    const side = view === 'side';
    const shoulderY = profile.shoulderY + dy + breathe * 0.5;
    const hipY = profile.hipY + dy;
    const lean = p.lean;

    const head = {
        x:
            profile.head.x +
            p.dx +
            p.headDx +
            lean +
            (side ? (profile.frame === 'heavy' ? 3 : 1) : 0),
        y: profile.head.y + dy + p.headDy,
    };
    const neck = { x: centre + lean, y: profile.neckY + dy + p.headDy };

    const shoulderSpread = side
        ? 1.5
        : profile.shoulderHalf - profile.armRadius[0] + 0.5;
    const hipSpread = side ? 0.8 : profile.legSpread;

    const armRootA = { x: centre + lean - shoulderSpread, y: shoulderY + 1 };
    const armRootB = { x: centre + lean + shoulderSpread, y: shoulderY + 1 };
    const legRootA = { x: centre - hipSpread, y: hipY };
    const legRootB = { x: centre + hipSpread, y: hipY };

    const legA = limb(legRootA, profile.thigh, profile.shin, p.legA);
    const legB = limb(legRootB, profile.thigh, profile.shin, p.legB);

    // Planted feet stay on the baseline, lifted feet rise.
    const floor = BASELINE - 1 + dy;
    for (const [leg, liftAmount] of [
        [legA, p.footLiftA],
        [legB, p.footLiftB],
    ] as Array<[Limb, number]>) {
        const target = floor - liftAmount;
        if (!side) {
            leg.end.y = Math.min(leg.end.y, target);
            leg.end.y = target;
            leg.joint.y =
                leg.root.y + (target - leg.root.y) * 0.5 - liftAmount * 0.3;
        } else {
            const diff = target - leg.end.y;
            if (Math.abs(p.legA.b) < 0.01 && Math.abs(p.legB.b) < 0.01) {
                leg.end.y += diff;
                leg.joint.y += diff * 0.5;
            }
        }
    }

    return {
        profile,
        view,
        centre,
        head,
        neck,
        shoulderY,
        waistY: profile.waistY + dy + breathe * 0.3,
        hipY,
        armA: limb(armRootA, profile.upperArm, profile.foreArm, p.armA),
        armB: limb(armRootB, profile.upperArm, profile.foreArm, p.armB),
        legA,
        legB,
        weaponArm: view === 'front' ? 'A' : 'B',
        weaponAngle: p.weaponAngle,
        lift: dy,
        fx: p.fx,
        fxPhase: p.fxPhase,
    };
}
