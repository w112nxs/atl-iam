# Deploying ATL IAM Frontend to Cloudflare Pages

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- Your code pushed to a GitHub (or GitLab) repository
- Node.js 18+ installed locally

---

## Option A: Deploy via Cloudflare Dashboard (Recommended)

### Step 1 — Push code to GitHub

```bash
cd /path/to/iam_meetup_1
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/atl-iam.git
git push -u origin main
```

### Step 2 — Connect to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the sidebar
3. Click **Create** → **Pages** → **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select your `atl-iam` repository

### Step 3 — Configure build settings

| Setting              | Value            |
|----------------------|------------------|
| Project name         | `atl-iam`        |
| Production branch    | `main`           |
| Framework preset     | `None`           |
| Root directory       | `frontend`       |
| Build command        | `npm run build`  |
| Build output directory | `dist`         |

### Step 4 — Set environment variables

Under **Environment variables**, add:

| Variable       | Value                              |
|----------------|------------------------------------|
| `NODE_VERSION` | `20`                               |
| `VITE_API_URL` | `https://your-backend-url.com/api` |

> **Note:** Vite only exposes env vars prefixed with `VITE_` to the client bundle.
> Update `VITE_API_URL` once your backend is deployed.

### Step 5 — Deploy

Click **Save and Deploy**. Cloudflare will:
1. Clone your repo
2. Run `npm install` in the `frontend/` directory
3. Run `npm run build` (which runs `tsc -b && vite build`)
4. Deploy the `dist/` folder to its global CDN

Your site will be live at: `https://atl-iam.pages.dev`

---

## Option B: Deploy via Wrangler CLI

### Step 1 — Install Wrangler

```bash
npm install -g wrangler
```

### Step 2 — Authenticate

```bash
wrangler login
```

This opens a browser window to authorize the CLI.

### Step 3 — Build locally

```bash
cd frontend
VITE_API_URL=https://your-backend-url.com/api npm run build
```

### Step 4 — Deploy

```bash
wrangler pages deploy dist --project-name=atl-iam
```

First run will create the project. Subsequent runs update it.

### Step 5 — Set up production branch (optional)

```bash
wrangler pages project create atl-iam --production-branch=main
```

---

## Custom Domain Setup

1. In Cloudflare dashboard, go to **Workers & Pages** → `atl-iam` → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `atliam.org`)
4. Cloudflare will automatically provision SSL and configure DNS if the domain is on Cloudflare

If your domain is **not** on Cloudflare DNS:
1. Add a CNAME record at your DNS provider:
   ```
   CNAME  @  atl-iam.pages.dev
   ```
2. Cloudflare will verify and issue an SSL certificate

---

## SPA Routing Fix

Since this app uses client-side routing (`window.history.pushState`), you need a redirect rule so that all paths serve `index.html`.

Create this file in `frontend/public/`:

**`frontend/public/_redirects`**
```
/*  /index.html  200
```

This tells Cloudflare Pages to serve `index.html` for all routes (e.g., `/events`, `/my-profile`) instead of returning 404.

---

## Preview Deployments

Every push to a non-production branch automatically gets a preview URL:

```
https://<commit-hash>.atl-iam.pages.dev
```

This is great for testing PRs before merging to `main`.

---

## Environment Variables by Environment

You can set different env vars for production vs. preview:

1. Go to **Workers & Pages** → `atl-iam` → **Settings** → **Environment variables**
2. Add variables under **Production** or **Preview** tabs separately

Example:
| Environment | `VITE_API_URL`                          |
|-------------|------------------------------------------|
| Production  | `https://api.atliam.org/api`             |
| Preview     | `https://api-staging.atliam.org/api`     |

---

## CI/CD with GitHub Actions (Optional)

If you prefer GitHub Actions over Cloudflare's built-in Git integration:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install & Build
        working-directory: frontend
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}
        run: |
          npm ci
          npm run build

      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy frontend/dist --project-name=atl-iam
```

**Required GitHub secrets:**
| Secret                   | Where to get it                                      |
|--------------------------|------------------------------------------------------|
| `CLOUDFLARE_API_TOKEN`   | Cloudflare dashboard → My Profile → API Tokens → Create Token (use "Edit Cloudflare Workers" template) |
| `CLOUDFLARE_ACCOUNT_ID`  | Cloudflare dashboard → any domain → Overview → right sidebar |

**Required GitHub variable:**
| Variable       | Value                              |
|----------------|------------------------------------|
| `VITE_API_URL` | `https://api.atliam.org/api`       |

---

## Cost Summary

| Resource          | Free Tier Limit    |
|-------------------|--------------------|
| Bandwidth         | **Unlimited**      |
| Requests          | **Unlimited**      |
| Sites             | **Unlimited**      |
| Builds per month  | 500                |
| Concurrent builds | 1                  |
| Max file size     | 25 MB              |
| Custom domains    | 100 per project    |

**Total cost: $0/month**

---

## Checklist

- [ ] Code pushed to GitHub
- [ ] Cloudflare Pages project created
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] `NODE_VERSION` env var set to `20`
- [ ] `VITE_API_URL` env var configured
- [ ] `frontend/public/_redirects` file created for SPA routing
- [ ] Custom domain configured (optional)
- [ ] Verify site loads at `https://atl-iam.pages.dev`
