Contributing to Music Tutor Studio

## Coding Standards

- All new code must use ES modules (import/export)
- No global variables; use explicit imports/exports
- Use DaisyUI/Tailwind for UI components
- All config/data must be loaded from JSON
- Use VexFlow for music notation

## Commit Rules

- Use clear, descriptive commit messages
- Reference related issues or TTD items
- Group related changes in a single commit

## Branching Strategy

- `main`: Stable production code
- `dev`: Active development
- Feature branches: `feature/<name>`
- Always PR to `dev` before merging to `main`

## Review & Testing

- Run ESLint/static analysis before PR
- Use orphan scanner to remove unused files
- Test UI and staff rendering in browser

## Documentation

- Update `README.md` and `.docs/migration-outline.md` for major changes
  migration-outline.md
