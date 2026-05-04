type AnalyticsPayload = Record<string, unknown>;

function safeStringify(payload: AnalyticsPayload): string {
  try {
    return JSON.stringify(payload);
  } catch {
    return "{}";
  }
}

export function trackEvent(name: string, payload: AnalyticsPayload = {}) {
  const event = {
    name,
    payload,
    ts: Date.now(),
  };

  // Lightweight local telemetry for debugging and future wiring.
  console.info("[analytics]", name, payload);
  window.dispatchEvent(new CustomEvent("codetradehub:analytics", { detail: event }));

  // Optional GA4 hook if already available on window.
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", name, payload);
  }

  // Optional Plausible hook if available.
  const plausible = (window as unknown as { plausible?: (event: string, options?: { props?: AnalyticsPayload }) => void }).plausible;
  if (typeof plausible === "function") {
    plausible(name, { props: payload });
  }

  // Keep this to support quick log shipping in future if needed.
  void safeStringify(event);
}
