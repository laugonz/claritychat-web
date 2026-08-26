import { access, readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const failures = [];
const warnings = [];

async function walk(directory) {
  const items = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const path = join(directory, item.name);
    if (item.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

function matches(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

function stripMarkup(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|quot|#39);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageUrl(path) {
  const rel = relative(dist, path).replaceAll("\\", "/");
  return rel === "index.html" ? "/" : `/${rel.replace(/index\.html$/, "")}`;
}

const files = await walk(dist);
const htmlFiles = files.filter((path) => extname(path) === ".html");
if (htmlFiles.length !== 12) failures.push(`Expected 12 HTML pages, found ${htmlFiles.length}.`);

const seenTitles = new Map();
const seenDescriptions = new Map();

for (const path of htmlFiles) {
  const url = pageUrl(path);
  const html = await readFile(path, "utf8");
  const titles = matches(html, /<title>([\s\S]*?)<\/title>/gi);
  const descriptions = matches(html, /<meta name="description" content="([^"]*)">/gi);
  const canonicals = matches(html, /<link rel="canonical" href="([^"]*)">/gi);
  const h1s = matches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);

  if (titles.length !== 1) failures.push(`${url}: expected one title, found ${titles.length}.`);
  if (descriptions.length !== 1) failures.push(`${url}: expected one meta description, found ${descriptions.length}.`);
  if (canonicals.length !== 1) failures.push(`${url}: expected one canonical, found ${canonicals.length}.`);
  if (h1s.length !== 1) failures.push(`${url}: expected one H1, found ${h1s.length}.`);

  if (titles[0]) {
    const previous = seenTitles.get(titles[0]);
    if (previous) failures.push(`${url}: title duplicates ${previous}.`);
    seenTitles.set(titles[0], url);
    if (titles[0].length > 65) warnings.push(`${url}: title is ${titles[0].length} characters.`);
  }
  if (descriptions[0]) {
    const previous = seenDescriptions.get(descriptions[0]);
    if (previous) failures.push(`${url}: description duplicates ${previous}.`);
    seenDescriptions.set(descriptions[0], url);
    if (descriptions[0].length < 90 || descriptions[0].length > 170) warnings.push(`${url}: description is ${descriptions[0].length} characters.`);
  }
  if (canonicals[0] !== `https://claritychat.app${url}`) failures.push(`${url}: incorrect canonical ${canonicals[0] ?? "missing"}.`);
  if (/localhost|\.vercel\.app/.test(html)) failures.push(`${url}: contains a development or Vercel URL.`);

  const jsonLdBlocks = matches(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  if (!jsonLdBlocks.length) failures.push(`${url}: no JSON-LD found.`);
  for (const block of jsonLdBlocks) {
    try { JSON.parse(block); } catch { failures.push(`${url}: invalid JSON-LD.`); }
  }

  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\balt="[^"]*"/.test(tag)) failures.push(`${url}: image without alt text.`);
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    if (src?.startsWith("/")) {
      try { await access(join(dist, src)); } catch { failures.push(`${url}: missing image ${src}.`); }
    }
  }

  for (const href of matches(html, /<a[^>]+href="([^"]+)"/gi)) {
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const clean = href.split("#")[0];
    if (!clean) continue;
    const target = clean === "/" ? join(dist, "index.html") : join(dist, clean, "index.html");
    try { await access(target); } catch { failures.push(`${url}: broken internal link ${href}.`); }
  }

  if (url.startsWith("/guides/") && url !== "/guides/") {
    const body = html.match(/<div class="article-body">([\s\S]*?)<\/div><aside class="article-sidebar">/)?.[1] ?? "";
    const words = stripMarkup(body).split(/\s+/).filter(Boolean).length;
    if (words < 600) failures.push(`${url}: guide has only ${words} words; minimum is 600.`);
    if (words > 1300) warnings.push(`${url}: guide has ${words} words.`);
  }
}

for (const required of ["sitemap.xml", "robots.txt", "style.css", "manifest.webmanifest"]) {
  try {
    const info = await stat(join(dist, required));
    if (!info.size) failures.push(`${required} is empty.`);
  } catch {
    failures.push(`${required} is missing.`);
  }
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
if ((sitemap.match(/<url>/g) ?? []).length !== htmlFiles.length) failures.push("Sitemap route count does not match HTML route count.");
const robots = await readFile(join(dist, "robots.txt"), "utf8");
if (!robots.includes("https://claritychat.app/sitemap.xml")) failures.push("robots.txt does not name the production sitemap.");

const sourceFiles = (await walk(join(root, "src"))).filter((path) => /\.(?:ts|tsx)$/.test(path));
for (const path of sourceFiles) {
  const source = await readFile(path, "utf8");
  if (source.includes("—")) failures.push(`${relative(root, path)} contains an em dash.`);
}

if (warnings.length) {
  console.warn(`Warnings (${warnings.length}):`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (failures.length) {
  console.error(`Verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} pages, metadata, schema, internal links, image assets, guide depth, sitemap and robots.txt.`);
