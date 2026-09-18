<?php

namespace App\Http\Requests\Tasks;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'title' => ['required', 'string', 'max:160'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'difficulty' => ['required', Rule::in(['easy', 'normal', 'hard', 'epic'])],
            'priority' => ['required', 'integer', 'between:1,4'],
            'project_id' => [
                'nullable',
                Rule::exists('projects', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'parent_id' => [
                'nullable',
                Rule::exists('tasks', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'due_at' => ['nullable', 'date'],
            'remind_at' => ['nullable', 'date'],
            'estimate_minutes' => ['nullable', 'integer', 'between:1,1440'],
        ];
    }
}
