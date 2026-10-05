/**
 * RuneDay Sprite Forge — equipment.
 *
 * Every item is fitted to the shared rig, so one item definition works on
 * Human, Elf, Skeleton and Ogre/Orc bodies (Broad, Lean and Heavy frames).
 */

import { equipmentMaterial } from '@/game/character-style';
import { handPoint, sym, torsoOutline, type Ctx } from './anatomy';
import { ramp } from './palette';
import {
    capsule,
    ellipse,
    hex,
    line,
    mix,
    polygon,
    rgba,
    union,
    type LitPixel,
    type Ramp,
    type Rgba,
} from './raster';
import type { Limb } from './rig';

export type GearPhase =
    | 'behind' // before the body (capes in front view, sheathed gear)
    | 'legs' // after legs (greaves)
    | 'feet' // boots
    | 'torso' // chest armour, tunics
    | 'neck' // pendants, clasps
    | 'shoulders' // pauldrons (after arms)
    | 'headBehind' // hood volume behind the head
    | 'head' // helmets, circlets, hood rims (after hair)
    | 'over' // capes in back view
    | 'glow'; // emissive pixels, painted after the outline

export type GearDef = {
    slot: string;
    covers?: { head?: boolean; chest?: boolean; feet?: boolean };
    sleeve?: () => Ramp;
    paint: Partial<Record<GearPhase, (ctx: Ctx) => void>>;
};

const TAG_GEAR = 4;
const TAG_GLOW = 9;

const gold = () => ramp('gold', true);

function glowDot(ctx: Ctx, x: number, y: number, c: Rgba, alpha = 255): void {
    const [r, g, b] = [(c >>> 16) & 255, (c >>> 8) & 255, c & 255];
    ctx.r.set(Math.round(x), Math.round(y), rgba(r, g, b, alpha), TAG_GLOW);
}

/* ------------------------------------------------------------------ */
/* Chest                                                               */
/* ------------------------------------------------------------------ */

type PlateOptions = {
    metal: Ramp;
    trim?: Ramp;
    ridge?: boolean;
    emblem?: 'diamond' | 'sun' | 'rune' | 'scales';
    emblemColor?: Rgba;
    tassets?: number;
    collar?: boolean;
};

function plate(ctx: Ctx, o: PlateOptions): void {
    const { r, rig } = ctx;
    const p = rig.profile;
    const cx = rig.centre + (rig.neck.x - rig.centre);
    const outline = torsoOutline(ctx, 0.7).map(
        ([x, y]) => [x, Math.min(y, rig.waistY + 1.5)] as [number, number],
    );
    const body = polygon(outline, 0.15);
    r.paint(body, o.metal, {
        innerLine: true,
        tag: TAG_GEAR,
        thresholds: [-0.25, 0.3, 0.75],
    });

    const sy = rig.shoulderY;
    const front = ctx.view === 'front';
    const side = ctx.view === 'side';

    if (o.trim) {
        // Neckline and waist trim.
        if (!side) {
            r.paint(line(cx - 3, sy - 1, cx + 3, sy - 1, 0.5), o.trim, {
                tag: TAG_GEAR,
            });
            r.paint(
                line(
                    cx - p.waistHalf - 1,
                    rig.waistY + 1,
                    cx + p.waistHalf + 1,
                    rig.waistY + 1,
                    0.2,
                ),
                o.trim,
                { tag: TAG_GEAR },
            );
        } else {
            r.paint(
                line(
                    cx - p.depth,
                    rig.waistY + 1,
                    cx + p.depth,
                    rig.waistY + 1,
                    0.2,
                ),
                o.trim,
                { tag: TAG_GEAR },
            );
        }
    }

    if (o.collar && !side) {
        r.paint(
            polygon(
                sym(cx, [
                    [4.5, sy - 2.5],
                    [4, sy],
                    [1.5, sy + 1],
                ]),
                0.3,
            ),
            o.trim ?? o.metal,
            { innerLine: true, tag: TAG_GEAR },
        );
    }

    if (front && o.ridge) {
        r.paint(line(cx, sy + 1, cx, rig.waistY - 1, 0.95), o.metal, {
            tag: TAG_GEAR,
        });
        r.paint(line(cx + 1, sy + 1, cx + 1, rig.waistY - 1, -0.6), o.metal, {
            tag: TAG_GEAR,
        });
    }

    if (front && o.emblem) {
        const ey = sy + 5;
        const c = o.emblemColor ?? (o.trim ?? gold()).light;
        if (o.emblem === 'diamond') {
            ctx.r.fill(
                [
                    { x: cx, y: ey - 1 },
                    { x: cx - 1, y: ey },
                    { x: cx + 1, y: ey },
                    { x: cx, y: ey + 1 },
                ],
                c,
                TAG_GEAR,
            );
            ctx.r.set(cx, ey, mix(c, hex('#ffffff'), 0.4), TAG_GEAR);
        } else if (o.emblem === 'sun') {
            ctx.r.fill(
                [
                    { x: cx, y: ey - 2 },
                    { x: cx - 2, y: ey },
                    { x: cx + 2, y: ey },
                    { x: cx, y: ey + 2 },
                    { x: cx, y: ey },
                    { x: cx - 1, y: ey - 1 },
                    { x: cx + 1, y: ey + 1 },
                    { x: cx + 1, y: ey - 1 },
                    { x: cx - 1, y: ey + 1 },
                ],
                c,
                TAG_GEAR,
            );
        } else if (o.emblem === 'scales') {
            // Overlapping scale rows: a dark lower rim under each scale.
            const top = Math.round(sy + 3);
            for (let row = 0; top + row * 3 < rig.waistY - 1; row++) {
                const y = top + row * 3;
                const shift = row % 2 === 0 ? 0 : 1.5;
                for (
                    let dx = -p.chestHalf + 2 + shift;
                    dx < p.chestHalf - 1;
                    dx += 3
                ) {
                    const x = Math.round(cx + dx);
                    if (ctx.r.tag(x, y) !== TAG_GEAR) continue;
                    ctx.r.set(x, y + 1, o.metal.shadow, TAG_GEAR);
                    ctx.r.set(x + 1, y + 1, o.metal.shadow, TAG_GEAR);
                    ctx.r.set(x, y, o.metal.light, TAG_GEAR);
                }
            }
        }
    }

    if (o.tassets) {
        const top = rig.waistY + 2;
        const n = o.tassets;
        const width = side ? p.depth * 2 : p.hipHalf * 2 + 2;
        const left = side ? cx - p.depth : cx - p.hipHalf - 1;
        const w = width / n;
        for (let i = 0; i < n; i++) {
            const x0 = left + i * w;
            const tasset = polygon(
                [
                    [x0 + 0.2, top],
                    [x0 + w - 0.2, top],
                    [x0 + w - 0.4, top + 4.5],
                    [x0 + 0.4, top + 4.5],
                ],
                0.1,
            );
            r.paint(tasset, o.metal, { innerLine: true, tag: TAG_GEAR });
            if (o.trim)
                r.paint(
                    line(x0 + 0.5, top + 4, x0 + w - 0.6, top + 4, 0.4),
                    o.trim,
                    { tag: TAG_GEAR },
                );
        }
    }
}

function tunic(ctx: Ctx, cloth: Ramp, skirt: number, trim?: Ramp): void {
    const { r, rig } = ctx;
    const p = rig.profile;
    const outline = torsoOutline(ctx, 0.5);
    const cx = rig.centre;
    const bottom = rig.hipY + skirt;
    const extended = outline.map(([x, y]) => {
        if (y > rig.waistY + 1) {
            const dir = x < cx ? -1 : 1;
            return [x + dir * 0.8, bottom] as [number, number];
        }
        return [x, y] as [number, number];
    });
    r.paint(polygon(extended, 0.1), cloth, { innerLine: true, tag: TAG_GEAR });

    if (ctx.view === 'front') {
        const sy = rig.shoulderY;
        r.paint(
            polygon(
                sym(rig.neck.x, [
                    [1.8, sy - 1.5],
                    [0.3, sy + 3],
                ]),
            ),
            ctx.pal.skin,
            { tag: TAG_GEAR },
        );
        // Hem folds.
        for (const s of [-1, 1]) {
            r.paint(
                line(
                    cx + s * 2,
                    rig.waistY + 3,
                    cx + s * 2.5,
                    bottom - 0.5,
                    -0.8,
                ),
                cloth,
                { tag: TAG_GEAR },
            );
        }
        r.paint(line(cx, rig.hipY + 1, cx, bottom - 0.5, -0.8), cloth, {
            tag: TAG_GEAR,
        });
    }

    if (trim) {
        const half = ctx.view === 'side' ? p.depth + 1 : p.hipHalf + 1.6;
        r.paint(line(cx - half, bottom, cx + half, bottom, 0.3), trim, {
            tag: TAG_GEAR,
        });
    }
}

function belt(ctx: Ctx): void {
    const { r, rig } = ctx;
    const p = rig.profile;
    const cx = rig.centre;
    const y = rig.waistY + 1;
    const half = ctx.view === 'side' ? p.depth + 0.8 : p.waistHalf + 1.3;
    r.paint(
        polygon([
            [cx - half, y - 0.6],
            [cx + half, y - 0.6],
            [cx + half + 0.2, y + 1.4],
            [cx - half - 0.2, y + 1.4],
        ]),
        ctx.pal.leather,
        { innerLine: true, flat: true, tag: TAG_GEAR },
    );
    if (ctx.view === 'front') {
        r.set(cx, y, hex('#d0a64f'), TAG_GEAR);
        r.set(cx, y + 1, hex('#8b662d'), TAG_GEAR);
    }
}

function vest(ctx: Ctx, material: Ramp): void {
    const { r, rig } = ctx;
    const cx = rig.centre + (rig.neck.x - rig.centre);
    // Shirt underneath.
    r.paint(polygon(torsoOutline(ctx, 0.3)), ctx.pal.cloth, {
        innerLine: true,
        tag: TAG_GEAR,
    });
    const vestPx = polygon(torsoOutline(ctx, 0.7), 0.1).filter(
        (px) =>
            ctx.view !== 'front' ||
            Math.abs(px.x - cx) >= 2 ||
            px.y > rig.waistY,
    );
    r.paint(vestPx, material, { innerLine: true, tag: TAG_GEAR });
    if (ctx.view === 'front') {
        for (const s of [-1, 1]) {
            r.set(
                cx + s * 3,
                rig.shoulderY + 6,
                ctx.pal.leather.light,
                TAG_GEAR,
            );
        }
    }
    belt(ctx);
}

/* ------------------------------------------------------------------ */
/* Shoulders, greaves, boots                                           */
/* ------------------------------------------------------------------ */

type PauldronOptions = {
    size: number;
    trim?: boolean;
    layers?: number;
    spike?: boolean;
    wing?: boolean;
};

function pauldrons(ctx: Ctx, o: PauldronOptions): void {
    const { r, rig } = ctx;
    const metal = ramp('iron', true);
    const trim = gold();
    const arms: Array<[Limb, number]> =
        ctx.view === 'side'
            ? [[rig.armB, 1]]
            : [
                  [rig.armA, -1],
                  [rig.armB, 1],
              ];
    const heavy = rig.profile.frame === 'heavy' ? 1.3 : 1;

    for (const [arm, s] of arms) {
        const sx = arm.root.x + (ctx.view === 'side' ? 0 : s * 0.5);
        const sy = arm.root.y - 0.8;
        const rx = (2.6 + o.size * 0.6) * heavy;
        const ry = (2.1 + o.size * 0.4) * heavy;
        const shell = ellipse(sx, sy, rx, ry, 0.1).filter(
            (p) => p.y <= sy + ry * 0.55,
        );
        r.paint(shell, metal, {
            innerLine: true,
            tag: TAG_GEAR,
            thresholds: [-0.25, 0.3, 0.72],
        });

        for (let i = 1; i < (o.layers ?? 1); i++) {
            const ly = sy + ry * 0.5 + i * 1.6;
            const lame = ellipse(
                sx + s * 0.4,
                ly,
                rx - i * 0.5,
                1.4,
                0.05,
            ).filter((p) => p.y >= ly - 0.5);
            r.paint(lame, metal, { innerLine: true, tag: TAG_GEAR });
            if (o.trim)
                r.paint(
                    line(sx - rx + i + 1, ly + 1, sx + rx - i - 1, ly + 1, 0.4),
                    trim,
                    { tag: TAG_GEAR },
                );
        }

        if (o.trim) {
            const rim = ellipse(sx, sy, rx, ry).filter(
                (p) => p.y <= sy + ry * 0.55 && p.y >= sy + ry * 0.55 - 1,
            );
            r.paint(rim, trim, { tag: TAG_GEAR });
        }

        if (o.spike) {
            r.paint(
                polygon(
                    [
                        [sx - 1, sy - ry + 0.5],
                        [sx + s * 1.5, sy - ry - 3.5],
                        [sx + 1, sy - ry + 0.5],
                    ],
                    0.4,
                ),
                o.trim ? trim : metal,
                { innerLine: true, tag: TAG_GEAR },
            );
        }

        if (o.wing) {
            r.paint(
                polygon(
                    [
                        [sx - s * 1, sy - ry + 1],
                        [sx + s * (rx + 1), sy - ry - 2.5],
                        [sx + s * rx, sy],
                    ],
                    0.3,
                ),
                trim,
                { innerLine: true, tag: TAG_GEAR },
            );
        }
    }
}

function greaves(
    ctx: Ctx,
    o: { trim?: boolean; cuisses?: boolean; spike?: boolean },
): void {
    const { r, rig } = ctx;
    const metal = ramp('iron', true);
    const trim = gold();
    const legs: Array<[Limb, boolean]> = [
        [rig.legA, ctx.view === 'side'],
        [rig.legB, false],
    ];
    const [r0, r1] = rig.profile.legRadius;

    for (const [leg, far] of legs) {
        const shin = capsule(
            leg.joint.x,
            leg.joint.y + 1,
            leg.end.x,
            leg.end.y - 1.5,
            (r0 + r1) / 2 + 0.7,
            r1 + 0.7,
            0.1,
        );
        r.paint(shin, metal, {
            far,
            innerLine: true,
            tag: TAG_GEAR,
            thresholds: [-0.25, 0.3, 0.72],
        });
        if (o.cuisses) {
            const thigh = capsule(
                leg.root.x,
                leg.root.y + 1.5,
                leg.joint.x,
                leg.joint.y - 1,
                r0 + 0.6,
                (r0 + r1) / 2 + 0.6,
                0.1,
            );
            r.paint(thigh, metal, { far, innerLine: true, tag: TAG_GEAR });
        }
        r.paint(
            ellipse(leg.joint.x, leg.joint.y, r0 * 0.75 + 0.6, 1.5, 0.2),
            o.trim ? trim : metal,
            { far, innerLine: true, tag: TAG_GEAR },
        );
        if (o.spike) {
            r.set(
                Math.round(leg.joint.x),
                Math.round(leg.joint.y - 2),
                trim.light,
                TAG_GEAR,
            );
        }
        if (o.trim) {
            r.paint(
                line(
                    leg.end.x - r1 - 0.5,
                    leg.end.y - 2,
                    leg.end.x + r1 + 0.5,
                    leg.end.y - 2,
                    0.3,
                ),
                trim,
                { far, tag: TAG_GEAR },
            );
        }
    }
}

function boots(
    ctx: Ctx,
    material: Ramp,
    o: { cuff?: Ramp; glow?: Rgba } = {},
): void {
    const { r, rig } = ctx;
    const p = rig.profile;
    const legs: Array<[Limb, boolean, number]> = [
        [rig.legA, ctx.view === 'side', -1],
        [rig.legB, false, 1],
    ];

    for (const [leg, far, s] of legs) {
        const top = leg.joint.y + (leg.end.y - leg.joint.y) * 0.35;
        const tx = leg.joint.x + (leg.end.x - leg.joint.x) * 0.35;
        const r1 = p.legRadius[1] + 0.6;
        const shaft = capsule(tx, top, leg.end.x, leg.end.y - 1, r1, r1, 0.05);
        const { x, y } = leg.end;
        const foot =
            ctx.view === 'side'
                ? polygon([
                      [x - 2, y - 2],
                      [x + 1, y - 2],
                      [x + p.footLength + 0.8, y],
                      [x + p.footLength + 0.8, y + 1.5],
                      [x - 2, y + 1.5],
                  ])
                : ellipse(x + s * 0.5, y + 0.4, p.footLength / 2 + 0.8, 1.5);
        r.paint(union(shaft, foot), material, {
            far,
            innerLine: true,
            tag: TAG_GEAR,
        });
        // Sole.
        r.paint(
            ctx.view === 'side'
                ? line(x - 2, y + 1.5, x + p.footLength + 0.5, y + 1.5, -1)
                : line(
                      x + s * 0.5 - p.footLength / 2 - 0.5,
                      y + 1.6,
                      x + s * 0.5 + p.footLength / 2 + 0.5,
                      y + 1.6,
                      -1,
                  ),
            material,
            { far, tag: TAG_GEAR },
        );
        if (o.cuff) {
            r.paint(capsule(tx, top, tx, top + 1, r1 + 0.3), o.cuff, {
                far,
                innerLine: true,
                flat: true,
                tag: TAG_GEAR,
            });
        }
    }
}

/* ------------------------------------------------------------------ */
/* Back items                                                          */
/* ------------------------------------------------------------------ */

type CapeOptions = {
    cloth: Ramp;
    lining?: Ramp;
    stars?: boolean;
    flame?: boolean;
};

function capeShape(ctx: Ctx, front: boolean): Array<[number, number]> {
    const { rig } = ctx;
    const p = rig.profile;
    const cx = rig.centre + (rig.neck.x - rig.centre);
    const sy = rig.shoulderY - 1;
    const bottom = Math.min(55, rig.hipY + 14);
    const flutter = rig.fx === 'none' ? 0 : 1;

    if (ctx.view === 'side') {
        const back = cx - p.depth;
        return [
            [back + 2, sy - 1],
            [back + 0.5, sy],
            [back - 2 - flutter, rig.waistY],
            [back - 5 - flutter * 2, bottom],
            [back + 1, bottom + 1],
            [back + 2, rig.waistY],
        ];
    }

    const sh = p.shoulderHalf - 0.5;
    const spread = front ? 2.5 : 2;

    return [
        [cx - sh + 1, sy - 1],
        [cx + sh - 1, sy - 1],
        [cx + sh + 0.5, sy + 2],
        [cx + sh + spread, bottom],
        [cx - sh - spread, bottom],
        [cx - sh - 0.5, sy + 2],
    ];
}

function cape(ctx: Ctx, phase: 'behind' | 'over', o: CapeOptions): void {
    const { r, rig } = ctx;
    const view = ctx.view;

    if (view === 'back' && phase === 'behind') return;
    if (view !== 'back' && phase === 'over') return;

    const pts = capeShape(ctx, view === 'front');
    const body = polygon(pts, view === 'front' ? -0.4 : 0.05, 0.8);
    const fill = view === 'front' && o.lining ? o.lining : o.cloth;
    r.paint(body, fill, { innerLine: true, tag: TAG_GEAR });

    const bottom = Math.max(...pts.map((p) => p[1]));
    if (view === 'back') {
        const cx = rig.centre;
        for (const dx of [-3, 0, 3]) {
            r.paint(
                line(
                    cx + dx,
                    rig.shoulderY + 4,
                    cx + dx * 1.3,
                    bottom - 1,
                    -0.9,
                ),
                o.cloth,
                { tag: TAG_GEAR },
            );
        }
    }

    if (o.stars) {
        const star = hex('#f3e7a6');
        const spots = [
            [-3, 6],
            [2, 10],
            [-1, 15],
            [4, 18],
            [-4, 21],
            [1, 24],
        ];
        for (const [dx, dy] of spots) {
            const x = rig.centre + dx;
            const y = rig.shoulderY + dy;
            if (r.tag(x, y) === TAG_GEAR) r.set(x, y, star, TAG_GEAR);
        }
    }

    if (o.flame) {
        const flame = ramp('phoenix', true);
        const minX = Math.min(...pts.map((p) => p[0]));
        const maxX = Math.max(...pts.map((p) => p[0]));
        for (let x = Math.ceil(minX); x <= maxX; x += 2) {
            const h = 2 + ((x * 7) % 3);
            r.paint(
                polygon(
                    [
                        [x - 1, bottom - 0.5],
                        [x + 0.3, bottom + h - 1],
                        [x + 1.2, bottom - 0.5],
                    ],
                    0.6,
                ),
                flame,
                { tag: TAG_GEAR },
            );
        }
    }
}

function capeClasp(ctx: Ctx, color: Ramp): void {
    if (ctx.view !== 'front') return;
    const { r, rig } = ctx;
    const cx = rig.neck.x;
    const y = rig.shoulderY - 1;
    for (const s of [-1, 1]) {
        r.paint(ellipse(cx + s * 4, y + 0.5, 0.9, 0.9, 0.4), color, {
            tag: TAG_GEAR,
        });
    }
}

function satchel(ctx: Ctx, phase: GearPhase): void {
    const { r, rig } = ctx;
    const leather = ramp('leather');
    const p = rig.profile;
    const cx = rig.centre;

    if (phase === 'torso' && ctx.view !== 'side') {
        // Strap across the chest.
        const s = ctx.view === 'front' ? 1 : -1;
        r.paint(
            capsule(
                cx + s * (p.chestHalf - 1),
                rig.shoulderY - 0.5,
                cx - s * (p.waistHalf + 1),
                rig.waistY + 1,
                0.8,
            ),
            leather,
            { innerLine: true, tag: TAG_GEAR },
        );
    }

    if (phase === 'shoulders') {
        const s = ctx.view === 'front' ? -1 : ctx.view === 'back' ? 1 : -1;
        const bx =
            ctx.view === 'side' ? cx - p.depth - 1 : cx + s * (p.hipHalf + 1);
        const by = rig.waistY + 3;
        r.paint(
            polygon(
                [
                    [bx - 2.5, by - 2],
                    [bx + 2.5, by - 2],
                    [bx + 2.8, by + 3],
                    [bx - 2.8, by + 3],
                ],
                0.1,
            ),
            leather,
            { innerLine: true, tag: TAG_GEAR },
        );
        r.paint(line(bx - 2.5, by - 1, bx + 2.5, by - 1, -0.8), leather, {
            tag: TAG_GEAR,
        });
        r.set(Math.round(bx), Math.round(by), hex('#d0a64f'), TAG_GEAR);
    }
}

/* ------------------------------------------------------------------ */
/* Head gear                                                           */
/* ------------------------------------------------------------------ */

function hood(ctx: Ctx, phase: GearPhase, cloth: Ramp): void {
    const { r, rig } = ctx;
    const { x: hx, y: hy } = rig.head;
    const { rx, ry } = rig.profile.head;

    if (ctx.view === 'back') {
        if (phase !== 'head') return;
        const shape = union(
            ellipse(hx, hy - 1, rx + 1.6, ry + 1.2, 0.05),
            polygon(
                sym(hx, [
                    [rx + 1, hy + 2],
                    [rx + 3, hy + 9],
                    [0.5, hy + 10],
                ]),
                0,
            ),
        );
        r.paint(shape, cloth, { innerLine: true, tag: TAG_GEAR });
        r.paint(line(hx, hy - 4, hx, hy + 8, -0.9), cloth, { tag: TAG_GEAR });
        return;
    }

    if (ctx.view === 'side') {
        if (phase === 'headBehind') {
            r.paint(
                polygon(
                    [
                        [hx - rx - 2, hy - 1],
                        [hx - rx, hy + 9],
                        [hx + 2, hy + 9],
                        [hx, hy + 4],
                    ],
                    -0.2,
                ),
                cloth,
                { innerLine: true, tag: TAG_GEAR },
            );
            return;
        }
        if (phase !== 'head') return;
        const shape = ellipse(hx - 1, hy - 1.5, rx + 1.6, ry + 1, 0.05).filter(
            (p) => p.x <= hx + rx - 2.5 || p.y <= hy - ry + 0.5,
        );
        const tip = polygon(
            [
                [hx - rx, hy - ry],
                [hx - rx - 3.5, hy - ry + 2.5],
                [hx - rx - 0.5, hy - 1],
            ],
            0.1,
        );
        r.paint(union(shape, tip), cloth, { innerLine: true, tag: TAG_GEAR });
        r.paint(
            line(hx + rx - 2.5, hy - ry + 1, hx + rx - 2.5, hy + 4, -0.9),
            cloth,
            { tag: TAG_GEAR },
        );
        return;
    }

    if (phase === 'headBehind') {
        const shape = union(
            ellipse(hx, hy, rx + 2, ry + 1.5, -0.1),
            polygon(
                sym(hx, [
                    [rx + 1.5, hy + 2],
                    [rx + 3.5, hy + 9],
                    [0.5, hy + 9.5],
                ]),
                -0.25,
            ),
        );
        r.paint(shape, cloth, { innerLine: true, tag: TAG_GEAR });
        return;
    }

    if (phase !== 'head') return;
    const rim = ellipse(hx, hy - 1, rx + 2, ry + 1.5, 0.05).filter((p) => {
        const inFace =
            ((p.x - hx) / (rx - 0.6)) ** 2 +
                ((p.y - (hy + 1.6)) / (ry - 0.6)) ** 2 <
            1;
        return !inFace;
    });
    r.paint(
        rim.filter((p) => p.y <= hy + 6),
        cloth,
        { innerLine: true, tag: TAG_GEAR },
    );
    // Shadow cast by the hood on the brow.
    for (let x = Math.round(hx - rx + 1); x <= hx + rx - 1; x++) {
        const y = Math.round(hy - 2);
        if (r.tag(x, y) === 2) r.set(x, y, ctx.pal.skin.shadow, 2);
    }
}

function circlet(ctx: Ctx, band: Ramp, gem: Ramp, crown: boolean): void {
    const { r, rig } = ctx;
    const { x: hx, y: hy } = rig.head;
    const { rx } = rig.profile.head;
    const y = hy - (crown ? 5 : 3);

    if (ctx.view === 'side') {
        r.paint(line(hx - rx - 0.5, y + 0.5, hx + rx - 1.5, y, 0.4), band, {
            tag: TAG_GEAR,
        });
        if (crown) {
            for (const dx of [-4, -1, 2]) {
                r.paint(
                    polygon(
                        [
                            [hx + dx - 1, y],
                            [hx + dx, y - 3],
                            [hx + dx + 1, y],
                        ],
                        0.4,
                    ),
                    band,
                    { innerLine: true, tag: TAG_GEAR },
                );
            }
            r.paint(capsule(hx - rx, y + 0.5, hx + rx - 1.5, y, 1), band, {
                innerLine: true,
                tag: TAG_GEAR,
            });
        }
        r.paint(ellipse(hx + rx - 2, y, 0.6, 0.6, 0.5), gem, { tag: TAG_GEAR });
        return;
    }

    const half = rx + 0.5;

    if (crown) {
        r.paint(capsule(hx - half + 0.5, y, hx + half - 0.5, y, 1.1), band, {
            innerLine: true,
            tag: TAG_GEAR,
        });
        for (const dx of [-4, 0, 4]) {
            const h = dx === 0 ? 4 : 3;
            r.paint(
                polygon(
                    [
                        [hx + dx - 1.2, y - 0.5],
                        [hx + dx, y - h - 0.5],
                        [hx + dx + 1.2, y - 0.5],
                    ],
                    0.5,
                ),
                band,
                { innerLine: true, tag: TAG_GEAR },
            );
        }
        if (ctx.view === 'front') {
            r.paint(ellipse(hx, y, 0.8, 0.7, 0.4), gem, { tag: TAG_GEAR });
        }
        return;
    }

    r.paint(line(hx - half, y + 0.5, hx + half, y + 0.5, 0.4), band, {
        tag: TAG_GEAR,
    });
    r.paint(line(hx - half + 1, y, hx + half - 1, y, 0.8), band, {
        tag: TAG_GEAR,
        clipToExisting: true,
    });
    if (ctx.view === 'front') {
        r.paint(ellipse(hx, y + 0.5, 1, 1, 0.4), gem, {
            innerLine: true,
            tag: TAG_GEAR,
        });
    }
}

/* ------------------------------------------------------------------ */
/* Pendants & accessories                                              */
/* ------------------------------------------------------------------ */

function pendant(ctx: Ctx, gem: Ramp, chain: Ramp): void {
    if (ctx.view !== 'front') return;
    const { r, rig } = ctx;
    const cx = rig.neck.x;
    const top = rig.shoulderY - 1;
    for (const s of [-1, 1])
        r.paint(line(cx + s * 2.5, top, cx + s * 1, top + 3, 0.3), chain, {
            tag: TAG_GEAR,
        });
    r.paint(ellipse(cx, top + 4, 1.1, 1.3, 0.3), gem, {
        innerLine: true,
        tag: TAG_GEAR,
    });
}

function beltCharm(ctx: Ctx, stone: Ramp, glyph: Rgba): void {
    if (ctx.view === 'back') return;
    const { r, rig } = ctx;
    const p = rig.profile;
    const x =
        ctx.view === 'side'
            ? rig.centre + p.depth - 1
            : rig.centre + p.waistHalf - 1;
    const y = rig.waistY + 4;
    r.paint(line(x, y - 2, x, y - 1, 0), ctx.pal.leather, { tag: TAG_GEAR });
    r.paint(ellipse(x, y + 0.5, 1.4, 1.5, 0.2), stone, {
        innerLine: true,
        tag: TAG_GEAR,
    });
    r.set(Math.round(x), Math.round(y + 0.5), glyph, TAG_GEAR);
}

function sigil(ctx: Ctx): void {
    const { rig } = ctx;
    const x = ctx.view === 'side' ? rig.head.x - 9 : rig.head.x + 11;
    const y = rig.head.y - 4 + (rig.fxPhase % 2);
    const c = hex('#bd95ff');
    // Floating diamond rune.
    for (let dx = -3; dx <= 3; dx++) {
        const dy = 3 - Math.abs(dx);
        glowDot(ctx, x + dx, y - dy, c, 230);
        if (dy !== 0) glowDot(ctx, x + dx, y + dy, c, 230);
    }
    glowDot(ctx, x, y, hex('#f4e9ff'), 255);
    glowDot(ctx, x, y - 1, c, 160);
    glowDot(ctx, x, y + 1, c, 160);
}

/* ------------------------------------------------------------------ */
/* Weapons                                                             */
/* ------------------------------------------------------------------ */

type SwordOptions = {
    blade: Ramp;
    guard: Ramp;
    grip: Ramp;
    length: number;
    width: number;
    glow?: Rgba;
    leaf?: boolean;
};

export function sword(ctx: Ctx, o: SwordOptions): void {
    const { r, rig } = ctx;
    const arm = rig.weaponArm === 'A' ? rig.armA : rig.armB;
    const hand = handPoint(ctx, arm);
    const a = rig.weaponAngle;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const scale = rig.profile.frame === 'heavy' ? 1.15 : 1;
    const len = o.length * scale;
    const far = false;

    // Grip/pommel behind the hand.
    r.paint(
        capsule(hand.x - dx * 2.5, hand.y - dy * 2.5, hand.x, hand.y, 0.8),
        o.grip,
        { far, innerLine: true, tag: TAG_GEAR },
    );
    r.paint(ellipse(hand.x - dx * 3.2, hand.y - dy * 3.2, 1, 1, 0.3), o.guard, {
        far,
        innerLine: true,
        tag: TAG_GEAR,
    });

    // Blade.
    const bx = hand.x + dx * 1.5;
    const by = hand.y + dy * 1.5;
    const tx = hand.x + dx * len;
    const ty = hand.y + dy * len;
    r.paint(capsule(bx, by, tx, ty, o.width, 0.35, 0.15), o.blade, {
        far,
        innerLine: true,
        tag: TAG_GEAR,
        thresholds: [-0.3, 0.25, 0.65],
    });
    // Fuller / edge shine.
    r.paint(
        line(bx + dx * 1, by + dy * 1, tx - dx * 2, ty - dy * 2, 1),
        o.blade,
        { tag: TAG_GEAR },
    );

    // Crossguard.
    const gx = -dy;
    const gy = dx;
    r.paint(
        capsule(
            hand.x + dx * 1.2 - gx * 2.6,
            hand.y + dy * 1.2 - gy * 2.6,
            hand.x + dx * 1.2 + gx * 2.6,
            hand.y + dy * 1.2 + gy * 2.6,
            0.8,
        ),
        o.guard,
        { innerLine: true, tag: TAG_GEAR },
    );

    if (o.leaf) {
        r.paint(
            ellipse(
                hand.x + dx * 5 + gx * 1.5,
                hand.y + dy * 5 + gy * 1.5,
                1,
                0.8,
                0.3,
            ),
            ramp('emerald'),
            { tag: TAG_GEAR },
        );
    }

    // Repaint the gripping hand over the handle.
    const handRamp = rig.profile.bony ? ctx.pal.bone : ctx.pal.skin;
    r.paint(
        ellipse(hand.x, hand.y, rig.profile.handRadius, rig.profile.handRadius),
        handRamp,
        { innerLine: true, tag: 1 },
    );
}

function swordGlow(ctx: Ctx, color: Rgba): void {
    const { rig } = ctx;
    const arm = rig.weaponArm === 'A' ? rig.armA : rig.armB;
    const hand = handPoint(ctx, arm);
    const a = rig.weaponAngle;
    const n = 4;
    for (let i = 0; i < n; i++) {
        const t = 5 + i * 3 + (rig.fxPhase % 2);
        const off = i % 2 === 0 ? 1.8 : -1.8;
        glowDot(
            ctx,
            hand.x + Math.sin(a) * t - Math.cos(a) * off,
            hand.y + Math.cos(a) * t + Math.sin(a) * off,
            color,
            200,
        );
    }
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

const swords: Record<string, SwordOptions> = {
    weapon_training_sword: {
        blade: ramp('wood'),
        guard: ramp('leather'),
        grip: ramp('darkLeather'),
        length: 12,
        width: 1,
    },
    weapon_moonsteel_blade: {
        blade: ramp('moonsteel', true),
        guard: ramp('steel', true),
        grip: ramp('clothBlue'),
        length: 15,
        width: 1.1,
    },
    weapon_mossblade: {
        blade: ramp('mosssteel', true),
        guard: ramp('wood'),
        grip: ramp('leather'),
        length: 14,
        width: 1.1,
        leaf: true,
    },
    weapon_emberfang: {
        blade: ramp('embersteel', true),
        guard: ramp('gold', true),
        grip: ramp('darkLeather'),
        length: 15,
        width: 1.3,
        glow: hex('#ffb04a'),
    },
};

function plateDef(o: () => PlateOptions, sleeve = true): GearDef {
    return {
        slot: 'chest',
        covers: { chest: true },
        sleeve: sleeve ? () => ramp('darkLeather') : undefined,
        paint: { torso: (ctx) => plate(ctx, o()) },
    };
}

const registry: Record<string, GearDef> = {
    chest_linen_tunic: {
        slot: 'chest',
        covers: { chest: true },
        sleeve: () => ramp('linen'),
        paint: {
            torso: (ctx) => {
                tunic(ctx, ramp('linen'), 4, ramp('clothBlue'));
                belt(ctx);
            },
        },
    },
    chest_ranger_vest: {
        slot: 'chest',
        covers: { chest: true },
        paint: { torso: (ctx) => vest(ctx, ramp('clothGreen')) },
    },
    chest_runic_armor: plateDef(() => ({
        metal: ramp('steel', true),
        trim: ramp('sapphire', true),
        ridge: true,
        collar: true,
        tassets: 3,
    })),
    chest_dragonplate: plateDef(() => ({
        metal: ramp('embersteel', true),
        trim: gold(),
        emblem: 'scales',
        collar: true,
        tassets: 4,
    })),
    v3_armor_chest_8: plateDef(() => ({
        metal: ramp('iron', true),
        trim: gold(),
        collar: true,
    })),
    v3_armor_chest_9: plateDef(() => ({
        metal: ramp('iron', true),
        trim: gold(),
        ridge: true,
        tassets: 3,
    })),
    v3_armor_chest_10: plateDef(() => ({
        metal: ramp('iron', true),
        trim: gold(),
        emblem: 'sun',
        collar: true,
        tassets: 3,
    })),
    v3_armor_chest_11: plateDef(() => ({
        metal: ramp('steel', true),
        trim: gold(),
        ridge: true,
        emblem: 'diamond',
        collar: true,
        tassets: 4,
    })),

    feet_simple_boots: {
        slot: 'feet',
        covers: { feet: true },
        paint: { feet: (ctx) => boots(ctx, ramp('leather')) },
    },
    feet_trail_boots: {
        slot: 'feet',
        covers: { feet: true },
        paint: {
            feet: (ctx) => boots(ctx, ramp('leather'), { cuff: ramp('linen') }),
        },
    },
    feet_shadow_boots: {
        slot: 'feet',
        covers: { feet: true },
        paint: {
            feet: (ctx) =>
                boots(ctx, ramp('darkLeather'), { cuff: ramp('darkLeather') }),
        },
    },
    feet_voidwalkers: {
        slot: 'feet',
        covers: { feet: true },
        paint: {
            feet: (ctx) =>
                boots(ctx, ramp('void', true), { cuff: ramp('clothViolet') }),
            glow: (ctx) => {
                for (const leg of [ctx.rig.legA, ctx.rig.legB]) {
                    glowDot(
                        ctx,
                        leg.end.x - 2,
                        leg.end.y + 2,
                        hex('#bd95ff'),
                        150,
                    );
                    glowDot(
                        ctx,
                        leg.end.x + 2,
                        leg.end.y + 2,
                        hex('#bd95ff'),
                        110,
                    );
                }
            },
        },
    },

    head_traveler_hood: {
        slot: 'head',
        covers: { head: true },
        paint: {
            headBehind: (ctx) => hood(ctx, 'headBehind', ramp('leather')),
            head: (ctx) => hood(ctx, 'head', ramp('leather')),
        },
    },
    head_scout_hood: {
        slot: 'head',
        covers: { head: true },
        paint: {
            headBehind: (ctx) => hood(ctx, 'headBehind', ramp('clothGreen')),
            head: (ctx) => hood(ctx, 'head', ramp('clothGreen')),
        },
    },
    head_azure_circlet: {
        slot: 'head',
        paint: {
            head: (ctx) =>
                circlet(
                    ctx,
                    ramp('steel', true),
                    ramp('sapphire', true),
                    false,
                ),
        },
    },
    head_crown_of_dawn: {
        slot: 'head',
        paint: {
            head: (ctx) => circlet(ctx, gold(), ramp('ruby', true), true),
        },
    },

    back_adventurer_cape: {
        slot: 'back',
        paint: {
            behind: (ctx) =>
                cape(ctx, 'behind', {
                    cloth: ramp('clothRed'),
                    lining: ramp('clothRed'),
                }),
            over: (ctx) => cape(ctx, 'over', { cloth: ramp('clothRed') }),
            neck: (ctx) => capeClasp(ctx, gold()),
        },
    },
    back_phoenix_mantle: {
        slot: 'back',
        paint: {
            behind: (ctx) =>
                cape(ctx, 'behind', {
                    cloth: ramp('phoenix', true),
                    flame: true,
                }),
            over: (ctx) =>
                cape(ctx, 'over', {
                    cloth: ramp('phoenix', true),
                    flame: true,
                }),
            neck: (ctx) => capeClasp(ctx, gold()),
        },
    },
    back_starcloak: {
        slot: 'back',
        paint: {
            behind: (ctx) =>
                cape(ctx, 'behind', { cloth: ramp('starcloth'), stars: true }),
            over: (ctx) =>
                cape(ctx, 'over', { cloth: ramp('starcloth'), stars: true }),
            neck: (ctx) => capeClasp(ctx, ramp('steel', true)),
        },
    },
    back_small_satchel: {
        slot: 'back',
        paint: {
            torso: (ctx) => satchel(ctx, 'torso'),
            shoulders: (ctx) => satchel(ctx, 'shoulders'),
        },
    },

    accessory_copper_charm: {
        slot: 'accessory',
        paint: {
            neck: (ctx) => pendant(ctx, ramp('copper', true), ramp('copper')),
        },
    },
    accessory_emerald_token: {
        slot: 'accessory',
        paint: {
            neck: (ctx) => pendant(ctx, ramp('emerald', true), ramp('gold')),
        },
    },
    accessory_lucky_rune: {
        slot: 'accessory',
        paint: {
            shoulders: (ctx) => beltCharm(ctx, ramp('stone'), hex('#7fe0a3')),
        },
    },
    accessory_astral_sigil: {
        slot: 'accessory',
        paint: { glow: (ctx) => sigil(ctx) },
    },
};

for (let v = 0; v < 8; v++) {
    const o: PauldronOptions = [
        { size: 0 },
        { size: 0.5, trim: true },
        { size: 0.5, layers: 2 },
        { size: 0.5, spike: true },
        { size: 1.2, trim: true },
        { size: 0.8, trim: true, wing: true },
        { size: 1, trim: true, layers: 3 },
        { size: 1.4, trim: true, spike: true, layers: 2 },
    ][v];
    registry['v3_armor_shoulder_' + v] = {
        slot: 'shoulder',
        paint: { shoulders: (ctx) => pauldrons(ctx, o) },
    };
}

for (let v = 12; v < 18; v++) {
    const i = v - 12;
    const o = [
        {},
        { trim: true },
        { spike: true },
        { cuisses: true },
        { cuisses: true, trim: true },
        { cuisses: true, trim: true, spike: true },
    ][i];
    registry['v3_armor_greave_' + v] = {
        slot: 'legs',
        paint: { legs: (ctx) => greaves(ctx, o) },
    };
}

for (const [key, o] of Object.entries(swords)) {
    registry[key] = {
        slot: 'weapon',
        paint: {
            glow: o.glow ? (ctx) => swordGlow(ctx, o.glow!) : undefined,
        },
    };
}

export function gearFor(
    visualKey: string | undefined,
    slot: string,
): GearDef | null {
    if (!visualKey) return null;
    const known = registry[visualKey];
    if (known) return known;

    // Unknown items still render, using their slot and inferred material.
    const material = ramp(equipmentMaterial(visualKey), true);
    switch (slot) {
        case 'chest':
            return plateDef(() => ({ metal: material, trim: gold() }));
        case 'feet':
            return {
                slot,
                covers: { feet: true },
                paint: { feet: (ctx) => boots(ctx, material) },
            };
        case 'head':
            return {
                slot,
                paint: {
                    head: (ctx) =>
                        circlet(ctx, material, ramp('sapphire', true), false),
                },
            };
        case 'back':
            return {
                slot,
                paint: {
                    behind: (ctx) => cape(ctx, 'behind', { cloth: material }),
                    over: (ctx) => cape(ctx, 'over', { cloth: material }),
                },
            };
        case 'shoulder':
            return {
                slot,
                paint: { shoulders: (ctx) => pauldrons(ctx, { size: 0.5 }) },
            };
        case 'legs':
            return { slot, paint: { legs: (ctx) => greaves(ctx, {}) } };
        case 'weapon':
            return { slot, paint: {} };
        default:
            return null;
    }
}

export function swordFor(visualKey: string | undefined): SwordOptions | null {
    if (!visualKey) return null;
    if (swords[visualKey]) return swords[visualKey];
    if (!visualKey.startsWith('weapon_')) return null;

    return {
        blade: ramp(equipmentMaterial(visualKey), true),
        guard: ramp('steel', true),
        grip: ramp('leather'),
        length: 14,
        width: 1.1,
    };
}

export type { LitPixel };

/** Items the Forge has authored fits for, grouped by equipment slot. */
export const FORGE_ITEM_CATALOG: Record<string, string[]> = Object.entries(
    registry,
).reduce(
    (catalog, [key, def]) => {
        (catalog[def.slot] ??= []).push(key);
        return catalog;
    },
    {} as Record<string, string[]>,
);
