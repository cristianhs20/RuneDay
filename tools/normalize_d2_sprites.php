<?php

declare(strict_types=1);

function isChroma(int $r, int $g, int $b): bool
{
    return $g > 145
        && $g > ($r * 1.20)
        && $g > ($b * 1.20)
        && ($g - max($r, $b)) > 35;
}

function loadTransparent(string $path): GdImage
{
    $source = imagecreatefrompng($path);
    $width = imagesx($source);
    $height = imagesy($source);

    $out = imagecreatetruecolor($width, $height);
    imagealphablending($out, false);
    imagesavealpha($out, true);
    $transparent = imagecolorallocatealpha($out, 0, 0, 0, 127);
    imagefill($out, 0, 0, $transparent);

    for ($y = 0; $y < $height; $y++) {
        for ($x = 0; $x < $width; $x++) {
            $c = imagecolorat($source, $x, $y);
            $r = ($c >> 16) & 255;
            $g = ($c >> 8) & 255;
            $b = $c & 255;

            if (isChroma($r, $g, $b)) {
                continue;
            }

            $color = imagecolorallocatealpha($out, $r, $g, $b, 0);
            imagesetpixel($out, $x, $y, $color);
        }
    }

    imagedestroy($source);

    return $out;
}

/** @return array{0:int,1:int,2:int,3:int} */
function alphaBounds(GdImage $image): array
{
    $w = imagesx($image);
    $h = imagesy($image);
    $minX = $w;
    $minY = $h;
    $maxX = 0;
    $maxY = 0;

    for ($y = 0; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $rgba = imagecolorat($image, $x, $y);
            $alpha = ($rgba & 0x7F000000) >> 24;

            if ($alpha >= 120) {
                continue;
            }

            $minX = min($minX, $x);
            $minY = min($minY, $y);
            $maxX = max($maxX, $x);
            $maxY = max($maxY, $y);
        }
    }

    return [$minX, $minY, $maxX, $maxY];
}

function normalizeSprite(string $sourcePath, string $destPath): array
{
    $source = loadTransparent($sourcePath);
    [$minX, $minY, $maxX, $maxY] = alphaBounds($source);

    $srcW = $maxX - $minX + 1;
    $srcH = $maxY - $minY + 1;

    $targetW = 128;
    $targetH = 128;
    $maxVisualW = 112;
    $maxVisualH = 116;
    $scale = min($maxVisualW / $srcW, $maxVisualH / $srcH);
    $drawW = max(1, (int) floor($srcW * $scale));
    $drawH = max(1, (int) floor($srcH * $scale));

    $dest = imagecreatetruecolor($targetW, $targetH);
    imagealphablending($dest, false);
    imagesavealpha($dest, true);
    $transparent = imagecolorallocatealpha($dest, 0, 0, 0, 127);
    imagefill($dest, 0, 0, $transparent);

    $destX = (int) floor(($targetW - $drawW) / 2);
    $destY = 122 - $drawH;

    imagecopyresized(
        $dest,
        $source,
        $destX,
        $destY,
        $minX,
        $minY,
        $drawW,
        $drawH,
        $srcW,
        $srcH,
    );

    imagepng($dest, $destPath, 9);
    imagedestroy($source);
    imagedestroy($dest);

    return [
        'source_bbox' => [$minX, $minY, $maxX, $maxY],
        'draw' => [$destX, $destY, $drawW, $drawH],
    ];
}

function transparentCanvas(): GdImage
{
    $image = imagecreatetruecolor(128, 128);
    imagealphablending($image, false);
    imagesavealpha($image, true);
    $transparent = imagecolorallocatealpha($image, 0, 0, 0, 127);
    imagefill($image, 0, 0, $transparent);

    return $image;
}

function copySelectedPixels(
    GdImage $source,
    GdImage $target,
    callable $selector,
): void {
    for ($y = 0; $y < 128; $y++) {
        for ($x = 0; $x < 128; $x++) {
            $rgba = imagecolorat($source, $x, $y);
            $alpha = ($rgba & 0x7F000000) >> 24;

            if ($alpha >= 120) {
                continue;
            }

            $r = ($rgba >> 16) & 255;
            $g = ($rgba >> 8) & 255;
            $b = $rgba & 255;

            if (! $selector($x, $y, $r, $g, $b)) {
                continue;
            }

            $color = imagecolorallocatealpha($target, $r, $g, $b, $alpha);
            imagesetpixel($target, $x, $y, $color);
        }
    }
}

function makeLayers(string $masterPath, string $dir, string $view): void
{
    $master = imagecreatefrompng($masterPath);
    imagealphablending($master, false);
    imagesavealpha($master, true);

    $layers = [
        'hair' => transparentCanvas(),
        'face' => transparentCanvas(),
        'eyes' => transparentCanvas(),
        'weapon_back' => transparentCanvas(),
        'body' => transparentCanvas(),
    ];

    copySelectedPixels($master, $layers['eyes'], function ($x, $y, $r, $g, $b) use ($view) {
        if ($view === 'back') {
            return false;
        }
        if ($y > 51 || $y < 18) {
            return false;
        }
        $blue = $b > $r * 1.15 && $b > $g * 1.05 && $b > 90;

        return $blue && $x > 42 && $x < 86;
    });

    copySelectedPixels($master, $layers['hair'], function ($x, $y, $r, $g, $b) {
        if ($y > 47) {
            return false;
        }
        $brown = $r > 40 && $r > $b * 1.18 && $g > $b * 0.85 && $g < $r * 0.92;
        $darkHair = $r < 90 && $g < 75 && $b < 70;

        return $brown || $darkHair;
    });

    copySelectedPixels($master, $layers['face'], function ($x, $y, $r, $g, $b) use ($view) {
        if ($view === 'back') {
            return false;
        }
        if ($y > 58 || $y < 22 || $x < 38 || $x > 90) {
            return false;
        }
        $skin = $r > 110 && $r > $g * 1.08 && $g > $b * 1.05;

        return $skin;
    });

    copySelectedPixels($master, $layers['weapon_back'], function ($x, $y, $r, $g, $b) use ($view) {
        if ($view === 'front' && $x < 82) {
            return false;
        }
        if ($view === 'side' && $x < 79) {
            return false;
        }
        if ($view === 'back' && $x < 75) {
            return false;
        }
        if ($y > 94 || $y < 8) {
            return false;
        }

        $steel = abs($r - $g) < 35 && abs($g - $b) < 45 && max($r, $g, $b) > 75;
        $hilt = $r > 80 && $r > $g * 1.08 && $g > $b * 1.05;

        return $steel || $hilt;
    });

    for ($y = 0; $y < 128; $y++) {
        for ($x = 0; $x < 128; $x++) {
            $rgba = imagecolorat($master, $x, $y);
            $alpha = ($rgba & 0x7F000000) >> 24;
            if ($alpha >= 120) {
                continue;
            }

            $claimed = false;
            foreach (['hair', 'face', 'eyes', 'weapon_back'] as $name) {
                $c = imagecolorat($layers[$name], $x, $y);
                $a = ($c & 0x7F000000) >> 24;
                if ($a < 120) {
                    $claimed = true;
                    break;
                }
            }

            if (! $claimed) {
                $r = ($rgba >> 16) & 255;
                $g = ($rgba >> 8) & 255;
                $b = $rgba & 255;
                $color = imagecolorallocatealpha($layers['body'], $r, $g, $b, $alpha);
                imagesetpixel($layers['body'], $x, $y, $color);
            }
        }
    }

    $shadow = transparentCanvas();
    $shadowColor = imagecolorallocatealpha($shadow, 7, 10, 14, 80);
    imagefilledellipse($shadow, 64, 121, 54, 7, $shadowColor);
    $layers['shadow'] = $shadow;

    foreach ($layers as $name => $image) {
        imagepng($image, $dir.'/'.$view.'-'.$name.'.png', 9);
        imagedestroy($image);
    }

    imagedestroy($master);
}

$project = '/app';
$assetDir = $project.'/public/game/characters/v2/characters/human/broad/master';
@mkdir($assetDir, 0775, true);

$sourceMap = [
    'front' => '/tmp/runeday_d2_front.png',
    'side' => '/tmp/runeday_d2_side.png',
    'back' => '/tmp/runeday_d2_back.png',
];

foreach ($sourceMap as $view => $source) {
    $master = $assetDir.'/'.$view.'-master.png';
    $meta = normalizeSprite($source, $master);
    makeLayers($master, $assetDir, $view);
    echo $view.' '.json_encode($meta).PHP_EOL;
}
