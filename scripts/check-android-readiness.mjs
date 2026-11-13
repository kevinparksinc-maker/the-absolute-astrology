import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = process.cwd();
const publicDir = resolve(root, "client/public");
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const manifestPath = resolve(publicDir, "manifest.webmanifest");
check(existsSync(manifestPath), "Missing client/public/manifest.webmanifest");
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  check(manifest.name === "The Absolute", "Manifest app name must be The Absolute");
  check(manifest.display === "standalone", "Manifest must use standalone display");
  check(typeof manifest.start_url === "string" && manifest.start_url.length > 0, "Missing start_url");
  check(typeof manifest.scope === "string" && manifest.scope.length > 0, "Missing scope");
  check(Array.isArray(manifest.icons) && manifest.icons.length > 0, "Missing icons");
  for (const icon of manifest.icons ?? []) {
    const src = icon.src;
    check(typeof src === "string" && !src.startsWith("http"), "Icon must be a local asset");
    if (typeof src !== "string" || src.startsWith("http")) continue;
    const iconPath = resolve(publicDir, src.replace(/^\.\//, "").replace(/^\//, ""));
    check(iconPath.startsWith(publicDir + "/") && existsSync(iconPath), `Missing icon asset: ${src}`);
  }
}
check(existsSync(resolve(publicDir, "sw.js")), "Missing service worker");
const htmlPath = resolve(root, "client/index.html");
check(existsSync(htmlPath), "Missing client/index.html");
if (existsSync(htmlPath)) {
  const html = readFileSync(htmlPath, "utf8");
  check(html.includes('rel="manifest"'), "HTML does not link to the manifest");
}
if (errors.length) {
  for (const error of errors) console.error("Android readiness: " + error);
  process.exitCode = 1;
} else {
  console.log("Web app prerequisites present. APK signing, HTTPS deployment, digital asset links, and device testing are separate release gates.");
}
