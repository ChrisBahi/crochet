/**
 * Retry wrapper for Anthropic AI calls with exponential backoff.
 * Handles transient errors: rate limits (429), server errors (5xx), network failures.
 * Guarantees a result or throws after maxAttempts.
 */

const RETRYABLE_STATUSES = [429, 500, 502, 503, 504]

export async function withRetry<T>(
  fn: () => Promise<T>,
  label = "AI call",
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const status = (err as { status?: number })?.status
      const message = (err as { message?: string })?.message ?? ""

      // Determine if this error is retryable
      const isStatusRetryable = status != null && RETRYABLE_STATUSES.includes(status)
      const isNetworkError = !status && (
        message.includes("ECONNRESET") ||
        message.includes("ETIMEDOUT") ||
        message.includes("fetch failed") ||
        message.includes("network")
      )
      const isRetryable = isStatusRetryable || isNetworkError

      if (!isRetryable || attempt === maxAttempts) {
        console.error(`[withRetry] ${label} — final failure after ${attempt} attempt(s):`, err)
        throw err
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1) // 1s, 2s, 4s
      console.warn(
        `[withRetry] ${label} — attempt ${attempt}/${maxAttempts} failed (status ${status ?? "network"}), retrying in ${delay}ms…`
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
