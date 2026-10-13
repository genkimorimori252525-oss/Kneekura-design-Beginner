#!/usr/bin/env node
import { readFileSync } from "node:fs";

const sourcesPath = new URL("../catalog/sources.json", import.meta.url);
const casesPath = new URL("../catalog/use-cases.json", import.meta.url);
const allowedStates = new Set(["permissive_verified", "restricted", "unverified", "site_claim_only", "service_terms", "spec_reference"]);
const allowedAdoption = new Set(["review-upstream", "reference-only"]);
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const httpsUrl = (value) => typeof value === "string" && /^https:\/\/[^/\s]+\S*$/.test(value);

function load() {
  return {
    catalog: JSON.parse(readFileSync(sourcesPath, "utf8")),
    guide: JSON.parse(readFileSync(casesPath, "utf8"))
  };
}
function validate(catalog, guide) {
  const errors = [];
  if (catalog.schema_version !== 1 || !Array.isArray(catalog.sources)) errors.push("Invalid sources contract");
  if (guide.schema_version !== 1 || !Array.isArray(guide.use_cases)) errors.push("Invalid use-cases contract");
  const seen = new Set();
  for (const s of catalog.sources || []) {
    if (!s || !slug.test(s.id || "")) { errors.push("Invalid source id"); continue; }
    if (seen.has(s.id)) errors.push("Duplicate source: " + s.id);
    seen.add(s.id);
    if (typeof s.name !== "string" || !s.name.trim()) errors.push(s.id + ": name");
    if (typeof s.kind !== "string" || !s.kind) errors.push(s.id + ": kind");
    for (const key of ["website", "repository"]) if (!httpsUrl(s[key])) errors.push(s.id + ": invalid " + key);
    for (const key of ["stack", "tags"]) if (!Array.isArray(s[key]) || !s[key].length || s[key].some(v => typeof v !== "string" || !v)) errors.push(s.id + ": " + key);
    if (!s.license || !allowedStates.has(s.license.state) || !s.license.label || !httpsUrl(s.license.evidence)) errors.push(s.id + ": license");
    if (!allowedAdoption.has(s.adoption)) errors.push(s.id + ": adoption");
    if (s.license?.state !== "permissive_verified" && s.adoption !== "reference-only") errors.push(s.id + ": must remain reference-only");
    if (!/^\d{4}-\d\d-\d\d$/.test(s.verified_on || "")) errors.push(s.id + ": verified_on");
    if (typeof s.notes !== "string" || !s.notes.trim()) errors.push(s.id + ": notes");
  }
  const caseIds = new Set();
  for (const u of guide.use_cases || []) {
    if (!u || !slug.test(u.id || "")) { errors.push("Invalid use case id"); continue; }
    if (caseIds.has(u.id)) errors.push("Duplicate use case: " + u.id);
    caseIds.add(u.id);
    if (typeof u.label !== "string" || !u.label) errors.push(u.id + ": label");
    if (typeof u.objective !== "string" || !u.objective) errors.push(u.id + ": objective");
    if (!Array.isArray(u.source_ids) || !u.source_ids.length) errors.push(u.id + ": missing source_ids");
    for (const id of u.source_ids || []) if (!seen.has(id)) errors.push(u.id + ": unknown source " + id);
    if (!Array.isArray(u.checks) || !u.checks.length) errors.push(u.id + ": checks");
  }
  return errors;
}

const help = () => {
  process.stdout.write([
    "Kneekura design catalog (no network/dependencies)",
    "  node tools/catalog.mjs validate",
    "  node tools/catalog.mjs self-test",
    "  node tools/catalog.mjs list [--stack name] [--tag name] [--license state] [--json]",
    "  node tools/catalog.mjs search [keywords] [--stack name] [--tag name] [--kind name] [--license state] [--json]"
  ].join("\n") + "\n");
};

function main(argv) {
  const [command, ...rest] = argv;
  if (!command || command === "--help" || command === "help") return help();
  const { catalog, guide } = load();
  const errors = validate(catalog, guide);
  if (errors.length) {
    for (const e of errors) console.error("INVALID:", e);
    process.exitCode = 1;
    return;
  }
  if (command === "validate") {
    console.log("PASS:", catalog.sources.length, "sources /", guide.use_cases.length, "use cases");
    return;
  }
  if (command === "self-test") {
    const index = new Map(catalog.sources.map(s => [s.id, s]));
    const expected = ["morphin", "viora-ui", "tween-ui", "scrollx-ui", "toggle-supply", "designpass"];
    for (const id of expected) if (!index.has(id)) throw Error("Missing screenshot source: " + id);
    for (const id of ["scrollx-ui", "react-bits"]) if (index.get(id).adoption !== "reference-only") throw Error("Restriction regression: " + id);
    console.log("PASS: screenshot sources and redistribution restrictions");
    return;
  }
  if (command !== "list" && command !== "search") {
    console.error("Unknown command:", command);
    process.exitCode = 2;
    return help();
  }
  const filters = {};
  const terms = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--json") { filters.json = true; continue; }
    if (["--stack", "--tag", "--kind", "--license"].includes(arg)) {
      const val = rest[++i];
      if (!val || val.startsWith("--")) throw Error("Missing value for " + arg);
      filters[arg.slice(2)] = val.toLowerCase();
      continue;
    }
    if (arg.startsWith("--")) throw Error("Unknown flag: " + arg);
    terms.push(arg.toLowerCase());
  }
  const results = catalog.sources.filter(s => {
    if (filters.stack && !s.stack.some(x => x.toLowerCase() === filters.stack)) return false;
    if (filters.tag && !s.tags.some(x => x.toLowerCase() === filters.tag)) return false;
    if (filters.kind && s.kind.toLowerCase() !== filters.kind) return false;
    if (filters.license && s.license.state.toLowerCase() !== filters.license) return false;
    const haystack = [s.name, s.id, s.kind, s.notes, ...s.tags, ...s.stack].join(" ").toLowerCase();
    return terms.every(t => haystack.includes(t));
  });
  if (filters.json) return console.log(JSON.stringify(results, null, 2));
  for (const s of results) {
    console.log(s.id + " | " + s.name + " | " + s.kind + " | " + s.license.state + " | " + s.adoption);
    console.log("  " + s.website);
  }
  console.log("RESULTS:", results.length);
}
try { main(process.argv.slice(2)); }
catch (e) { console.error("ERROR:", e.message); process.exitCode = 1; }

