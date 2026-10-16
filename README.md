# Eclipse Command

**React 19 + Vite • Cloudflare Workers Static Assets • GitHub Actions CI/CD**

A responsive, local-first operations console with synthetic telemetry and safe, interactive incident response workflows.

> **Demo, not production monitoring.** No real infrastructure is connected. All nodes, charts, incidents and playbook execution are simulated. No command is sent to any remote system.

## Features

- Overview of 18 synthetic nodes across four regions, health ratios, incident queue and time series.
- Searchable/filterable node inventory and interactive inspector.
- Three response playbook rehearsals; every action is logged to local browser storage.
- Acknowledge incidents; pause/resume or reset the scenario; export a JSON snapshot.
- Responsive desktop/mobile interface and keyboard navigation (1–4 / Escape).
- No authentication, API billing, paid dependencies, or server-side data storage.

## Architecture

GitHub master -> GitHub Actions npm ci + TypeScript check + Vite build -> Cloudflare Workers Static Assets. UI session data is saved in browser localStorage. No Worker script runs for static asset requests.

## Local development

Requires Node.js 22 and npm.

```bash
npm ci
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Cloudflare free-tier deployment

1. Create a free Cloudflare account and enable your free workers.dev subdomain.
2. Create a **scoped Edit Cloudflare Workers** API token and find your Cloudflare Account ID.
3. Set these GitHub repository **Actions secrets** (Settings > Secrets and variables > Actions):
   - **CLOUDFLARE_API_TOKEN**: Cloudflare deployment token.
   - **CLOUDFLARE_ACCOUNT_ID**: Cloudflare account identifier.
4. Push to **master**, or use **Actions > Cloudflare Workers CI/CD > Run workflow**.
5. Read the deployment URL in the workflow logs. The expected address is https://eclipse-command.<your-workers-subdomain>.workers.dev.

Pull requests run validation only. If secrets are missing, builds still run and deployments are intentionally skipped with a visible workflow warning. Never commit tokens into the repository.

Manual deployment after npm run build:

```bash
npx wrangler@4 login
npx wrangler@4 deploy
```

The Cloudflare [wrangler.jsonc](wrangler.jsonc) configuration deploys the Vite dist folder as Workers Static Assets. According to Cloudflare's documentation, static-asset requests are free and unlimited; account-level and deployment quotas still apply. No billing is required for the app's intended free-tier usage.

## Security and data model

- Scenario telemetry is synthetic, not actual CPU or network telemetry.
- Acknowledgments and audit-like **demo** history persist in localStorage only, not a tamper-proof server audit log.
- Playbooks never execute infrastructure operations.
- JSON snapshots are assembled and downloaded on the user's device.
- Vite no longer embeds a Gemini API key in frontend code.
- The original GitHub Pages workflow is removed to avoid deployment conflicts.
- Original legacy UI components remain in the repository for reference but are no longer mounted.

## License

No license is granted by this repository. All rights reserved by the owner unless a license is added.
