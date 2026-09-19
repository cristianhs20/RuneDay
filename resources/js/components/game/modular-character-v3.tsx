import { useEffect, useMemo, useRef, useState } from 'react';
import {
    loadModularV3Manifest,
    type ModularV3Manifest,
    type ModularV3Module,
    type ModularV3View,
} from '@/game/modular-v3';

type EquipmentSelection = {
    weapon_back: boolean;
    chest: boolean;
    neck: boolean;
    waist: boolean;
    feet: boolean;
};

type Props = {
    view: ModularV3View;
    skin: 'fair' | 'light_tan' | 'tan' | 'dark';
    hair:
        | 'messy'
        | 'short_spiky'
        | 'medium_parted'
        | 'long'
        | 'ponytail'
        | 'wild'
        | 'none';
    expression: 'base' | 'neutral' | 'determined' | 'happy' | 'serious';
    equipment: EquipmentSelection;
    scale?: 1 | 2 | 3;
    className?: string;
};

const manifestUrl = '/game/characters/v3/manifests/modular-v3.json';

const atlasCache = new Map<string, HTMLImageElement>();

async function loadAtlas(src: string): Promise<HTMLImageElement> {
    const existing = atlasCache.get(src);
    if (existing) return existing;

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
            atlasCache.set(src, image);
            resolve(image);
        };
        image.onerror = reject;
        image.src = src;
    });
}

function resolveModule(
    manifest: ModularV3Manifest,
    id: string,
): ModularV3Module | null {
    return manifest.modules[id] ?? null;
}

export function ModularCharacterV3({
    view,
    skin,
    hair,
    expression,
    equipment,
    scale = 2,
    className = '',
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [manifest, setManifest] = useState<ModularV3Manifest | null>(null);
    const [error, setError] = useState<string | null>(null);

    const moduleIds = useMemo(() => {
        const ids: string[] = [];

        if (equipment.weapon_back) {
            ids.push('training_sword.' + view);
        }

        ids.push('body.' + skin + '.' + view);
        ids.push('head.' + skin + '.' + view);

        if (expression !== 'base' && view === 'front') {
            ids.push('face.' + expression + '.front');
        }

        if (hair !== 'none' && manifest?.availability.hair[view]) {
            ids.push('hair.' + hair + '.' + view);
        }

        if (equipment.chest) {
            ids.push('chest_blue_harness.' + view);
        }

        if (equipment.neck) {
            ids.push('scarf_royal_blue.' + view);
        }

        if (equipment.waist) {
            ids.push('belt_starter_tabard.' + view);
        }

        if (equipment.feet) {
            ids.push('boots_starter.' + view);
        }

        return ids;
    }, [view, skin, hair, expression, equipment, manifest]);

    useEffect(() => {
        let canceled = false;

        loadModularV3Manifest(manifestUrl)
            .then((nextManifest) => {
                if (!canceled) {
                    setManifest(nextManifest);
                    setError(null);
                }
            })
            .catch(() => {
                if (!canceled) {
                    setError(
                        'Modular Character Engine v3 manifest unavailable.',
                    );
                }
            });

        return () => {
            canceled = true;
        };
    }, []);

    useEffect(() => {
        let canceled = false;

        if (!manifest) return;

        const modules = moduleIds
            .map((id) => resolveModule(manifest, id))
            .filter((module): module is ModularV3Module => module !== null);

        Promise.all(
            Array.from(new Set(modules.map((module) => module.atlas))).map(
                (atlas) => loadAtlas(atlas),
            ),
        )
            .then(() => {
                if (canceled) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                const width = manifest.cell.width;
                const height = manifest.cell.height;

                canvas.width = width * scale;
                canvas.height = height * scale;

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.imageSmoothingEnabled = false;
                context.save();
                context.scale(scale, scale);

                for (const module of modules) {
                    const image = atlasCache.get(module.atlas);
                    if (!image) continue;

                    context.drawImage(
                        image,
                        module.x,
                        module.y,
                        module.w,
                        module.h,
                        0,
                        0,
                        width,
                        height,
                    );
                }

                context.restore();
                setError(null);
            })
            .catch(() => {
                if (!canceled) {
                    setError(
                        'One or more modular sprite atlases failed to load.',
                    );
                }
            });

        return () => {
            canceled = true;
        };
    }, [manifest, moduleIds, scale]);

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
            aria-label="RuneDay Modular Character Engine v3 character"
        />
    );
}
