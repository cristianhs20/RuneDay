<?php

namespace App\Http\Requests\Game;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCharacterRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'character_name' => ['required', 'string', 'min:2', 'max:60'],
            'archetype' => ['required', Rule::in(['wanderer', 'warden', 'rogue', 'arcanist'])],
            'appearance' => ['required', 'array'],
            'appearance.body' => ['required', Rule::in(['type_a', 'type_b'])],
            'appearance.skin_tone' => ['required', Rule::in(['moon', 'sun', 'bronze', 'deep'])],
            'appearance.hair_style' => ['required', Rule::in(['short', 'wild', 'braid', 'crest', 'none'])],
            'appearance.hair_color' => ['required', Rule::in(['onyx', 'chestnut', 'blonde', 'silver', 'ember'])],
            'appearance.eye_color' => ['required', Rule::in(['emerald', 'azure', 'amber', 'violet'])],
        ];
    }
}
