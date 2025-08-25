# 🌍 StreamScribe - Global YouTube Transcription Service

**Professional YouTube transcription service with AI-powered insights, available worldwide with localized pricing.**

## 🚀 Features

- **🌍 International Support**: Automatic currency detection and localized pricing
- **🎯 AI-Powered Transcription**: High-accuracy transcription using AssemblyAI
- **💳 Global Payments**: Stripe integration with 135+ currencies
- **🔐 Secure Authentication**: Google OAuth + custom email/password
- **📱 Responsive Design**: Works on all devices
- **🌙 Dark/Light Mode**: User preference support
- **📊 Usage Analytics**: Track transcription hours and exports
- **🔒 Tiered Access**: Basic, Standard, and Premium plans

## 🌍 International Pricing

StreamScribe automatically detects your location and shows prices in your local currency:

| Plan | Features | Price (Local Currency) |
|------|----------|------------------------|
| **Basic** | 30 hours/month, TXT exports, timestamps | Auto-detected |
| **Standard** | 60 hours/month, TXT/DOCX/SRT, advanced analytics | Auto-detected |
| **Premium** | 100 hours/month, all formats, AI highlights | Auto-detected |

**Supported Regions**: 50+ countries with automatic currency conversion
**Payment Methods**: Credit cards, debit cards, digital wallets
**Tax Compliance**: Automatic tax calculation based on location

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js + Google OAuth
- **Payments**: Stripe (global payment processing)
- **AI Services**: AssemblyAI for transcription
- **Deployment**: Vercel, Netlify, or any Node.js hosting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Google Cloud Console project
- Stripe account
- AssemblyAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/streamscribe.git
   cd streamscribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🌍 Production Deployment

### 1. Environment Setup

Create `.env.local` with production values:

```bash
# Production URLs
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streamscribe

# Authentication
NEXTAUTH_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Services
ASSEMBLYAI_API_KEY=your-assemblyai-key

# Payments
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### 2. Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel --prod
```

### 3. Database Setup

```bash
# Seed initial data
npm run db:seed

# Run migrations (if any)
npm run db:migrate
```

## 🔧 Configuration

### International Pricing

The app automatically detects user location and shows appropriate pricing:

- **Currency Detection**: Uses IP geolocation to determine user's country
- **Exchange Rates**: Built-in exchange rate calculations for 50+ currencies
- **Local Formatting**: Prices displayed in local currency format
- **Tax Compliance**: Automatic tax calculation based on location

### Stripe Integration

Configure Stripe for global payments:

1. **Enable international payments** in your Stripe dashboard
2. **Set up webhooks** for subscription management
3. **Configure tax rates** for different regions
4. **Enable local payment methods** (iDEAL, SEPA, etc.)

## 📊 Monitoring & Analytics

### Health Checks

Monitor your application health:

```bash
# Health check endpoint
GET /api/health

# Response includes:
# - Database status
# - Environment variables
# - Response time
# - Uptime
```

### Performance Metrics

- **Response Time**: Track API performance
- **Error Rates**: Monitor application health
- **User Analytics**: Track usage patterns
- **Revenue Metrics**: Monitor subscription growth

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Security Headers**: XSS protection, clickjacking prevention
- **Input Validation**: Sanitized user inputs
- **JWT Tokens**: Secure session management
- **CORS Protection**: Controlled cross-origin requests

## 🌍 Localization Support

### Supported Languages

- **Primary**: English
- **Planned**: Spanish, French, German, Portuguese, Japanese, Korean, Chinese, Arabic, Hindi

### Regional Features

- **Currency**: Automatic detection and conversion
- **Time Zones**: User preference support
- **Date Formats**: Localized date/time display
- **Number Formats**: Regional number formatting

## 📈 Scaling Considerations

### For 1000+ Users

- **Database**: MongoDB Atlas M10+ cluster
- **Caching**: Redis for session storage
- **CDN**: Cloudflare or AWS CloudFront
- **Monitoring**: Sentry for error tracking

### For 10,000+ Users

- **Load Balancing**: Multiple server instances
- **Database**: MongoDB Atlas M30+ with read replicas
- **File Storage**: AWS S3 or Google Cloud Storage
- **Queue System**: Bull/BullMQ for background jobs

## 🚀 Deployment Platforms

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 Support

- **Documentation**: [docs.streamscribe.com](https://docs.streamscribe.com)
- **Email**: support@streamscribe.com
- **Discord**: [Join our community](https://discord.gg/streamscribe)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

**Built with ❤️ for the global transcription community**
