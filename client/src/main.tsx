import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { Router as WouterRouter } from "wouter";
import { startLogin } from "./const";
import "./index.css";
import { chartQueryTransport } from "@shared/trpcTransport";

const queryClient = new QueryClient();

async function fetchApiResponse(input: RequestInfo | URL, init?: RequestInit) {
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await globalThis.fetch(input, {
      ...(init ?? {}),
      credentials: "include",
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const preview = (await response.clone().text()).slice(0, 240).replace(/\s+/g, " ");
      const isServerStarting = preview.includes("Starting Server") || preview.includes("Starting Server...") || preview.includes("vite:loading");
      if (isServerStarting && attempt < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 1200));
        continue;
      }
      throw new Error(`API request failed: HTTP ${response.status} ${response.statusText}. Non-JSON response (${contentType || "no content-type"}): ${preview}`);
    }
    return response;
  }
  throw new Error("API request failed: Server starting up, please try again.");
}

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      ...chartQueryTransport,
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return fetchApiResponse(input, init);
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={window.location.hostname.endsWith("github.io") ? "/firmament-guardian" : ""}>
        <App />
      </WouterRouter>
    </QueryClientProvider>
  </trpc.Provider>
);


// Allow Android browsers to offer a home-screen install. No API or user data is cached.
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(error => {
      console.warn("Firmament Guardian install support unavailable:", error);
    });
  });
}
