# DEPLOY.md - Deployment Guidelines

**Versão**: 1.0  
**Última Atualização**: 22 de Maio de 2026  
**Status**: ✅ Ativo - GitHub Pages

---

## 🚀 Overview

This application is deployed to **GitHub Pages** at: https://miguelti.github.io/local-time-blocking/

The deployment process is **automatic** and does **NOT require manual workflow creation or interaction**.

---

## 🔄 How GitHub Pages Deployment Works

### Automatic Workflow

When you push to the `gh-pages` branch, GitHub automatically:

1. Detects the push to `gh-pages`
2. Triggers the built-in "Pages Build and Deployment" workflow
3. Serves content from the `gh-pages` branch to the live URL

**IMPORTANT**: You do NOT need to manually trigger workflows or check workflow executions. The deployment happens automatically.

### Proper gh-pages Structure

The `gh-pages` branch should contain **ONLY**:

```
gh-pages/
├── assets/              # Built CSS, JS, images (entire folder)
└── index.html           # Main HTML entry point
```

**NEVER include**:
- `dist/` folder (extract contents only)
- `node_modules/`
- `src/` folder
- `package.json`
- `.git/` or other config files

---

## 📋 Deployment Process (Step-by-Step)

### Prerequisites

1. **Repository Remote**: Must point to GitHub HTTPS URL
   ```bash
   git remote -v
   # Should show: origin https://github.com/miguelTI/local-time-blocking.git
   ```

2. **npm Packages**: Install all dependencies
   ```bash
   npm install
   ```

### Build & Deploy

1. **Build the application**:
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with:
   - `dist/index.html`
   - `dist/assets/` (CSS, JS, images)

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```
   This command:
   - Takes contents from `dist/` folder
   - Creates/updates the `gh-pages` branch
   - Pushes only the **assets/** folder and **index.html** to gh-pages
   - GitHub automatically serves the content

3. **Verify Deployment**:
   - Wait 1-2 minutes for GitHub to process
   - Visit: https://miguelti.github.io/local-time-blocking/
   - Check browser console for any errors

### Verifying gh-pages Branch Contents

After deployment, verify the branch has correct structure:

```bash
git switch gh-pages
git ls-tree -r HEAD
# Should show only:
# - assets/ (as a tree)
# - index.html (as a blob)
# Nothing else!

git switch claude/feature-task-types  # Switch back to feature branch
```

---

## ⚠️ CRITICAL: Git Safety Rules for gh-pages

### Rule 1: NEVER Force Push without Verification

**BEFORE any force push, ALWAYS**:

```bash
# Check existing commits on gh-pages
git log gh-pages --oneline -10

# Make sure you understand what you're overwriting
# If commits look correct, do NOT force push!
```

**Correct behavior**:
- Push normally: `git push origin gh-pages`
- Let it fail if there are conflicts
- Pull first if needed: `git pull origin gh-pages`

**WRONG behavior** ❌:
- Force push: `git push -f origin gh-pages`
- Overwriting existing commits without verification
- Using `--force-with-lease` without understanding consequences

### Rule 2: Commits are History - Never Lose Them

Once gh-pages branch has commits, they represent deployed versions:

```
b492a75  ← Previous deployment (correct structure)
a3f8e2c  ← Deployment before that
1f9c4d1  ← Original setup
```

If you force push and overwrite these, the deployment history is lost.

**Solution**: Only push new commits cleanly. Use normal `git push`, not `git push -f`.

### Rule 3: If Push Fails, Investigate First

```bash
# Push fails?
git push origin gh-pages

# FIRST: Check what's on remote
git log origin/gh-pages --oneline -5

# THEN: Decide what to do
# Option A: Pull and resolve (safest)
git pull origin gh-pages

# Option B: Create a new commit
git add .
git commit -m "docs: update gh-pages deployment"
git push origin gh-pages
```

---

## 🔧 Troubleshooting

### Problem: `npm run deploy` fails with authentication error

**Cause**: Remote URL is incorrect or token is invalid

**Solution**:
```bash
# Check current remote
git remote -v

# If it points to something other than github.com:
git remote set-url origin https://github.com/miguelTI/local-time-blocking.git

# Try deploy again
npm run deploy
```

### Problem: Deployment appears to take too long

**Cause**: GitHub Pages processing time (normal)

**Solution**:
- Wait 2-3 minutes
- Clear browser cache (Ctrl+Shift+Delete)
- Check the live URL: https://miguelti.github.io/local-time-blocking/
- If still not updated, check local `dist/` was built correctly

### Problem: Live site shows old version

**Cause**: Stale cache

**Solution**:
1. Force refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Wait for cache to expire (usually 5 minutes)
3. Check browser DevTools → Application → Storage → Clear all

### Problem: `dist/` folder not created

**Cause**: Build failed or missing dependencies

**Solution**:
```bash
npm install
npm run build

# Check that dist/ exists
ls -la dist/

# If empty, check for build errors in terminal output
```

---

## ✅ Deployment Checklist

Before deploying, verify:

- [ ] All code committed to feature branch
- [ ] Feature branch merged to main (if following main branch)
- [ ] Run `npm run build` locally without errors
- [ ] Verify `dist/index.html` exists
- [ ] Verify `dist/assets/` folder exists with CSS/JS
- [ ] No uncommitted changes: `git status` shows clean
- [ ] Remote is correct: `git remote -v`
- [ ] Ready to deploy: `npm run deploy`

---

## 📚 GitHub Pages Configuration

### Repository Settings

The repository is configured for GitHub Pages:

**Settings → Pages**:
- Source: Deploy from a branch
- Branch: `gh-pages` (root)
- Domain: Auto-generated HTTPS

**Note**: Do NOT change these settings without explicit approval.

---

## 🚫 Things That Break Deployment

❌ **Never do these**:
- Commit to `gh-pages` directly (use `npm run deploy`)
- Include `dist/` folder in main branch commits
- Include `node_modules/` anywhere
- Force push gh-pages without verification
- Change Pages settings in repository configuration
- Merge gh-pages branch into main or feature branches
- Commit with `--no-verify` or skip hooks

---

## 📝 Deployment in Evolution Workflow

When implementing a feature per PLANS.md:

1. **Development**: Work on feature branch `claude/feature-[name]`
2. **Build**: Run `npm run build` locally to verify
3. **Final Commit**: Push feature branch with all changes
4. **Deploy**: Run `npm run deploy` when feature is complete
5. **Verify**: Check live URL reflects new changes

---

## 🔗 Useful Commands

```bash
# View current remote
git remote -v

# Update remote URL if needed
git remote set-url origin https://github.com/miguelTI/local-time-blocking.git

# Build application
npm run build

# Deploy to GitHub Pages
npm run deploy

# Check git status
git status

# View gh-pages branch contents
git switch gh-pages && git ls-tree -r HEAD

# Switch back to working branch
git switch claude/feature-task-types
```

---

## 📞 Support

If deployment fails:

1. Check the troubleshooting section above
2. Review recent commits to understand what changed
3. Verify remote and branch configuration
4. Never force push without understanding consequences
5. Ask for help before trying experimental solutions

---

## Version History

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0 | 22/05/2026 | Documentação inicial com GitHub Pages workflow e git safety rules |

