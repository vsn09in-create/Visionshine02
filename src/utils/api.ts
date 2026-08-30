/**
 * Safe API response wrapper to prevent "Unexpected token 'T', 'The page c'... is not valid JSON" errors
 * when endpoints return HTML (e.g. 404, 502, Google Auth redirects, or server-side error pages).
 */

export interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  rawText: string;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    const rawText = await res.text();
    let parsed: any = null;

    if (rawText && rawText.trim()) {
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // If response is HTML or plaintext (e.g. 404 page, Google error)
        let cleanText = rawText;
        if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(rawText, 'text/html');
            cleanText = doc.body.textContent?.trim() || doc.title || rawText;
          } catch {
            // fallback to regex
          }
        }
        cleanText = cleanText.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').slice(0, 200).trim();
        parsed = {
          success: false,
          message: cleanText || `Request failed with HTTP status ${res.status}`,
          status: res.status,
        };
      }
    } else {
      parsed = {
        success: res.ok,
        status: res.status,
      };
    }

    return {
      ok: res.ok,
      status: res.status,
      data: parsed as T,
      rawText,
    };
  } catch (err: any) {
    const message = err?.message || 'Network connection failed. Please check your connection and retry.';
    return {
      ok: false,
      status: 0,
      data: {
        success: false,
        message,
      } as unknown as T,
      rawText: message,
    };
  }
}
