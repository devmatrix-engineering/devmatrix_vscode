#!/usr/bin/env node
/**
 * Release check for the DevMatrix extension package (.vsix).
 *
 *   node .github/release/check.cjs [--tag vX.Y.Z] [--sha256 FILE.sha256] <extension.vsix>
 *
 * Reads the archive itself (zlib only, no packaging tool) and exits 1 naming
 * every problem it finds; exits 0 only after reading a non-empty package.
 *
 *   inventory  every packaged file is one the extension needs at runtime, and
 *              the files it cannot run without are present;
 *   secrets    no credential-shaped string in any packaged file;
 *   leakage    no source maps, no absolute paths from the build machine;
 *   manifest   the Marketplace listing rules: PNG icon of at least 128x128,
 *              no Microsoft mark in the name, https images, allowed categories,
 *              at most 30 keywords, explicit pricing, repository and issues links;
 *   notices    ThirdPartyNotices.txt lists every bundled package with its license;
 *   license    LICENSE excludes the bundled third-party components;
 *   privacy    README links the privacy policy at its exact address;
 *   decisions  any "[… — pending …]" owner placeholder left in README, LICENSE
 *              or CHANGELOG blocks until it carries its value.
 *
 * --tag requires the package version to equal the tag without its leading "v".
 * --sha256 requires the package bytes to match the digest in that file.
 */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const zlib = require("node:zlib");

/** Every path the installed extension needs at runtime, and nothing else. */
const RUNTIME_FILES = [
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "ThirdPartyNotices.txt",
  "dist/extension.js",
  "language-configuration/dmx.language-configuration.json",
  "media/activity-bar.svg",
  "media/dmx-file.svg",
  "media/icon.png",
  "media/logo.png",
  "package.json",
  "syntaxes/dmx.tmLanguage.json",
  "themes/devmatrix-dark-color-theme.json",
];

/** Without these the published extension does not run, or may not be distributed. */
const REQUIRED_FILES = [
  "package.json",
  "dist/extension.js",
  "syntaxes/dmx.tmLanguage.json",
  "language-configuration/dmx.language-configuration.json",
  "media/icon.png",
  "README.md",
  "LICENSE",
  "ThirdPartyNotices.txt",
];

/** The packaging tool renames these inside the archive; the rules speak the source names. */
const ARCHIVE_NAMES = { "readme.md": "README.md", "LICENSE.txt": "LICENSE", "changelog.md": "CHANGELOG.md" };

/** Archive members written next to extension/. */
const PACKAGE_METADATA = ["[Content_Types].xml", "extension.vsixmanifest"];

/** Credential shapes. Each is specific enough to have no business in a package. */
const SECRET_PATTERNS = [
  ["DevMatrix Workshop key", /\bdm_(?:live|test)_[A-Za-z0-9_-]{16,}/],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})/],
  ["AWS access key id", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["private key", /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ["API secret key", /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}/],
  ["Azure DevOps PAT", /\b[A-Za-z0-9]{52}AZDO[A-Za-z0-9]{4}\b/],
  ["JSON Web Token", /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["connection string with password", /\b[a-z][a-z0-9+]*:\/\/[^\s:@/"'`]+:[^\s@/"'`]{6,}@[^\s"'`]+/i],
];

/** Things from the build machine that must never ship. */
const LEAK_PATTERNS = [
  ["source map reference", /sourceMapping(?:URL)=/],
  ["absolute POSIX home path", /\/(?:home|Users)\/[A-Za-z0-9._-]+\//],
  ["absolute Windows user path", /[A-Za-z]:\\\\?Users\\\\?[A-Za-z0-9._-]+/],
];

/** The Marketplace and Open VSX publisher id. */
const PUBLISHER = "Dev-Matrix";

/** The extension name: "devmatrix" is taken on the Marketplace, so the id is Dev-Matrix.devmatrix-dmx. */
const EXTENSION_NAME = "devmatrix-dmx";

/** The public repository the listing links to. */
const PUBLIC_REPOSITORY_URL = "https://github.com/devmatrix-engineering/devmatrix_vscode.git";
const PUBLIC_BUGS_URL = "https://github.com/devmatrix-engineering/devmatrix_vscode/issues";

/** Categories the extension manifest reference allows. */
const ALLOWED_CATEGORIES = [
  "Programming Languages", "Snippets", "Linters", "Themes", "Debuggers", "Formatters", "Keymaps",
  "SCM Providers", "Other", "Extension Packs", "Language Packs", "Data Science", "Machine Learning",
  "Visualization", "Notebooks", "Education", "Testing",
];

const MICROSOFT_MARK = /\b(?:microsoft|visual\s*studio|vs\s*code|vscode)\b/i;
/**
 * Other companies' product and company names. The listing may say what the
 * extension works with in the README, under a trademark notice; the fields that
 * name and describe the extension itself carry none of them.
 */
const THIRD_PARTY_MARK = /\b(?:anthropic|claude|copilot|openai|chatgpt|gemini|cursor|windsurf|vscodium)\b/i;

const NOTICES_HEADER = "THIRD-PARTY SOFTWARE NOTICES";
const NOTICE_SECTION = /^={78}\n(\S+)@(\S+) \(([^)\n]+)\)\n={78}\n\n([\s\S]*?)(?=\n={78}\n|\s*$)/gm;

/** The publisher's privacy policy (Marketplace Terms of Use, section 2); README links it. */
const PRIVACY_POLICY_URL = "https://devmatrix.dev/privacy";

/** An owner placeholder: an upper-case label and "— pending", in square brackets. */
const PLACEHOLDER = /\[[A-Z][A-Z0-9 ,/&-]+ — pending[^\]]*\]/g;

/** Packaged documents a user reads, where an owner placeholder may not ship. */
const USER_DOCS = ["README.md", "LICENSE", "CHANGELOG.md"];

/** Read every member of a zip archive: [{ path, bytes }]. */
function readZip(buffer) {
  const EOCD = 0x06054b50;
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (buffer.readUInt32LE(i) === EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("not a zip archive (no end-of-central-directory record)");
  const count = buffer.readUInt16LE(eocd + 10);
  let p = buffer.readUInt32LE(eocd + 16);
  const entries = [];
  for (let n = 0; n < count; n++) {
    if (buffer.readUInt32LE(p) !== 0x02014b50) throw new Error("corrupt central directory");
    const method = buffer.readUInt16LE(p + 10);
    const compressed = buffer.readUInt32LE(p + 20);
    const nameLen = buffer.readUInt16LE(p + 28);
    const extraLen = buffer.readUInt16LE(p + 30);
    const commentLen = buffer.readUInt16LE(p + 32);
    const local = buffer.readUInt32LE(p + 42);
    const name = buffer.toString("utf8", p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith("/")) continue;
    const dataStart = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const raw = buffer.subarray(dataStart, dataStart + compressed);
    let bytes;
    if (method === 0) bytes = Buffer.from(raw);
    else if (method === 8) bytes = zlib.inflateRawSync(raw);
    else throw new Error(`${name}: unsupported compression method ${method}`);
    entries.push({ path: decodeURIComponent(name), bytes });
  }
  return entries;
}

/** Source name of an archive member under extension/, or null. */
function sourceName(entryPath) {
  if (!entryPath.startsWith("extension/")) return null;
  const inner = entryPath.slice("extension/".length);
  return Object.hasOwn(ARCHIVE_NAMES, inner) ? ARCHIVE_NAMES[inner] : inner;
}

/** A reader over the packaged files by source name: (name) => text | undefined. */
function reader(entries) {
  return (doc) => entries.find((e) => sourceName(e.path) === doc)?.bytes.toString("utf8");
}

const BINARY = /\.(png|jpe?g|gif|ico|woff2?)$/i;

/** Violations for an archive's members. Empty array = the package is publishable. */
function auditPackage(entries) {
  const violations = [];
  const shipped = [];
  for (const { path } of entries) {
    const name = sourceName(path);
    if (name !== null) shipped.push(name);
    else if (!PACKAGE_METADATA.includes(path)) violations.push(`inventory: unexpected archive member ${path}`);
  }
  if (shipped.length === 0) {
    return ["inventory: the package ships no extension files (empty or not a vsix)"];
  }
  for (const f of shipped) {
    if (!RUNTIME_FILES.includes(f)) violations.push(`inventory: ${f} is not a runtime file`);
  }
  for (const f of REQUIRED_FILES) {
    if (!shipped.includes(f)) violations.push(`inventory: required file ${f} is missing`);
  }

  for (const { path, bytes } of entries) {
    if (/\.map$/.test(path)) violations.push(`leakage: source map ${path} is packaged`);
    if (/(^|\/)\.env(\.|$)/.test(path)) violations.push(`secrets: environment file ${path} is packaged`);
    if (BINARY.test(path)) continue;
    const text = bytes.toString("utf8");
    for (const [label, re] of SECRET_PATTERNS) {
      if (re.test(text)) violations.push(`secrets: ${label} in ${path}`);
    }
    for (const [label, re] of LEAK_PATTERNS) {
      if (re.test(text)) violations.push(`leakage: ${label} in ${path}`);
    }
  }

  const read = reader(entries);
  const manifestText = read("package.json");
  if (manifestText) {
    const manifest = JSON.parse(manifestText);
    violations.push(...auditManifest(manifest));
    if (typeof manifest.icon === "string" && !/\.svg$/i.test(manifest.icon)) {
      const icon = entries.find((e) => sourceName(e.path) === manifest.icon);
      if (!icon) violations.push(`manifest: icon ${manifest.icon} is not in the package`);
      else violations.push(...auditIcon(manifest.icon, icon.bytes));
    }
  }
  for (const doc of ["README.md", "CHANGELOG.md"]) {
    const text = read(doc);
    if (text !== undefined) violations.push(...auditMarkdownImages(doc, text));
  }
  const notices = read("ThirdPartyNotices.txt");
  if (notices !== undefined) violations.push(...auditNotices(notices));
  const license = read("LICENSE");
  if (license !== undefined && !/ThirdPartyNotices\.txt/.test(license)) {
    violations.push("license: LICENSE must exclude the bundled third-party components and point to ThirdPartyNotices.txt");
  }
  const readme = read("README.md");
  if (readme !== undefined) violations.push(...auditTrademarkNotice(readme));
  if (readme !== undefined && !hasLink(readme, PRIVACY_POLICY_URL)) {
    violations.push(`privacy: README.md must link the privacy policy at ${PRIVACY_POLICY_URL}`);
  }
  return violations;
}

/**
 * A README that names Anthropic's or Microsoft's products to say what the
 * extension works with carries the trademark notice that keeps that from
 * reading as affiliation: who owns the marks it names, and that DevMatrix is not
 * affiliated with or endorsed by them.
 */
function auditTrademarkNotice(readme) {
  const v = [];
  if (/\bclaude\b/i.test(readme) && !/Claude and Claude Code are trademarks of Anthropic, PBC\./.test(readme)) {
    v.push("trademarks: README.md names Claude without the notice that Claude and Claude Code are trademarks of Anthropic, PBC");
  }
  if (MICROSOFT_MARK.test(readme) && !/Visual Studio Code is\s+a trademark of Microsoft Corporation\./.test(readme)) {
    v.push("trademarks: README.md names a Microsoft product without the notice that Visual Studio Code is a trademark of Microsoft Corporation");
  }
  if ((/\bclaude\b/i.test(readme) || MICROSOFT_MARK.test(readme)) && !/DevMatrix is not affiliated with or endorsed by/.test(readme)) {
    v.push("trademarks: README.md names other companies' products without saying DevMatrix is not affiliated with or endorsed by them");
  }
  return v;
}

/** True when the markdown text carries a link whose target is exactly url. */
function hasLink(text, url) {
  return [...text.matchAll(/\[[^\]]+\]\(\s*<?([^)\s>]+)>?\s*\)/g)].some((m) => m[1] === url);
}

/** Manifest rules of the Marketplace listing and of Microsoft's trademark guidelines. */
function auditManifest(m) {
  const v = [];
  for (const field of [
    "name", "displayName", "description", "publisher", "version", "license", "icon",
    "repository", "bugs", "engines", "categories", "galleryBanner", "pricing", "qna",
  ]) {
    if (m[field] === undefined || m[field] === "") v.push(`manifest: ${field} is missing`);
  }
  if (m.publisher !== undefined && m.publisher !== PUBLISHER) {
    v.push(`manifest: publisher must be "${PUBLISHER}" (found "${m.publisher}")`);
  }
  if (m.name !== undefined && m.name !== EXTENSION_NAME) {
    v.push(`manifest: name must be "${EXTENSION_NAME}" (found "${m.name}")`);
  }
  if (typeof m.icon === "string" && /\.svg$/i.test(m.icon)) v.push("manifest: icon may not be an SVG");
  for (const field of ["name", "displayName", "publisher"]) {
    if (typeof m[field] === "string" && MICROSOFT_MARK.test(m[field])) {
      v.push(`manifest: ${field} "${m[field]}" uses a Microsoft mark`);
    }
  }
  const described = [
    ["name", m.name], ["displayName", m.displayName], ["description", m.description],
    ...(Array.isArray(m.keywords) ? m.keywords.map((k) => ["keywords", k]) : []),
  ];
  for (const [field, value] of described) {
    if (typeof value === "string" && THIRD_PARTY_MARK.test(value)) {
      v.push(`manifest: ${field} "${value}" uses another company's mark`);
    }
  }
  if (Array.isArray(m.keywords)) {
    for (const k of m.keywords) {
      if (typeof k === "string" && MICROSOFT_MARK.test(k)) v.push(`manifest: keywords "${k}" uses a Microsoft mark`);
    }
  }
  if (m.license !== undefined && !/^SEE LICENSE IN \S+$/.test(m.license)) {
    v.push(`manifest: license must be "SEE LICENSE IN <file>" for a proprietary extension (found "${m.license}")`);
  }
  const repo = typeof m.repository === "string" ? m.repository : m.repository?.url;
  if (m.repository !== undefined && repo !== PUBLIC_REPOSITORY_URL) {
    v.push(`manifest: repository url must be https ${PUBLIC_REPOSITORY_URL} (found ${repo})`);
  }
  const bugs = typeof m.bugs === "string" ? m.bugs : m.bugs?.url;
  if (m.bugs !== undefined && bugs !== PUBLIC_BUGS_URL) {
    v.push(`manifest: bugs url must be ${PUBLIC_BUGS_URL} (found ${bugs})`);
  }
  if (m.engines !== undefined) {
    const vscode = m.engines?.vscode;
    if (typeof vscode !== "string" || vscode.trim() === "" || vscode.trim() === "*") {
      v.push(`manifest: engines.vscode must name the supported versions (found ${JSON.stringify(vscode)})`);
    }
  }
  if (m.categories !== undefined) {
    if (!Array.isArray(m.categories) || m.categories.length === 0) v.push("manifest: categories must be a non-empty list");
    else for (const c of m.categories) {
      if (!ALLOWED_CATEGORIES.includes(c)) v.push(`manifest: category "${c}" is not an allowed Marketplace category`);
    }
  }
  if (Array.isArray(m.keywords) && m.keywords.length > 30) {
    v.push(`manifest: at most 30 keywords (found ${m.keywords.length})`);
  }
  if (m.galleryBanner !== undefined) {
    const color = m.galleryBanner?.color;
    if (color === undefined) v.push("manifest: galleryBanner.color is missing");
    else if (typeof color !== "string" || !/^#[0-9a-fA-F]{3,8}$/.test(color)) {
      v.push(`manifest: galleryBanner.color must be a hex color (found ${JSON.stringify(color)})`);
    }
  }
  if (m.pricing !== undefined && !["Free", "Trial"].includes(m.pricing)) {
    v.push(`manifest: pricing must be Free or Trial (${m.pricing})`);
  }
  if (m.qna !== undefined && !(m.qna === false || m.qna === "marketplace" || /^https:\/\//.test(m.qna))) {
    v.push(`manifest: qna must be false, "marketplace" or an https URL (found ${JSON.stringify(m.qna)})`);
  }
  if (m.badges !== undefined) {
    if (!Array.isArray(m.badges)) v.push("manifest: badges must be a list");
    else m.badges.forEach((b, i) => {
      if (b?.url === undefined) v.push(`manifest: badge ${i + 1} url is missing`);
      else if (typeof b.url !== "string" || !/^https:\/\//.test(b.url)) v.push(`manifest: badge url must be https (${b.url})`);
    });
  }
  return v;
}

/** The icon is a PNG of at least 128x128 pixels. */
function auditIcon(name, bytes) {
  const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(PNG) || bytes.toString("latin1", 12, 16) !== "IHDR") {
    return [`manifest: icon ${name} is not a PNG`];
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  return width >= 128 && height >= 128 ? [] : [`manifest: icon ${name} is ${width}x${height}; at least 128x128 is required`];
}

/** README/CHANGELOG images: https only, no SVG. */
function auditMarkdownImages(doc, text) {
  const v = [];
  const urls = [
    ...[...text.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)/g)].map((m) => m[1]),
    ...[...text.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]),
  ];
  for (const url of urls) {
    if (!/^https:\/\//i.test(url)) v.push(`manifest: image in ${doc} is not https (${url})`);
    else if (/\.svg(?:[?#].*)?$/i.test(url)) v.push(`manifest: image in ${doc} is an SVG (${url})`);
  }
  return v;
}

/** ThirdPartyNotices.txt: a header and at least one section, each with its license text. */
function auditNotices(text) {
  const v = [];
  if (!text.startsWith(NOTICES_HEADER)) v.push("notices: ThirdPartyNotices.txt does not start with its header");
  const sections = [...text.matchAll(NOTICE_SECTION)];
  if (sections.length === 0) v.push("notices: ThirdPartyNotices.txt lists no package");
  for (const [, name, version, , body] of sections) {
    if (body.trim().length === 0) v.push(`notices: ${name}@${version} carries no license text`);
  }
  return v;
}

/**
 * The owner decisions this package still waits on: [{ id, why }], one per
 * "[… — pending …]" placeholder left in a packaged README, LICENSE or CHANGELOG.
 */
function pendingDecisions(entries) {
  const read = reader(entries);
  const out = [];
  for (const doc of USER_DOCS) {
    const text = read(doc);
    if (text === undefined) continue; // a missing document is an inventory violation of its own
    for (const m of text.matchAll(PLACEHOLDER)) {
      out.push({ id: "owner-placeholder", why: `${doc} still carries ${m[0]}` });
    }
  }
  return out;
}

/** Release identity: the tag names the package version, and the bytes match the published digest. */
function auditRelease(entries, buffer, { tag, sha256 } = {}) {
  const v = [];
  const manifestText = reader(entries)("package.json");
  const version = manifestText ? JSON.parse(manifestText).version : undefined;
  if (tag !== undefined && tag !== `v${version}`) v.push(`release: tag ${tag} does not match package version ${version}`);
  if (sha256 !== undefined) {
    const expected = sha256.trim().split(/\s+/)[0];
    const actual = crypto.createHash("sha256").update(buffer).digest("hex");
    if (!/^[0-9a-f]{64}$/.test(expected)) v.push("release: the digest file does not start with a sha256");
    else if (expected !== actual) v.push(`release: package digest ${actual} differs from the published ${expected}`);
  }
  return v;
}

module.exports = {
  THIRD_PARTY_MARK,
  auditTrademarkNotice,
  ALLOWED_CATEGORIES,
  ARCHIVE_NAMES,
  LEAK_PATTERNS,
  PLACEHOLDER,
  PRIVACY_POLICY_URL,
  PUBLIC_BUGS_URL,
  PUBLIC_REPOSITORY_URL,
  PUBLISHER,
  EXTENSION_NAME,
  REQUIRED_FILES,
  RUNTIME_FILES,
  SECRET_PATTERNS,
  auditIcon,
  auditManifest,
  auditMarkdownImages,
  auditNotices,
  auditPackage,
  auditRelease,
  pendingDecisions,
  reader,
  readZip,
  sourceName,
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const option = (name) => {
    const i = args.indexOf(name);
    return i < 0 ? undefined : args.splice(i, 2)[1];
  };
  const tag = option("--tag");
  const shaFile = option("--sha256");
  const vsix = args.find((a) => !a.startsWith("--"));
  if (!vsix) {
    console.error("usage: node .github/release/check.cjs [--tag vX.Y.Z] [--sha256 FILE] <extension.vsix>");
    process.exit(2);
  }
  const buffer = fs.readFileSync(vsix);
  const entries = readZip(buffer);
  const violations = [
    ...auditPackage(entries),
    ...auditRelease(entries, buffer, { tag, sha256: shaFile === undefined ? undefined : fs.readFileSync(shaFile, "utf8") }),
    ...pendingDecisions(entries).map((d) => `pending decision ${d.id}: ${d.why}`),
  ];
  if (violations.length > 0) {
    console.error(`release check: ${violations.length} problem(s) in ${vsix}`);
    for (const line of violations) console.error(`  - ${line}`);
    process.exit(1);
  }
  console.log(`release check: ${vsix} is publishable (${entries.length} archive members read)`);
}
