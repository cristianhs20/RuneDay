<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:4000'],
            'status' => ['sometimes', Rule::in(['active', 'completed', 'archived'])],
            'due_at' => ['nullable', 'date'],
        ];
    }
}
