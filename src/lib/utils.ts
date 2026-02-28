import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes ticker symbols to uppercase and trims whitespace
 * Used to ensure consistent matching with market prices
 */
export function normalizeTickerSymbol(ticker: string | undefined | null): string | undefined {
  if (!ticker) return undefined
  const normalized = ticker.trim().toUpperCase()
  return normalized || undefined
}
