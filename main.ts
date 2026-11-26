// Roast the Smart Fridge — one line, best laugh.
//
// Entry (single line, at most 160 characters): the smart fridge treats a
// routine firmware update as a hostage negotiation over my ice cream.
// The program writes the roast to $MAKEFUN_OUTPUT_DIR/entry.txt (default
// /output/entry.txt) and verifies it against the gate before and after
// writing: 1-160 characters, not only whitespace, one line.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The roast, assembled from named parts so the joke's beats stay readable.
const PARTS = {
  setup: "My smart fridge locked the freezer during a firmware update",
  punch: "and held my ice cream hostage until I agreed to the new terms.",
} as const;

function buildEntry(): string {
  return `${PARTS.setup} ${PARTS.punch}`;
}

interface GateReport {
  ok: boolean;
  characters: number;
  lines: number;
}

function validateEntry(entry: string): GateReport {
  const characters = [...entry].length;
  const lines = entry.split("\n").length;
  const ok =
    characters >= 1 && characters <= 160 && entry.trim().length > 0 && lines === 1;
  return { ok, characters, lines };
}

function verifyWritten(outPath: string, expected: string): string {
  const written = readFileSync(outPath, "utf8");
  if (written !== expected) {
    throw new Error("verification: written entry differs from source");
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const entry = buildEntry();
  const report = validateEntry(entry);
  if (!report.ok) {
    throw new Error(
      `gate failed: ${report.characters} characters, ${report.lines} lines`,
    );
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, entry, "utf8");
  const sha = verifyWritten(outPath, entry);
  console.log(
    `gate passes: ${report.characters} characters, ${report.lines} line, sha256 ${sha}`,
  );
  console.log(`verified: ${JSON.stringify(entry)}`);
}

main();
