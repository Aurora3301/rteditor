# RTEditor — Local Testing, Publishing & Deployment Guide

## 🧪 How to Test Locally

### Step 1: Install Ollama (for AI features)

Go to **https://ollama.com/download** and install for your OS:

- **macOS:** `brew install ollama` or download the .dmg
- **Windows:** Download the installer from the website
- **Linux:** `curl -fsSL https://ollama.com/install.sh | sh`

### Step 2: Pull the AI model

```bash
ollama pull llama3.2
```

This downloads LLaMA 3.2 (3B parameters, ~2 GB). It runs on CPU — no GPU needed.

### Step 3: Start Ollama

```bash
ollama serve
```

This starts the server on `http://localhost:11434`. Keep this terminal open.

### Step 4: Clone and run the demo

```bash
git clone https://github.com/Aurora3301/rteditor.git
cd rteditor
npm install
npm run dev
```

This starts the demo at **http://localhost:3000**.

### Step 5: Test the AI features

Open `http://localhost:3000` in your browser and try:

| Method | How |
|--------|-----|
| **Keyboard** | Press `Ctrl+K` (or `⌘+K` on Mac) |
| **Slash command** | Type `/ai` in the editor |
| **Bubble menu** | Select text → click the **AI** button |

Quick actions: **Simplify**, **Grammar**, **Summarize**, **Expand**, **Translate**

You can also type any custom prompt in the text area.

### Running unit tests

```bash
npm test              # run all 130 tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

### Running E2E tests

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

---

## 📦 How to Publish to npm

### One-time setup

1. **Create an npm account** at https://www.npmjs.com/signup

2. **Login from terminal:**
   ```bash
   npm login
   ```

3. **Verify your scoped package name** — the package is `@timothyphchan/rteditor`, so you need to either:
   - Create an **npm organization** named `timothyphchan` at https://www.npmjs.com/org/create, OR
   - Change the package name to unscoped (e.g. `rteditor`) in `package.json`

### Manual publish

```bash
cd rteditor

# This automatically runs: lint → typecheck → test → build → publish
npm publish --access public
```

The `prepublishOnly` script in package.json ensures quality gates run before every publish.

### Publish via version bump (recommended)

```bash
# Patch release (0.1.0 → 0.1.1)
npm run release:patch

# Minor release (0.1.0 → 0.2.0)
npm run release:minor

# Major release (0.1.0 → 1.0.0)
npm run release:major
```

These commands bump the version, create a git tag, and push. The git tag (`v0.1.1`, etc.)
triggers the **GitHub Actions release workflow** which automatically publishes to npm.

### GitHub Actions auto-publish setup

The repo already has `.github/workflows/release.yml` that auto-publishes on git tags.
You just need to add one secret:

1. Go to **https://www.npmjs.com** → Profile → Access Tokens → **Generate New Token** (type: Automation)
2. Go to **https://github.com/Aurora3301/rteditor/settings/secrets/actions**
3. Click **New repository secret**, name it `NPM_TOKEN`, paste the token

After that, every `npm run release:patch/minor/major` will auto-publish via CI.

---

## 🌐 How to Deploy the Demo

### Option A: GitHub Pages (free, easiest)

1. Build the demo as a static site:
   ```bash
   cd rteditor
   npx vite build --config demo/vite.config.ts --outDir demo-dist
   ```
2. Go to **https://github.com/Aurora3301/rteditor/settings/pages**
3. Set Source to **GitHub Actions**, or push the `demo-dist/` folder to a `gh-pages` branch

> ⚠️ **Note:** AI features won't work on GitHub Pages because they need a local Ollama server.
> The editor itself (typing, formatting, toolbar, etc.) will all work.

### Option B: Vercel / Netlify (free, auto-deploy)

1. Go to **https://vercel.com** or **https://netlify.com** and import your GitHub repo
2. Set build settings:
   - **Build command:** `npx vite build --config demo/vite.config.ts --outDir demo-dist`
   - **Output directory:** `demo-dist`
3. It auto-deploys on every push to `main`

Same AI caveat — AI needs a backend server.

### Option C: Full demo with AI (self-hosted)

To have AI work in a deployed demo, you need a server running Ollama (e.g. DigitalOcean, AWS EC2):

```bash
# On your server
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2
ollama serve

# Build and serve the demo
cd rteditor
npx vite build --config demo/vite.config.ts --outDir demo-dist
npx vite preview --config demo/vite.config.ts --outDir demo-dist
```

Update the Vite proxy target to point to the server's Ollama URL, or use an
OpenAI-compatible API endpoint instead.

---

## Quick Reference

| What | Command |
|------|---------|
| Run demo locally | `ollama serve` + `npm run dev` |
| Run unit tests | `npm test` |
| Run E2E tests | `npx playwright install --with-deps chromium && npm run test:e2e` |
| Build package | `npm run build` |
| Publish to npm | `npm publish --access public` |
| Auto-publish via CI | `npm run release:patch` (needs `NPM_TOKEN` secret in GitHub) |
| Deploy demo (static) | Vercel / Netlify / GitHub Pages |
| Deploy demo (with AI) | Self-hosted server with Ollama |

