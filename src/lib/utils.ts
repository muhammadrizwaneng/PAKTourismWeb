// Helper to parse JSON stored as string in SQLite
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Helper to stringify array/object for SQLite storage
export function toJson(value: unknown): string {
  return JSON.stringify(value);
}

// Build slug from title
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Format price in PKR
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Render star rating (returns 0-5)
export function clampRating(rating: number): number {
  return Math.max(0, Math.min(5, rating));
}

// Paginate helper for API routes
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// Standard API response builders
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function apiError(message: string, status = 400) {
  return { success: false, error: message, status };
}
