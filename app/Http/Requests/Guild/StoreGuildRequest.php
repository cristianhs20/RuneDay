<?php

namespace App\Http\Requests\Guild;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuildRequest extends FormRequest
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
        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:60',
                Rule::unique('guilds', 'name'),
            ],
            'tag' => [
                'required',
                'string',
                'min:2',
                'max:5',
                'regex:/^[A-Z0-9]+$/',
                Rule::unique('guilds', 'tag'),
            ],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
