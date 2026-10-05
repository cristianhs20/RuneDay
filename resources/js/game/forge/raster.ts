/**
 * RuneDay Sprite Forge — pixel raster.
 *
 * Every hero is painted on one shared logical grid (64×64). Parts are
 * rasterised as pixel masks that carry a per-pixel light value, then
 * quantised into a 4-tone ramp. Nothing is anti-aliased and every pixel
 * lands on the grid, so layers can never drift out of alignment.
 */

export type Rgba = number; // 0xAARRGGBB

export type Ramp = {
    line: Rgba;
    shadow: Rgba;
    base: Rgba;
    light: Rgba;
    shine?: Rgba;
};

export type LitPixel = { x: number; y: number; l: number };

export type PaintOptions = {
    /** Draw a darker edge where this part overlaps something painted earlier. */
    innerLine?: boolean;
    /** Shift every tone one step darker (far limbs in side view). */
    far?: boolean;
    /** Light thresholds: [shadow→base, base→light, light→shine]. */
    thresholds?: [number, number, number];
    /** Paint only over pixels that are already opaque (clipping). */
    clipToExisting?: boolean;
    /** Never draw the inner line on these pixels' top edge (seams). */
    flat?: boolean;
    /** Tag used by the outline pass and debug overlays. */
    tag?: number;
};

export const TRANSPARENT = 0;

export function hex(value: string): Rgba {
    const v = value.replace('#', '');
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    const a = v.length >= 8 ? parseInt(v.slice(6, 8), 16) : 255;

    return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

export function channels(c: Rgba): [number, number, number, number] {
    return [(c >>> 16) & 255, (c >>> 8) & 255, c & 255, (c >>> 24) & 255];
}

export function rgba(r: number, g: number, b: number, a = 255): Rgba {
    const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

    return (
        ((clamp(a) << 24) | (clamp(r) << 16) | (clamp(g) << 8) | clamp(b)) >>> 0
    );
}

export function mix(a: Rgba, b: Rgba, t: number): Rgba {
    const [ar, ag, ab, aa] = channels(a);
    const [br, bg, bb, ba] = channels(b);

    return rgba(
        ar + (br - ar) * t,
        ag + (bg - ag) * t,
        ab + (bb - ab) * t,
        aa + (ba - aa) * t,
    );
}

/** Build a 4/5-tone ramp from a 3-tone palette entry with hue-shifted ends. */
export function rampFrom(
    tone: { shadow: string; base: string; highlight: string },
    shine = false,
): Ramp {
    const shadow = hex(tone.shadow);
    const base = hex(tone.base);
    const light = hex(tone.highlight);
    // Shadows shift toward cool violet, lines toward near-black.
    const line = mix(mix(shadow, hex('#1a1426'), 0.55), hex('#000000'), 0.15);

    return {
        line,
        shadow,
        base,
        light,
        shine: shine ? mix(light, hex('#ffffff'), 0.55) : undefined,
    };
}

export function darker(ramp: Ramp): Ramp {
    return {
        line: mix(ramp.line, hex('#000000'), 0.25),
        shadow: mix(ramp.shadow, ramp.line, 0.45),
        base: ramp.shadow,
        light: ramp.base,
        shine: ramp.light,
    };
}

export class Raster {
    readonly width: number;
    readonly height: number;
    readonly pixels: Uint32Array;
    readonly tags: Uint8Array;

    constructor(width = 64, height = 64) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint32Array(width * height);
        this.tags = new Uint8Array(width * height);
    }

    inside(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    get(x: number, y: number): Rgba {
        x = Math.round(x);
        y = Math.round(y);
        if (!this.inside(x, y)) return TRANSPARENT;

        return this.pixels[y * this.width + x];
    }

    tag(x: number, y: number): number {
        x = Math.round(x);
        y = Math.round(y);
        if (!this.inside(x, y)) return 0;

        return this.tags[y * this.width + x];
    }

    set(x: number, y: number, c: Rgba, tag = 0): void {
        x = Math.round(x);
        y = Math.round(y);
        if (!this.inside(x, y)) return;
        const i = y * this.width + x;
        const alpha = (c >>> 24) & 255;

        if (alpha === 0) return;

        if (alpha === 255) {
            this.pixels[i] = c;
        } else {
            const under = this.pixels[i];
            this.pixels[i] =
                ((under >>> 24) & 255) === 0
                    ? c
                    : mix(under, c | 0xff000000, alpha / 255);
        }

        this.tags[i] = tag;
    }

    erase(x: number, y: number): void {
        x = Math.round(x);
        y = Math.round(y);
        if (!this.inside(x, y)) return;
        this.pixels[y * this.width + x] = TRANSPARENT;
        this.tags[y * this.width + x] = 0;
    }

    opaque(x: number, y: number): boolean {
        return ((this.get(x, y) >>> 24) & 255) > 0;
    }

    /** Quantise lit pixels into the ramp and paint them. */
    paint(lit: LitPixel[], ramp: Ramp, options: PaintOptions = {}): void {
        const [t0, t1, t2] = options.thresholds ?? [-0.2, 0.42, 0.86];
        const r = options.far ? darker(ramp) : ramp;
        const key = (x: number, y: number) => y * 256 + x;
        const mask = new Set<number>();

        for (const p of lit) mask.add(key(p.x, p.y));

        const tag = options.tag ?? 1;
        const writes: Array<[number, number, Rgba]> = [];

        for (const p of lit) {
            if (!this.inside(p.x, p.y)) continue;
            if (options.clipToExisting && !this.opaque(p.x, p.y)) continue;

            let c: Rgba;

            if (p.l < t0) c = r.shadow;
            else if (p.l < t1) c = r.base;
            else if (p.l < t2 || !r.shine) c = r.light;
            else c = r.shine;

            if (options.innerLine) {
                // Edge pixel against a different, already painted part.
                const neighbours: Array<[number, number]> = options.flat
                    ? [
                          [1, 0],
                          [-1, 0],
                          [0, 1],
                      ]
                    : [
                          [1, 0],
                          [-1, 0],
                          [0, 1],
                          [0, -1],
                      ];

                for (const [dx, dy] of neighbours) {
                    const nx = p.x + dx;
                    const ny = p.y + dy;

                    if (!mask.has(key(nx, ny)) && this.opaque(nx, ny)) {
                        c = r.line;
                        break;
                    }
                }
            }

            writes.push([p.x, p.y, c]);
        }

        for (const [x, y, c] of writes) this.set(x, y, c, tag);
    }

    /** Flat colour fill, no shading. */
    fill(points: Array<{ x: number; y: number }>, c: Rgba, tag = 1): void {
        for (const p of points) this.set(p.x, p.y, c, tag);
    }

    /**
     * Selective outline: transparent pixels touching the sprite take a dark
     * tone of the neighbouring colour, so silhouettes read on any background.
     */
    outline(strength = 0.72): void {
        const add: Array<[number, number, Rgba]> = [];
        const ink = hex('#120e1a');

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.opaque(x, y)) continue;

                let source: Rgba = TRANSPARENT;

                for (const [dx, dy] of [
                    [0, 1],
                    [1, 0],
                    [-1, 0],
                    [0, -1],
                ]) {
                    const c = this.get(x + dx, y + dy);

                    if (
                        ((c >>> 24) & 255) > 200 &&
                        this.tag(x + dx, y + dy) !== 9
                    ) {
                        source = c;
                        break;
                    }
                }

                if (source !== TRANSPARENT) {
                    add.push([x, y, mix(source, ink, strength) | 0xff000000]);
                }
            }
        }

        for (const [x, y, c] of add) this.set(x, y, c, 8);
    }

    /** Copy another raster on top of this one (alpha-aware). */
    blit(other: Raster, dx = 0, dy = 0, flipX = false): void {
        for (let y = 0; y < other.height; y++) {
            for (let x = 0; x < other.width; x++) {
                const c = other.pixels[y * other.width + x];
                if (((c >>> 24) & 255) === 0) continue;
                const tx = flipX ? other.width - 1 - x + dx : x + dx;
                this.set(tx, y + dy, c, other.tags[y * other.width + x]);
            }
        }
    }

    /** Tint every opaque pixel toward a colour (hurt flash, spectral FX). */
    tint(c: Rgba, amount: number): void {
        for (let i = 0; i < this.pixels.length; i++) {
            const p = this.pixels[i];
            if (((p >>> 24) & 255) === 0) continue;
            this.pixels[i] = mix(p, c | 0xff000000, amount) | (p & 0xff000000);
        }
    }

    toRgbaBytes(): Uint8ClampedArray<ArrayBuffer> {
        const out = new Uint8ClampedArray(this.width * this.height * 4);

        for (let i = 0; i < this.pixels.length; i++) {
            const [r, g, b, a] = channels(this.pixels[i]);
            out[i * 4] = r;
            out[i * 4 + 1] = g;
            out[i * 4 + 2] = b;
            out[i * 4 + 3] = a;
        }

        return out;
    }
}

/* ------------------------------------------------------------------ */
/* Shape rasterisers. Each returns pixels with a light value in [-1,1]. */
/* ------------------------------------------------------------------ */

const LIGHT = normalize3(-0.55, -0.62, 0.56);

function normalize3(x: number, y: number, z: number): [number, number, number] {
    const len = Math.hypot(x, y, z) || 1;

    return [x / len, y / len, z / len];
}

function sphereLight(nx: number, ny: number): number {
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

    return nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2] * 1.15 - 0.35;
}

/** Filled ellipse with spherical shading. */
export function ellipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    bias = 0,
): LitPixel[] {
    const out: LitPixel[] = [];

    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
            const nx = (x + 0.5 - cx - 0.5) / (rx + 0.35);
            const ny = (y + 0.5 - cy - 0.5) / (ry + 0.35);

            if (nx * nx + ny * ny <= 1) {
                out.push({ x, y, l: sphereLight(nx, ny) + bias });
            }
        }
    }

    return out;
}

/** Tapered capsule between two points with cylindrical shading. */
export function capsule(
    ax: number,
    ay: number,
    bx: number,
    by: number,
    ra: number,
    rb = ra,
    bias = 0,
): LitPixel[] {
    const out: LitPixel[] = [];
    const minX = Math.floor(Math.min(ax - ra, bx - rb)) - 1;
    const maxX = Math.ceil(Math.max(ax + ra, bx + rb)) + 1;
    const minY = Math.floor(Math.min(ay - ra, by - rb)) - 1;
    const maxY = Math.ceil(Math.max(ay + ra, by + rb)) + 1;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const len = Math.sqrt(len2);
    // Perpendicular unit vector.
    const px = -dy / len;
    const py = dx / len;

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const t = Math.max(
                0,
                Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2),
            );
            const cx = ax + dx * t;
            const cy = ay + dy * t;
            const r = ra + (rb - ra) * t;
            const ox = x - cx;
            const oy = y - cy;
            const d = Math.hypot(ox, oy);

            if (d <= r + 0.42) {
                const side = r > 0 ? (ox * px + oy * py) / (r + 0.42) : 0;
                const nx = side * px;
                const ny = side * py;
                // Cylinder: normal lies in the perpendicular plane.
                const along = (ox * dx + oy * dy) / len / (r + 0.42);
                out.push({
                    x,
                    y,
                    l:
                        sphereLight(
                            nx + along * 0.25 * (dx / len),
                            ny + along * 0.25 * (dy / len),
                        ) + bias,
                });
            }
        }
    }

    return out;
}

/** Polygon (even-odd) with horizontal-cylinder shading per row. */
export function polygon(
    points: Array<[number, number]>,
    bias = 0,
    curve = 1,
): LitPixel[] {
    const out: LitPixel[] = [];
    const ys = points.map((p) => p[1]);
    const xs = points.map((p) => p[0]);
    const minY = Math.floor(Math.min(...ys));
    const maxY = Math.ceil(Math.max(...ys));
    const minX = Math.floor(Math.min(...xs));
    const maxX = Math.ceil(Math.max(...xs));
    const height = Math.max(1, maxY - minY);

    for (let y = minY; y <= maxY; y++) {
        const row: number[] = [];

        for (let x = minX; x <= maxX; x++) {
            if (pointInPolygon(x + 0.001, y + 0.001, points)) row.push(x);
        }

        if (row.length === 0) continue;

        const left = row[0];
        const right = row[row.length - 1];
        const centre = (left + right) / 2;
        const half = Math.max(1, (right - left) / 2 + 0.5);
        const v = (y - minY) / height;

        for (const x of row) {
            const nx = ((x - centre) / half) * 0.92 * curve;
            const ny = (v - 0.45) * 0.7;
            out.push({ x, y, l: sphereLight(nx, ny) + bias });
        }
    }

    return out;
}

export function rect(
    x: number,
    y: number,
    w: number,
    h: number,
    bias = 0,
): LitPixel[] {
    return polygon(
        [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h],
        ],
        bias,
    );
}

/** One-pixel line (Bresenham) with constant light. */
export function line(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    l = 0,
): LitPixel[] {
    const out: LitPixel[] = [];
    let x = Math.round(x0);
    let y = Math.round(y0);
    const tx = Math.round(x1);
    const ty = Math.round(y1);
    const dx = Math.abs(tx - x);
    const dy = -Math.abs(ty - y);
    const sx = x < tx ? 1 : -1;
    const sy = y < ty ? 1 : -1;
    let err = dx + dy;

    for (let guard = 0; guard < 256; guard++) {
        out.push({ x, y, l });
        if (x === tx && y === ty) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y += sy;
        }
    }

    return out;
}

export function pointInPolygon(
    x: number,
    y: number,
    points: Array<[number, number]>,
): boolean {
    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }

    return inside;
}

/** Shift light of a pixel set (e.g. cast shadow under a hood). */
export function shade(pixels: LitPixel[], amount: number): LitPixel[] {
    return pixels.map((p) => ({ ...p, l: p.l + amount }));
}

export function translate(
    pixels: LitPixel[],
    dx: number,
    dy: number,
): LitPixel[] {
    return pixels.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
}

export function mirrorX(pixels: LitPixel[], axis: number): LitPixel[] {
    return pixels.map((p) => ({ ...p, x: Math.round(2 * axis - p.x) }));
}

export function union(...sets: LitPixel[][]): LitPixel[] {
    const map = new Map<number, LitPixel>();

    for (const set of sets) {
        for (const p of set) map.set(p.y * 256 + p.x, p);
    }

    return [...map.values()];
}

export function subtract(a: LitPixel[], b: LitPixel[]): LitPixel[] {
    const keys = new Set(b.map((p) => p.y * 256 + p.x));

    return a.filter((p) => !keys.has(p.y * 256 + p.x));
}

export function clipRows(
    pixels: LitPixel[],
    minY: number,
    maxY: number,
): LitPixel[] {
    return pixels.filter((p) => p.y >= minY && p.y <= maxY);
}
