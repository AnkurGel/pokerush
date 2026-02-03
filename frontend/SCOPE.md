# TypeRacer Clone - Application Scope

## Overview

A multiplayer online typing race game where players compete by typing passages as quickly and accurately as possible. Cars advance on a track based on typing progress, creating a visual racing experience.

---

## Full Feature Analysis (Based on TypeRacer)

### 1. Core Gameplay

| Feature | Description |
|---------|-------------|
| **Racing Mechanic** | Car advances on track as user types correctly |
| **Text Passages** | Quotes from books, movies, songs, games |
| **Real-time Progress** | Visual feedback showing all racers' positions |
| **Error Handling** | Must fix typos before continuing (word turns red) |
| **WPM Calculation** | Words per minute speed tracking |
| **Accuracy Tracking** | Percentage of correct keystrokes |

### 2. Game Modes

| Mode | Description |
|------|-------------|
| **Multiplayer (Public)** | Race against random online players |
| **Practice (Solo)** | Race alone against ghost/timer |
| **Private Race** | Create room, invite friends (up to 200) |
| **Instant Death** | Single typo = disqualification |

### 3. Universes (Text Categories)

- Main (general quotes)
- Numbers only
- Long texts
- Anime quotes
- Movie quotes
- Song lyrics
- Custom universes

### 4. User System

| Feature | Description |
|---------|-------------|
| **Guest Play** | Play without account (no stats saved) |
| **Registration** | Email/password account creation |
| **Profile Page** | Avatar, bio, country, stats display |
| **Skill Levels** | 6 tiers based on average WPM |
| **Premium Tier** | Paid features ($12/year on TypeRacer) |

### 5. Statistics & Tracking

| Metric | Description |
|--------|-------------|
| **Races Completed** | Total race count |
| **Average WPM** | All-time average speed |
| **Recent Average** | Last 10 races average |
| **Best WPM** | Personal record |
| **Text Bests** | Best score per unique text |
| **Accuracy %** | Overall accuracy rate |
| **Points** | Cumulative score |
| **Games Won** | Victory count |
| **Race History** | Full log of past races |

### 6. Leaderboards

| Type | Description |
|------|-------------|
| **Latest High Scores** | Recent top performances |
| **Fastest Typists** | All-time speed rankings |
| **Most Races** | Highest race counts |
| **Daily/Weekly/Monthly** | Time-bounded rankings |

### 7. Social Features

| Feature | Description |
|---------|-------------|
| **Friends List** | Add/manage friends |
| **Private Lobbies** | Invite-only race rooms |
| **Chat** | In-game/lobby chat |
| **Embeddable Badge** | Share stats on external sites |
| **Race Replay** | Keystroke replay for verification |

### 8. Anti-Cheat Measures

- CAPTCHA for speeds >100 WPM
- Keystroke replay logging
- Lag compensation (registered vs unlagged WPM)
- Guest exclusion from leaderboards

### 9. Premium Features

- Custom avatars/profile pictures
- Ad-free experience
- Full race history export (CSV)
- Practice mode score saving
- Profile customization

### 10. Technical Features

| Feature | Description |
|---------|-------------|
| **Real-time Sync** | WebSocket for live race updates |
| **Matchmaking** | Group players by skill level |
| **API** | Public endpoints for stats/history |
| **Responsive Design** | Desktop + mobile support |

---

## MVP Proposal Options

### Option A: Solo Practice Mode (Simplest)
**Scope:** Single-player typing test with basic stats

- [ ] Text display with character-by-character validation
- [ ] WPM and accuracy calculation
- [ ] Visual car/progress indicator
- [ ] Basic results screen
- [ ] Local storage for personal bests

**Tech:** Pure frontend (HTML/CSS/JS or React)

---

### Option B: Multiplayer Racing (Core Experience)
**Scope:** Real-time racing against others

Everything in Option A, plus:
- [ ] User registration/login
- [ ] Real-time multiplayer (WebSockets)
- [ ] Race lobby/matchmaking
- [ ] Live opponent progress display
- [ ] Basic leaderboard

**Tech:** Frontend + Backend + WebSocket server + Database

---

### Option C: Full Social Platform (Extended MVP)
**Scope:** Complete competitive typing platform

Everything in Option B, plus:
- [ ] User profiles with stats history
- [ ] Friends system
- [ ] Private race rooms
- [ ] Multiple text categories
- [ ] Comprehensive leaderboards
- [ ] Race history/replay

**Tech:** Full stack with additional infrastructure

---

## Recommended MVP: Option A + Partial B

A balanced starting point:

### Phase 1: Core Typing Game
1. **Text Display Engine**
   - Show passage to type
   - Highlight current word
   - Character-by-character validation
   - Error highlighting (red on mistake)

2. **Progress Visualization**
   - Car/progress bar that advances with correct typing
   - Percentage complete indicator

3. **Metrics Calculation**
   - Real-time WPM display
   - Final accuracy percentage
   - Time elapsed

4. **Results Screen**
   - Final WPM, accuracy, time
   - Comparison to average
   - "Race Again" option

5. **Text Library**
   - Curated set of 20-50 quotes
   - Random selection per race

### Phase 2: Persistence & Competition
6. **Local Leaderboard**
   - Store scores in localStorage
   - Display personal best times per text

7. **User Accounts (Optional)**
   - Simple auth (email/password)
   - Persist stats to database

### Phase 3: Multiplayer (Future)
8. **Real-time Racing**
   - WebSocket server
   - Race rooms
   - Live opponent cars

---

## Technology Recommendations

| Layer | Recommendation |
|-------|----------------|
| **Frontend** | React or vanilla JS |
| **Styling** | Tailwind CSS |
| **Backend** | Node.js + Express |
| **Real-time** | Socket.io or WebSockets |
| **Database** | PostgreSQL or MongoDB |
| **Auth** | JWT or session-based |
| **Hosting** | Vercel/Railway/Render |

---

## Sources

- [TypeRacer Official](https://play.typeracer.com/)
- [TypeRacer Wikipedia](https://en.wikipedia.org/wiki/TypeRacer)
- [TypeRacer Wiki - Leaderboards](https://typeracer.fandom.com/wiki/Leaderboards)
- [TypeRacer Data](https://www.typeracerdata.com/about)
- [TypeRacer Blog - Speed Records](https://blog.typeracer.com/2017/07/09/a-history-of-typeracer-speed-records/)
