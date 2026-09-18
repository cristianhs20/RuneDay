# RuneDay — Phase 2: Character RPG

## Status

**MVP complete.**

Phase 2 turns the Phase 1 productivity engine into a visible RPG progression loop without changing the product rule that real-world productivity comes first.

## Core loop

The implemented loop is:

**Complete quest → hero attacks → XP + gold → loot roll → inventory → equip item → sprite changes → achievements evaluate**

The game layer is driven by server-verified productivity events. Client refreshes, repeated requests and double taps cannot reroll rewards.

## Character Creator

Users can create and edit a hero with:

- hero name;
- archetype: Wanderer, Warden, Rogue or Arcanist;
- two body frames;
- four skin tones;
- five hair styles;
- five hair colors;
- four eye colors.

Archetypes are cosmetic in Phase 2. They do not change XP multipliers, productivity rewards or loot odds.

The first character creation grants and equips:

- Training Sword;
- Linen Tunic.

Starter equipment is granted only once.

## Layered Sprite Engine

RuneDay now has its own code-driven pixel-art sprite system rather than a single flattened avatar image.

Layers are rendered independently:

1. back item;
2. legs;
3. feet;
4. body / skin;
5. chest equipment;
6. head / face;
7. hair;
8. head equipment;
9. accessory;
10. weapon.

Equipment is linked through each item's visual_key, so changing gear immediately changes the visible hero without creating every possible equipment combination as a separate image.

Animation states currently supported:

- idle;
- attack;
- celebrate.

Animations respect prefers-reduced-motion.

## Character Stats

Character stats are derived rather than stored:

- Power;
- Guard;
- Focus;
- Luck;
- Gear Score.

Level provides the base stats and equipped gear adds modifiers.

These stats are intentionally not used to modify productivity XP or real-world task rewards in Phase 2. They are the foundation for future PvE systems.

## Inventory & Equipment

Equipment slots:

- weapon;
- head;
- chest;
- feet;
- back;
- accessory.

Owned item instances are stored separately from the static item catalog.

Rules:

- users can only equip items they own;
- one item can occupy a slot at a time;
- equipping a new item replaces that slot;
- an inventory item cannot be equipped in multiple slots;
- starter, loot and shop acquisition sources remain traceable.

## Item Catalog

Phase 2 ships with 24 equipment items:

- 6 Common;
- 6 Uncommon;
- 6 Rare;
- 6 Epic.

Each rarity contains one item for each equipment slot.

Every item defines:

- stable slug;
- name and description;
- equipment slot;
- rarity;
- visual key;
- stat modifiers;
- minimum level;
- gold price;
- shop/drop eligibility.

The initial catalog is installed through migrations so a fresh deployment works without a manual seeding step.

## Loot Engine

Every completed quest creates at most one immutable loot decision identified by:

user + task_completion + task id

That record exists whether an item drops or not, preventing request retries from rerolling loot.

### First quest onboarding

The first loot roll is guaranteed to produce a **Common** item so the player experiences the complete loop early.

### Base drop chances

Before anti-farming adjustment:

| Difficulty | Drop chance |
| ---------- | ----------: |
| Easy       |         15% |
| Normal     |         22% |
| Hard       |         35% |
| Epic       |         55% |

### Rarity distribution

Difficulty also shifts the rarity distribution.

Higher-difficulty quests have better Rare/Epic odds, but no difficulty guarantees a high-rarity item.

### Anti-farming

The Phase 1 daily reward factor also scales loot chance:

- first 12 rewarded quest completions: 100% loot chance multiplier;
- completions 13–20: 50% loot chance multiplier;
- completion 21+: 0% loot chance.

The task is still completed when the reward cap is reached.

## Shop

The Adventure Shop uses only RuneDay gold earned from productivity and achievements.

Phase 2 shop policy:

- Common items: purchasable with earned gold;
- Uncommon items: purchasable with earned gold;
- Rare items: loot-only;
- Epic items: loot-only;
- no real-money currency;
- no purchasable competitive currency.

Shop purchases create a negative gold ledger transaction so currency spend remains auditable.

An equipment item can only be owned once in the current Phase 2 model.

## Achievements

Phase 2 includes seven server-evaluated achievements:

1. First Step — complete 1 quest;
2. Questline — complete 10 quests;
3. Seasoned — reach level 5;
4. Treasure Found — find 1 loot item;
5. Suited Up — equip 4 slots;
6. Deep Work — accumulate 120 focus minutes;
7. Habit Builder — record 25 habit actions.

Achievements can reward XP and gold.

Unlocks are unique per user and achievement. Reward transactions use the achievement unlock as their immutable source, preventing duplicate rewards.

Achievement evaluation supports chained unlocks. If one achievement reward raises the hero enough to satisfy another achievement, the next achievement can unlock immediately.

## Game Event Overlay

Inertia now shares the current hero snapshot globally.

Game events can trigger a full-screen feedback card containing:

- animated hero;
- XP earned;
- gold earned/spent;
- loot found;
- achievement unlocks;
- equipment change feedback;
- shop purchase feedback.

Quest completion uses the attack animation. Other positive progression events use celebrate feedback.

The simple XP toast is suppressed when the richer RPG overlay is present.

## Hero on Today

The current layered hero appears directly on Today on desktop and links to the Hero page.

The character is therefore part of the main productivity experience instead of living only in a separate game screen.

## Security & Integrity

Phase 2 keeps all meaningful game state server-side:

- character progression;
- inventory ownership;
- equipment;
- shop spending;
- loot decisions;
- achievement unlocks;
- gold ledger transactions.

The client only requests actions and renders the result.

## Deferred to later phases

The following are intentionally not part of the Phase 2 MVP:

- enemies and persistent PvE encounters;
- weapon-specific combat math;
- pets;
- consumables and stackable inventory;
- item upgrades/crafting;
- trading;
- guild inventory;
- raids;
- seasons;
- native sprite asset packs;
- marketplace purchases;
- real-money cosmetics.

Those systems can now be built on top of the Phase 2 item, equipment, loot and character foundations.
