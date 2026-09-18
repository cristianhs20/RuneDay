<?php

namespace App\Http\Requests\Social;

use App\Domain\Social\Models\SocialProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSocialProfileRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('handle'))) {
            $this->merge([
                'handle' => strtolower(ltrim(trim($this->input('handle')), '@')),
            ]);
        }
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $profileId = SocialProfile::query()
            ->where('user_id', $this->user()->id)
            ->value('id');

        return [
            'handle' => [
                'required',
                'string',
                'min:3',
                'max:24',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('social_profiles', 'handle')->ignore($profileId),
            ],
            'bio' => ['nullable', 'string', 'max:180'],
            'profile_visibility' => [
                'required',
                Rule::in(['public', 'friends', 'private']),
            ],
            'activity_visibility' => [
                'required',
                Rule::in(['public', 'friends', 'private']),
            ],
            'friend_requests_enabled' => ['required', 'boolean'],
            'show_adventure' => ['required', 'boolean'],
            'show_stats' => ['required', 'boolean'],
            'show_achievements' => ['required', 'boolean'],
        ];
    }
}
