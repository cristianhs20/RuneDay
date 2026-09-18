<?php

namespace App\Http\Requests\Guild;

use App\Domain\Guild\Models\Guild;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuildRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('tag'))) {
            $this->merge([
                'tag' => strtoupper(trim($this->input('tag'))),
            ]);
        }
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        /** @var Guild $guild */
        $guild = $this->route('guild');

        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:60',
                Rule::unique('guilds', 'name')->ignore($guild->id),
            ],
            'tag' => [
                'required',
                'string',
                'min:2',
                'max:5',
                'regex:/^[A-Z0-9]+$/',
                Rule::unique('guilds', 'tag')->ignore($guild->id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
