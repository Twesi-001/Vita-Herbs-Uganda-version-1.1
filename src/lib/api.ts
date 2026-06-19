/**
 * Base URL for the KarOrganicsAPI.
 *
 * Set `VITE_API_URL` in an `.env` file (e.g. `.env.local` for development):
 *   VITE_API_URL=http://localhost:4000/api
 *
 * Falls back to the local backend if the variable is not set.
 */
const fromEnv = import.meta.env.VITE_API_URL as string | undefined;

export const API_URL = (fromEnv?.replace(/\/$/, '')) || 'http://localhost:4000/api';
