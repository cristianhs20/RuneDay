/**
 * RuneDay Sprite Forge — lineage anatomy.
 *
 * Bodies, heads, faces, ears, horns and hair for Human, Elf, Skeleton and
 * Ogre/Orc. Everything is placed from the rig, never from hard-coded
 * per-sprite offsets.
 */

import type {
    CharacterLineage,
    CharacterView,
    GameAppearance,
} from '@/types/game';
import type { ForgePalette } from './palette';
import {
    capsule,
    ellipse,
    line,
    mix,
    hex,
    polygon,
    shade,
    union,
    type LitPixel,
    type Ramp,
    type Raster,
    type Rgba,
} from './raster';
import type { Limb, Rig } from './rig';

export type Ctx = {
    r: Raster;
    rig: Rig;
    pal: ForgePalette;
    ap: GameAppearance;
    lineage: CharacterLineage;
    archetype: string;
    view: CharacterView;
    /** Head covered by a hood or helm (hair hidden). */
    hooded: boolean;
    /** Upper body covered by a chest item (base shirt hidden). */
    chestCovered: boolean;
    /** Feet covered by boots. */
    feetCovered: boolean;
};

const TAG_BODY = 1;
const TAG_HEAD = 2;
const TAG_HAIR = 3;

/** Symmetric polygon around column cx: pts are [dx, y] of the right half, top to bottom. */
export function sym(
    cx: number,
    pts: Array<[number, number]>,
): Array<[number, number]> {
    const right = pts.map(([dx, y]) => [cx + dx, y] as [number, number]);
    const left = [...pts]
        .reverse()
        .map(([dx, y]) => [cx - dx, y] as [number, number]);

    return [...right, ...left];
}

function dot(r: Raster, x: number, y: number, c: Rgba, tag = TAG_HEAD): void {
    r.set(Math.round(x), Math.round(y), c, tag);
}

/* ------------------------------------------------------------------ */
/* Limbs                                                               */
/* ------------------------------------------------------------------ */

export function legPixels(ctx: Ctx, leg: Limb): LitPixel[] {
    const p = ctx.rig.profile;
    const [r0, r1] = p.legRadius;
    const thigh = capsule(
        leg.root.x,
        leg.root.y,
        leg.joint.x,
        leg.joint.y,
        r0,
        (r0 + r1) / 2,
    );
    const shin = capsule(
        leg.joint.x,
        leg.joint.y,
        leg.end.x,
        leg.end.y,
        (r0 + r1) / 2,
        r1,
    );

    return union(thigh, shin);
}

export function footPixels(ctx: Ctx, leg: Limb, outward: number): LitPixel[] {
    const p = ctx.rig.profile;
    const { x, y } = leg.end;

    if (ctx.view === 'side') {
        return polygon([
            [x - 1.5, y - 1.5],
            [x + 1, y - 1.5],
            [x + p.footLength, y + 0.2],
            [x + p.footLength, y + 1.4],
            [x - 1.5, y + 1.4],
        ]);
    }

    const w = p.footLength / 2 + 0.3;

    return ellipse(x + outward * 0.5, y + 0.4, w, 1.3);
}

function boneLimb(
    ctx: Ctx,
    limb: Limb,
    radius: [number, number],
    far: boolean,
): void {
    const r = ctx.r;
    const bone = ctx.pal.bone;
    r.paint(
        capsule(
            limb.root.x,
            limb.root.y,
            limb.joint.x,
            limb.joint.y,
            radius[0],
        ),
        bone,
        { far, innerLine: true, tag: TAG_BODY },
    );
    r.paint(
        capsule(limb.joint.x, limb.joint.y, limb.end.x, limb.end.y, radius[1]),
        bone,
        { far, innerLine: true, tag: TAG_BODY },
    );
    r.paint(ellipse(limb.joint.x, limb.joint.y, 1.4, 1.2), bone, {
        far,
        innerLine: true,
        tag: TAG_BODY,
    });
}

export function paintLeg(
    ctx: Ctx,
    leg: Limb,
    side: -1 | 1,
    far: boolean,
): void {
    const r = ctx.r;
    const p = ctx.rig.profile;

    if (p.bony) {
        boneLimb(ctx, leg, p.legRadius, far);
        r.paint(ellipse(leg.root.x, leg.root.y, 1.6, 1.4), ctx.pal.bone, {
            far,
            tag: TAG_BODY,
        });
        if (!ctx.feetCovered) {
            r.paint(footPixels(ctx, leg, side), ctx.pal.bone, {
                far,
                innerLine: true,
                tag: TAG_BODY,
            });
            // Toe gaps.
            if (ctx.view !== 'side') {
                dot(
                    r,
                    leg.end.x + side * 0.5,
                    leg.end.y + 1,
                    ctx.pal.bone.line,
                    TAG_BODY,
                );
            }
        }

        return;
    }

    const skin = ctx.pal.skin;
    r.paint(legPixels(ctx, leg), skin, { far, innerLine: true, tag: TAG_BODY });

    // Base trousers: full length for humans/elves, knee shorts for ogres.
    const pants = ctx.pal.pants;
    const [r0, r1] = p.legRadius;
    const thigh = capsule(
        leg.root.x,
        leg.root.y,
        leg.joint.x,
        leg.joint.y,
        r0 + 0.3,
        (r0 + r1) / 2 + 0.3,
    );

    if (ctx.lineage === 'ogre') {
        r.paint(
            thigh.filter(
                (px) => px.y <= leg.root.y + (leg.joint.y - leg.root.y) * 0.55,
            ),
            pants,
            { far, innerLine: true, tag: TAG_BODY },
        );
        // Knee shading for muscle mass.
        r.paint(ellipse(leg.joint.x, leg.joint.y + 0.5, 1, 0.8, -0.6), skin, {
            far,
            tag: TAG_BODY,
        });
    } else {
        const shin = capsule(
            leg.joint.x,
            leg.joint.y,
            leg.end.x,
            leg.end.y - 1,
            (r0 + r1) / 2 + 0.3,
            r1 + 0.2,
        );
        r.paint(union(thigh, shin), pants, {
            far,
            innerLine: true,
            tag: TAG_BODY,
        });
    }

    if (!ctx.feetCovered) {
        const foot = footPixels(ctx, leg, side);
        if (ctx.lineage === 'ogre') {
            r.paint(foot, skin, { far, innerLine: true, tag: TAG_BODY });
        } else {
            // Simple cloth foot wraps.
            r.paint(foot, ctx.pal.leather, {
                far,
                innerLine: true,
                tag: TAG_BODY,
            });
            r.paint(
                capsule(
                    leg.end.x,
                    leg.end.y - 2,
                    leg.end.x,
                    leg.end.y - 0.5,
                    p.legRadius[1] + 0.3,
                ),
                darkerWrap(ctx.pal.leather),
                { far, innerLine: true, flat: true, tag: TAG_BODY },
            );
        }
    }
}

function darkerWrap(rmp: Ramp): Ramp {
    return { ...rmp, base: rmp.shadow, light: rmp.base };
}

export function paintArm(
    ctx: Ctx,
    arm: Limb,
    far: boolean,
    sleeve: boolean,
): void {
    const r = ctx.r;
    const p = ctx.rig.profile;

    if (p.bony) {
        boneLimb(ctx, arm, p.armRadius, far);
        r.paint(ellipse(arm.root.x, arm.root.y, 1.7, 1.5), ctx.pal.bone, {
            far,
            innerLine: true,
            tag: TAG_BODY,
        });
        paintHand(ctx, arm, far);

        return;
    }

    const [r0, r1] = p.armRadius;
    const upper = capsule(
        arm.root.x,
        arm.root.y,
        arm.joint.x,
        arm.joint.y,
        r0,
        (r0 + r1) / 2,
    );
    const fore = capsule(
        arm.joint.x,
        arm.joint.y,
        arm.end.x,
        arm.end.y,
        (r0 + r1) / 2,
        r1,
    );
    r.paint(union(upper, fore), ctx.pal.skin, {
        far,
        innerLine: true,
        tag: TAG_BODY,
    });

    if (ctx.lineage === 'ogre') {
        // Bicep/forearm mass highlights.
        r.paint(
            shade(
                ellipse(
                    (arm.root.x + arm.joint.x) / 2,
                    (arm.root.y + arm.joint.y) / 2,
                    r0 - 0.8,
                    1.4,
                ),
                0.15,
            ),
            ctx.pal.skin,
            { far, tag: TAG_BODY },
        );
    }

    if (sleeve) {
        const cut = arm.root.y + (arm.joint.y - arm.root.y) * 0.55;
        const sleevePx = capsule(
            arm.root.x,
            arm.root.y,
            arm.joint.x,
            arm.joint.y,
            r0 + 0.4,
            r0 + 0.2,
        ).filter((px) => {
            const t =
                (px.y - arm.root.y) / Math.max(1, arm.joint.y - arm.root.y);
            return arm.joint.y > arm.root.y ? px.y <= cut : t > -0.6;
        });
        r.paint(sleevePx, ctx.pal.cloth, {
            far,
            innerLine: true,
            tag: TAG_BODY,
        });
    }

    paintHand(ctx, arm, far);
}

export function paintHand(ctx: Ctx, arm: Limb, far: boolean): void {
    const p = ctx.rig.profile;
    const ramp = p.bony ? ctx.pal.bone : ctx.pal.skin;
    const dx = arm.end.x - arm.joint.x;
    const dy = arm.end.y - arm.joint.y;
    const len = Math.hypot(dx, dy) || 1;
    const hx = arm.end.x + (dx / len) * (p.handRadius * 0.6);
    const hy = arm.end.y + (dy / len) * (p.handRadius * 0.6);

    ctx.r.paint(ellipse(hx, hy, p.handRadius, p.handRadius), ramp, {
        far,
        innerLine: true,
        tag: TAG_BODY,
    });

    if (p.bony) {
        dot(ctx.r, hx, hy + 1, ramp.line, TAG_BODY);
    }
}

export function handPoint(ctx: Ctx, arm: Limb): { x: number; y: number } {
    const p = ctx.rig.profile;
    const dx = arm.end.x - arm.joint.x;
    const dy = arm.end.y - arm.joint.y;
    const len = Math.hypot(dx, dy) || 1;

    return {
        x: arm.end.x + (dx / len) * (p.handRadius * 0.6),
        y: arm.end.y + (dy / len) * (p.handRadius * 0.6),
    };
}

/* ------------------------------------------------------------------ */
/* Torso                                                               */
/* ------------------------------------------------------------------ */

export function torsoOutline(ctx: Ctx, grow = 0): Array<[number, number]> {
    const { rig } = ctx;
    const p = rig.profile;
    const cx = rig.centre;
    const sy = rig.shoulderY;
    const wy = rig.waistY;
    const hy = rig.hipY;
    const g = grow;

    if (ctx.view === 'side') {
        const d = p.depth + g;
        const lean = rig.neck.x - cx;

        return [
            [cx - d + 1 + lean, sy - 1 - g],
            [cx + d - 1 + lean, sy - 1 - g],
            [cx + d + 0.5 + lean, sy + 3],
            [cx + d - 0.5, wy - 2],
            [cx + d - 1, wy + 1],
            [cx + d - 0.5, hy + 1 + g],
            [cx - d + 0.5, hy + 1 + g],
            [cx - d, wy],
            [cx - d + 0.5 + lean, sy + 4],
        ];
    }

    const lean = rig.neck.x - cx;
    const sh = p.shoulderHalf + g - 0.5;
    const ch = p.chestHalf + g;
    const wh = p.waistHalf + g;
    const hh = p.hipHalf + g;

    return [
        [cx + lean + sh - 2, sy - 1.5 - g],
        [cx + lean + sh, sy + 1],
        [cx + lean + ch, sy + 6],
        [cx + wh, wy],
        [cx + hh, hy + 1.5 + g],
        [cx - hh, hy + 1.5 + g],
        [cx - wh, wy],
        [cx + lean - ch, sy + 6],
        [cx + lean - sh, sy + 1],
        [cx + lean - sh + 2, sy - 1.5 - g],
    ];
}

export function paintNeck(ctx: Ctx): void {
    const { rig } = ctx;
    const p = rig.profile;
    const ramp = p.bony ? ctx.pal.bone : ctx.pal.skin;
    const top = rig.head.y + 4;
    const radius = p.bony ? 1 : ctx.lineage === 'ogre' ? 4 : 2;
    const nx = ctx.view === 'side' ? rig.neck.x + 0.5 : rig.neck.x;

    ctx.r.paint(
        shade(capsule(nx, top, nx, rig.shoulderY, radius), -0.35),
        ramp,
        { tag: TAG_BODY },
    );

    if (p.bony) {
        for (let y = Math.round(top); y < rig.shoulderY; y += 2) {
            dot(ctx.r, nx, y, ramp.line, TAG_BODY);
        }
    }
}

export function paintTorso(ctx: Ctx): void {
    const { r, rig, pal } = ctx;
    const p = rig.profile;
    const cx = rig.centre;

    if (p.bony) {
        paintRibcage(ctx);

        return;
    }

    r.paint(polygon(torsoOutline(ctx), 0.05), pal.skin, {
        innerLine: true,
        tag: TAG_BODY,
    });

    if (ctx.lineage === 'ogre' && ctx.view !== 'side') {
        // Trapezius mass that sinks the head between the shoulders.
        const traps = polygon(
            sym(rig.neck.x, [
                [3.5, rig.head.y + 2.5],
                [p.shoulderHalf - 2.5, rig.shoulderY - 1.5],
                [p.shoulderHalf - 4, rig.shoulderY + 2],
                [0.5, rig.shoulderY + 2],
            ]),
            0.1,
        );
        r.paint(traps, pal.skin, { innerLine: true, tag: TAG_BODY });
    }

    if (ctx.lineage === 'ogre' && ctx.view !== 'back') {
        // Pectorals + belly mass.
        const sy = rig.shoulderY;
        if (ctx.view === 'front') {
            for (const s of [-1, 1]) {
                r.paint(
                    line(
                        cx + s * 1,
                        sy + 7,
                        cx + s * (p.chestHalf - 2),
                        sy + 6,
                        -1,
                    ),
                    pal.skin,
                    { tag: TAG_BODY },
                );
            }
            r.paint(line(cx, sy + 3, cx, rig.waistY - 1, -0.6), pal.skin, {
                tag: TAG_BODY,
            });
            r.paint(ellipse(cx, rig.waistY - 1, 3, 2, 0.2), pal.skin, {
                tag: TAG_BODY,
                thresholds: [-0.4, 0.3, 0.9],
            });
        }
    }

    if (ctx.lineage === 'ogre' && ctx.view === 'back') {
        r.paint(line(cx, rig.shoulderY + 2, cx, rig.waistY, -0.8), pal.skin, {
            tag: TAG_BODY,
        });
    }

    if (!ctx.chestCovered && ctx.lineage !== 'ogre') {
        // Base shirt in the archetype colour.
        r.paint(polygon(torsoOutline(ctx, 0.3)), pal.cloth, {
            innerLine: true,
            tag: TAG_BODY,
        });
        if (ctx.view === 'front') {
            // Collar notch.
            const ny = rig.shoulderY - 1;
            r.paint(
                polygon(
                    sym(rig.neck.x, [
                        [1.5, ny - 0.5],
                        [0.2, ny + 3],
                    ]),
                ),
                pal.skin,
                { tag: TAG_BODY },
            );
        }
    }

    paintBelt(ctx);
}

export function paintBelt(ctx: Ctx): void {
    const { r, rig, pal } = ctx;
    const p = rig.profile;
    const cx = rig.centre;
    const y = rig.waistY + 1;
    const half = ctx.view === 'side' ? p.depth + 0.5 : p.waistHalf + 1;

    // Hip cloth between waist and crotch.
    if (ctx.lineage !== 'skeleton') {
        const hips: Array<[number, number]> =
            ctx.view === 'side'
                ? [
                      [cx - p.depth - 0.2, y],
                      [cx + p.depth - 0.2, y],
                      [cx + p.depth, rig.hipY + 2],
                      [cx - p.depth, rig.hipY + 2],
                  ]
                : [
                      [cx - half, y],
                      [cx + half, y],
                      [cx + p.hipHalf + 0.6, rig.hipY + 2],
                      [cx - p.hipHalf - 0.6, rig.hipY + 2],
                  ];
        r.paint(polygon(hips), pal.pants, { innerLine: true, tag: TAG_BODY });
    }

    const band = polygon([
        [cx - half - 0.4, y - 0.6],
        [cx + half + 0.4, y - 0.6],
        [cx + half + 0.6, y + 1.4],
        [cx - half - 0.6, y + 1.4],
    ]);
    r.paint(band, pal.leather, { innerLine: true, flat: true, tag: TAG_BODY });

    if (ctx.view === 'front') {
        // Buckle.
        const metal = hex('#d0a64f');
        dot(r, cx, y, metal, TAG_BODY);
        dot(r, cx, y + 1, mix(metal, hex('#000000'), 0.4), TAG_BODY);
    }

    if (ctx.lineage === 'ogre' || ctx.lineage === 'skeleton') {
        // Hanging loincloth flap.
        if (ctx.view !== 'side') {
            const flap = polygon(
                sym(cx, [
                    [2.5, y + 1.5],
                    [2, y + 8],
                    [0.5, y + 9],
                ]),
            );
            r.paint(flap, pal.pants, { innerLine: true, tag: TAG_BODY });
        } else {
            const flap = polygon([
                [cx + p.depth - 2, y + 1.5],
                [cx + p.depth + 0.5, y + 1.5],
                [cx + p.depth + 1, y + 8],
                [cx + p.depth - 2, y + 7],
            ]);
            r.paint(flap, pal.pants, { innerLine: true, tag: TAG_BODY });
        }
    }
}

function paintRibcage(ctx: Ctx): void {
    const { r, rig, pal } = ctx;
    const p = rig.profile;
    const cx = rig.centre + (rig.neck.x - rig.centre);
    const bone = pal.bone;
    const sy = rig.shoulderY;

    if (ctx.view === 'side') {
        // Spine curve + rib profile.
        r.paint(capsule(cx - 2, sy - 1, cx - 2.5, rig.hipY, 1), bone, {
            innerLine: true,
            tag: TAG_BODY,
        });
        for (let i = 0; i < 4; i++) {
            const y = sy + 1 + i * 2.6;
            const w = p.depth - i * 0.4;
            r.paint(capsule(cx - 2, y, cx + w, y + 1.5, 0.75, 0.65), bone, {
                innerLine: true,
                tag: TAG_BODY,
            });
        }
        r.paint(
            polygon([
                [cx - 3, rig.hipY - 2],
                [cx + 3, rig.hipY - 1.5],
                [cx + 2, rig.hipY + 2],
                [cx - 3.5, rig.hipY + 1.5],
            ]),
            bone,
            { innerLine: true, tag: TAG_BODY },
        );
        paintBelt(ctx);

        return;
    }

    // Clavicles.
    for (const s of [-1, 1]) {
        r.paint(
            capsule(
                cx + s * 1,
                sy,
                cx + s * (p.shoulderHalf - 1.5),
                sy - 0.5,
                0.75,
            ),
            bone,
            { innerLine: true, tag: TAG_BODY },
        );
    }

    // Spine (visible through the ribs and full in back view).
    r.paint(
        capsule(cx, sy, cx, rig.hipY - 1, ctx.view === 'back' ? 1.1 : 0.8),
        bone,
        { innerLine: true, tag: TAG_BODY },
    );
    if (ctx.view === 'back') {
        for (let y = Math.round(sy) + 1; y < rig.hipY - 1; y += 2)
            dot(r, cx, y, bone.line, TAG_BODY);
    }

    // Ribs.
    for (let i = 0; i < 4; i++) {
        const y = sy + 2 + i * 2.7;
        const w = p.chestHalf - 0.5 - i * 0.6;
        for (const s of [-1, 1]) {
            r.paint(
                union(
                    capsule(cx + s * 1, y, cx + s * w, y + 0.6, 0.7),
                    capsule(
                        cx + s * w,
                        y + 0.6,
                        cx + s * (w - 1.8),
                        y + 1.9,
                        0.6,
                    ),
                ),
                bone,
                { innerLine: false, tag: TAG_BODY },
            );
        }
    }

    if (ctx.view === 'front') {
        // Sternum.
        r.paint(capsule(cx, sy + 1.5, cx, sy + 8.5, 0.8), bone, {
            tag: TAG_BODY,
        });
    }

    // Pelvis.
    const hy = rig.hipY;
    const pelvis = polygon(
        sym(cx, [
            [1.5, hy - 3],
            [p.hipHalf, hy - 1.5],
            [p.hipHalf - 0.5, hy + 1],
            [2, hy + 2.5],
        ]),
    );
    r.paint(pelvis, bone, { innerLine: true, tag: TAG_BODY });
    for (const s of [-1, 1]) {
        dot(r, cx + s * 3, hy, bone.line, TAG_BODY);
        dot(r, cx + s * 3, hy + 1, bone.line, TAG_BODY);
    }

    paintBelt(ctx);
}

/* ------------------------------------------------------------------ */
/* Head                                                                */
/* ------------------------------------------------------------------ */

type HeadShape = {
    pixels: LitPixel[];
};

function headShape(ctx: Ctx): HeadShape {
    const { rig, ap } = ctx;
    const { x: hx, y: hy } = rig.head;
    let { rx, ry } = rig.profile.head;
    const lineage = ctx.lineage;

    if (lineage === 'skeleton' && ap.face_style === 'narrow_skull') rx -= 0.7;

    if (ctx.view === 'side') {
        const fx = hx + rx - 0.5;
        const cranium = ellipse(hx - 1, hy - 1, rx, ry - 0.3, 0.05);
        let face: Array<[number, number]>;

        if (lineage === 'ogre') {
            face = [
                [hx - 2, hy - 4],
                [fx, hy - 3],
                [fx + 1, hy - 1],
                [fx + 1.5, hy + 2],
                [fx + 1.5, hy + 6],
                [fx - 1, hy + 7.5],
                [hx - 3, hy + 6],
            ];
        } else if (lineage === 'skeleton') {
            face = [
                [hx - 2, hy - 4],
                [fx, hy - 3],
                [fx + 0.5, hy + 1],
                [fx + 0.5, hy + 4],
                [fx, hy + (ap.jaw_style === 'missing' ? 5.5 : 7)],
                [fx - 3, hy + (ap.jaw_style === 'missing' ? 5 : 7)],
                [hx - 3, hy + 4],
            ];
        } else {
            const chin = lineage === 'elf' ? 6.5 : 6.5;
            face = [
                [hx - 2, hy - 4],
                [fx, hy - 3],
                [fx + 0.5, hy],
                [fx + 1.5, hy + 2.2],
                [fx + 0.5, hy + 3.4],
                [fx + 0.7, hy + 4.6],
                [fx, hy + chin],
                [fx - 2, hy + chin + 0.4],
                [hx - 3, hy + 4.5],
            ];
        }

        return { pixels: union(cranium, polygon(face, 0.1, 0.6)) };
    }

    const cranium = ellipse(hx, hy - 1, rx, ry - 0.3, 0.05);

    if (ctx.view === 'back') {
        // From behind only the skull and nape are visible.
        const nape = polygon(
            sym(hx, [
                [rx - 0.5, hy],
                [rx - 1.5, hy + 4],
                [rx - 3, hy + 5.5],
            ]),
            -0.1,
        );
        return { pixels: union(cranium, nape) };
    }

    let jaw: Array<[number, number]>;

    if (lineage === 'ogre') {
        jaw = sym(hx, [
            [rx - 0.5, hy - 1],
            [rx + 0.8, hy + 2.5],
            [rx + 0.8, hy + 5.5],
            [rx - 1, hy + 7.4],
            [2, hy + 7.8],
        ]);
    } else if (lineage === 'elf') {
        const sharp = ap.face_style === 'angular' ? 0.4 : 1;
        jaw = sym(hx, [
            [rx, hy - 1],
            [rx - 0.3, hy + 3],
            [2 * sharp + 0.6, hy + 6.2],
            [0.8, hy + 7],
        ]);
    } else if (lineage === 'skeleton') {
        const bottom = ap.jaw_style === 'missing' ? hy + 5.4 : hy + 7.5;
        jaw = sym(hx, [
            [rx - 0.5, hy - 1],
            [rx - 1.5, hy + 3],
            [rx - 2.5, hy + 5],
            [3, bottom],
            [1.5, bottom],
        ]);
    } else {
        const square =
            ap.face_style === 'strong'
                ? 1
                : ap.face_style === 'soft'
                  ? -0.4
                  : 0;
        jaw = sym(hx, [
            [rx, hy - 1],
            [rx - 0.1, hy + 3],
            [rx - 1.8 + square, hy + 5.6],
            [1.8 + square * 0.6, hy + 7],
            [0.5, hy + 7.1],
        ]);
    }

    return { pixels: union(cranium, polygon(jaw, 0.1, 0.8)) };
}

export function paintEars(ctx: Ctx, layer: 'behind' | 'front'): void {
    const { r, rig, ap, pal } = ctx;
    const { x: hx, y: hy } = rig.head;
    const rx = rig.profile.head.rx;
    const skin = pal.skin;

    if (ctx.lineage === 'skeleton') return;

    if (ctx.view === 'side') {
        if (layer === 'behind') return;
        const ex = hx - 2;
        if (ctx.lineage === 'elf') {
            const tip =
                ap.ear_style === 'swept'
                    ? [ex - 7, hy - 1]
                    : ap.ear_style === 'high'
                      ? [ex - 3, hy - 8]
                      : [ex - 5, hy - 6];
            r.paint(
                polygon(
                    [
                        [ex + 1, hy - 1],
                        [tip[0], tip[1]],
                        [ex + 1, hy + 3],
                    ],
                    0.1,
                ),
                skin,
                { innerLine: true, tag: TAG_HEAD },
            );
            dot(r, ex - 1, hy + 1, skin.shadow);
        } else {
            const torn = ap.ear_style === 'torn';
            r.paint(
                ellipse(ex, hy + 1, ctx.lineage === 'ogre' ? 1.6 : 1.2, 1.7),
                skin,
                { innerLine: true, tag: TAG_HEAD },
            );
            dot(r, ex, hy + 1, skin.shadow);
            if (torn) r.erase(Math.round(ex - 1), Math.round(hy - 1));
        }

        return;
    }

    // Front/back: ears sit on both sides, drawn behind the head.
    if (layer !== 'behind') return;

    for (const s of [-1, 1]) {
        const ex = hx + s * (rx + 0.3);
        if (ctx.lineage === 'elf') {
            const tip =
                ap.ear_style === 'swept'
                    ? [ex + s * 6.5, hy - 1]
                    : ap.ear_style === 'high'
                      ? [ex + s * 3.5, hy - 7.5]
                      : [ex + s * 5.5, hy - 4.5];
            r.paint(
                polygon(
                    [
                        [ex - s * 1, hy - 0.5],
                        [tip[0], tip[1]],
                        [ex - s * 0.5, hy + 3.5],
                    ],
                    0.15,
                ),
                skin,
                { innerLine: true, tag: TAG_HEAD },
            );
            dot(r, ex + s * 1, hy + 1, skin.shadow);
        } else if (ctx.lineage === 'ogre') {
            r.paint(
                polygon(
                    [
                        [ex - s * 0.8, hy - 0.5],
                        [ex + s * 3.8, hy - 2],
                        [ex + s * 2.4, hy + 1],
                        [ex - s * 0.4, hy + 3.2],
                    ],
                    0.15,
                ),
                skin,
                { innerLine: true, tag: TAG_HEAD },
            );
            dot(r, ex + s * 1, hy + 0.5, skin.shadow);
            if (ap.ear_style === 'torn')
                r.erase(Math.round(ex + s * 3), Math.round(hy - 2));
        } else {
            const size = 1.2;
            r.paint(ellipse(ex + s * 0.5, hy + 1.2, size, 1.8), skin, {
                innerLine: true,
                tag: TAG_HEAD,
            });
            dot(r, ex + s * 0.6, hy + 1.2, skin.shadow);
            if (ap.ear_style === 'torn')
                r.erase(Math.round(ex + s * 1.5), Math.round(hy));
        }
    }
}

export function paintHead(ctx: Ctx): void {
    const { r, pal } = ctx;
    const ramp = ctx.lineage === 'skeleton' ? pal.bone : pal.skin;
    const shape = headShape(ctx);

    paintEars(ctx, 'behind');
    r.paint(shape.pixels, ramp, { tag: TAG_HEAD });

    if (ctx.view !== 'back') {
        if (ctx.lineage === 'skeleton') paintSkullFace(ctx);
        else paintFace(ctx);
    } else if (ctx.lineage === 'skeleton') {
        const { x: hx, y: hy } = ctx.rig.head;
        r.paint(line(hx, hy - 6, hx, hy - 3, -1), pal.bone, { tag: TAG_HEAD });
    }
}

function paintFace(ctx: Ctx): void {
    const { r, rig, ap, pal } = ctx;
    const { x: hx, y: hy } = rig.head;
    const rx = rig.profile.head.rx;
    const skin = pal.skin;
    const brow = mix(pal.hair.shadow, skin.line, 0.35);
    const lid = skin.line;
    const ogre = ctx.lineage === 'ogre';
    const elf = ctx.lineage === 'elf';

    if (ctx.view === 'side') {
        const fx = hx + rx - 0.5;
        const ex = Math.round(fx - 2);
        // Eye.
        dot(r, ex, hy + 1, pal.iris);
        dot(r, ex - 1, hy + 1, ogre ? skin.line : pal.sclera);
        dot(r, ex, hy, lid);
        dot(r, ex - 1, hy, lid);
        // Brow.
        r.fill(
            [
                { x: ex - 1, y: hy - 1 },
                { x: ex, y: hy - 1 },
                { x: ex + 1, y: hy - 1 },
            ],
            ogre ? skin.line : brow,
            TAG_HEAD,
        );
        // Nostril + mouth.
        dot(r, fx + 0.5, hy + 3, skin.shadow);
        dot(r, fx, hy + 5, pal.mouth);
        dot(r, fx - 1, hy + 5, pal.mouth);
        if (ogre && ap.jaw_style === 'tusked') {
            dot(r, fx + 0.5, hy + 4, pal.tusk.light);
            dot(r, fx + 0.5, hy + 3, pal.tusk.base);
        }
        if (ap.face_style === 'scarred') {
            r.fill(
                line(ex - 2, hy - 2, ex + 1, hy + 3),
                mix(skin.light, hex('#e8a0a0'), 0.4),
                TAG_HEAD,
            );
        }

        return;
    }

    // Front.
    const eyeY = hy + 1;
    for (const s of [-1, 1]) {
        const inner = hx + s * 2;
        const outer = hx + s * 3;

        if (elf && ap.face_style === 'serene') {
            dot(r, inner, eyeY, lid);
            dot(r, outer, eyeY, lid);
            dot(r, outer + s, eyeY - 1, lid);
        } else if (ogre) {
            dot(r, inner, eyeY, pal.iris);
            dot(r, outer, eyeY, skin.line);
            dot(r, inner, eyeY - 1, skin.line);
            dot(r, outer, eyeY - 1, skin.line);
        } else {
            dot(r, inner, eyeY, pal.iris);
            dot(r, outer, eyeY, pal.sclera);
            dot(r, inner, eyeY - 1, lid);
            dot(r, outer, eyeY - 1, lid);
            if (elf) dot(r, outer + s, eyeY - 1, lid);
            // Lower iris pixel gives the eye height at this scale.
            dot(r, inner, eyeY + 1, mix(pal.iris, skin.base, 0.55));
        }

        // Brows.
        const browY = ogre ? hy - 1 : hy - 1;
        const strong =
            ap.face_style === 'strong' || ap.face_style === 'angular' || ogre;
        if (ogre) {
            r.fill(
                line(hx + s * 1, browY, hx + s * 5, browY),
                skin.line,
                TAG_HEAD,
            );
            r.fill(
                line(hx + s * 1, browY - 1, hx + s * 4, browY - 1),
                skin.light,
                TAG_HEAD,
            );
            if (ap.face_style === 'elder')
                r.fill(
                    line(hx + s * 2, browY, hx + s * 4, browY),
                    hex('#d8d8d0'),
                    TAG_HEAD,
                );
        } else if (ap.face_style !== 'serene') {
            dot(r, inner, browY - (strong ? 0 : 1), brow);
            dot(r, outer, browY - 1, brow);
            if (strong || ap.face_style === 'balanced')
                dot(r, outer + s, browY - 1, brow);
        }

        if (ap.face_style === 'soft' || ap.face_style === 'serene') {
            dot(r, hx + s * 4, hy + 3, mix(skin.base, hex('#e0707a'), 0.35));
        }
    }

    // Nose.
    if (ogre) {
        dot(r, hx - 1, hy + 3, skin.line);
        dot(r, hx + 1, hy + 3, skin.line);
        dot(r, hx, hy + 2, skin.light);
        dot(r, hx, hy + 3, skin.base);
    } else {
        dot(r, hx + 1, hy + 3, skin.shadow);
        dot(r, hx, hy + 2, skin.light);
    }

    // Mouth.
    const my = hy + 5;
    if (ogre) {
        r.fill(line(hx - 3, my, hx + 3, my), pal.mouth, TAG_HEAD);
        if (ap.jaw_style === 'tusked') {
            for (const s of [-1, 1]) {
                dot(r, hx + s * 3, my - 1, pal.tusk.base);
                dot(r, hx + s * 3, my - 2, pal.tusk.light);
                dot(r, hx + s * 3, my, pal.tusk.shadow);
            }
        } else {
            dot(r, hx - 2, my - 1, pal.tusk.light);
            dot(r, hx + 2, my - 1, pal.tusk.light);
        }
        // Heavy chin shadow.
        r.fill(line(hx - 2, my + 2, hx + 2, my + 2), skin.shadow, TAG_HEAD);
    } else if (ap.face_style === 'soft' || ap.face_style === 'serene') {
        dot(r, hx - 1, my, pal.mouth);
        dot(r, hx, my, pal.mouth);
        dot(r, hx + 1, my, pal.mouth);
        dot(r, hx - 2, my - 1, mix(pal.mouth, skin.base, 0.4));
        dot(r, hx + 2, my - 1, mix(pal.mouth, skin.base, 0.4));
    } else {
        dot(r, hx - 1, my, pal.mouth);
        dot(r, hx, my, pal.mouth);
        dot(
            r,
            hx + 1,
            my,
            ap.face_style === 'strong'
                ? pal.mouth
                : mix(pal.mouth, skin.base, 0.5),
        );
        if (ap.face_style === 'strong') dot(r, hx, my + 1, skin.shadow);
    }

    if (ap.face_style === 'scarred') {
        r.fill(
            line(hx + 2, hy - 2, hx + 4, hy + 3),
            mix(skin.light, hex('#e8a0a0'), 0.45),
            TAG_HEAD,
        );
    }

    if (ap.face_style === 'elder' && ogre) {
        // Short grey beard tuft.
        r.paint(
            polygon(
                sym(hx, [
                    [2.5, my + 1],
                    [1.5, my + 3.5],
                    [0.4, my + 4],
                ]),
            ),
            rampOf(hex('#9a9a92')),
            { innerLine: true, tag: TAG_HEAD },
        );
    }
}

function rampOf(c: Rgba): Ramp {
    return {
        line: mix(c, hex('#120e1a'), 0.65),
        shadow: mix(c, hex('#120e1a'), 0.3),
        base: c,
        light: mix(c, hex('#ffffff'), 0.35),
    };
}

function paintSkullFace(ctx: Ctx): void {
    const { r, rig, ap, pal } = ctx;
    const { x: hx, y: hy } = rig.head;
    const rx = rig.profile.head.rx;
    const bone = pal.bone;
    const ink = pal.ink;
    const glow = pal.glow ?? hex('#71c8ff');
    const missing = ap.jaw_style === 'missing';

    if (ctx.view === 'side') {
        const fx = Math.round(hx + rx - 1);
        r.fill(
            [
                { x: fx - 2, y: hy },
                { x: fx - 1, y: hy },
                { x: fx - 2, y: hy + 1 },
                { x: fx - 1, y: hy + 1 },
                { x: fx - 2, y: hy + 2 },
            ],
            ink,
            TAG_HEAD,
        );
        dot(r, fx - 1, hy + 1, glow);
        dot(r, fx, hy + 3, ink);
        for (let x = fx - 2; x <= fx; x++)
            dot(r, x, hy + 5, x % 2 === 0 ? bone.light : bone.shadow);
        if (!missing) {
            r.fill(line(fx - 3, hy + 6, fx, hy + 6), ink, TAG_HEAD);
            dot(r, fx - 3, hy + 3, bone.shadow);
        }
        if (ap.jaw_style === 'cracked')
            r.fill(line(fx - 4, hy + 6, fx - 3, hy + 7), ink, TAG_HEAD);

        return;
    }

    // Cheekbone shading.
    for (const s of [-1, 1]) {
        dot(r, hx + s * (rx - 1), hy + 3, bone.shadow);
    }

    // Eye sockets.
    for (const s of [-1, 1]) {
        const a = hx + s * 2;
        const b = hx + s * 4;
        const lo = Math.min(a, b);
        for (let x = lo; x <= lo + 2; x++) {
            for (let y = hy; y <= hy + 2; y++) {
                const corner =
                    (x === lo || x === lo + 2) && (y === hy || y === hy + 2);
                if (!corner || y === hy + 1) dot(r, x, y, ink);
            }
        }
        dot(r, hx + s * 3, hy + 1, glow);
        dot(r, hx + s * 3, hy, mix(glow, ink, 0.55));
    }

    // Nasal cavity.
    dot(r, hx, hy + 3, ink);
    dot(r, hx, hy + 4, bone.line);

    // Teeth.
    const ty = hy + 5;
    for (let x = hx - 2; x <= hx + 2; x++) {
        dot(r, x, ty, (x - hx) % 2 === 0 ? bone.light : bone.base);
    }
    dot(r, hx - 3, ty, bone.line);
    dot(r, hx + 3, ty, bone.line);

    if (!missing) {
        r.fill(line(hx - 2, ty + 1, hx + 2, ty + 1), ink, TAG_HEAD);
        for (let x = hx - 2; x <= hx + 2; x++)
            dot(r, x, ty + 2, (x - hx) % 2 === 0 ? bone.base : bone.light);
    }

    if (ap.jaw_style === 'cracked') {
        r.fill(
            [
                { x: hx + 2, y: ty + 2 },
                { x: hx + 3, y: ty + 3 },
            ],
            ink,
            TAG_HEAD,
        );
    }

    if (ap.face_style === 'ancient_skull') {
        r.fill(line(hx - 3, hy - 6, hx - 1, hy - 3), bone.line, TAG_HEAD);
        r.fill([{ x: hx - 1, y: hy - 2 }], bone.line, TAG_HEAD);
        dot(r, hx + 3, hy - 4, bone.shadow);
        dot(r, hx + 4, hy - 3, bone.shadow);
    }
}

/* ------------------------------------------------------------------ */
/* Hair & horns                                                        */
/* ------------------------------------------------------------------ */

export function paintHair(ctx: Ctx, layer: 'back' | 'front'): void {
    const { r, rig, ap, pal } = ctx;
    const style = ap.hair_style;

    if (style === 'none') return;
    if (ctx.hooded && !(style === 'braid' && layer === 'back')) return;

    const { x: hx, y: hy } = rig.head;
    const { rx, ry } = rig.profile.head;
    const hair = pal.hair;
    const opts = {
        innerLine: true,
        tag: TAG_HAIR,
        thresholds: [-0.25, 0.35, 0.78] as [number, number, number],
    };

    if (ctx.view === 'front') {
        if (layer === 'back') {
            if (style === 'braid') {
                const pts: LitPixel[][] = [];
                for (let i = 0; i < 6; i++) {
                    pts.push(
                        ellipse(
                            hx + rx + 0.5 + i * 0.25,
                            hy + 3 + i * 2.4,
                            1.6,
                            1.4,
                            0.1,
                        ),
                    );
                }
                r.paint(union(...pts), hair, opts);
                dot(r, hx + rx + 2, hy + 18, pal.leather.base, TAG_HAIR);
            }
            if (style === 'wild') {
                // Volume behind the head.
                r.paint(ellipse(hx, hy, rx + 2, ry + 0.5), hair, {
                    ...opts,
                    far: true,
                });
            }
            if (style === 'short') {
                r.paint(
                    ellipse(hx, hy - 1, rx + 1, ry - 0.5).filter(
                        (p) => p.y <= hy + 1,
                    ),
                    hair,
                    { ...opts, far: true },
                );
            }
            return;
        }

        if (style === 'short') {
            const cap = ellipse(hx, hy - 2.6, rx + 1.4, ry + 0.4).filter(
                (p) => p.y <= hy - 2,
            );
            // Swept bangs with three tips, authored around the face centre.
            const bangs = polygon(
                [
                    [hx - rx - 1.2, hy - 4],
                    [hx + rx + 1.2, hy - 4],
                    [hx + rx + 0.8, hy + 0.5],
                    [hx + rx - 0.6, hy - 2],
                    [hx + 3, hy - 2.6],
                    [hx + 1.5, hy - 1],
                    [hx + 0.2, hy - 2.8],
                    [hx - 2.2, hy - 0.6],
                    [hx - 3.4, hy - 2.6],
                    [hx - rx + 0.4, hy - 2],
                    [hx - rx - 0.8, hy + 0.5],
                ],
                0.15,
            );
            r.paint(union(cap, bangs), hair, opts);
            // Shine streak.
            dot(r, hx - 3, hy - 5, hair.shine ?? hair.light, TAG_HAIR);
            dot(r, hx - 2, hy - 6, hair.shine ?? hair.light, TAG_HAIR);
            dot(r, hx - 1, hy - 6, hair.light, TAG_HAIR);
        } else if (style === 'wild') {
            const spikes: Array<[number, number]> = [];
            const n = 13;
            for (let i = 0; i <= n; i++) {
                const t = Math.PI + (i / n) * Math.PI;
                const rad = i % 2 === 0 ? 1.45 : 1.05;
                spikes.push([
                    hx + Math.cos(t) * (rx + 0.5) * rad,
                    hy - 1.5 + Math.sin(t) * (ry - 0.5) * rad,
                ]);
            }
            spikes.push(
                [hx + rx + 2, hy + 2],
                [hx + rx - 0.5, hy - 1],
                [hx + 2, hy - 2],
                [hx, hy - 0.5],
                [hx - 2, hy - 2],
                [hx - rx + 0.5, hy - 1],
                [hx - rx - 2, hy + 2],
            );
            r.paint(polygon(spikes, 0.1, 0.9), hair, opts);
            dot(r, hx - 2, hy - 6, hair.shine ?? hair.light, TAG_HAIR);
        } else if (style === 'braid') {
            const cap = ellipse(hx, hy - 2, rx + 1, ry - 0.5).filter(
                (p) => p.y <= hy - 2,
            );
            const locks = [
                ...capsule(hx - rx, hy - 3, hx - rx - 0.3, hy + 3, 1.2, 1),
                ...capsule(hx + rx, hy - 3, hx + rx + 0.3, hy + 3, 1.2, 1),
            ];
            const sweep = polygon(
                [
                    [hx - rx - 0.5, hy - 3],
                    [hx + 1, hy - 4],
                    [hx - 1, hy - 1.5],
                    [hx - rx + 1, hy - 0.5],
                ],
                0.2,
            );
            r.paint(union(cap, locks, sweep), hair, opts);
            r.fill(line(hx + 1, hy - 7, hx + 1, hy - 4), hair.shadow, TAG_HAIR);
            dot(r, hx - 3, hy - 6, hair.shine ?? hair.light, TAG_HAIR);
        } else if (style === 'crest') {
            const crest = polygon(
                sym(hx, [
                    [1, hy - ry - 4],
                    [2.2, hy - ry - 1],
                    [2.2, hy - 2],
                    [1.2, hy - 1.5],
                ]),
                0.15,
            );
            r.paint(crest, hair, opts);
            dot(r, hx - 1, hy - ry - 2, hair.shine ?? hair.light, TAG_HAIR);
        }

        return;
    }

    if (ctx.view === 'back') {
        if (layer === 'back') return;

        if (style === 'short') {
            const cap = ellipse(hx, hy - 1.6, rx + 1.4, ry + 0.8).filter(
                (p) => p.y <= hy + 3,
            );
            const nape: LitPixel[] = [];
            for (let x = Math.round(hx - rx + 1); x <= hx + rx - 1; x++) {
                if ((x - hx) % 2 === 0) nape.push({ x, y: hy + 4, l: -0.3 });
            }
            r.paint(union(cap, nape), hair, opts);
            r.fill(line(hx - 1, hy - 5, hx + 1, hy - 1), hair.shadow, TAG_HAIR);
        } else if (style === 'wild') {
            const spikes: Array<[number, number]> = [];
            const n = 18;
            for (let i = 0; i <= n; i++) {
                const t = Math.PI * 0.85 + (i / n) * Math.PI * 1.3;
                const rad = i % 2 === 0 ? 1.4 : 1.05;
                spikes.push([
                    hx + Math.cos(t) * (rx + 0.5) * rad,
                    hy + Math.sin(t) * (ry + 0.5) * rad,
                ]);
            }
            spikes.push([hx + 3, hy + 6], [hx, hy + 5], [hx - 3, hy + 6]);
            r.paint(polygon(spikes, 0.05, 0.9), hair, opts);
        } else if (style === 'braid') {
            const cap = ellipse(hx, hy - 1, rx + 1, ry).filter(
                (p) => p.y <= hy + 3,
            );
            r.paint(cap, hair, opts);
            const pts: LitPixel[][] = [];
            for (let i = 0; i < 7; i++)
                pts.push(ellipse(hx, hy + 4 + i * 2.4, 1.6, 1.4, 0.1));
            r.paint(union(...pts), hair, opts);
            for (let i = 0; i < 7; i++)
                dot(
                    r,
                    hx + (i % 2 === 0 ? -1 : 1),
                    hy + 5 + i * 2.4,
                    hair.shadow,
                    TAG_HAIR,
                );
            dot(r, hx, hy + 21, pal.leather.base, TAG_HAIR);
        } else if (style === 'crest') {
            r.paint(
                polygon(
                    sym(hx, [
                        [1, hy - ry - 4],
                        [2.2, hy - ry - 1],
                        [2.2, hy + 3],
                        [1.2, hy + 5],
                    ]),
                    0.1,
                ),
                hair,
                opts,
            );
        }

        return;
    }

    // Side view (facing right): hair covers the top and back of the skull.
    if (layer === 'back') {
        if (style === 'braid') {
            const pts: LitPixel[][] = [];
            for (let i = 0; i < 6; i++)
                pts.push(
                    ellipse(
                        hx - rx - 0.5 - i * 0.4,
                        hy + 3 + i * 2.4,
                        1.5,
                        1.4,
                        0.1,
                    ),
                );
            r.paint(union(...pts), hair, opts);
        }
        return;
    }

    const hairline = hx + rx - 2.5;

    if (style === 'short') {
        const cap = ellipse(hx - 1, hy - 1.5, rx + 1, ry - 0.2).filter(
            (p) => p.y <= hy - 2 || p.x <= hx - 1,
        );
        const shaped = cap
            .filter((p) => p.x <= hairline || p.y <= hy - 3)
            .filter((p) => p.y <= hy + 3);
        r.paint(
            union(
                shaped,
                line(hairline + 1, hy - 3, hairline + 2, hy - 2, 0.2),
            ),
            hair,
            opts,
        );
        dot(r, hx - 1, hy - 6, hair.shine ?? hair.light, TAG_HAIR);
    } else if (style === 'wild') {
        const spikes: Array<[number, number]> = [];
        const n = 14;
        for (let i = 0; i <= n; i++) {
            const t = Math.PI * 0.55 + (i / n) * Math.PI * 1.35;
            const rad = i % 2 === 0 ? 1.45 : 1.05;
            spikes.push([
                hx - 1 + Math.cos(t) * (rx + 0.5) * rad,
                hy - 1 + Math.sin(t) * (ry - 0.2) * rad,
            ]);
        }
        spikes.push(
            [hairline + 3, hy - 1],
            [hairline, hy - 2],
            [hx - 1, hy - 1],
            [hx - 2, hy + 3],
        );
        r.paint(polygon(spikes, 0.05, 0.9), hair, opts);
    } else if (style === 'braid') {
        const cap = ellipse(hx - 1, hy - 1.5, rx + 1, ry - 0.2).filter(
            (p) =>
                (p.y <= hy - 2 || p.x <= hx - 2) &&
                p.y <= hy + 3 &&
                (p.x <= hairline || p.y <= hy - 3),
        );
        r.paint(cap, hair, opts);
        r.fill(line(hx - 2, hy - 5, hx - 4, hy - 1), hair.shadow, TAG_HAIR);
    } else if (style === 'crest') {
        // Fin along the skull midline, from nape to hairline.
        const pts: Array<[number, number]> = [];
        const cx = hx - 1;
        const cy = hy - 1;
        for (let i = 0; i <= 10; i++) {
            const t = Math.PI * (1.05 + i * 0.065);
            const rad = ry + (i % 2 === 0 ? 3.2 : 2.2);
            pts.push([cx + Math.cos(t) * rad, cy + Math.sin(t) * rad]);
        }
        for (let i = 10; i >= 0; i--) {
            const t = Math.PI * (1.05 + i * 0.065);
            pts.push([
                cx + Math.cos(t) * (ry - 0.8),
                cy + Math.sin(t) * (ry - 0.8),
            ]);
        }
        r.paint(polygon(pts, 0.15), hair, opts);
    }
}

export function paintHorns(ctx: Ctx): void {
    const { r, rig, ap, pal } = ctx;
    if (ctx.lineage !== 'ogre' || ap.horn_style === 'none') return;
    const { x: hx, y: hy } = rig.head;
    const rx = rig.profile.head.rx;
    const opts = { innerLine: true, tag: TAG_HEAD };

    const sides = ctx.view === 'side' ? [-1] : [-1, 1];

    for (const s of sides) {
        const bx = ctx.view === 'side' ? hx - 1 : hx + s * (rx - 2);
        const by = hy - 5;

        if (ap.horn_style === 'short') {
            r.paint(
                polygon(
                    [
                        [bx - 1.5, by + 1],
                        [bx + s * 1.5 + (ctx.view === 'side' ? 0 : 0), by - 4],
                        [bx + 1.5, by + 1],
                    ],
                    0.2,
                ),
                pal.horn,
                opts,
            );
        } else {
            const dir = ctx.view === 'side' ? -1 : s;
            r.paint(
                union(
                    capsule(bx, by + 1, bx + dir * 3, by - 3, 1.5, 1.1),
                    capsule(
                        bx + dir * 3,
                        by - 3,
                        bx + dir * 6,
                        by - 2,
                        1.1,
                        0.6,
                    ),
                ),
                pal.horn,
                opts,
            );
        }
    }
}
