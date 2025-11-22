# Build & Deploy Scripts Analysis

**Date:** November 22, 2025  
**Context:** Repository cleanup with canonical path structure

## Updated Scripts

### ✅ `tools/uprev.ps1` - UPDATED
**Status:** Fixed to use canonical paths  
**Changes:**
- `public/data/version.json` → `data/version.json`
- `public/data/change-log.json` → `data/change-log.json`

**Purpose:** Increments version numbers and updates change log  
**Still Valid:** ✅ Yes - core functionality remains relevant

---

## Scripts That Need Review/Update

### ⚠️ `tools/build-alpha-vue-spa.ps1` - NEEDS REVIEW
**Current Purpose:** Builds Vue SPA, promotes to public/index.html, deploys to Netlify  
**Issues:**
- Complex asset promotion logic (copies SPA assets to /public/assets/)
- Promotes alpha-vue-SPA/index.html to public/index.html (overwrites main landing page)
- Creates backup files with timestamps

**Recommendation:** 
- **Consider deprecating** in favor of simpler workflow
- If the SPA should BE the main site, this is correct
- If public/index.html should remain separate, this conflicts

**Alternative:** Use `build-verify-deploy.ps1` which has better verification steps

---

### ⚠️ `tools/vueDeploySPA.ps1` - POSSIBLY REDUNDANT
**Current Purpose:** Build Vue SPA into public/alpha-vue-SPA  
**Issues:**
- Does NOT deploy (despite name)
- Only builds, does not promote or copy assets
- Simpler than build-alpha-vue-spa.ps1

**Recommendation:**
- **Rename to `build-vue-spa.ps1`** to reflect actual function
- Use this for local builds
- Use `build-alpha-vue-spa.ps1` for deployment builds

---

### ✅ `tools/dev-alpha-vue-spa.ps1` - VALID
**Current Purpose:** Run Vue dev server  
**Status:** No changes needed  
**Still Valid:** ✅ Yes

---

### ✅ `tools/vueView.ps1` - DUPLICATE OF dev-alpha-vue-spa.ps1
**Current Purpose:** Run Vue dev server  
**Status:** Exact duplicate  
**Recommendation:** 
- **DELETE** - use `dev-alpha-vue-spa.ps1` instead
- Or keep one and delete the other

---

### ✅ `deploy.ps1` (root) - SIMPLE & VALID
**Current Purpose:** Deploy public/ folder to Netlify  
**Status:** Simple, clean, no path dependencies  
**Still Valid:** ✅ Yes - best for quick deployments after manual builds

---

### ⚠️ `tools/build-verify-deploy.ps1` - COMPREHENSIVE
**Current Purpose:** Full build → verify → promote → deploy pipeline  
**Features:**
- Builds SPA
- Copies libs from public/libs → public/alpha-vue-SPA/libs
- Promotes index.html to public/index.html
- Copies assets to public/assets/
- Verifies outputs
- Deploys to Netlify

**Status:** Most comprehensive script  
**Recommendation:** 
- **This should be the PRIMARY deployment script**
- Handles all edge cases
- Good for CI/CD

---

## Deprecated/Obsolete Scripts

None of the current scripts reference old paths like:
- ❌ `public/data/` (now `data/`)
- ❌ `public/scripts/` (now `src/scripts/`)

However, some scripts may reference directories marked for deletion:
- `public/alpha-backup_10-25-2025/`
- `public/assets_DELETE_ME/`
- Legacy prototype/daisy folders

**Recommendation:** Verify no scripts copy or reference _DELETE_ME folders

---

## Recommended Script Hierarchy

### For Local Development
1. **`tools/dev-alpha-vue-spa.ps1`** - Start dev server
2. **`tools/vueDeploySPA.ps1`** - Build SPA only (local testing)

### For Deployment
1. **`tools/build-verify-deploy.ps1`** - PRIMARY (full pipeline with verification)
2. **`tools/build-alpha-vue-spa.ps1`** - ALTERNATIVE (simpler, less verification)
3. **`deploy.ps1`** - Manual deploy only (after manual build)

### For Version Management
1. **`tools/uprev.ps1`** - Update version & changelog ✅ Fixed

---

## Action Items

1. ✅ **DONE:** Update `tools/uprev.ps1` paths
2. **TODO:** Delete `tools/vueView.ps1` (duplicate of dev-alpha-vue-spa.ps1)
3. **TODO:** Rename `tools/vueDeploySPA.ps1` → `tools/build-vue-spa.ps1` (clarify it doesn't deploy)
4. **TODO:** Update VS Code tasks to use `build-verify-deploy.ps1` as primary deploy task
5. **TODO:** Add comments to `build-alpha-vue-spa.ps1` warning about index.html overwrite behavior
6. **TODO:** Verify no scripts reference _DELETE_ME folders

---

## Script Comparison Matrix

| Script | Build | Verify | Promote | Copy Assets | Copy Libs | Deploy | Best Use |
|--------|-------|--------|---------|-------------|-----------|--------|----------|
| `dev-alpha-vue-spa.ps1` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Dev server |
| `vueDeploySPA.ps1` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Local build |
| `build-alpha-vue-spa.ps1` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | Quick deploy |
| `build-verify-deploy.ps1` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Production deploy |
| `deploy.ps1` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Manual deploy |

---

## Notes

- All scripts assume `vue-src-alpha/` as source directory ✅
- All scripts output to `public/alpha-vue-SPA/` ✅
- Asset promotion varies (some scripts copy to `/public/assets/`, others don't)
- Index promotion behavior differs (affects whether SPA is main site or subsection)

