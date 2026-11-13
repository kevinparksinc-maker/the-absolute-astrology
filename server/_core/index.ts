import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { chartQueryServerTransport } from "../../shared/trpcTransport";
import { sessionConfiguration } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  sessionConfiguration();
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);
  app.get(["/health", "/healthz"], (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.get(["/the-absolute-astrology.zip", "/download-project.zip", "/api/download-zip"], (_req, res) => {
    const zipPath = path.resolve(process.cwd(), "client", "public", "the-absolute-astrology.zip");
    const fallbackPath = path.resolve(process.cwd(), "the-absolute-astrology.zip");
    const targetPath = fs.existsSync(zipPath) ? zipPath : fs.existsSync(fallbackPath) ? fallbackPath : null;
    if (targetPath) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="the-absolute-astrology.zip"');
      res.download(targetPath, "the-absolute-astrology.zip");
    } else {
      res.status(404).send("Zip archive not found.");
    }
  });
  // Readiness reports configuration, not an unverified claim that external services work.
  app.get("/ready", (_req, res) => {
    const checks = {
      sessionSigning: Boolean((process.env.MANUS_JWT_SECRET ?? process.env.JWT_SECRET)?.length),
      interpreterKey: Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
      databaseConfigured: Boolean(process.env.DATABASE_URL),
    };
    res.status(checks.sessionSigning ? 200 : 503).json({ ready: checks.sessionSigning, checks });
  });
  app.get("/api/runtime-config", (_req, res) => {
    res.json({
      apiUrl: process.env.MANUS_API_URL ?? "",
      browserKey: process.env.MANUS_API_BROWSER_KEY ?? "",
      appId: sessionConfiguration().appId,
      oauthPortalUrl: process.env.MANUS_OAUTH_PORTAL_URL ?? process.env.VITE_OAUTH_PORTAL_URL ?? "",
    });
  });
  app.get("/api/maps/javascript", async (req, res) => {
    const apiUrl = process.env.MANUS_API_URL ?? "";
    const browserKey = process.env.MANUS_API_BROWSER_KEY ?? "";
    const requestedOrigin = typeof req.query.origin === "string" ? req.query.origin : "";
    let origin: URL;
    try {
      origin = new URL(requestedOrigin);
      if (origin.protocol !== "https:" && origin.protocol !== "http:") throw new Error("Unsupported origin protocol");
    } catch {
      res.status(400).json({ error: "A valid application origin is required" });
      return;
    }
    if (!apiUrl || !browserKey) {
      res.status(503).json({ error: "Maps runtime configuration is unavailable" });
      return;
    }
    const mapsUrl = new URL(`${apiUrl.replace(/\/+$/, "")}/v1/maps/proxy/maps/api/js`);
    mapsUrl.searchParams.set("key", browserKey);
    mapsUrl.searchParams.set("v", "weekly");
    mapsUrl.searchParams.set("libraries", "marker,places,geocoding,geometry");
    try {
      const mapsResponse = await fetch(mapsUrl, {
        headers: {
          Origin: origin.origin,
          Referer: `${origin.origin}/`,
        },
      });
      const body = await mapsResponse.text();
      res.status(mapsResponse.status).set("Content-Type", "application/javascript; charset=utf-8").send(body);
    } catch (error) {
      console.error("Google Maps script proxy failed", error);
      res.status(502).json({ error: "Google Maps script proxy failed" });
    }
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.post("/api/background-music", express.raw({ type: "*/*", limit: "80mb" }), (req, res) => {
    if (process.env.NODE_ENV === "production") {
      res.status(403).json({ error: "Direct filesystem uploads are disabled in production; use authenticated persistent object storage." });
      return;
    }
    try {
      const targetDir = path.resolve(process.cwd(), "client", "public", "assets");
      fs.mkdirSync(targetDir, { recursive: true });
      const targetPath = path.join(targetDir, "firmament-inner-peace-528hz.mp3");
      fs.writeFileSync(targetPath, req.body);
      res.json({ ok: true, path: "/assets/firmament-inner-peace-528hz.mp3" });
    } catch (error) {
      console.error("Failed to save background music", error);
      res.status(500).json({ error: "Failed to save background music" });
    }
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      ...chartQueryServerTransport,
      router: appRouter,
      createContext,
    })
  );
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `No API route ${req.method} ${req.originalUrl}` });
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // On Render or Cloud Run, process.env.PORT is dynamically assigned (e.g. 10000).
  // In the local development sandbox, Nginx ingress uses 8080 and proxies into 3000.
  const port = parseInt(
    process.env.APP_PORT ||
      (process.env.NODE_ENV === "production" && process.env.PORT
        ? process.env.PORT
        : process.env.PORT && process.env.PORT !== "8080"
          ? process.env.PORT
          : "3000"),
    10
  );

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(error => {
  console.error("Server startup failed:", error);
  process.exitCode = 1;
});
