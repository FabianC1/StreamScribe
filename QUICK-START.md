# StreamScribe - Quick Start Guide

## ⚡ 5-Minute Quick Start

### Already Done ✓
- ✅ Dependencies installed
- ✅ Dev environment configured (`.env.local`)
- ✅ Build tested and working
- ✅ Dev server ready

### What You Need to Do

#### 1. Get API Keys (15 minutes)

**AssemblyAI** (for video transcription)
```bash
1. Go to https://www.assemblyai.com
2. Sign up → verify email
3. Copy API key
4. Add to .env.local: ASSEMBLYAI_API_KEY=your_key_here
```

**Google OAuth** (for sign-in)
```bash
1. Go to https://console.cloud.google.com
2. Create new project → Search "Google+ API" → Enable
3. Go to "Credentials" → Create OAuth 2.0 credentials
4. Type: Web Application
5. Add authorized redirect: <your app origin>/api/auth/callback/google
6. Copy Client ID and Secret
7. Add to .env.local:
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
```

**MongoDB** (for database)
```bash
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user with password
4. Get connection string (copy full URI)
5. Add to .env.local: MONGODB_URI=your_uri
```

**Stripe** (for payments)
```bash
1. Go to https://stripe.com
2. Sign up → complete account verification
3. Go to Developers → API keys
4. Copy publishable key (pk_test_...)
5. Copy secret key (sk_test_...)
6. Create 3 products with prices:
   - Basic: 30 hours/month
   - Standard: 60 hours/month
   - Premium: 100 hours/month
7. Add to .env.local:
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_BASIC_PRICE_ID=price_...
   (etc for Standard and Premium)
```

**Resend** (for password reset emails)
```bash
1. Go to https://resend.com
2. Sign up → verify email
3. Copy API key
4. Add to .env.local: RESEND_API_KEY=your_key_here
```

#### 2. Test Locally

```bash
# Start dev server (should already be running)
npm run dev

# Open your forwarded app URL in the browser

# Test these flows:
✓ Create account with email
✓ Login page
✓ Submit YouTube URL (use this test URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
✓ View pricing page
✓ Test password reset (check console for link)
```

#### 3. Deploy to Production (Choose One)

**Option A: Vercel** (Easiest)
```bash
# 1. Push code to GitHub
git add .
git commit -m "Setup complete"
git push

# 2. Go to https://vercel.com/new
# 3. Connect your GitHub repo
# 4. Add all environment variables from .env.local
# 5. Change to PRODUCTION API KEYS:
#    - Stripe: Use live keys (pk_live_, sk_live_)
#    - MongoDB: Use production database
#    - Google OAuth: Add production domain redirect URI
#    Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL to your domain
# 6. Click "Deploy"
# 7. Done! Your site is live
```

**Option B: Other Hosts**
- See [COMPLETE-SETUP.md](./COMPLETE-SETUP.md) for Netlify, AWS, DigitalOcean, etc.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **[COMPLETE-SETUP.md](./COMPLETE-SETUP.md)** | Full setup guide with all details |
| **[MONETIZATION.md](./MONETIZATION.md)** | Revenue strategies and optimization |
| **[README.md](./README.md)** | Feature overview and tech stack |
| **[PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md)** | Pre-launch testing checklist |
| **[deploy-production-checklist.sh](./deploy-production-checklist.sh)** | Automated deployment verification |

---

## 🎯 Your Action Items

### This Week:
- [ ] Get AssemblyAI API key
- [ ] Get Google OAuth credentials
- [ ] Set up MongoDB
- [ ] Get Stripe API keys
- [ ] Get Resend API key
- [ ] Update `.env.local` with all keys
- [ ] Test locally end-to-end

### Next Week:
- [ ] Switch Stripe to production keys
- [ ] Deploy to Vercel/Netlify/VPS
- [ ] Update domain DNS
- [ ] Test in production
- [ ] Monitor logs

### Following Week:
- [ ] Announce launch
- [ ] Gather user feedback
- [ ] Optimize based on analytics
- [ ] Plan monetization improvements

---

## 🚀 Current Status

```
Development:  ✅ READY
  ├─ Dependencies: ✅ Installed
  ├─ Build: ✅ Passing
  ├─ Dev Server: ✅ Running on port 3000
  └─ Code Quality: ✅ TypeScript errors fixed

API Keys:     ⏳ PENDING (You need to get these)
  ├─ AssemblyAI: ❌ Required
  ├─ Google OAuth: ❌ Required
  ├─ MongoDB: ❌ Required
  ├─ Stripe: ❌ Required
  └─ Resend: ❌ Required

Production:   ⏳ PENDING (After keys configured)
  ├─ Environment: ❌ Not deployed yet
  ├─ Domain: ❌ Not configured
  └─ Monitoring: ❌ Not set up
```

---

## 💡 Pro Tips

1. **Use Stripe Test Mode First**
   - Test card: `4242 4242 4242 4242`
   - Never use production keys for testing
   - Switch to live keys only when everything works

2. **Keep `.env.local` Safe**
   - Never commit to GitHub
   - Never share or screenshot
   - `.env.local` is already in `.gitignore` ✓

3. **Monitor Your Costs**
   - AssemblyAI: Free tier is 600 minutes/month
   - MongoDB: Free tier is 512 MB (enough for dev)
   - Stripe: Only pay on successful transactions
   - Resend: Free tier is 100 emails/day
   - **Total monthly cost for launch: $0** ✓

4. **Password Reset Testing**
   - During development, reset links appear in console
   - In production, emails are sent via Resend
   - Save the link from console to test the flow

---

## ❓ FAQ

**Q: Can I skip the MongoDB setup?**
A: No, it's required for user data, subscriptions, and transcription history.

**Q: Do I need to pay for anything before launch?**
A: No! All services have free tiers that cover development and small launches.

**Q: How long until I make money?**
A: Users can subscribe immediately after you flip Stripe to live mode.
First revenue typically comes within days of launch.

**Q: What if I mess up the Stripe setup?**
A: Subscriptions won't process, but nothing breaks. You can fix it anytime.
Stripe has excellent documentation and support.

**Q: How do I monitor issues in production?**
A: Check Vercel/Netlify logs. Add Sentry for advanced error tracking (optional).

---

## 🆘 Stuck?

1. **Read the detailed guides:**
   - [COMPLETE-SETUP.md](./COMPLETE-SETUP.md) - comprehensive setup
   - [README.md](./README.md) - tech overview

2. **Check API provider docs:**
   - AssemblyAI: https://docs.assemblyai.com
   - Stripe: https://stripe.com/docs
   - NextAuth: https://next-auth.js.org
   - MongoDB: https://docs.mongodb.com

3. **Verify locally first:**
   Run locally, fix issues, then deploy

---

**Ready? Start with AssemblyAI key then work through the checklist above. You've got this! 🚀**
