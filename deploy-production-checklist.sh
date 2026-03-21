#!/bin/bash

# StreamScribe Production Deployment Checklist & Script
# Run this script to verify and prepare for production launch

set -e

echo "🚀 StreamScribe Production Deployment Script"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function
check_env() {
  local var=$1
  local desc=$2
  
  if [ -z "${!var}" ]; then
    echo -e "${RED}✗${NC} $desc not found in .env.local"
    echo "  Set: export $var=<your_value>"
    return 1
  else
    echo -e "${GREEN}✓${NC} $desc configured"
    return 0
  fi
}

# 1. Check environment variables
echo "1️⃣  Checking Environment Variables..."
echo ""

MISSING_VARS=0

check_env "NEXTAUTH_SECRET" "NEXTAUTH_SECRET" || MISSING_VARS=$((MISSING_VARS+1))
check_env "NEXTAUTH_URL" "NEXTAUTH_URL (production domain)" || MISSING_VARS=$((MISSING_VARS+1))
check_env "NEXT_PUBLIC_APP_URL" "NEXT_PUBLIC_APP_URL (production domain)" || MISSING_VARS=$((MISSING_VARS+1))

echo ""
check_env "MONGODB_URI" "MongoDB connection" || MISSING_VARS=$((MISSING_VARS+1))
echo ""

check_env "GOOGLE_CLIENT_ID" "Google OAuth Client ID" || MISSING_VARS=$((MISSING_VARS+1))
check_env "GOOGLE_CLIENT_SECRET" "Google OAuth Secret" || MISSING_VARS=$((MISSING_VARS+1))
echo ""

check_env "STRIPE_PUBLISHABLE_KEY" "Stripe Publishable Key" || MISSING_VARS=$((MISSING_VARS+1))
check_env "STRIPE_SECRET_KEY" "Stripe Secret Key" || MISSING_VARS=$((MISSING_VARS+1))
check_env "STRIPE_WEBHOOK_SECRET" "Stripe Webhook Secret" || MISSING_VARS=$((MISSING_VARS+1))
check_env "STRIPE_BASIC_PRICE_ID" "Stripe Basic Tier Price ID" || MISSING_VARS=$((MISSING_VARS+1))
check_env "STRIPE_STANDARD_PRICE_ID" "Stripe Standard Tier Price ID" || MISSING_VARS=$((MISSING_VARS+1))
check_env "STRIPE_PREMIUM_PRICE_ID" "Stripe Premium Tier Price ID" || MISSING_VARS=$((MISSING_VARS+1))
echo ""

check_env "ASSEMBLYAI_API_KEY" "AssemblyAI API Key" || MISSING_VARS=$((MISSING_VARS+1))
echo ""

check_env "RESEND_API_KEY" "Resend Email API Key" || MISSING_VARS=$((MISSING_VARS+1))
echo ""

if [ $MISSING_VARS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $MISSING_VARS environment variables are missing${NC}"
  echo ""
  echo "Add them to .env.local and retry:"
  echo "  export VAR_NAME=value"
  exit 1
fi

echo -e "${GREEN}✓ All environment variables configured${NC}"
echo ""

# 2. Build verification
echo "2️⃣  Building Application..."
echo ""

npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed. Fix errors above.${NC}"
  exit 1
fi

echo ""

# 3. Type checking
echo "3️⃣  Type Checking..."
echo ""

npm run type-check

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ No TypeScript errors${NC}"
else
  echo -e "${RED}✗ Type errors found. Fix them above.${NC}"
  exit 1
fi

echo ""

# 4. Deployment instructions
echo "4️⃣  Deployment Instructions"
echo ""

echo "Choose your hosting platform:"
echo ""
echo "📌 Option A: Vercel (Recommended)"
echo "   1. Go to https://vercel.com"
echo "   2. Connect your GitHub repository"
echo "   3. Add environment variables from .env.local"
echo "   4. Deploy!"
echo ""

echo "📌 Option B: Netlify"
echo "   1. Go to https://netlify.com"
echo "   2. Connect your GitHub repository"
echo "   3. Build: npm run build"
echo "   4. Publish: .next"
echo "   5. Add environment variables"
echo ""

echo "📌 Option C: Self-Hosted (AWS/DigitalOcean/VPS)"
echo "   1. npm run build"
echo "   2. npm start (runs on port 3000)"
echo "   3. Use PM2 or systemd to keep it running"
echo ""

# 5. Pre-deployment testing
echo ""
echo "5️⃣  Pre-Deployment Tests"
echo ""

echo "Before going live, test these flows:"
echo ""
echo "✓ User Registration & Email Verification"
echo "  - Create new account with email"
echo "  - Check password reset email"
echo "  - Verify email delivery working"
echo ""

echo "✓ Google OAuth"
echo "  - Click 'Sign in with Google'"
echo "  - Verify redirect works"
echo "  - Check user is created in database"
echo ""

echo "✓ Subscription Payment (Test Mode)"
echo "  - Click 'Subscribe' button"
echo "  - Enter test card: 4242 4242 4242 4242"
echo "  - Verify subscription status updates"
echo "  - Check user hours limit is updated"
echo ""

echo "✓ Transcription Flow"
echo "  - Submit a YouTube video URL"
echo "  - Verify transcription starts"
echo "  - Check progress updates"
echo "  - Download transcript in multiple formats"
echo ""

echo "✓ Profile & Settings"
echo "  - Update user profile"
echo "  - Change password"
echo "  - Update subscription tier"
echo ""

# 6. Final checklist
echo ""
echo "6️⃣  Pre-Flight Checklist"
echo ""

echo -e "${YELLOW}Before launching to production, verify:${NC}"
echo ""
echo "[ ] All API keys are PRODUCTION keys (not test keys)"
echo "[ ] Database is a production MongoDB cluster"
echo "[ ] SSL certificate is installed (auto with Vercel/Netlify)"
echo "[ ] Domain is properly configured"
echo "[ ] Email service is working"
echo "[ ] Stripe webhook is receving events"
echo "[ ] Google OAuth redirect URI includes production domain"
echo "[ ] NEXTAUTH_SECRET is 32+ characters"
echo "[ ] .env.local is in .gitignore (never commit secrets)"
echo "[ ] Database backups are configured"
echo "[ ] Error monitoring is set up (optional: Sentry)"
echo ""

echo -e "${GREEN}✓ Ready for deployment!${NC}"
echo ""
echo "Next steps:"
echo "  1. Commit changes: git add . && git commit -m 'Production setup'"
echo "  2. Deploy using your chosen platform"
echo "  3. Monitor logs and error reports"
echo "  4. Celebrate launch! 🎉"
echo ""
