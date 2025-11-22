# Copilot RESET Script
# Resets Copilot Chat state and reloads the VS Code window

Write-Host "🔄 Copilot RESET initiated..." -ForegroundColor Cyan

# Execute VS Code commands via the CLI
# Note: These commands require the VS Code CLI to be available

Write-Host "1️⃣ Resetting Copilot Chat state..." -ForegroundColor Yellow
code --command workbench.action.chat.clearHistory

Start-Sleep -Milliseconds 500

Write-Host "2️⃣ Reloading VS Code window..." -ForegroundColor Yellow
code --command workbench.action.reloadWindow

Write-Host "✅ Copilot RESET complete!" -ForegroundColor Green
