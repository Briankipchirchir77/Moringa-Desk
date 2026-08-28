// The real Flask API's root ('http://localhost:5000', or wherever it's
// deployed) when VITE_API_URL is set; otherwise '/api', which the MSW mock
// backend intercepts. Centralized here so baseApi.js/authApi.js/usersApi.js
// all resolve the same way instead of duplicating (and risking drifting)
// this fallback logic three times.
export function apiBaseUrl() {
  const url = import.meta.env.VITE_API_URL;
  return url ? url.replace(/\/$/, '') : '/api';
}

// Parses a fetch Response body as JSON, tolerating an empty or non-JSON
// body (no backend running, a proxy error page, a timed-out request)
// instead of throwing a raw "Unexpected end of JSON input" parser error.
export async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
