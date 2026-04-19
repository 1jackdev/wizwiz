# wizwiz

A character management system for tabletop RPGs. Built with a Python/FastAPI backend and React Native mobile app.

## Features

### Character Management
- Create, update, search, and delete characters
- 12 D&D classes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
- 14 species with racial ability bonuses (Human, High/Wood/Dark Elf, Hill/Mountain Dwarf, Lightfoot/Stout Halfling, Half-Elf, Half-Orc, Tiefling, Dragonborn, Forest/Rock Gnome)
- Levels 1–20 with auto-calculated proficiency bonus
- 6 core abilities (STR, DEX, CON, INT, WIS, CHA) with standard array scoring based on class priority
- 18 skills with proficiency levels (None, Proficient, Expertise) and computed modifiers
- Saving throws calculated from abilities
- Character descriptions: height, weight, eye/hair color, backstory, appearance
- Update logging with old/new value tracking

### Dice Rolling
- Client-side dice roller in the mobile app
- D4, D6, D8, D10, D12, D20
- Animated rolling with physics-style waypoint movement
- Roll history tracking
- Multi-dice selection (up to 20 of each type)
- Double-tap to roll

### Authentication
- JWT-based auth with bcrypt password hashing
- Configurable token expiration

## Architecture

### Backend
- **Framework**: FastAPI + Uvicorn
- **Database**: SQLAlchemy 2.0 + SQLite + Alembic migrations
- **Validation**: Pydantic v2
- **DI**: dependency-injector containers
- **Pattern**: CQRS event bus — commands produce events, events persist to database

```
Command → CommandHandler → Event → EventHandler → Database
```

Commands: `CreateCharacter`, `UpdateCharacter`, `DeleteCharacter`, `CreateUser`

### Mobile
- React Native with TypeScript
- SVG dice shapes with 3D-projection detail lines

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/user/create` | Register user |
| GET | `/user/search?username=` | Find user by username |
| GET | `/user/{id}/details` | Get user details |
| POST | `/character/create` | Create character |
| GET | `/character/user/{user_id}` | List user's characters |
| GET | `/character/{id}/details` | Full character sheet |
| GET | `/character/search?name=` | Find character by name |
| PUT | `/character/{id}/update` | Update character |
| DELETE | `/character/{id}/delete` | Delete character |

## Setup

### Requirements
- Python 3.12+
- [PDM](https://pdm-project.org/) package manager

### Backend

```bash
# Install dependencies
pdm install

# Run migrations
pdm run alembic upgrade head

# Start server
pdm run python -m backend.app.http.main
```

Server runs on `0.0.0.0:8080` by default.

### Configuration

Environment variables (or `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `ENV` | `local` | Environment name |
| `DB_PATH` | `./wizwiz.db` | SQLite database path |
| `SECRET_KEY` | — | JWT signing key |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8080` | Server port |

### Testing

```bash
pdm run pytest
```

Tests use an in-memory SQLite database.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Database | SQLite + Alembic |
| Auth | PyJWT + bcrypt |
| DI | dependency-injector |
| Mobile | React Native, TypeScript, react-native-svg |
| Testing | pytest, factory-boy, httpx |
| Formatting | Black, isort, mypy (strict) |
