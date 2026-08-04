/**
 * Global ban enforcement.
 *
 * When the signed-in user's profile status is `banned` / `suspended`:
 *  - a full-screen notice is rendered (see BanGate)
 *  - every write request (Supabase REST/RPC, backend API) is blocked client-side
 *
 * The database also enforces this with RESTRICTIVE RLS policies
 * (`public.is_banned`), so removing the overlay via devtools changes nothing.
 */

export const BAN_MESSAGE =
  "Your account has been banned. Please contact support for further information.";

let banned = false;
let reason: string | null = null;
let installed = false;

export function isBannedNow() {
  return banned;
}
export function getBanReason() {
  return reason;
}

export function assertNotBanned() {
  if (banned) throw new Error(BAN_MESSAGE);
}

function installFetchGuard() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (banned) {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const method = (
        init?.method ??
        (input instanceof Request ? input.method : "GET")
      ).toUpperCase();
      const isAuth = url.includes("/auth/v1/");
      const isWrite = method !== "GET" && method !== "HEAD";
      const isRpc = url.includes("/rest/v1/rpc/");
      if (!isAuth && (isWrite || isRpc)) {
        return new Response(JSON.stringify({ error: BAN_MESSAGE }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return original(input, init);
  };
}

export function setBanState(next: boolean, nextReason: string | null) {
  banned = next;
  reason = nextReason;
  if (next) installFetchGuard();
}
