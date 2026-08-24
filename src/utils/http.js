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
