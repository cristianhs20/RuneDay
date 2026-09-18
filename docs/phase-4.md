# RuneDay — Phase 4: Friends & Social

## Status

**MVP complete.**

Phase 4 adds a deliberate social layer around RuneDay's productivity, hero and Adventure systems without turning the product into an open social network.

The core social principle is:

**Share progression, not private life data.**

RuneDay social profiles never expose task titles, notes, reminders, email addresses, calendar details or private productivity content.

## Social domain

Phase 4 introduces a dedicated Social domain.

It owns:

- social profiles;
- handles;
- friend codes;
- friend requests;
- friendships;
- blocks;
- social activities;
- reactions;
- social privacy rules;
- social feed snapshots.

Productivity, Game and Adventure publish safe milestone events into Social.

## Social profile

A Social Profile is created automatically when a user registers.

Existing users are supported through lazy profile creation.

Each profile has:

- unique handle;
- stable friend code;
- optional bio;
- profile visibility;
- activity visibility;
- friend-request preference;
- Adventure visibility;
- hero-stat visibility;
- achievement visibility.

### Safe defaults

New profiles default to:

- Profile visibility: Friends;
- Activity visibility: Friends;
- Friend requests: enabled;
- Adventure summary: visible;
- hero stats: visible;
- achievements: visible.

Public exposure is opt-in.

## Friend code & handle

Users can connect using either:

- exact @handle;
- 8-character friend code.

Friend codes intentionally avoid ambiguous characters.

RuneDay does not ship a global people directory in Phase 4.

Discovery is deliberate rather than algorithmic.

## Friend requests

Friend requests are directional until accepted.

Supported states:

- Pending;
- Accepted;
- Declined;
- Canceled.

Rules:

- users cannot request themselves;
- duplicate pending requests do not create duplicate rows;
- crossed requests automatically become a friendship;
- friendship storage is canonical regardless of who sent the request;
- accepting the same request repeatedly does not duplicate friendship;
- declined/canceled requests cannot later be accepted through stale actions;
- users can disable new friend requests;
- requests are rate-limited.

Friend request and friend acceptance events create database notifications.

## Friendships

A friendship is stored using a canonical low-user/high-user pair.

This guarantees one friendship per pair independent of direction.

Friends can:

- inspect each other's allowed social profile;
- see allowed milestone activity;
- react to activity;
- appear in each other's Party standings.

Removing a friend does not delete either user's progression or historical game data.

## Blocking

Phase 4 includes blocking from the beginning.

Blocking another user:

- removes an existing friendship;
- cancels pending requests in either direction;
- prevents profile visibility between both users;
- prevents social activity visibility between both users;
- prevents new friend requests until unblocked.

The blocker can review and remove blocks from Social Profile settings.

## Privacy

### Profile visibility

Options:

- Public;
- Friends only;
- Only me.

A Public profile can be opened without authentication at:

/u/{handle}

Friends-only profiles are available only to accepted friends and the owner.

Private profiles are available only to the owner.

Blocks override all visibility levels, including Public.

### Activity visibility

Options:

- Public;
- Friends only;
- Only me.

Changing Activity visibility updates existing milestone posts as well as future activity.

This means privacy changes are retroactive rather than applying only to new posts.

### Optional profile sections

Users can independently disable:

- Adventure progress;
- RPG stats;
- achievements.

Friend cards also respect Adventure visibility.

## Public profile

The inspectable profile can show, subject to the owner's settings:

- hero sprite;
- hero name;
- handle;
- level;
- archetype;
- current equipment;
- Power;
- Guard;
- Focus;
- Luck;
- Gear Score;
- Adventure Renown;
- victories;
- boss victories;
- total Adventure damage;
- recent achievements;
- recent visible social milestones;
- friend count.

The server deliberately omits:

- gold;
- total XP;
- friend code;
- email;
- task data;
- notes;
- reminders;
- calendar data.

## Share cards

Public profiles support:

- native Web Share where available;
- copy profile URL;
- downloadable PNG share card generated locally in the browser.

The PNG card includes:

- rendered RuneDay hero;
- hero name;
- handle;
- level;
- visible social metrics;
- RuneDay branding.

No external rendering service or third-party image processor is required.

If a profile is Friends-only or Private, external sharing controls are not shown.

## Social activity

Social activity is created by domain services, not by web-button code.

This means future mobile/API clients receive the same behavior.

Phase 4 publishes only meaningful game milestones.

Current activity types:

- Hero created;
- Level up;
- Achievement unlocked;
- Rare/Epic loot found;
- first-clear boss victory;
- region unlocked.

Task completion itself is not published.

Task titles and task metadata are never copied into Social activity.

### Idempotency

Every activity uses:

user + source_type + source_id

as an immutable social source.

Retries cannot publish the same milestone multiple times.

## Party feed

The Friends feed contains:

- the user's own visible milestones;
- accepted friends' Public or Friends activity.

It does not contain Public activity from strangers.

Phase 4 intentionally does not include:

- global discovery feed;
- trending feed;
- suggested accounts;
- algorithmic recommendations.

This keeps the social loop centered on people the user intentionally added.

## Reactions

Safe predefined reactions are supported:

- Cheer;
- Fire;
- Sword;
- Crown.

Rules:

- one active reaction per user/activity;
- selecting the same reaction again removes it;
- choosing a different reaction replaces the existing one;
- users cannot react to their own activity;
- hidden activity cannot be reacted to;
- blocked users cannot interact;
- first reaction creates a notification;
- repeatedly switching reaction type does not create notification spam;
- reaction actions are rate-limited.

There is no free-form comment system in Phase 4.

## Party standings

Friends includes a private Party standings panel.

Ranking uses:

1. hero level;
2. handle as deterministic tie-breaker.

The ranking contains only:

- the current user;
- accepted friends.

There are no rewards, currencies or competitive bonuses for ranking position.

RuneDay does not rank users by raw checkbox/task count.

## Notifications

Phase 4 adds database notifications for:

- incoming friend request;
- accepted friend request;
- first social reaction.

These reuse the existing RuneDay notification center.

## Social milestone integrations

Phase 4 connects to earlier domains.

### Game

Game can publish:

- hero creation;
- level up;
- Achievement unlock;
- Rare/Epic loot.

### Adventure

Adventure can publish:

- first boss clear;
- newly unlocked region.

No Social activity can directly mutate Game or Adventure progression.

## Security & integrity

All relationship and visibility decisions are server-authoritative.

The client cannot decide:

- whether two users are friends;
- whether a profile is visible;
- whether an activity is visible;
- whether a reaction is allowed;
- whether a block applies.

Important guarantees:

- blocks override Public visibility;
- crossed requests cannot duplicate friendships;
- stale requests cannot be accepted;
- reactions require visibility permission;
- public profile payload omits private economy/task data;
- milestone payloads use explicit safe fields only.

## Deferred beyond Phase 4

The following remain intentionally outside this phase:

- Guilds;
- Guild Hall;
- guild roles;
- raids;
- party/guild chat;
- free-form comments;
- DMs;
- public people directory;
- global social feed;
- social recommendations;
- follow model;
- moderation tooling required for open text communities;
- seasons and social leaderboards beyond private friends.

Guilds are now the natural next social expansion because the friend/profile foundations, privacy layer, hero inspection and social activity system are already in place.
