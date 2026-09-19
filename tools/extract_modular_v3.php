<?php

declare(strict_types=1);

$project = dirname(__DIR__);
$manifestPath = $project.'/public/game/characters/v3/manifests/modular-v3.json';
$manifest = json_decode(
    (string) file_get_contents($manifestPath),
    true,
    flags: JSON_THROW_ON_ERROR,
);

$publicRoot = $project.'/public';
$moduleRoot = $project.'/public/game/characters/v3/modules';
@mkdir($moduleRoot, 0775, true);

$atlasCache = [];

function modulePath(string $id): string
{
    $parts = explode('.', $id);
    $file = array_pop($parts).'.png';

    return implode('/', $parts).'/'.$file;
}

foreach ($manifest['modules'] as $id => &$module) {
    $atlasPath = $publicRoot.$module['atlas'];

    if (! isset($atlasCache[$atlasPath])) {
        $image = imagecreatefrompng($atlasPath);

        if (! $image) {
            throw new RuntimeException('Unable to open atlas: '.$atlasPath);
        }

        imagealphablending($image, false);
        imagesavealpha($image, true);
        $atlasCache[$atlasPath] = $image;
    }

    $target = imagecreatetruecolor(256, 256);
    imagealphablending($target, false);
    imagesavealpha($target, true);
    $transparent = imagecolorallocatealpha(
        $target,
        0,
        0,
        0,
        127,
    );
    imagefill($target, 0, 0, $transparent);

    imagecopy(
        $target,
        $atlasCache[$atlasPath],
        0,
        0,
        (int) $module['x'],
        (int) $module['y'],
        256,
        256,
    );

    $relative = modulePath($id);
    $output = $moduleRoot.'/'.$relative;
    @mkdir(dirname($output), 0775, true);

    imagepng($target, $output, 9);
    imagedestroy($target);

    $module['png'] = '/game/characters/v3/modules/'.$relative;
}
unset($module);

foreach ($atlasCache as $image) {
    imagedestroy($image);
}

$json = json_encode(
    $manifest,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES,
).PHP_EOL;

file_put_contents($manifestPath, $json);
file_put_contents(
    $project.'/resources/game/modular-v3/modular-v3.json',
    $json,
);

echo count($manifest['modules'])." modular PNG files extracted.\n";
