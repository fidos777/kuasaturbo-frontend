type TrackEventName =
  | "tab_view"
  | "work_start"
  | "work_run"
  | "work_save_draft"
  | "estimator_used"
  | "conversion_click"
  | "feature_request_submit";

const ALLOWED_EVENTS: TrackEventName[] = [
  "tab_view",
  "work_start",
  "work_run",
  "work_save_draft",
  "estimator_used",
  "conversion_click",
  "feature_request_submit",
];

function getAnonId(): string {
  if (typeof window === "undefined") return "";
  const key = "kt_anon_id";
  let id = localStorage.getItem(key);
  if (!id) {
    // crypto.randomUUID supported by modern browsers; fallback for safety
    const c = globalThis.crypto as { randomUUID?: () => string };
    id = c?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export async function trackEvent(
  eventName: TrackEventName,
  data: Record<string, unknown> = {}
): Promise<void> {
  if (!ALLOWED_EVENTS.includes(eventName)) return;

  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pathname": typeof window !== "undefined" ? window.location.pathname : "",
      },
      body: JSON.stringify({
        event_name: eventName,
        anon_id: getAnonId(),
        data,
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    // silent fail
  }
}
