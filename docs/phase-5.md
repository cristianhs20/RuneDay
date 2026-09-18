# RuneDay — Phase 5: Guilds & Cooperative Raids

## Status

**MVP complete.**

Phase 5 turns RuneDay's Friends and Adventure foundations into persistent cooperative progression.

The central rule remains:

**A guild progresses when its members complete real work.**

Guilds do not create a parallel clicker game. Real RuneDay quests are the source of Guild XP and raid damage.

## Guild domain

Phase 5 introduces a dedicated Guild domain.

It owns:

- guild identity;
- membership;
- roles;
- invitations;
- Guild XP ledger;
- per-member contributions;
- Guild Hall progression;
- raid boss catalog;
- active raids;
- raid contributions;
- raid settlement and contributor rewards.

Productivity remains the source of real quest completion.

Game still owns personal XP/gold.

Guild consumes task-completion events and records its own immutable progression sources.

## Membership

A user can belong to only one guild at a time.

A guild can be founded only after the user has created a RuneDay hero.

The founder becomes:

- guild Leader;
- first guild member.

Guild identity includes:

- unique name;
- unique 2–5 character uppercase tag;
- stable slug;
- optional description.

## Roles

Phase 5 includes three guild roles.

### Leader

Can:

- edit guild identity;
- invite friends;
- cancel guild invitations;
- promote Members to Officers;
- demote Officers;
- transfer leadership;
- remove Officers or Members;
- start raids;
- abandon raids;
- disband the guild.

A Leader cannot leave the guild directly.

They must first:

1. transfer leadership; or
2. disband the guild.

### Officer

Can:

- invite accepted RuneDay friends;
- cancel guild invitations;
- start raids;
- remove regular Members.

Officers cannot:

- remove the Leader;
- remove another Officer;
- promote/demote roles;
- transfer leadership;
- disband the guild.

### Member

Can:

- contribute Guild XP;
- contribute raid damage;
- inspect the guild roster;
- inspect Hall progression;
- leave the guild.

## Guild invitations

Guild invitations are intentionally restricted to accepted RuneDay friends.

This prevents Guilds from becoming an unsolicited invite/discovery surface.

Rules:

- Leader or Officer can invite;
- target must be an accepted friend of the inviter;
- target cannot already belong to a guild;
- guild must have available member capacity;
- duplicate pending invite does not duplicate rows;
- accepting one guild invitation cancels the recipient's other pending guild invitations;
- accepted/declined/canceled invitations cannot be reused through stale requests.

Guild invitations generate database notifications.

When an invite is accepted, the inviter receives a guild-member-joined notification.

## Guild Hall

The Guild Hall is derived from total Guild XP rather than stored as a manually mutable level.

### Tiers

| Hall tier  | Guild XP | Member capacity |
| ---------- | -------: | --------------: |
| Camp       |        0 |              10 |
| Tavern     |      500 |              20 |
| Guild Hall |    1,500 |              30 |
| Fortress   |    3,500 |              40 |
| Castle     |    7,500 |              50 |

The UI renders a different pixel-art structure for each Hall tier.

Hall upgrades increase:

- visual status;
- guild capacity;
- available raid bosses.

## Guild XP

Guild XP is ledger-backed.

Each Guild XP operation records:

- guild;
- optional contributing user;
- source type;
- source id;
- XP delta;
- metadata.

The guild also keeps a cached total XP balance for efficient UI rendering.

## Quest contributions

When a member completes a real RuneDay quest, it can contribute Guild XP.

Base Guild XP:

| Quest difficulty | Base Guild XP |
| ---------------- | ------------: |
| Easy             |             3 |
| Normal           |             6 |
| Hard             |            12 |
| Epic             |            20 |

The same RuneDay daily reward factor used by personal XP/loot/Adventure also scales Guild XP.

### Anti-farming

- completions 1–12: 100% Guild XP;
- completions 13–20: 50% Guild XP;
- completion 21+: 0 Guild XP.

A capped task still records a Guild contribution with 0 XP.

That task cannot later be replayed for Guild progression.

## Member contribution stats

Each Guild Member tracks:

- contribution XP;
- contributing quest count;
- lifetime raid damage while in that guild.

These are shown on the Guild roster.

They are informational and do not produce competitive rewards.

## Guild contribution integrity

Task contribution is unique by:

user + task_completion + task id

A real quest can therefore create at most one Guild contribution.

Retries and duplicate client requests cannot grant additional Guild XP.

The Guild contribution ledger never stores:

- task title;
- task notes;
- schedule;
- private task content.

Only safe progression metadata such as difficulty and reward factor is recorded.

## Cooperative raids

A guild can have only one active raid at a time.

Leader or Officer can start raids.

Leader can abandon an active raid.

Expired raids automatically stop receiving task damage.

## Raid boss catalog

Phase 5 installs three raid bosses automatically.

### Briar Colossus

- Hall requirement: Camp;
- HP: 1,200;
- duration: 72 hours;
- victory Guild XP: 300;
- contributor reward: 50 XP + 35 gold.

### Ashen Behemoth

- Hall requirement: Tavern;
- HP: 3,000;
- duration: 72 hours;
- victory Guild XP: 700;
- contributor reward: 100 XP + 70 gold.

### Moon-Eater

- Hall requirement: Guild Hall;
- HP: 6,000;
- duration: 96 hours;
- victory Guild XP: 1,500;
- contributor reward: 180 XP + 120 gold.

Higher raid tiers unlock through real Guild Hall progression.

## Raid combat

There is no raid Attack button.

When a guild member completes a real quest while a raid is active, the completion becomes a raid turn.

Raid damage uses:

- quest difficulty;
- hero Power;
- Focus;
- Luck;
- daily reward factor;
- deterministic critical roll.

Raid critical chance is capped at 25%.

A raid critical deals 1.5x damage.

## Raid anti-farming

The same daily factor applies to raid damage:

- first 12 rewarded quest completions: 100% raid damage;
- completions 13–20: 50% raid damage;
- completion 21+: 0 raid damage.

A capped task still creates a zero-damage raid contribution.

It cannot be replayed later.

## Raid contribution integrity

A task can create at most one raid contribution because raid turns are unique by:

user + task_completion + task id

This remains true even if the browser retries the request.

## Raid victory

When raid HP reaches zero, settlement is server-authoritative and idempotent.

Victory can grant:

### Guild reward

- configured Guild XP for the raid boss.

### Personal contributor reward

Only users who dealt **more than zero raid damage** receive:

- configured personal XP;
- configured gold;
- Raid Victory notification.

A guild member who did not contribute damage receives no personal raid reward.

This prevents passive reward farming.

## Raid settlement idempotency

Raid settlement uses the existing Game reward ledger plus Guild XP ledger.

For each contributor:

user + guild_raid_victory + raid id

is an immutable personal reward source.

The Guild reward uses:

guild + raid_victory + raid id

as its immutable Guild XP source.

Calling settlement repeatedly cannot duplicate:

- Guild XP;
- personal XP;
- gold;
- notifications.

## Raid UI

The Guild page displays:

- active boss sprite;
- boss HP;
- raid deadline;
- total guild raid damage;
- victory rewards;
- contributor damage board;
- member turn counts;
- direct CTA back to Today.

If no raid is active, available raid bosses are shown with Hall requirements and rewards.

## Quest completion overlay

Phase 5 extends the global RuneDay game-event overlay.

Completing a quest can now display, alongside existing Game/Adventure feedback:

- Guild XP gained;
- Guild Hall upgrade;
- raid damage;
- raid critical hit;
- raid HP remaining;
- raid victory;
- Guild XP victory reward;
- personal XP/gold raid reward;
- Hall upgrade caused by raid victory.

This keeps the real-life action and all game consequences in one coherent feedback moment.

## Guild roster

Roster cards show:

- hero sprite;
- hero name;
- handle;
- level;
- guild role;
- Guild XP contribution;
- contributing quest count;
- raid damage.

Leader controls are available inline.

Officer controls are limited according to server-side permissions.

## Recent contributions

The Guild page shows recent safe contribution events:

- contributor;
- difficulty;
- Guild XP;
- whether the daily cap applied.

Private task text is never shown.

## Guild settings

Leader can update:

- guild name;
- tag;
- description.

The guild slug remains stable after creation.

Leader can also disband the guild.

Disbanding deletes guild-owned membership/progression/raid data through database cascades.

It does not delete users' personal RuneDay progress.

## Security & integrity

All Guild state is server-authoritative.

The browser cannot decide:

- guild membership;
- role;
- Hall tier;
- capacity;
- invitation validity;
- raid access;
- raid damage;
- critical outcome;
- raid expiration;
- raid reward eligibility;
- raid settlement.

Important guarantees:

- one guild per user;
- accepted friendship required to invite;
- Hall capacity enforced server-side;
- Leader cannot accidentally leave;
- Officer permissions cannot exceed role;
- task contribution is idempotent;
- raid damage is idempotent;
- daily anti-farming applies to Guild XP and raids;
- zero-damage contributors do not receive raid victory rewards;
- Guild XP and raid rewards are ledger-backed.

## Initial Phase 5 catalog

Fresh migrations install automatically:

- Guild schema;
- membership/invite schema;
- Guild XP ledger;
- contribution ledger;
- raid schema;
- 3 raid bosses.

No manual seeder is required.

## Deferred beyond Phase 5

The following remain intentional future work:

- guild chat;
- free-form guild posts;
- guild discovery directory;
- public guild pages;
- guild emblems/banner editor;
- guild applications;
- guild alliances;
- guild wars;
- seasonal guild leagues;
- world raid events;
- raid mechanics/status effects;
- shared guild inventory;
- guild crafting;
- guild shops;
- monetized cosmetic guild customization.

The existing membership, role, contribution and raid foundations are ready for those systems without rebuilding core Guild identity.
