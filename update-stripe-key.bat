@echo off
echo Setting up your Stripe secret key for Supabase Edge Functions...
echo.
echo *** IMPORTANT: Replace "sk_test_YourStripeSecretKeyHere" with your actual Stripe secret key ***
echo.
echo npx -y supabase secrets set STRIPE_SECRET_KEY="sk_test_YourStripeSecretKeyHere" --project-ref wdbcwawakmyijhbwbdkt
echo.
echo After updating the key above, run this file by double-clicking it or from the terminal
pause
