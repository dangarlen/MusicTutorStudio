# VS Code Task Menu Items
**Updated:** November 22, 2025

When you press `Ctrl+Shift+P` → `Tasks: Run Task`, you'll see these menu choices:

## 🚀 Build & Deploy Tasks

1. **🚀 Deploy (Build, Verify & Deploy) - PRIMARY** ⭐ (Default)
   - Full build → verify → copy libs → promote → deploy pipeline
   - Script: `tools/build-verify-deploy.ps1`
   - **Use this for production deployments**

2. **📤 Deploy Only (Manual - No Build)**
   - Deploys existing public/ folder to Netlify without building
   - Script: `deploy.ps1`
   - Use after manual builds

3. **🔨 Build SPA (Simple - No Deploy)**
   - Builds SPA with asset promotion but NO deploy
   - Script: `tools/build-alpha-vue-spa.ps1`
   - Use for testing build output

4. **🔨 Build Vue SPA Only (No Deploy)**
   - Simple build into public/alpha-vue-SPA (no promotion)
   - Script: `tools/vueDeploySPA.ps1`
   - Use for local testing

## 🎯 Development Tasks

5. **🎯 Dev Server (Vue SPA)**
   - Starts Vite dev server for Vue SPA development
   - Script: `tools/dev-alpha-vue-spa.ps1`
   - Port: 5173

6. **Dev Server (npm run dev)**
   - Alternative dev server (npm command)
   - Keyboard shortcut: `Ctrl+Alt+D`

## 🌐 Static Server Tasks

7. **Serve public (Python http.server)**
   - Serves public/ folder with Python's built-in server
   - Port: 8000

8. **Serve public (npx serve)**
   - Serves public/ folder with npx serve
   - Port: 8000

9. **Serve + Open Live Preview**
   - Starts server AND opens browser automatically
   - Runs tasks 8 → 10 in sequence

10. **Open Live Preview (browser)**
    - Opens http://localhost:8000/index.html in default browser

## 🛠️ Utility Tasks

11. **📝 Version Bump (Uprev)**
    - Interactive version number update
    - Updates data/version.json and change-log.json
    - Script: `tools/uprev.ps1`

12. **Run Finder**
    - Runs finder.bat script
    - Script: `finder.bat`

13. **Run Orphan Scanner**
    - Scans for orphaned files
    - Script: `orphans.bat`

14. **Test Task 2**
    - Simple echo test task

---

## Removed/Consolidated Tasks

The following tasks were **removed as duplicates** or **outdated**:

- ❌ "✈️✈️✈️ 🚀 Push & Deploy to Netlify" → Replaced by "🚀 Deploy (Build, Verify & Deploy) - PRIMARY"
- ❌ "✈️ Build Verify & Deploy (Rev 2.0)✈️" → Duplicate, removed
- ❌ "✈️✈️ Netlify Deploy (build-alpha-vue-spa.ps1)" → Duplicate, removed
- ❌ "✈️✈️Copy libs" → Outdated, libs now copied in build script
- ❌ "Vue View (Dev Server)" → Duplicate of "🎯 Dev Server (Vue SPA)"
- ❌ Duplicate "Dev Server (npm run dev)" → Consolidated to one

---

## Quick Reference

**For daily development:**
- 🎯 Dev Server (Vue SPA)

**For production deployment:**
- 🚀 Deploy (Build, Verify & Deploy) - PRIMARY

**For testing builds:**
- 🔨 Build Vue SPA Only (No Deploy)

**For static file serving:**
- Serve + Open Live Preview

**For version updates:**
- 📝 Version Bump (Uprev)

