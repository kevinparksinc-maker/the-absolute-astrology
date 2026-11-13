import { COOKIE_NAME, OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

type PublicRuntimeConfig = {
  appId?: string;
  oauthPortalUrl?: string;
};

let runtimeConfigPromise: Promise<PublicRuntimeConfig> | null = null;

function loadRuntimeConfig() {
  if (!runtimeConfigPromise) {
    runtimeConfigPromise = fetch("/api/runtime-config", { credentials: "same-origin" })
      .then(async response => {
        if (!response.ok) throw new Error(`Runtime configuration request failed (${response.status})`);
        return response.json() as Promise<PublicRuntimeConfig>;
      })
      .catch(error => {
        runtimeConfigPromise = null;
        throw error;
      });
  }

  return runtimeConfigPromise;
}

// Start the Manus OAuth login only from an event handler or effect. Runtime
// configuration keeps the public project ID and OAuth portal out of the static
// build, so the same artifact works in Preview and production.
export const startLogin = async (): Promise<void> => {
  if (window.location.pathname === "/account") return;
  window.location.assign(`/account?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
};

/** Optional migration sign-in for accounts created through the original provider. */
export const startLegacyLogin = async (): Promise<void> => {
  try {
    const { appId, oauthPortalUrl } = await loadRuntimeConfig();
    if (!appId || !oauthPortalUrl) throw new Error("The original sign-in provider is not configured on this server. Use your independent account, or contact the app owner to restore original-account access.");
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const nonce = crypto.randomUUID();
    document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
    const url = new URL(`${oauthPortalUrl.replace(/\/$/, "")}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", encodeOAuthState({ redirectUri, nonce }));
    url.searchParams.set("responseType", "code");
    window.location.assign(url.toString());
  } catch (error) {
    window.dispatchEvent(new CustomEvent("fg:auth-error", { detail: { message: error instanceof Error ? error.message : "Unable to start sign-in." } }));
    throw error;
  }
};
