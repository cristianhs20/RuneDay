<?php

namespace App\Domain\Social\Enums;

enum SocialVisibility: string
{
    case Public = 'public';
    case Friends = 'friends';
    case Private = 'private';
}
