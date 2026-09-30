# Afronomics: set the production environment variables on Vercel, then redeploy.
# Run from the project folder:  powershell -ExecutionPolicy Bypass -File scripts\setup-env.ps1
# Keys are typed at hidden prompts and go straight to Vercel; nothing is written to disk.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Read-Secret($prompt) {
  $secure = Read-Host -Prompt $prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr).Trim() }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

function Set-VercelEnv($name, $value) {
  if ([string]::IsNullOrWhiteSpace($value)) { Write-Host "  skipped $name (empty)"; return }
  vercel env rm $name production --yes 2>$null | Out-Null
  $value | vercel env add $name production | Out-Null
  Write-Host "  set $name"
}

Write-Host "`nAfronomics production settings`n" -ForegroundColor Cyan

# Database (public URL, not a secret)
Set-VercelEnv "SUPABASE_URL" "https://ugjpcybhqwvzidcbqpik.supabase.co"

Write-Host "`nSupabase service_role key: Supabase dashboard > afronomicsfeed > Project Settings > API Keys"
Set-VercelEnv "SUPABASE_SERVICE_ROLE_KEY" (Read-Secret "Paste the service_role key (hidden)")

Write-Host "`nPaystack secret key: Paystack dashboard > Settings > API Keys & Webhooks (sk_live_... or sk_test_...)"
Set-VercelEnv "PAYSTACK_SECRET_KEY" (Read-Secret "Paste the Paystack secret key (hidden)")

Write-Host "`nOptional: recurring plans. Create them in Paystack > Products > Plans (monthly), then paste the plan codes (PLN_...)."
Write-Host "Leave blank to charge one month at a time instead."
Set-VercelEnv "PAYSTACK_PLAN_PRO" (Read-Host "Pro plan code")
Set-VercelEnv "PAYSTACK_PLAN_TEAM" (Read-Host "Team plan code")

Write-Host "`nCurrency for Pro/Team one-off charges. Use USD only if Paystack has enabled USD on your account; otherwise KES."
$currency = Read-Host "Currency [USD]"
if ([string]::IsNullOrWhiteSpace($currency)) { $currency = "USD" }
Set-VercelEnv "PAYSTACK_CURRENCY" $currency.ToUpper()

# Protects the daily archive job; Vercel sends it automatically with each cron call.
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
Set-VercelEnv "CRON_SECRET" ([Convert]::ToBase64String($bytes) -replace '[+/=]', '')

Write-Host "`nRedeploying production so the settings take effect..." -ForegroundColor Cyan
vercel deploy --prod --yes

Write-Host "`nLast step in Paystack: Settings > API Keys & Webhooks > Live Webhook URL:" -ForegroundColor Cyan
Write-Host "  https://www.afronomicsfeed.com/api/paystack/webhook`n"
