// Access code gate — community tier.
// Free tier: first 3 cases per room, all Foundations, full Defense Strategy.
// Premium: full case banks, Company Tracks, full Behavioral (BEH04+), full Simulator.
// Access code stays permanent even after Stripe goes live (community tier).
// When Stripe goes live: isUnlocked() should also accept a valid Stripe session.
const UNLOCK_KEY = 'pal-access-code-v1';

// Access codes — comparison is case-insensitive at runtime.
// DAI2026 → community code (LinkedIn, word of mouth, direct invite)
const VALID_CODES = ['DAI2026'];

export function isUnlocked() {
  try {
    const stored = localStorage.getItem(UNLOCK_KEY);
    return stored !== null && VALID_CODES.includes(stored.toUpperCase());
  } catch {
    return false;
  }
}

export function tryUnlock(code) {
  const normalized = code.trim().toUpperCase();
  if (VALID_CODES.includes(normalized)) {
    try {
      localStorage.setItem(UNLOCK_KEY, normalized);
    } catch {
      // ignore — storage unavailable
    }
    return true;
  }
  return false;
}

export function lock() {
  try {
    localStorage.removeItem(UNLOCK_KEY);
  } catch {
    // ignore
  }
}

export function getStoredCode() {
  try {
    return localStorage.getItem(UNLOCK_KEY) || null;
  } catch {
    return null;
  }
}

// Tier system — three levels:
// 'anonymous' : not signed in. Can browse rooms, cannot run any content.
// 'free'      : signed in, no access code. isFree cases + Foundations + Easy SQL.
// 'premium'   : signed in + access code (DAI2026) or future Stripe subscription.
//               Full access to all rooms, all SQL tiers, all company tracks.
// When Stripe goes live: isUnlocked() will also accept a valid subscription token.
export function getAccessTier(user) {
  if (isUnlocked()) return 'premium';
  if (user) return 'free';
  return 'anonymous';
}
