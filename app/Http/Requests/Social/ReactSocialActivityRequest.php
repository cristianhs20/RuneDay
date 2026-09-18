<?php

namespace App\Http\Requests\Social;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReactSocialActivityRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'type' => [
                'required',
                Rule::in(['cheer', 'fire', 'sword', 'crown']),
            ],
        ];
    }
}
