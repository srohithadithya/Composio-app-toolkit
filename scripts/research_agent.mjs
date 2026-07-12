import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const htmlPath = resolve("outputs/composio_app_toolkit_research_case_study.html");

function extractArray(source, name, nextName) {
  const marker = `const ${name} = `;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${name} in HTML`);
  const bodyStart = start + marker.length;
  const endMarker = nextName ? `\n\nconst ${nextName}` : "\n\nfunction ";
  const end = source.indexOf(endMarker, bodyStart);
  if (end === -1) throw new Error(`Could not find end of ${name}`);
  return Function(`"use strict"; return (${source.slice(bodyStart, end).trim().replace(/;$/, "")});`)();
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

function authFamily(app) {
  const auth = app.auth.toLowerCase();
  if (auth.includes("oauth")) return "OAuth2 / OAuth-first";
  if (auth.includes("api key") || auth.includes("token") || auth.includes("bearer") || auth.includes("jwt")) return "API key / bearer token";
  if (auth.includes("basic")) return "Basic / key-secret";
  if (auth.includes("none") || auth.includes("cli")) return "Local / no auth";
  return "Unclear / private";
}

function audit(apps) {
  const allowedVerdicts = new Set(["Yes", "Partial", "No"]);
  const allowedConfidence = new Set(["High", "Medium", "Low"]);
  const ids = new Set(apps.map((app) => app.n));
  const problems = [];

  if (apps.length !== 100) problems.push(`Expected 100 apps, found ${apps.length}`);
  if (ids.size !== apps.length) problems.push("Duplicate app ids found");

  for (const app of apps) {
    if (!allowedVerdicts.has(app.verdict)) problems.push(`${app.app}: invalid verdict ${app.verdict}`);
    if (!allowedConfidence.has(app.conf)) problems.push(`${app.app}: invalid confidence ${app.conf}`);
    if (!/^https?:\/\//.test(app.e)) problems.push(`${app.app}: missing evidence URL`);
    if (app.verdict === "No" && app.gate !== "No clear path") problems.push(`${app.app}: No verdict should use No clear path gate`);
    if (app.verdict === "Yes" && app.conf === "Low") problems.push(`${app.app}: low-confidence Yes should be reviewed`);
  }

  return {
    ok: problems.length === 0,
    problems,
    metrics: {
      total: apps.length,
      verdicts: countBy(apps, "verdict"),
      gates: countBy(apps, "gate"),
      confidence: countBy(apps, "conf"),
      authFamilies: apps.reduce((acc, app) => {
        const family = authFamily(app);
        acc[family] = (acc[family] || 0) + 1;
        return acc;
      }, {})
    }
  };
}

function toCsv(apps) {
  const columns = ["n", "app", "cat", "does", "auth", "gate", "surface", "verdict", "blocker", "e", "conf"];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [columns.join(","), ...apps.map((app) => columns.map((col) => escape(app[col])).join(","))].join("\n");
}

async function main() {
  const html = await readFile(htmlPath, "utf8");
  const apps = extractArray(html, "apps", "matrixRows");
  const matrixRows = extractArray(html, "matrixRows", "auditSamples");
  const auditSamples = extractArray(html, "auditSamples");
  const result = audit(apps);
  const args = new Set(process.argv.slice(2));

  if (args.has("--audit") || process.argv.length === 2) {
    console.log(result.ok ? "PASS" : "CHECK");
    console.log(JSON.stringify(result.metrics, null, 2));
    if (!result.ok) {
      console.log("Problems:");
      for (const problem of result.problems) console.log(`- ${problem}`);
      process.exitCode = 1;
    }
  }

  const jsonIndex = process.argv.indexOf("--export-json");
  if (jsonIndex !== -1) {
    const out = resolve(process.argv[jsonIndex + 1] || "outputs/research_dataset.json");
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, JSON.stringify({ apps, matrixRows, auditSamples, audit: result }, null, 2));
    console.log(`Wrote ${out}`);
  }

  const csvIndex = process.argv.indexOf("--export-csv");
  if (csvIndex !== -1) {
    const out = resolve(process.argv[csvIndex + 1] || "outputs/research_dataset.csv");
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, toCsv(apps));
    console.log(`Wrote ${out}`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
