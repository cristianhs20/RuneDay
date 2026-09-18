# RuneDay — Phase 1

## Goal

Build a serious productivity core whose real-world actions can safely drive an RPG economy.

## Implemented

### Foundation

- Laravel authentication, verified-user routes and security starter features.
- Productivity and Game domain boundaries.
- Character profile with level, XP, total XP and gold.
- Idempotent reward ledger with traceable sources.
- Global reward feedback in the web client.

### Quests

- Inbox for quick capture.
- Full quest create/update/archive flow.
- Difficulty, priority, notes, due date, reminder timestamp and time estimate.
- Campaign/project grouping.
- Nested subtasks.
- Parent quests cannot be completed while subtasks remain open.
- Today prioritizes overdue, due and unscheduled quests.
- Completion rewards XP and gold server-side.

### Anti-farming

Quest rewards use a provisional daily soft cap:

- completions 1–12: 100% reward;
- completions 13–20: 50% reward;
- completion 21+: 0% reward.

Tasks still count as completed after the cap. The applied reward factor is recorded in the ledger so balancing can be changed later from real retention/abuse data.

### Dailies

- Daily or selected-weekday recurrence.
- Date-range support in the model.
- One completion per scheduled day.
- Idempotent progression rewards.
- No XP penalty for missing a daily.

### Habits

- Positive, negative, neutral and mixed tracking modes.
- Unlimited observation logs.
- Only the first positive log per habit/day grants progression.
- Negative logs never remove character progress.

### Focus

- 25/50/90-minute focus timer UI.
- Optional quest association.
- Completed sessions persist duration and timestamps.
- Focus time grants capped XP/gold.

### Calendar and Today

- Month calendar for dated quests.
- Recurring rhythm panel for Dailies.
- Today metrics for completed quests, focus minutes and habit logs.
- Direct entry points into Inbox, Focus and Habits.

## Domain boundaries

- Productivity owns quests, campaigns, dailies, habits and focus.
- Game owns character progression, currencies and reward transactions.
- Productivity never mutates character balances directly.
- Every Game reward must have a traceable source.
- Competitive currencies will never be purchasable.

## Provisional quest reward table

| Difficulty |  XP | Gold |
| ---------- | --: | ---: |
| Easy       |  15 |    5 |
| Normal     |  30 |   10 |
| Hard       |  60 |   20 |
| Epic       | 120 |   40 |

These values are intentionally provisional.

## Remaining Phase 1 work

- Reminder delivery worker and notification preferences.
- Offline-friendly mobile API contract and idempotency keys.
- Productivity analytics beyond Today.
- User timezone/preferences for daily boundaries.
- Better recurrence rules (intervals, monthly, exclusions).
- Accessibility pass, keyboard flows and richer loading/error states.
- Responsive polish after testing on real mobile devices.
- CI verification of PHP tests on GitHub Actions.
