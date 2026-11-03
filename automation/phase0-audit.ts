#!/usr/bin/env ts-node
/**
 * Phase 0 — Environment Audit
 * Checks: Node version, Python + PyMuPDF, FFmpeg, TypeScript compiler, Remotion CLI.
 */

import { execSync, ExecSyncOptions } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface CheckResult {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
}

const results: CheckResult[] = [];

function run(cmd: string): string {
  try {
    const opts: ExecSyncOptions = { stdio: "pipe", encoding: "utf8" };
    return (execSync(cmd, opts) as unknown as string).trim();
  } catch {
    return "";
  }
}

function check(name: string, cmd: string, validator: (out: string) => boolean, detail: (out: string) => string): void {
  const out = run(cmd);
  results.push({ name, status: validator(out) ? "PASS" : "FAIL", detail: detail(out) });
}

function warn(name: string, cmd: string, validator: (out: string) => boolean, detail: (out: string) => string): void {
  const out = run(cmd);
  results.push({ name, status: validator(out) ? "PASS" : "WARN", detail: detail(out) });
}

check("Node.js >= 20", "node --version", (v) => {
  const m = v.match(/v(\d+)/);
  return m ? parseInt(m[1] ?? "0") >= 20 : false;
}, (v) => v || "not found");

check("npm", "npm --version", (v) => v.length > 0, (v) => v || "not found");

check("TypeScript >= 5", "npx tsc --version", (v) => {
  const m = v.match(/(\d+)\./);
  return m ? parseInt(m[1] ?? "0") >= 5 : false;
}, (v) => v || "not found");

warn("Remotion CLI (needs npm ci first)", "npx remotion --version", (v) => v.includes("4.") || v.includes("remotion"), (v) => v || "run npm ci first");

check("Python >= 3.9", "python --version", (v) => {
  const m = v.match(/Python (\d+)\.(\d+)/);
  if (!m) return false;
  return parseInt(m[1] ?? "0") >= 3 && parseInt(m[2] ?? "0") >= 9;
}, (v) => v || "not found — needed for PDF extraction");

warn("PyMuPDF (fitz)", "python -c \"import fitz; print(fitz.version)\"", (v) => v.length > 0 && !v.includes("Error"), (v) => v || "not installed — run: pip install pymupdf");

check("FFmpeg", "ffmpeg -version", (v) => v.includes("ffmpeg version"), (v) => (v ? v.split("\n")[0] ?? "" : "not found"));

const pkgExists = fs.existsSync(path.join(process.cwd(), "package.json"));
results.push({ name: "package.json", status: pkgExists ? "PASS" : "FAIL", detail: pkgExists ? "found" : "missing" });

console.log("\n━━━ Phase 0 Environment Audit ━━━━━━━━━━━━━━━━━━━━\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : r.status === "WARN" ? "⚠" : "✗";
  console.log(`  ${icon}  [${r.status}]  ${r.name.padEnd(30)} ${r.detail}`);
}

const failures = results.filter((r) => r.status === "FAIL");
const warnings = results.filter((r) => r.status === "WARN");

console.log(`\n  ${results.length - failures.length - warnings.length} passed · ${warnings.length} warnings · ${failures.length} failed\n`);

if (failures.length > 0) {
  console.error("Phase 0 FAILED — fix the above before proceeding to Phase 1.");
  process.exit(1);
} else {
  console.log("Phase 0 PASSED — environment is ready for Phase 1 render.\n");
  process.exit(0);
}
