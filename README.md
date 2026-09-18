# RuneDay

**Level up your real life.**

RuneDay is a cross-platform productivity RPG. Real quests, Dailies, habits and focused work drive a persistent hero, equipment, loot and achievement system.

## Product principle

RuneDay is a productivity product first and an RPG second. The game should make real-world action more satisfying without becoming another distraction.

## Stack

- Laravel 13 / PHP 8.3+
- React 19 + TypeScript
- Inertia 3
- Tailwind CSS 4
- PostgreSQL in production
- Redis planned for queues/cache
- React Native + Expo planned for the mobile client

## Current milestone

**Phase 1 — Productivity Core MVP: complete.**

- Today, Inbox and Quests
- subtasks and Campaigns
- Dailies and Habits
- Focus timer
- Calendar
- timezone-safe daily boundaries
- quest reminders + notification center
- 7-day Progress / Insights
- XP/gold reward ledger
- anti-farming controls

See [docs/phase-1.md](docs/phase-1.md).

**Phase 2 — Character RPG MVP: complete.**

- Hero Creator
- layered pixel-art sprite engine
- idle / attack / celebrate animation states
- equipment-driven visual layers
- six equipment slots
- 24-item catalog across Common / Uncommon / Rare / Epic
- inventory and equipment management
- server-side loot engine with first-drop onboarding guarantee
- loot-aware anti-farming
- earned-gold Adventure Shop
- seven achievements with server-side progress/unlocks
- derived RPG stats and Gear Score
- global game-event overlay for XP, gold, loot and achievements
- live hero presence on Today

See [docs/phase-2.md](docs/phase-2.md).

**Phase 3 — Adventure PvE MVP: complete.**

- separate Adventure domain
- 3 regions with level/boss gating
- 9 enemies / 3 bosses
- persistent encounters
- quest-driven combat with no manual attack button
- Power/Guard/Focus/Luck combat effects
- deterministic critical hits
- enemy counterattacks + non-punitive Camp Rest
- anti-farming applied to combat damage
- immutable Renown ledger
- region quests / objectives
- first-clear boss equipment
- Bestiary discovery and victory history
- World UI + active encounter on Today
- combat overlay with HP, damage, criticals, rewards and region unlocks

See [docs/phase-3.md](docs/phase-3.md).

**Phase 4 — Friends & Social MVP: complete.**

- social profiles created at registration
- unique handles + stable friend codes
- friend requests and crossed-request auto-accept
- canonical friendships
- blocking and privacy enforcement
- Public / Friends / Private profile visibility
- retroactive activity visibility
- Friends hub + party feed
- predefined Cheer / Fire / Sword / Crown reactions
- friend-request / acceptance / reaction notifications
- public hero inspection with privacy toggles
- Party standings by level with no competitive rewards
- public profile share links
- client-side PNG share cards
- milestone publisher for hero, level, achievements, Rare/Epic loot, bosses and regions
- no task titles, notes, gold, email or calendar data exposed socially

See [docs/phase-4.md](docs/phase-4.md).

**Phase 5 — Guilds & Cooperative Raids MVP: complete.**

- one guild membership per user
- guild founding with unique name/tag
- Leader / Officer / Member roles
- friend-only guild invitations
- role promotion/demotion + leadership transfer
- server-enforced member capacity
- Guild XP immutable ledger
- quest-driven Guild XP contributions
- Camp → Tavern → Guild Hall → Fortress → Castle progression
- member contribution stats
- 3 cooperative raid bosses
- Hall-gated raid unlocks
- one active raid per guild
- quest-driven raid damage with Power/Focus/Luck
- deterministic raid criticals
- anti-farming applied to Guild XP and raid damage
- contributor-only raid victory XP/gold
- idempotent raid settlement
- Guild invite / join / raid victory notifications
- Guild Hall + roster + contributions + raid UI
- Guild feedback inside the global RuneDay event overlay

See [docs/phase-5.md](docs/phase-5.md).

## Character Engine focus

**Character Engine — Phase A: Art Direction Foundation v1: complete.**

The playable-character system now has a versioned visual source of truth rather than renderer-specific styling.

Locked in Phase A:

- RuneDay Heroic Compact Fantasy art direction
- 64×64 canonical playable-character canvas
- Y=58 baseline and hero/effect bounds
- fixed equipment/body anchors
- canonical layer order
- shared skin / hair / eye palettes
- reusable three-tone material library
- top-left lighting rule
- silhouette/internal outline rules
- rarity accent + FX budgets
- animation frame/FPS/root-travel targets
- machine-readable asset naming convention
- production renderer consuming shared style tokens
- bounds/anchor debug renderer
- authenticated Character Style Lab at /character/style-lab
- versioned artist handoff + QA checklist

See:

- [Phase A](docs/character-engine/phase-a.md)
- [Character Style Bible v1](docs/character-engine/style-bible-v1.md)
- [Asset Production Spec v1](docs/character-engine/asset-production-spec-v1.md)
- [Visual QA Checklist v1](docs/character-engine/qa-checklist-v1.md)

Phase A deliberately prioritizes **system consistency before asset quantity**.

**Character Engine — Phase B: Base Hero + Lineage System v1: complete.**

- shared Humanoid Rig contract consumed by Laravel + React
- semantic Broad / Lean / Heavy body frames
- legacy type_a / type_b normalization
- Human lineage
- Elf lineage with ear/face variants
- Skeleton lineage with bone palettes, jaw variants and soul-eye glow
- Ogre lineage with Heavy frame, tusks and horns
- Front / Side / Back rendering
- lineage-specific server-side personalization validation
- one shared equipment catalog across all launch lineages
- Ogre Heavy equipment mask without moving canonical sockets
- Idle / Walk / Attack / Cast / Celebrate / Hurt states
- 4-lineage × 6-state Epic equipment stress matrix
- internal Lineage Lab at /character/lineage-lab
- lineage identity propagated to Friends, public profiles and Guilds

See:

- [Phase B](docs/character-engine/phase-b.md)
- [Lineage System v1](docs/character-engine/lineage-system-v1.md)
- [Animation Stress Test v1](docs/character-engine/animation-stress-test-v1.md)

Mass equipment production should still remain controlled: Phase B proves the rig, lineage and compatibility architecture. Future authored frame-by-frame animation and production asset packs must continue to pass the Character QA system.

## Local setup

```bash
composer run setup
composer run dev
```

The project uses Laravel Wayfinder. Route/action TypeScript helpers are generated by Artisan/Vite and must exist before the global TypeScript check.

Laravel Scheduler must be running in deployed environments for quest reminders.

## Quality checks

```bash
npm run check
npm run types:check
vendor/bin/pint --test
vendor/bin/phpstan analyse --no-progress
php artisan test
```

GitHub Actions installs PHP/Node, runs migrations, builds the frontend to generate Wayfinder helpers, and executes the complete suite.

## Core rules

- Productivity modules never mutate game balances directly.
- XP, gold, loot, inventory ownership and achievements are validated server-side.
- Reward and spend operations have traceable ledger sources.
- Repeated requests cannot reroll task loot.
- Rare and Epic equipment are loot-only in Phase 2.
- Real quest completion is the only Phase 3 combat input.
- A task can create at most one combat action.
- Renown is ledger-backed and not purchasable.
- Social profiles are Friends-only by default; Public is opt-in.
- Task titles, notes, schedules, email and private economy data never enter Social activity.
- Blocks override Public visibility.
- Guild invitations are limited to accepted friends.
- Guild XP and raid turns come only from real quest completions.
- The same anti-farming factor applies to Guild XP and raid damage.
- Raid personal rewards go only to members who dealt positive damage.
- No competitive currency is purchasable.
