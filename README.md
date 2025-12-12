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

StreamScribe

A web application for transcribing YouTube videos using external AI transcription services. This README is intentionally minimal for public visibility, while still keeping enough notes for internal reference and future development.

Overview
StreamScribe retrieves audio from YouTube videos, processes transcriptions through an external transcription API, and provides users with downloadable text formats. The project includes authentication, a usage system, subscription tiers, and backend logic for managing costs and user limits.

Tech Stack
Next.js (App Router)
React / TypeScript
Tailwind CSS
MongoDB with Mongoose
NextAuth (Google OAuth + email/password)
Stripe (optional)
AssemblyAI (or other provider) for transcription

Project Structure Notes (internal reference)
Core directories:
app — Next.js routes and API endpoints
models — Mongoose schemas (subscription, usage tracking, transcriptions)
lib — helper utilities, pricing logic, auth config
services — transcription logic and external API interaction
components — UI components

Background tasks such as polling transcription status, caching transcripts, and usage tracking are handled in server-side routes.

Requirements
Node.js 18+
MongoDB Atlas
Google OAuth credentials (optional)
Transcription API key
Stripe keys (only if enabling subscriptions)

Environment Variables
This is for internal reference. Do not commit real values.

NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=
MONGODB_URI=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ASSEMBLYAI_API_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

Running Locally
Clone repository:
git clone https://github.com/yourusername/streamscribe.git
cd streamscribe

Install dependencies:
npm install

Setup environment file:
cp env.example .env.local

Run development:
npm run dev

Build production:
npm run build

Start production:
npm start

Deployment Notes (internal reference)

Vercel deployment:
npm install -g vercel
vercel --prod

Docker deployment:
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

Database
MongoDB Atlas free tier is sufficient.

To seed (only if you created scripts):
npm run db:seed

Internal Notes for the Future
Transcripts are cached to reduce API usage.
Usage tracking schema calculates user cost, API cost, profit, ROI, and other metrics.
Password reset via email is implemented; expected email volume is low, free tier services usually cover it.
Subscription tiers, pricing rules, and currency localization exist in code but are intentionally not documented publicly.
Stripe integration supports global subscriptions and payments. Only enable when ready.
A background job queue may be required later for scaling (BullMQ, etc).

License
MIT License

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

**Built with ❤️ for the global transcription community**
