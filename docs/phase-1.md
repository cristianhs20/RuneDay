# RuneDay — Phase 1: Productivity Core

## Status

**MVP complete.**

Phase 1 establishes a serious productivity system whose verified real-world actions can safely drive RuneDay's RPG progression.

## Foundation

- Laravel authentication, email verification, passkeys and optional 2FA.
- React + TypeScript + Inertia web client.
- Productivity and Game domain boundaries.
- Character profile with level, XP, total XP and gold.
- Idempotent reward ledger with traceable sources.
- Global reward feedback in the web client.
- User timezone captured during registration and editable from Profile.
- UTC persistence with user-local day boundaries for gameplay and analytics.

## Quests

- Inbox for fast capture.
- Full quest create/update/archive flow.
- Difficulty, priority, notes, due date, reminder and time estimate.
- Campaign/project grouping.
- Nested subtasks.
- Parent quests cannot be completed while subtasks remain open.
- Today prioritizes overdue and due quests.
- Completion rewards XP and gold server-side.

### Provisional anti-farming

Quest rewards currently use a daily soft cap calculated in the user's timezone:

- completions 1–12: 100% reward;
- completions 13–20: 50% reward;
- completion 21+: 0% reward.

Tasks still count as completed after the cap. The applied reward factor is recorded in the ledger so balancing can change later using real retention and abuse data.

## Dailies

- Daily or selected-weekday recurrence.
- Optional start/end dates.
- One completion per scheduled local day.
- Idempotent progression rewards.
- No XP penalty for missing a Daily.

## Habits

- Positive, negative, neutral and mixed tracking modes.
- Unlimited observation logs.
- Only the first positive log per habit/local day grants progression.
- Negative logs never remove character progress.

## Focus

- 25/50/90-minute focus timer.
- Optional quest association.
- Completed sessions persist duration and timestamps.
- Focus sessions grant capped XP/gold.
- Today and Progress aggregate focus time using the user's timezone.

## Calendar

- Month view for dated quests.
- Recurring rhythm panel for Dailies.
- Month boundaries are resolved in the user's timezone before querying UTC timestamps.

## Reminders & Notifications

- Quest reminder datetime supported from create/edit flows.
- Local reminder time is converted to UTC for storage.
- runeday:send-reminders runs every minute through Laravel Scheduler.
- Reminder delivery is idempotent through reminder_sent_at.
- Database notification center with read / mark-all-read flows.
- Editing a reminder re-arms delivery only when its scheduled time changes.

Production must run Laravel's scheduler (php artisan schedule:run every minute or schedule:work under a process manager).

## Progress / Insights

A 7-day Progress view tracks the metrics RuneDay wants to improve rather than app screen time:

- quests completed;
- focus minutes;
- habit logs;
- XP earned;
- gold earned;
- day-by-day activity rhythm.

## Reward boundaries

- Productivity owns quests, campaigns, Dailies, habits and focus.
- Game owns character progression, currencies and reward transactions.
- Productivity never mutates character balances directly.
- Every Game reward has a traceable source.
- Competitive currencies will never be purchasable.

## Provisional quest rewards

| Difficulty |  XP | Gold |
| ---------- | --: | ---: |
| Easy       |  15 |    5 |
| Normal     |  30 |   10 |
| Hard       |  60 |   20 |
| Epic       | 120 |   40 |

These values are deliberately provisional.

## Quality gate

Phase 1 is not considered complete unless all of these remain green:

- frontend format/lint;
- TypeScript typecheck;
- production Vite build / Wayfinder generation;
- Laravel Pint;
- PHPStan level 7;
- migrations from an empty database;
- full PHPUnit suite.

## Deferred beyond Phase 1

These are intentional next-stage items rather than missing Phase 1 blockers:

- richer recurrence rules (monthly, intervals, exclusions);
- native push notifications for the mobile app;
- offline/mobile sync and client idempotency keys;
- deeper productivity analytics and streak visualizations;
- accessibility and keyboard-navigation polish;
- advanced reminder preferences;
- RPG character equipment, inventory and visual progression (Phase 2).
