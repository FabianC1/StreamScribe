# StreamScribe Setup Guide

This guide will walk you through setting up StreamScribe, a YouTube transcription service with subscription tiers.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example environment file and fill in your API keys:
```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Lemonfix AI API (for transcription service)
LEMONFIX_API_KEY=your_lemonfix_api_key_here
LEMONFIX_API_URL=https://api.lemonfix.com
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Required Services Setup

### Stripe Setup
1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com) and sign up
   - Complete account verification

2. **Get API Keys**
   - Go to Developers → API keys in your Stripe dashboard
   - Copy your publishable key (starts with `pk_test_`)
   - Copy your secret key (starts with `sk_test_`)

3. **Configure Webhooks** (Optional for production)
   - Go to Developers → Webhooks
   - Add endpoint: `https://yoursite.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.created`

### Lemonfix AI Setup
1. **Sign Up for Lemonfix**
   - Visit the Lemonfix AI service website
   - Create an account and get your API key

2. **Configure API**
   - Add your API key to `.env.local`
   - Test the API connection

## 📊 Pricing Structure

The application is configured with three subscription tiers:

| Tier | Customer Price | Hours | Features |
|------|----------------|-------|----------|
| Basic | £6.99 | 30 | Standard accuracy, Text export, Email support, Basic analytics |
| Standard | £12.99 | 60 | High accuracy, Multiple export formats, Priority support, Advanced analytics, Bulk processing |
| Premium | £19.99 | 100 | Premium accuracy, All export formats, 24/7 support, Full analytics dashboard, API access, Custom integrations, White-label options |

## 🗄️ Database Setup

Choose your preferred database:

### Option 1: SQLite (Development)
```env
DATABASE_URL=file:./dev.db
```

### Option 2: PostgreSQL
```env
DATABASE_URL=postgresql://username:password@localhost:5432/streamscribe
```

### Option 3: MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/streamscribe
```

## 🎯 Features to Implement

### Phase 1: Core Functionality ✅
- [x] YouTube URL input and validation
- [x] Transcription form and results display
- [x] Subscription pricing tiers
- [x] Stripe checkout integration
- [x] Basic UI components

### Phase 2: Backend Integration
- [ ] User authentication system
- [ ] Database integration for users and transcriptions
- [ ] Lemonfix AI API integration
- [ ] Usage tracking and limits
- [ ] Webhook handling for Stripe events

### Phase 3: Advanced Features
- [ ] User dashboard
- [ ] Transcription history
- [ ] Analytics and reporting
- [ ] API rate limiting
- [ ] Multiple export formats

## 🔍 Testing the Application

### 1. Demo Page
Visit `/demo` to test the transcription interface without authentication.

### 2. Pricing Tiers
Click on subscription buttons to test Stripe checkout (use test card numbers).

### 3. Transcription API
Test the transcription endpoint with a YouTube URL.

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_BASE_URL=https://yoursite.com
STRIPE_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that `tsconfig.json` is properly configured

2. **Stripe Integration Issues**
   - Verify API keys are correct
   - Check that keys are for the right environment (test/live)
   - Ensure webhook endpoints are configured

3. **Transcription API Errors**
   - Verify Lemonfix API key is valid
   - Check API rate limits
   - Ensure YouTube URLs are valid

4. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Development Tips

- Use Stripe test mode for development
- Monitor browser console for errors
- Check network tab for API calls
- Use Stripe CLI for webhook testing

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs and network requests
3. Verify all environment variables are set correctly
4. Ensure all required services are properly configured

## 🎉 Next Steps

Once the basic setup is working:
1. Integrate with your chosen database
2. Set up user authentication
3. Connect to Lemonfix AI API
4. Configure production environment
5. Set up monitoring and analytics

---

Happy coding! 🚀
