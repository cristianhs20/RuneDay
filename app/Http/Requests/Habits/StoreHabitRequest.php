<?php

namespace App\Http\Requests\Habits;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHabitRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'mode' => ['required', Rule::in(['positive', 'negative', 'neutral', 'both'])],
            'difficulty' => ['required', Rule::in(['easy', 'normal', 'hard', 'epic'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
