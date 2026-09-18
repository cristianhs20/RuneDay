<?php

namespace App\Http\Requests\Dailies;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDailyRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'difficulty' => ['required', Rule::in(['easy', 'normal', 'hard', 'epic'])],
            'frequency' => ['required', Rule::in(['daily', 'weekly'])],
            'days_of_week' => ['nullable', 'required_if:frequency,weekly', 'array', 'min:1'],
            'days_of_week.*' => ['integer', 'between:1,7'],
            'starts_on' => ['nullable', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
