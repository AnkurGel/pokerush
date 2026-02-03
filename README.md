# PokéRush

A Pokemon-themed typing speed game with local and cloud leaderboards.

## Project Structure

```
pokerush/
├── frontend/          # Vue 3 frontend application
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── composables/    # Vue composables (hooks)
│   │   ├── config/         # Configuration files
│   │   ├── data/           # Static data (quotes)
│   │   └── styles/         # CSS styles
│   └── package.json
│
├── backend/           # NestJS backend API
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # Users module
│   │   ├── races/         # Races module
│   │   ├── leaderboard/   # Leaderboard module
│   │   └── common/        # Shared utilities
│   └── package.json
│
└── README.md
```

## Features

### Local Features (No Account Required)
- Type quotes to catch Pokemon
- Track personal bests per quote
- Race history with sorting and filtering
- Statistics dashboard (WPM, accuracy, time)
- Pokemon collection gallery
- WPM improvement tracking

### Cloud Features (Account Required)
- User registration and login
- Cloud sync of race results
- Global leaderboard (all-time, weekly, monthly)
- Personal rank tracking

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Environment Variables

#### Frontend (optional)
Create `.env` in the frontend directory:
```
VITE_API_URL=http://localhost:3000/api
```

#### Backend (optional)
Set environment variables:
```
JWT_SECRET=your-secret-key-change-in-production
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/logout` - Logout (client-side)
- `GET /api/auth/me` - Get current user

### Races
- `POST /api/races` - Submit race result (protected)
- `GET /api/races` - Get user's race history (protected)
- `GET /api/races/:id` - Get single race (protected)
- `GET /api/races/stats` - Get user stats (protected)

### Leaderboard
- `GET /api/leaderboard` - Global top scores
- `GET /api/leaderboard?quote=:id` - Per-quote rankings
- `GET /api/leaderboard?period=weekly|monthly|alltime` - Time-filtered
- `GET /api/leaderboard/user/:id` - User's rank
- `GET /api/leaderboard/me` - Current user's rank (protected)

### Users
- `GET /api/users/:id` - Public profile
- `PUT /api/users/me` - Update profile (protected)

## Tech Stack

### Frontend
- Vue 3 (Composition API)
- Tailwind CSS
- Vite

### Backend
- NestJS (TypeScript)
- TypeORM
- SQLite (development)
- JWT authentication
- class-validator

## Development

### Database
The backend uses SQLite with `synchronize: true` for development, which automatically creates tables based on entity definitions.

For production, switch to PostgreSQL and disable synchronize:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false, // Use migrations in production
})
```
