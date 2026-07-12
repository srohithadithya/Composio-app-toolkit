# Composio App Toolkit Research

Single-page case study and runnable research-agent replay for the 100-app Composio toolkit assignment.

## What is here

- `outputs/composio_app_toolkit_research_case_study.html` - final reviewer-facing HTML case study.
- `scripts/research_agent.mjs` - offline research-agent replay that reads the embedded dataset, audits it, and exports JSON/CSV.
- `scripts/static_server.mjs` - tiny local server for opening the HTML over `localhost`.

## Run it

Requirements: Node.js 18+.

```bash
npm run audit
npm run export:json
npm run serve
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```powershell
npm.cmd run audit
node scripts\research_agent.mjs --audit
```

Then open:

```text
http://127.0.0.1:4173/
```

## Research-agent workflow

The agent pipeline used for the case study was:

1. Seed the 100 apps with category, website hint, expected docs domain, and likely auth terms.
2. Retrieve official docs first, then developer portals, help articles, GitHub repos, and MCP references.
3. Extract auth method, credential gate, API breadth, MCP availability, blocker, evidence URL, and confidence.
4. Run rule checks for missing evidence, invalid labels, and inconsistent verdict/gate combinations.
5. Human-check a stratified sample, especially gated and low-confidence apps, then update the final verdicts.
6. Render the HTML report and keep the machine-readable dataset embedded in the page.

`npm run audit` is the reproducible verification loop for the reviewed dataset. It should report `PASS` and print the verdict, gate, confidence, and auth-family counts.
