<?php

namespace App\Http\Requests\Habits;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LogHabitRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'direction' => ['required', Rule::in(['positive', 'negative', 'neutral'])],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
