import { useEffect, useMemo, useRef, useState } from 'react';
import {
    cachedFrame,
    FORGE_ENGINE_ID,
    FORGE_ENGINE_VERSION,
    STATE_TIMING,
    type ForgeCharacter,
    type ForgeState,
} from '@/game/forge/compose';
import { CELL } from '@/game/forge/rig';
import type { CharacterView } from '@/types/game';

type Props = {
    character: ForgeCharacter;
    view?: CharacterView;
    state?: ForgeState;
    /** Freeze on one frame instead of animating. */
    frame?: number;
    animate?: boolean;
    className?: string;
};

function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
}

/**
 * RuneDay Sprite Forge renderer. Draws 64×64 frames at the largest integer
 * scale that fits the box, so every logical pixel stays perfectly square.
 */
export function ForgeSprite({
    character,
    view = 'front',
    state = 'idle',
    frame,
    animate = true,
    className = '',
}: Props) {
    const boxRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [box, setBox] = useState({ width: 0, height: 0 });
    const [tick, setTick] = useState(0);
    const timing = STATE_TIMING[state];
    const playing = animate && frame === undefined && !prefersReducedMotion();
    const current = frame ?? (playing ? tick % timing.frames : 0);

    const characterKey = useMemo(
        () =>
            JSON.stringify([
                character.lineage,
                character.archetype,
                character.appearance,
                character.equipment,
            ]),
        [character],
    );

    useEffect(() => {
        const element = boxRef.current;
        if (!element) return;

        const update = () =>
            setBox({
                width: element.clientWidth,
                height: element.clientHeight,
            });
        update();

        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(update);
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setTick(0);
        if (!playing) return;

        // Non-looping states hold their last frame briefly, then replay.
        const hold = timing.loop ? 0 : 6;
        const interval = window.setInterval(
            () => setTick((t) => (t + 1) % (timing.frames + hold)),
            1000 / timing.fps,
        );

        return () => window.clearInterval(interval);
    }, [playing, state, timing.fps, timing.frames, timing.loop]);

    const shown = Math.min(current, timing.frames - 1);
    const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const fit = Math.min(box.width || CELL, box.height || box.width || CELL);
    const scale = Math.max(1, Math.floor((fit * dpr) / CELL));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const raster = cachedFrame({ character, view, state, frame: shown });
        const image = new ImageData(raster.toRgbaBytes(), CELL, CELL);
        const size = CELL * scale;

        if (canvas.width !== size) canvas.width = size;
        if (canvas.height !== size) canvas.height = size;

        const source = document.createElement('canvas');
        source.width = CELL;
        source.height = CELL;
        source.getContext('2d')?.putImageData(image, 0, 0);

        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, size, size);
        context.drawImage(source, 0, 0, size, size);
        // characterKey captures deep changes to the character object.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [characterKey, view, state, shown, scale]);

    const cssSize = (CELL * scale) / dpr;

    return (
        <div
            ref={boxRef}
            data-engine={FORGE_ENGINE_ID}
            data-engine-version={FORGE_ENGINE_VERSION}
            data-lineage={character.lineage ?? 'human'}
            data-view={view}
            data-state={state}
            className={'flex items-center justify-center ' + className}
        >
            <canvas
                ref={canvasRef}
                role="img"
                aria-label={`${character.lineage ?? 'human'} hero, ${view} view`}
                style={{ width: cssSize, height: cssSize }}
                className="block max-h-full max-w-full [image-rendering:pixelated]"
            />
        </div>
    );
}
