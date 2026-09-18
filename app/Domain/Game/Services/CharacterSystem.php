<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Enums\CharacterLineage;
use RuntimeException;

class CharacterSystem
{
    /** @var array<string, mixed>|null */
    private static ?array $cache = null;

    /**
     * @return array<string, mixed>
     */
    public function data(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        $path = resource_path('game/character-system.json');
        $json = file_get_contents($path);

        if ($json === false) {
            throw new RuntimeException('Character system definition is missing.');
        }

        $decoded = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($decoded)) {
            throw new RuntimeException('Character system definition is invalid.');
        }

        return self::$cache = $decoded;
    }

    /**
     * @return array<int, string>
     */
    public function lineages(): array
    {
        return array_map(
            'strval',
            array_keys($this->data()['lineages']),
        );
    }

    public function normalizeLineage(?string $lineage): CharacterLineage
    {
        return CharacterLineage::tryFrom((string) $lineage)
            ?? CharacterLineage::Human;
    }

    /**
     * @return array<string, string>
     */
    public function defaults(CharacterLineage|string $lineage): array
    {
        $key = $lineage instanceof CharacterLineage
            ? $lineage->value
            : $this->normalizeLineage($lineage)->value;

        /** @var array<string, string> $defaults */
        $defaults = $this->data()['lineages'][$key]['defaults'];

        return $defaults;
    }

    /**
     * @return array<int, string>
     */
    public function allowed(
        CharacterLineage|string $lineage,
        string $field,
    ): array {
        $key = $lineage instanceof CharacterLineage
            ? $lineage->value
            : $this->normalizeLineage($lineage)->value;

        if ($field === 'body') {
            /** @var array<int, string> $frames */
            $frames = $this->data()['lineages'][$key]['allowedFrames'];

            return $frames;
        }

        /** @var array<string, array<int, string>> $options */
        $options = $this->data()['lineages'][$key]['options'];

        return $options[$field] ?? [];
    }

    public function styleId(): string
    {
        return (string) $this->data()['styleId'];
    }

    public function systemVersion(): string
    {
        return (string) $this->data()['version'];
    }

    /**
     * @param  array<string, mixed>|null  $appearance
     * @return array<string, string>
     */
    public function normalizeAppearance(
        CharacterLineage|string $lineage,
        ?array $appearance,
    ): array {
        $lineage = $lineage instanceof CharacterLineage
            ? $lineage
            : $this->normalizeLineage($lineage);

        $defaults = $this->defaults($lineage);
        $input = is_array($appearance) ? $appearance : [];

        $body = (string) ($input['body'] ?? $defaults['body']);
        $legacyMap = $this->data()['legacyBodyMap'];

        if (isset($legacyMap[$body])) {
            $body = (string) $legacyMap[$body];
        }

        $normalized = [];

        foreach ($defaults as $field => $fallback) {
            $value = $field === 'body'
                ? $body
                : (string) ($input[$field] ?? $fallback);

            $allowed = $this->allowed($lineage, $field);

            $normalized[$field] = in_array($value, $allowed, true)
                ? $value
                : $fallback;
        }

        return $normalized;
    }

    public function frameAllowed(
        CharacterLineage|string $lineage,
        string $frame,
    ): bool {
        return in_array($frame, $this->allowed($lineage, 'body'), true);
    }
}
