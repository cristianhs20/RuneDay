# RuneDay — Phase 3: Adventure PvE

## Status

**MVP complete.**

Phase 3 turns RuneDay's character/equipment foundation into a persistent Adventure layer driven by real productivity.

The central rule remains unchanged:

**There is no manual attack button. Completing a real RuneDay quest is the combat action.**

## Architecture

Adventure is a separate domain from Productivity and Game:

- Productivity owns real tasks, Dailies, habits and focus.
- Game owns hero progression, equipment, loot, gold and achievements.
- Adventure owns regions, enemies, encounters, combat, Renown, bosses, region objectives and Bestiary.

A completed task can therefore produce three independent outcomes:

1. productivity completion;
2. Game progression / loot;
3. Adventure combat action.

Each subsystem keeps its own idempotency boundaries.

## World

Phase 3 ships with three regions:

### Greenwild Frontier

- minimum level: 1;
- boss unlock: 3 normal/elite victories;
- Mossling;
- Thorn Wolf;
- Root Warden (boss).

### Embercrag

- minimum level: 3;
- requires Root Warden defeated;
- boss unlock: 4 normal/elite victories;
- Ash Crawler;
- Cinder Hound;
- Forge Tyrant (boss).

### Moonfall Ruins

- minimum level: 5;
- requires Forge Tyrant defeated;
- boss unlock: 5 normal/elite victories;
- Wisp Knight;
- Void Scholar;
- Moonbound Colossus (boss).

Region access is derived server-side from hero level and previous boss progress.

## Encounters

A user can have only one active encounter at a time.

Starting an encounter snapshots:

- enemy;
- region;
- hero combat stats;
- hero maximum HP;
- enemy maximum HP;
- start time.

Encounters can be abandoned without affecting Productivity, Game XP or previously earned rewards.

## Combat

Completing a real quest applies one combat action to the active encounter.

A task can produce at most one Adventure combat action because combat actions are unique by:

user + task_completion + task id

Retries and repeated requests cannot generate additional damage.

### Damage

Difficulty provides base attack power:

| Quest difficulty | Base combat damage |
| ---------------- | -----------------: |
| Easy             |                  8 |
| Normal           |                 14 |
| Hard             |                 24 |
| Epic             |                 40 |

Final damage also uses:

- hero Power;
- enemy Defense;
- current anti-farming reward factor;
- deterministic critical result.

### Stats

Phase 2 stats now have real PvE effects:

- **Power** increases outgoing damage;
- **Guard** reduces enemy counterattacks;
- **Focus** raises critical chance;
- **Luck** also raises critical chance;
- **Gear Score** remains a presentation/progression metric.

### Critical hits

Critical chance is deterministic for a given encounter/task combination.

The server calculates it from Focus + Luck and caps it at 35%.

A critical hit deals 1.6x damage.

## Enemy counterattacks & Camp Rest

If the enemy survives the player's attack, it counterattacks.

Guard reduces the received damage.

RuneDay deliberately avoids punitive death mechanics for productivity:

- if hero HP reaches 0;
- the hero automatically performs a Camp Rest;
- HP returns to maximum;
- damage already dealt to the enemy remains;
- no XP, equipment, task completion or encounter damage is lost.

Camp rests are counted on the encounter for future balancing/analytics.

## Anti-farming

Adventure uses the same task reward factor as XP/gold/loot.

- first 12 rewarded quest completions: 100% combat damage;
- completions 13–20: 50% combat damage;
- completion 21+: 0 combat damage.

A capped task still completes normally as productivity work.

A zero-damage combat action is recorded so that the same task cannot later be replayed to attack.

## Victory

Enemy victory settlement is server-side and idempotent.

A victory can grant:

- enemy gold reward;
- Adventure Renown;
- region objective completion;
- first-clear boss equipment;
- next-region unlock.

Adventure victory gold uses the existing Game reward ledger.

Renown uses a dedicated Adventure transaction ledger.

## Renown

Renown is a non-purchasable Adventure prestige currency.

It is stored in:

- Adventure Profile balance;
- immutable Adventure transaction ledger.

Sources currently include:

- encounter victories;
- region objective claims.

This prepares RuneDay for future guild ranking, seasons and Adventure leaderboards without making Renown purchasable.

## Region Quests

Each region has three automatic RPG objectives.

### Greenwild Frontier

- First Blood — defeat 1 regional enemy;
- Clear the Trail — defeat 3 regional enemies;
- Break the Old Guard — defeat Root Warden.

### Embercrag

- Ash Walker — defeat 1 regional enemy;
- Through the Heat — defeat 4 regional enemies;
- Cool the Forge — defeat Forge Tyrant.

### Moonfall Ruins

- Into the Ruins — defeat 1 regional enemy;
- Quiet the Halls — defeat 5 regional enemies;
- Moonbreaker — defeat Moonbound Colossus.

Objectives grant gold + Renown automatically when their server-side criteria become true.

Claims are unique per user/objective.

## Bosses

Bosses require regional progress before they can be challenged.

The first clear of each boss can additionally grant guaranteed equipment:

- Root Warden: Rare gear;
- Forge Tyrant: Rare gear;
- Moonbound Colossus: Epic gear.

The boss reward chooses from unowned eligible equipment.

Boss equipment is granted only on first clear.

Repeated boss victories can still grant their normal encounter gold/Renown, but cannot repeat the first-clear item.

## Bestiary

The Bestiary contains all nine enemies.

Before an encounter:

- the entry remains undiscovered;
- identity and combat information are hidden.

After first encounter:

- name;
- description;
- enemy type;
- HP;
- Attack;
- Defense;
- victory count

become visible.

## Adventure UI

The World screen includes:

- Adventure Renown;
- total damage;
- victories;
- boss victories;
- current encounter;
- hero/enemy HP;
- recent combat turns;
- region progression;
- boss unlock progress;
- region objectives;
- enemy selection;
- locked-region requirements.

Today also displays the active encounter so the player sees that the next real quest will advance combat.

## Game Event Overlay

Quest completion can now display:

- hero attack animation;
- enemy sprite;
- hero HP;
- enemy HP;
- damage dealt;
- critical hit;
- enemy counterattack;
- Camp Rest;
- quest XP/gold;
- task loot;
- Adventure victory;
- encounter gold;
- Renown;
- boss first-clear gear;
- region objective unlocks;
- newly unlocked region.

## Integrity guarantees

Meaningful Adventure state is fully server-authoritative:

- region access;
- boss access;
- encounters;
- HP;
- damage;
- critical rolls;
- counterattacks;
- combat action idempotency;
- victory settlement;
- boss first-clear rewards;
- Renown;
- objective claims.

The browser only requests actions and renders server results.

## Initial world catalog

Phase 3 migrations install automatically:

- 3 regions;
- 9 enemies;
- 3 bosses;
- 9 region objectives.

No manual seeder is required for a fresh environment.

## Deferred beyond Phase 3

Intentional future systems include:

- larger world map;
- more regions/enemies;
- enemy abilities/status effects;
- consumables;
- crafting/materials;
- pets;
- repeatable Adventure contracts;
- daily/weekly world events;
- raids;
- guild encounters;
- seasons;
- leaderboards;
- native sprite asset packs;
- social inspection of Adventure progress.
