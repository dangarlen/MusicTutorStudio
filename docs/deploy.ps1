Write-Host "✅ deploy.ps1 script started"

# Check if Netlify CLI is installed
if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Netlify CLI not found. Install it with: npm install -g netlify-cli"
    exit 1
}

# Check for public folder
if (-not (Test-Path "public")) {
    Write-Host "❌ public/ folder not found. Aborting."
    exit 1
}

# Link to the correct Netlify site (only needed once)
# netlify link --id <your-site-id>

# Deploy to Netlify
Write-Host "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=public

# Open the deployed site in your default browser
Start-Process "https://musictutorstudio.netlify.app/"

