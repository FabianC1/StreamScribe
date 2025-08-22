# StreamScribe - YouTube Transcription Service

A professional YouTube video transcription service built with Next.js, React, TypeScript, and Stripe. StreamScribe allows users to transcribe YouTube videos using AI technology and offers three subscription tiers with different pricing and features.

## 🚀 Features

- **YouTube Integration**: Simply paste any YouTube URL and get instant transcription
- **AI-Powered Transcription**: High-accuracy transcription using Lemonfix AI service
- **Subscription Tiers**: Three pricing plans with different usage limits
- **Stripe Payments**: Secure payment processing with Stripe
- **Modern UI**: Beautiful, responsive design built with Tailwind CSS
- **Export Options**: Download transcripts in multiple formats
- **Real-time Processing**: Live transcription status updates

## 💰 Pricing Tiers

### Basic Tier
- **Cost to you**: £4.00 (30 hours of API usage)
- **Charge customers**: £6.99
- **Your profit**: £2.99

### Standard Tier
- **Cost to you**: £8.00 (60 hours of API usage)
- **Charge customers**: £12.99
- **Your profit**: £4.99

### Premium Tier
- **Cost to you**: £15.00 (100 hours of API usage)
- **Charge customers**: £19.99
- **Your profit**: £4.99

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Payments**: Stripe
- **AI Service**: Lemonfix (for transcription)
- **Icons**: Lucide React
- **Database**: Configurable (PostgreSQL, MongoDB, SQLite)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account
- Lemonfix AI API access
- Database (your choice)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd StreamScribe-1
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Set up environment variables
```bash
cp env.example .env.local
```

Edit `.env.local` with your actual API keys and configuration:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
LEMONFIX_API_KEY=your_lemonfix_api_key_here
DATABASE_URL=your_database_connection_string
```

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Add them to your `.env.local` file

### Lemonfix AI Integration
1. Sign up for Lemonfix AI service
2. Get your API key
3. Add it to your `.env.local` file

### Database Setup
Choose your preferred database and update the `DATABASE_URL` in your environment variables:

- **PostgreSQL**: `postgresql://username:password@localhost:5432/streamscribe`
- **MongoDB**: `mongodb://localhost:27017/streamscribe`
- **SQLite**: `file:./dev.db`

## 📁 Project Structure

```
StreamScribe-1/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── create-checkout-session/  # Stripe checkout
│   │   └── transcribe/               # Transcription API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── TranscriptionForm.tsx  # Main transcription form
│   └── PricingTiers.tsx   # Subscription pricing
├── public/                 # Static assets
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🔌 API Endpoints

### POST /api/create-checkout-session
Creates a Stripe checkout session for subscription payments.

**Body:**
```json
{
  "tier": "basic|standard|premium",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/pricing"
}
```

### POST /api/transcribe
Transcribes a YouTube video using the Lemonfix AI service.

**Body:**
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "userId": "user_id_here"
}
```

## 🎨 Customization

### Styling
The project uses Tailwind CSS with custom color schemes. You can modify:
- `tailwind.config.js` for theme customization
- `app/globals.css` for custom component styles

### Components
All components are built with TypeScript and can be easily customized:
- Modify pricing tiers in `components/PricingTiers.tsx`
- Update the transcription form in `components/TranscriptionForm.tsx`
- Customize the header and footer as needed

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security Considerations

- API keys are stored in environment variables
- Stripe handles all payment processing securely
- Input validation on all API endpoints
- CORS protection for API routes

## 📈 Future Enhancements

- User authentication and accounts
- Transcription history
- Advanced analytics dashboard
- Bulk transcription processing
- Multiple language support
- API rate limiting
- Webhook handling for Stripe events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

## 💡 Tips for Success

- **Start with test API keys** before going live
- **Monitor your API usage** to stay within Lemonfix limits
- **Set up webhooks** for Stripe events to track subscriptions
- **Implement proper error handling** for production use
- **Add analytics** to track user behavior and conversion rates

---

Built with ❤️ using Next.js, React, and TypeScript
