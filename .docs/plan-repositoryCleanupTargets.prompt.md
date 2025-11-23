## Plan: Repository Cleanup Targets

Compile a cleanup shortlist across the repo by grouping duplicates, backups, generated outputs, and legacy prototypes, then validate references before deletion.

### Steps
1. Confirm duplicate build trees (public/alpha-vue-SPA, public/vue, public/assets vs alpha-vue-SPA/assets, vue-src-alpha/data/public) are unused, then prune redundant copies.
2. Review legacy prototype/test folders (public/test, public/tools, public/vue/dist/refactor-alpha) and remove if not referenced by docs or scripts.
3. Delete manual backups and snapshots (public/index.html.bak.*, tools/build-verify-deploy.ps1.corrupt.bak, public/planned-*.txt duplicates) after ensuring no rollback reliance.
4. Drop committed dependency directories (node_modules/, vue-src-alpha/node_modules/) if no offline build requirement exists.
5. Consolidate duplicated sample data (MusicXML files in public/tools vs elsewhere) and remove extra doc copies (planned-alpha-directory-tree.txt vs preAlpha versions).

### Further Considerations
1. Verify Netlify deploy or dev scripts don’t require alpha-vue-SPA mirror before removal.
