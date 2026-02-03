// API configuration
// Default to port 3000, but can be overridden via VITE_API_URL env variable
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const API_ENDPOINTS = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',

  // Races
  races: '/races',
  raceStats: '/races/stats',

  // Leaderboard
  leaderboard: '/leaderboard',
  myRank: '/leaderboard/me',

  // Users
  users: '/users',
}
