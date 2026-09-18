<?php

namespace App\Http\Requests\Game;

use App\Domain\Game\Services\CharacterSystem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCharacterRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $system = app(CharacterSystem::class);
        $lineage = $system->normalizeLineage(
            is_string($this->input('lineage'))
                ? $this->input('lineage')
                : 'human',
        )->value;

        $appearance = $this->input('appearance');

        if (! is_array($appearance)) {
            $appearance = [];
        }

        $defaults = $system->defaults($lineage);
        $appearance = [...$defaults, ...$appearance];

        $body = (string) ($appearance['body'] ?? $defaults['body']);
        $legacyMap = $system->data()['legacyBodyMap'];

        if (isset($legacyMap[$body])) {
            $appearance['body'] = (string) $legacyMap[$body];
        }

        $this->merge([
            'lineage' => $lineage,
            'appearance' => $appearance,
        ]);
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $system = app(CharacterSystem::class);
        $lineage = $system->normalizeLineage(
            is_string($this->input('lineage'))
                ? $this->input('lineage')
                : null,
        );

        return [
            'character_name' => [
                'required',
                'string',
                'min:2',
                'max:60',
            ],
            'archetype' => [
                'required',
                Rule::in([
                    'wanderer',
                    'warden',
                    'rogue',
                    'arcanist',
                ]),
            ],
            'lineage' => [
                'required',
                Rule::in($system->lineages()),
            ],
            'appearance' => [
                'required',
                'array',
            ],
            'appearance.body' => [
                'required',
                Rule::in($system->allowed($lineage, 'body')),
            ],
            'appearance.skin_tone' => [
                'required',
                Rule::in($system->allowed($lineage, 'skin_tone')),
            ],
            'appearance.bone_tone' => [
                'required',
                Rule::in($system->allowed($lineage, 'bone_tone')),
            ],
            'appearance.hair_style' => [
                'required',
                Rule::in($system->allowed($lineage, 'hair_style')),
            ],
            'appearance.hair_color' => [
                'required',
                Rule::in($system->allowed($lineage, 'hair_color')),
            ],
            'appearance.eye_color' => [
                'required',
                Rule::in($system->allowed($lineage, 'eye_color')),
            ],
            'appearance.eye_glow' => [
                'required',
                Rule::in($system->allowed($lineage, 'eye_glow')),
            ],
            'appearance.face_style' => [
                'required',
                Rule::in($system->allowed($lineage, 'face_style')),
            ],
            'appearance.ear_style' => [
                'required',
                Rule::in($system->allowed($lineage, 'ear_style')),
            ],
            'appearance.jaw_style' => [
                'required',
                Rule::in($system->allowed($lineage, 'jaw_style')),
            ],
            'appearance.horn_style' => [
                'required',
                Rule::in($system->allowed($lineage, 'horn_style')),
            ],
        ];
    }
}
