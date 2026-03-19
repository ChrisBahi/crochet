/**
 * Canonical app URL — always resolves to the production domain.
 * Set NEXT_PUBLIC_APP_URL=https://crochett.ai in Vercel environment variables.
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://crochett.ai"
