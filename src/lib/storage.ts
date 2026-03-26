import { BusinessProfile, GeneratedQuote } from '@/types';

const PROFILE_KEY = 'crea-preventivo-profile';
const QUOTES_KEY = 'crea-preventivo-quotes';

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
