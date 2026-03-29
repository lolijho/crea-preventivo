import { BusinessProfile, GeneratedQuote, UsageStats, UsageEntry } from '@/types';

const PROFILE_KEY = 'crea-preventivo-profile';
const QUOTES_KEY = 'crea-preventivo-quotes';
const USAGE_KEY = 'crea-preventivo-usage';

export function getProfile(): BusinessProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: BusinessProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getQuotes(): GeneratedQuote[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(QUOTES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveQuote(quote: GeneratedQuote): void {
  const quotes = getQuotes();
  quotes.unshift(quote);
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

export function deleteQuote(id: string): void {
  const quotes = getQuotes().filter(q => q.id !== id);
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

export function getUsageStats(): UsageStats {
  if (typeof window === 'undefined') {
    return { totalInputTokens: 0, totalOutputTokens: 0, totalRequests: 0, history: [] };
  }
  const data = localStorage.getItem(USAGE_KEY);
  return data
    ? JSON.parse(data)
    : { totalInputTokens: 0, totalOutputTokens: 0, totalRequests: 0, history: [] };
}

export function addUsageEntry(entry: UsageEntry): void {
  const stats = getUsageStats();
  stats.totalInputTokens += entry.inputTokens;
  stats.totalOutputTokens += entry.outputTokens;
  stats.totalRequests += 1;
  stats.history.unshift(entry);
  localStorage.setItem(USAGE_KEY, JSON.stringify(stats));
}

export function resetUsageStats(): void {
  localStorage.setItem(
    USAGE_KEY,
    JSON.stringify({ totalInputTokens: 0, totalOutputTokens: 0, totalRequests: 0, history: [] })
  );
}
