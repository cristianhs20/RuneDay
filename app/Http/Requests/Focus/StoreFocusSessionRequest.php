<?php

namespace App\Http\Requests\Focus;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFocusSessionRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'duration_minutes' => ['required', 'integer', 'between:5,240'],
            'task_id' => [
                'nullable',
                Rule::exists('tasks', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'mode' => ['sometimes', Rule::in(['focus', 'pomodoro'])],
        ];
    }
}
