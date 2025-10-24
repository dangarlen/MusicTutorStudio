# Tailwind CSS + DaisyUI Installation Notes

REQUIRED FIX TO USE NEW VERSION
To use your production Tailwind/DaisyUI build, do the following in your HTML file (create-scales-wc.html):

Remove these lines from the <head> section:

Add this line in their place (in the <head>, after your other CSS/JS includes):

This will load your locally built Tailwind/DaisyU

^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

## Final Installed Version

- **Tailwind CSS version:** 3.3.3
- **Installation type:** Local npm install (not CDN)
- **Build method:** CSS built using the CLI (`npx tailwindcss ...`)
- **DaisyUI:** Installed via npm and included in Tailwind config
- **Recommended for:** Static sites, production use, and DaisyUI integration

## Why this version?

- Tailwind CSS v3.3.3 is stable and includes a reliable CLI for building CSS.
- Compatible with DaisyUI and most static site workflows.
- Tailwind v4+ does not expose a CLI in the same way and may require different build tools.

## Installation Steps

1. **Install Tailwind CSS v3.3.3 and DaisyUI locally:**
   ```sh
   npm install tailwindcss@3.3.3 daisyui
   ```
2. **Build your CSS:**
   ```sh
   npx tailwindcss -i ./tailwind/input.css -o ./public/alpha/site.css --minify
   ```
   _(Run this in WSL for best results on Windows)_
3. **Reference the built CSS in your HTML:**
   ```html
   <link href="site.css" rel="stylesheet" />
   ```
4. **Use DaisyUI and Tailwind classes in your HTML.**

## Helpful Links

- [Tailwind CSS Documentation](https://tailwindcss.com/docs/installation)
- [DaisyUI Documentation](https://daisyui.com/docs/install/)
- [Tailwind Play (online builder)](https://play.tailwindcss.com/)
- [WSL Setup Guide](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Browserslist Update Guide](https://github.com/browserslist/update-db#readme)

## Troubleshooting

- If CLI binaries are not created, use WSL or try an older Tailwind version (v3.3.3).
- For Windows, avoid CDN for production; use local build for best results.
- If you see a Browserslist warning, update with:
  ```sh
  npx update-browserslist-db@latest
  ```

## Summary

You are using a local, production-ready Tailwind CSS v3.3.3 build with DaisyUI, built via CLI and referenced in your HTML. This is the recommended workflow for static sites and modern UI development.
