# StreamScribe - Complete Setup & Deployment Guide

## ✅ Current Status

**Development Environment**: Ready ✓
- Dependencies installed
- `.env.local` configured for development
- Build successful
- Dev server running on `localhost:3000`

---

## 🚀 Setup Overview

StreamScribe is a **global YouTube transcription service** with:
- **AI Transcription**: Uses AssemblyAI API
- **Subscription Tiers**: Basic (£6.99/30h), Standard (£12.99/60h), Premium (£19.99/100h)
- **International Pricing**: Auto-detects user location, shows prices in local currencies
- **Payments**: Stripe integration (135+ currencies)
- **Auth**: Google OAuth + email/password with password reset

---

## 📋 Immediate Next Steps (Required for Publishing)

### 1. **Get Required API Keys** (Cost: Free or minimal)

#### AssemblyAI (Free - 600 mins/month)
- Go to [assemblyai.com](https://www.assemblyai.com)
- Sign up and get your API key
- Add to `.env.local`:
```env
ASSEMBLYAI_API_KEY=your_key_here
```

#### Google OAuth (Free)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Set redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

#### Stripe (Free, pay only on transactions)
1. Go to [stripe.com](https://stripe.com)
2. Create account and go to Dashboard
3. Under "Developers" → "API keys", copy:
   - `pk_test_...` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `sk_test_...` → `STRIPE_SECRET_KEY`
4. Create 3 products for subscription tiers:
   - Basic: 30 hours/month at your local price
   - Standard: 60 hours/month
   - Premium: 100 hours/month
5. Get price IDs and add to `.env.local`

#### MongoDB (Free M0 tier)
1. Go to [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Create account and cluster
3. Create database user with password
4. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/...`)
5. Add to `.env.local`:
```env
MONGODB_URI=your_connection_string
```

#### Resend (Free - 100 emails/day)
- Go to [resend.com](https://resend.com)
- Sign up and get API key
- Add to `.env.local`:
```env
RESEND_API_KEY=your_key_here
```

### 2. **Update `.env.local` with Real Keys**

Replace every placeholder with actual keys from above services.

### 3. **Test All Features Locally**

```bash
npm run dev
# Then test:
# - Create account (email + password)
# - Login with Google OAuth
# - Submit YouTube URL for transcription
# - Check subscription pricing
# - Test password reset (check console for link)
```

---

## 🌐 Deploy to Production (15 minutes)

### Option A: Vercel (Recommended - Free tier available)

**Easiest option, auto-deploys from GitHub**

1. Connect GitHub to [vercel.com](https://vercel.com)
2. Import StreamScribe repository
3. Add environment variables in Vercel dashboard
4. Change to production API keys:
   - Google OAuth: Add production domain redirect URI
   - Stripe: Switch to live keys
   - MongoDB: Use production database
5. Deploy!
6. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your domain

### Option B: Netlify

1. Connect GitHub to [netlify.com](https://netlify.com)
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy!

### Option C: Self-Hosted (AWS, DigitalOcean, etc.)

```bash
# Build
npm run build

# Start server
npm start
# Server runs on port 3000

# Use PM2 to keep it running
npm install -g pm2
pm2 start "npm start" --name streamscribe
pm2 startup
pm2 save
```

---

## 💳 Monetization Setup

### Current Monetization Model
- **Free account**: Limited features (basic plan locked)
- **Subscription tiers**: Basic/Standard/Premium via Stripe
- **Usage tracking**: Hours used tracked per user
- **Automatic enforcement**: Users can't transcribe beyond their limits

### Monetization Enhancements

1. **Webhook Verification** (Critical)
   - Stripe → Settings → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.deleted`
   - This auto-updates subscription status when users pay

2. **Upgrade Prompts**
   - Add "Upgrade to Premium" button when user is near hour limit
   - Add discount codes during signup
   - Implement affiliate/referral system

3. **Analytics Dashboard**
   - Track revenue per tier
   - Monitor churn rate
   - Analyze usage patterns

4. **Additional Revenue Streams**
   - Bulk transcription discounts
   - API access for higher tiers
   - White-label options (for enterprises)

---

## 📊 Pre-Launch Checklist

- [ ] All API keys configured and tested
- [ ] MongoDB production database set up
- [ ] Stripe webhooks verified
- [ ] Google OAuth production credentials
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate set up (auto via Vercel/Netlify)
- [ ] Password reset email working
- [ ] Subscription payment flow tested (in Stripe test mode)
- [ ] User profile page tested
- [ ] Dark/light mode toggle working
- [ ] Analytics tracking configured (optional)
- [ ] Error monitoring set up (optional - Sentry)

---

## 🔐 Production Security Checklist

- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Production NEXTAUTH_SECRET (32+ characters, random)
- [ ] CORS properly configured for your domain
- [ ] Rate limiting on API endpoints
- [ ] Database backups configured
- [ ] SSL/TLS enabled (auto with Vercel/Netlify)

---

## 🎯 Launch Timeline

**Week 1:**
- [ ] Get all API keys
- [ ] Test locally
- [ ] Deploy to production

**Week 2:**
- [ ] Soft launch (limited users)
- [ ] Monitor for errors
- [ ] Fix bugs

**Week 3:**
- [ ] Full public launch
- [ ] Marketing/SEO
- [ ] Monitor analytics

---

## 📞 Support & Troubleshooting

### Common Issues

**"Cannot find module 'xyz'"**
```bash
npm install
npm run build
```

**MongoDB connection fails**
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Check username/password

**Stripe payment fails**
- Verify webhook is set up
- Check that price IDs are correct
- Test with Stripe test card: `4242 4242 4242 4242`

**Google OAuth not working**
- Verify redirect URI matches your domain
- Check that credentials are from "Web application" type
- Clear browser cookies

---

## 📚 Documentation Files

- [SETUP.md](./SETUP.md) - Initial development setup
- [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md) - Full deployment checklist
- [README.md](./README.md) - Feature overview
