// Input sanitization and validation utilities for API routes

/**
 * Sanitizes a string input by trimming whitespace and removing potentially dangerous characters.
 * Allows alphanumeric, Turkish characters, spaces, slashes, dots, hyphens, underscores, and commas.
 */
export function sanitizeInput(input: string | undefined | null, maxLength: number = 200): string {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  // Allow safe characters: alphanumeric, Turkish chars, spaces, / . - _ , :
  // First strip HTML tags, then remove remaining dangerous characters
  const noTags = trimmed.replace(/<[^>]*>/g, "");
  const stripped = noTags.replace(/[<>"'`;&=|!@#$%^*(){}[\]\\~]+/g, "");
  return stripped;
}

/**
 * Validates and sanitizes query parameters from NextRequest.
 * Returns sanitized values or throws if required params are missing.
 */
export function validateQueryParams(
  params: URLSearchParams,
  required: string[] = []
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = sanitizeInput(value);
  }
  for (const req of required) {
    if (!result[req]) {
      throw new Error(`Eksik gerekli parametre: ${req}`);
    }
  }
  return result;
}

/**
 * Validates a parcel ID parameter - must be a positive integer.
 */
export function validateParcelId(id: string | undefined | null): number | null {
  if (!id) return null;
  const num = parseInt(id, 10);
  if (isNaN(num) || num <= 0) return null;
  return num;
}

/**
 * Validates a municipality key - must match known municipalities pattern.
 */
export function validateMunicipality(key: string | undefined | null): string | null {
  if (!key || typeof key !== "string") return null;
  const sanitized = sanitizeInput(key, 50).toLocaleLowerCase("tr");
  if (!/^[a-zçğıöşüı]+$/.test(sanitized)) return null;
  return sanitized;
}

/**
 * Sanitizes a search query for parcel/ada searches.
 * Allows formats like "1/1", "100/1", "5", etc.
 */
export function sanitizeParcelQuery(query: string | undefined | null): string | null {
  if (!query || typeof query !== "string") return null;
  const trimmed = query.trim();
  if (!trimmed) return null;
  // Allow numbers, slashes, dots, hyphens
  const sanitized = trimmed.replace(/[^0-9/\.\-]/g, "");
  if (!sanitized) return null;
  return sanitized;
}

/**
 * Rate limiting helper - simple in-memory counter per IP.
 * In production, use Redis or similar for distributed rate limiting.
 */
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60_000, maxRequests: number = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(ip: string): boolean {
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record || now > record.resetTime) {
      this.requests.set(ip, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

// Default rate limiter: 30 requests per minute per IP
export const rateLimiter = new RateLimiter();

/**
 * Get client IP from NextRequest, respecting proxies.
 */
export function getClientIp(request: { headers: Headers }): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}
