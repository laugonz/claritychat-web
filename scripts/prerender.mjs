import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(projectRoot, "dist");
const ssrFile = join(projectRoot, "dist-ssr", "entry-server.js");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(join(projectRoot, "public"), distDir, { recursive: true });

const { ROUTES, renderRoute } = await import(ssrFile);

for (const route of ROUTES) {
  const output = route.path === "/"
    ? join(distDir, "index.html")
    : join(distDir, route.path, "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, renderRoute(route), "utf8");
}

const urls = ROUTES.map((route) => `  <url>\n    <loc>${route.meta.canonical}</loc>\n    <lastmod>${route.locale !== "en" || route.path === "/" ? "2026-09-13" : (route.meta.jsonLd.find(item => item["@type"] === "Article")?.dateModified ?? "2026-08-26")}</lastmod>\n    <changefreq>${route.basePath.startsWith("/guides/") ? "monthly" : "weekly"}</changefreq>\n    <priority>${route.meta.sitemapPriority}</priority>\n  </url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await writeFile(join(distDir, "sitemap.xml"), sitemap, "utf8");
await writeFile(
  join(distDir, "robots.txt"),
  "User-agent: *\nAllow: /\n\nSitemap: https://claritychat.app/sitemap.xml\n",
  "utf8",
);

const manifest = {
  name: "Clarity Chat",
  short_name: "Clarity Chat",
  description: "A private second look at your text conversations.",
  start_url: "/",
  display: "standalone",
  background_color: "#071626",
  theme_color: "#071626",
  icons: [{ src: "/assets/icon.png", sizes: "1024x1024", type: "image/png" }],
};
await writeFile(join(distDir, "manifest.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const indexPath = join(distDir, "index.html");
const homepage = await readFile(indexPath, "utf8");
await writeFile(
  indexPath,
  homepage.replace('<link rel="icon" href="/assets/icon.png">', '<link rel="icon" href="/assets/icon.png">\n  <link rel="manifest" href="/manifest.webmanifest">'),
  "utf8",
);

console.log(`Prerendered ${ROUTES.length} routes into dist/.`);
