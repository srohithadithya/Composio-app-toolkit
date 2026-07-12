# Composio App Toolkit Research

Research case study and reproducible agent replay for evaluating whether 100 requested apps can become Composio-style agent toolkits.

The project contains a finished reviewer-facing HTML page plus a lightweight Node.js research-agent replay that audits the embedded dataset and exports it as structured data.

## At a glance

| Item | Details |
| --- | --- |
| Research set | 100 apps across CRM, support, messaging, marketing, ecommerce, data, developer platforms, productivity, fintech, and AI/media |
| Main artifact | `outputs/composio_app_toolkit_research_case_study.html` |
| Agent replay | `scripts/research_agent.mjs` |
| Runtime | Node.js 18+ |
| Network required | No. The replay audits the reviewed dataset already embedded in the HTML. |
| Current verdict split | 65 buildable now, 29 partially buildable, 6 not buildable from public docs |

## Repository layout

```text
.
+-- README.md
+-- package.json
+-- outputs/
|   +-- composio_app_toolkit_research_case_study.html
|   +-- research_dataset.json
+-- scripts/
    +-- research_agent.mjs
    +-- static_server.mjs
```

### Key files

- `outputs/composio_app_toolkit_research_case_study.html`  
  The final single-page case study. It includes headline findings, pattern clusters, build-priority queues, the agent workflow, verification notes, and a filterable 100-app evidence table.

- `scripts/research_agent.mjs`  
  Offline replay of the research agent's validation step. It extracts the dataset from the HTML, runs consistency checks, prints metrics, and can export JSON or CSV.

- `outputs/research_dataset.json`  
  Machine-readable export of the reviewed dataset, matrix rows, audit samples, and audit metrics.

- `scripts/static_server.mjs`  
  Minimal local server for viewing the HTML page through a browser.

## Quickstart

Install dependencies:

```bash
npm install
```

There are no third-party dependencies today, but running `npm install` is harmless and keeps the workflow familiar.

Run the dataset audit:

```bash
npm run audit
```

Expected result:

```text
PASS
{
  "total": 100,
  "verdicts": {
    "Yes": 65,
    "Partial": 29,
    "No": 6
  }
}
```

Open the case study locally:

```bash
npm run serve
```

Then visit:

```text
http://127.0.0.1:4173/
```

## Windows PowerShell note

If PowerShell blocks `npm` because script execution is disabled, use `npm.cmd` or direct Node commands:

```powershell
npm.cmd run audit
npm.cmd run export:json
node scripts\research_agent.mjs --audit
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run agent` | Runs the replay agent with its default audit behavior. |
| `npm run audit` | Validates the reviewed 100-app dataset and prints summary metrics. |
| `npm run export:json` | Writes `outputs/research_dataset.json`. |
| `node scripts/research_agent.mjs --export-csv outputs/research_dataset.csv` | Exports the dataset as CSV. |
| `npm run serve` | Serves the HTML report at `http://127.0.0.1:4173/`. |

## What the research agent does

The original research process combined automated collection with human review. This repo preserves the reviewed output and the reproducible verification layer.

The agent workflow:

1. Seed app records with name, category, website hint, expected docs domain, and likely auth terms.
2. Retrieve official developer docs first, then help-center articles, platform portals, GitHub projects, and MCP references.
3. Extract the integration facts that matter for toolkit buildability:
   - app category and one-line description
   - auth methods
   - self-serve versus gated credential path
   - API surface and MCP availability
   - buildability verdict
   - main blocker
   - evidence URL
   - confidence level
4. Apply rule-based checks for missing evidence, invalid labels, duplicate IDs, and inconsistent verdict/gate combinations.
5. Human-check a stratified sample, with extra attention on low-confidence and commercially gated apps.
6. Render the final case study and export the machine-readable dataset.

## Data model

Each app record uses this shape:

```js
{
  n: 1,
  cat: "CRM and Sales",
  app: "Salesforce",
  does: "Enterprise CRM and automation platform.",
  auth: "OAuth2, JWT bearer, session token",
  gate: "Self-serve",
  surface: "Broad REST, SOAP, Bulk, Metadata APIs; many community MCPs",
  verdict: "Yes",
  blocker: "Connected app setup and org admin scopes",
  e: "https://developer.salesforce.com/...",
  conf: "High"
}
```

### Verdict meanings

| Verdict | Meaning |
| --- | --- |
| `Yes` | Public docs and credentials are enough to build an agent toolkit today. |
| `Partial` | API exists, but production use depends on review, admin approval, paid plan, customer setup, or partner access. |
| `No` | No reliable public integration API was found for the requested product surface. |

### Gate meanings

| Gate | Meaning |
| --- | --- |
| `Self-serve` | A developer can generally create credentials from a free/trial/dev account. |
| `Trial/admin` | Access exists, but needs workspace admin rights, a paid trial, or product setup. |
| `Review-gated` | Platform review, app review, business verification, or compliance approval is central. |
| `Partner/enterprise` | Access typically requires a customer contract, partner program, or sales motion. |
| `No clear path` | Public credential path could not be confirmed. |

## Verification

The replay audit checks:

- exactly 100 app records
- unique numeric IDs
- valid verdict labels
- valid confidence labels
- evidence URLs present
- `No` verdicts use the `No clear path` gate
- low-confidence `Yes` records are not silently accepted

Current audit output:

```text
PASS
total: 100
Yes: 65
Partial: 29
No: 6
Self-serve: 64
High confidence: 75
```

The HTML page also includes a visible verification section with a sample audit ledger showing where first-pass agent answers were corrected by source review.

## Known limitations

- The replay agent is offline. It validates and exports the reviewed dataset, but it does not re-crawl the web.
- Some evidence links point to product pages or help centers when a clean public API page was not available. Those records are marked lower confidence.
- Commercial access can change. Partner gates, app-review policies, and paid-plan requirements should be rechecked before productionizing a toolkit.

## Recommended reviewer path

1. Open `outputs/composio_app_toolkit_research_case_study.html`.
2. Read the headline cards and build-priority queue.
3. Filter the table by `Partial`, `No`, and `Low` confidence.
4. Run `npm run audit`.
5. Inspect `outputs/research_dataset.json` if you want the machine-readable version.
