import { useEffect, useMemo, useRef, useState } from 'react';
import {
    loadSpriteV2Manifest,
    type SpriteV2Animation,
    type SpriteV2AssemblyManifest,
    type SpriteV2Layer,
    type SpriteV2View,
} from '@/game/sprite-v2';

type LoadedLayer = SpriteV2Layer & {
    image: HTMLImageElement;
};

export function SpriteV2Character({
    manifestUrl,
    view = 'front',
    animation = 'idle',
    scale = 2,
    className = '',
}: {
    manifestUrl: string;
    view?: SpriteV2View;
    animation?: SpriteV2Animation;
    scale?: 1 | 2 | 3 | 4;
    className?: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [manifest, setManifest] = useState<SpriteV2AssemblyManifest | null>(
        null,
    );
    const [layers, setLayers] = useState<LoadedLayer[]>([]);
    const [error, setError] = useState<string | null>(null);

    const activeLayers = useMemo(
        () =>
            manifest?.views[view]?.[animation]
                ?.slice()
                .sort((a, b) => a.z - b.z) ?? [],
        [manifest, view, animation],
    );

    useEffect(() => {
        let canceled = false;

        loadSpriteV2Manifest(manifestUrl)
            .then((nextManifest) => {
                if (!canceled) {
                    setManifest(nextManifest);
                    setError(null);
                }
            })
            .catch(() => {
                if (!canceled) {
                    setError('Sprite v2 manifest unavailable.');
                }
            });

        return () => {
            canceled = true;
        };
    }, [manifestUrl]);

    useEffect(() => {
        let canceled = false;

        if (activeLayers.length === 0) {
            setLayers([]);
            return;
        }

        Promise.all(
            activeLayers.map(
                (layer) =>
                    new Promise<LoadedLayer>((resolve, reject) => {
                        const image = new Image();
                        image.decoding = 'async';
                        image.onload = () =>
                            resolve({
                                ...layer,
                                image,
                            });
                        image.onerror = reject;
                        image.src = layer.sheet;
                    }),
            ),
        )
            .then((loaded) => {
                if (!canceled) {
                    setLayers(loaded);
                    setError(null);
                }
            })
            .catch(() => {
                if (!canceled) {
                    setError('One or more Sprite v2 layers failed to load.');
                }
            });

        return () => {
            canceled = true;
        };
    }, [activeLayers]);

    useEffect(() => {
        if (!manifest || layers.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.imageSmoothingEnabled = false;

        const { width, height } = manifest.cell;
        canvas.width = width * scale;
        canvas.height = height * scale;

        let animationFrame = 0;
        const startedAt = performance.now();

        const render = (now: number) => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.save();
            context.scale(scale, scale);
            context.imageSmoothingEnabled = false;

            for (const layer of layers) {
                const frameCount = Math.max(1, layer.frames);
                const fps = layer.fps ?? 4;
                const elapsedSeconds = (now - startedAt) / 1000;
                const rawFrame = Math.floor(elapsedSeconds * fps);
                const frame =
                    layer.loop === false
                        ? Math.min(frameCount - 1, rawFrame)
                        : rawFrame % frameCount;

                context.globalAlpha = layer.opacity ?? 1;
                context.drawImage(
                    layer.image,
                    frame * width,
                    0,
                    width,
                    height,
                    0,
                    0,
                    width,
                    height,
                );
            }

            context.restore();
            animationFrame = requestAnimationFrame(render);
        };

        animationFrame = requestAnimationFrame(render);

        return () => cancelAnimationFrame(animationFrame);
    }, [manifest, layers, scale]);

    if (error) {
        return (
            <div
                className={
                    'text-muted-foreground flex items-center justify-center rounded-xl border border-dashed text-xs ' +
                    className
                }
            >
                {error}
            </div>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className={
                'block max-w-full [image-rendering:pixelated] ' + className
            }
            aria-label="RuneDay Sprite Engine v2 character"
        />
    );
}
