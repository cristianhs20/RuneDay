# RuneDay Authored Animation Spec v1

## Purpose

Phase B proved the motion states and compatibility architecture.

Phase C replaces prototype pose motion with authored frame-by-frame animation for the Base Hero.

The goal is not maximum frame count.

The goal is:

- readable motion;
- strong anticipation;
- clean equipment attachment;
- lineage personality;
- small-screen clarity.

## Canonical animation states

### Idle

Target:

- 4 authored frames;
- 4 FPS;
- seamless loop.

Motion:

- slight breathing;
- small weight shift;
- optional lineage-specific secondary motion.

Avoid constant bouncing.

### Walk

Target:

- 8 authored frames;
- 10 FPS;
- seamless loop.

Requirements:

- clear contact/pass/recoil rhythm;
- boots remain grounded;
- weapon grip remains stable;
- cape/hair motion is delayed slightly from torso;
- Ogre feels heavier;
- Elf feels lighter;
- Skeleton remains readable rather than jittery.

### Attack

Target:

- 6 authored frames;
- 12 FPS;
- one-shot.

Frame intent:

1. anticipation;
2. load;
3. strike start;
4. impact;
5. follow-through;
6. settle.

Requirements:

- weapon remains attached to grip;
- weapon arc is easy to read;
- silhouette changes strongly enough to feel rewarding;
- attack does not obscure the entire hero.

### Cast

Target:

- 8 authored frames;
- 10 FPS;
- one-shot.

Frame intent:

1. prepare;
2. raise focus point;
3. charge;
4. charge peak;
5. release;
6. release peak;
7. settle;
8. return.

Requirements:

- casting focal point must be obvious;
- Skeleton soul eyes may participate subtly;
- Ogre casting should still feel heavy and intentional;
- magic effect does not replace body acting.

### Celebrate

Target:

- 6 authored frames;
- 9 FPS;
- one-shot.

This is one of the most important RuneDay animations because it rewards real-life progress.

Target emotion:

- joy;
- pride;
- momentum.

Lineage flavor is encouraged:

- Human: confident cheer;
- Elf: elegant celebratory motion;
- Skeleton: magical/quirky triumph;
- Ogre: powerful victory gesture.

### Hurt

Target:

- 4 authored frames;
- 10 FPS;
- one-shot.

Requirements:

- fast readable impact;
- no gore;
- no prolonged suffering;
- equipment remains attached;
- immediately recoverable to gameplay pose.

## Root travel

Maximum root travel inherited from Phase A:

| State     | Max root travel |
| --------- | --------------: |
| Idle      |            2 px |
| Walk      |            1 px |
| Attack    |            5 px |
| Cast      |            2 px |
| Celebrate |            5 px |
| Hurt      |            3 px |

Root movement is measured against the canonical baseline.

## Lineage motion identity

### Human

Reference motion.

Balanced timing and weight.

### Elf

Slightly:

- quicker anticipation;
- cleaner arcs;
- lighter recovery.

Do not make Elf mechanically faster in gameplay.

This is visual acting only.

### Skeleton

Motion can include:

- subtle skull/jaw secondary motion;
- soul-eye pulse on Cast;
- slightly sharper limb timing.

Avoid slapstick.

### Ogre

Motion should communicate weight through:

- longer anticipation poses;
- stronger follow-through;
- broader silhouette changes.

Do not change actual gameplay timing without game-balance approval.

## Three-view requirements

Authoring order:

1. Front;
2. Side;
3. Back.

Front animation must be approved before side/back production begins.

Side/back must preserve:

- frame timing;
- root timing;
- equipment sockets.

## Equipment attachment contract

Each frame must provide the canonical sockets.

At minimum:

- weapon grip;
- head;
- shoulders;
- back;
- feet.

Equipment animation should be derived from socket motion rather than independently guessed.

## Secondary motion

Hair/capes may use secondary motion.

Rules:

- one-frame delay is usually enough;
- never detach visually;
- do not create separate timing per equipment item unless needed;
- motion must remain readable at native size.

## FX timing

FX belongs in dedicated FX layers.

Do not bake magic glow into the body layer unless it is lineage anatomy, such as Skeleton soul eyes.

Attack/cast FX should define:

- start frame;
- peak frame;
- end frame.

## Animation QA

Each animation must be reviewed:

- naked/base hero;
- starter equipment;
- Epic benchmark equipment;
- all launch lineages;
- all legal body frames.

The B5 stress matrix remains the primary compatibility environment.
