# StreamScribe - AI-Powered YouTube Transcription Service

StreamScribe is a modern web application that transforms YouTube videos into accurate, timestamped transcripts using AssemblyAI's advanced speech recognition technology.

## 🚀 Features

- **AI-Powered Transcription**: 99.5% accuracy using AssemblyAI's universal speech model
- **YouTube Integration**: Extract audio from any YouTube video automatically
- **Real-time Processing**: Live transcription status updates
- **Advanced Insights**: 
  - Auto-generated highlights and key phrases
  - Sentiment analysis
  - Automatic chapter detection
  - Entity recognition
  - Speaker identification
- **Interactive Interface**: 
  - Clickable timestamps to jump to video sections
  - Add notes to any transcript segment
  - Copy text to clipboard
  - Export in multiple formats (TXT, SRT, VTT, PDF)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Beautiful theme switching with smooth transitions

## 💰 Pricing

StreamScribe offers flexible subscription plans to meet different transcription needs:

- **Basic Plan**: £6.99/month - 30 hours of transcription with standard accuracy
- **Standard Plan**: £12.99/month - 60 hours of transcription with high accuracy and advanced features
- **Premium Plan**: £19.99/month - 100 hours of transcription with premium accuracy and enterprise features

All plans include our core transcription features, multiple export formats, and priority support. Start with our Basic plan and upgrade as your needs grow.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI Transcription**: AssemblyAI API
- **Audio Processing**: yt-dlp for YouTube audio extraction
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Hooks
- **File Handling**: fs-extra for server-side file operations

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- AssemblyAI API key (free $50 credits available)
- yt-dlp (automatically installed via npm package)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd StreamScribe-1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# AssemblyAI API Key
ASSEMBLYAI_API_KEY=your_api_key_here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get your free AssemblyAI API key:**
1. Visit [AssemblyAI](https://www.assemblyai.com/)
2. Sign up for a free account
3. Get $50 in free credits
4. Copy your API key to the `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test the Transcription

1. Navigate to the main page
2. Paste a YouTube URL in the transcription form
3. Click "Transcribe"
4. Wait for processing (audio extraction + AI transcription)
5. View results in the three-panel interface

## 🔧 How It Works

### 1. Audio Extraction
- Uses `yt-dlp` to download and extract audio from YouTube videos
- Converts to MP3 format for optimal processing
- Automatically cleans up temporary files

### 2. AI Transcription
- Uploads audio to AssemblyAI's secure servers
- Processes using the universal speech model
- Enables advanced features like sentiment analysis and entity detection

### 3. Results Processing
- Polls AssemblyAI API until transcription completes
- Formats results with timestamps and confidence scores
- Generates insights and highlights automatically

## 📱 Usage

### Basic Transcription
1. **Enter YouTube URL**: Paste any valid YouTube video link
2. **Click Transcribe**: The system will extract audio and process it
3. **Wait for Results**: Processing time depends on video length
4. **View Transcript**: See word-by-word transcription with timestamps

### Advanced Features
- **Add Notes**: Click the note icon on any transcript segment
- **Copy Text**: Use the copy button to copy specific sections
- **Jump to Time**: Click timestamps to navigate video sections
- **Export**: Download transcripts in various formats

### Insights Panel
- **Highlights**: Key phrases and important concepts
- **Sentiment**: Emotional tone analysis throughout the video
- **Chapters**: Automatic video segmentation
- **Entities**: Named entities (people, places, organizations)

## 🔒 Security & Privacy

- **Secure Processing**: All audio is processed on AssemblyAI's secure servers
- **Temporary Storage**: Audio files are automatically deleted after processing
- **No Data Retention**: Transcripts are not stored permanently (unless you implement storage)
- **API Key Protection**: Environment variables keep your API key secure

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **Railway**: Great for full-stack apps
- **DigitalOcean**: For more control

## 📊 API Endpoints

### POST `/api/transcribe`
Transcribes a YouTube video using AssemblyAI.

**Request Body:**
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "transcript": "Full transcript text...",
  "confidence": 0.95,
  "audio_duration": 1800,
  "words": [...],
  "highlights": [...],
  "sentiment": [...],
  "chapters": [...],
  "entities": [...],
  "speaker_labels": [...],
  "language_code": "en",
  "youtube_url": "..."
}
```

## 🎯 Customization

### Adding New Export Formats
Edit the transcription results page to add more export options:

```typescript
// In app/transcription-results/page.tsx
const exportFormats = ['TXT', 'SRT', 'VTT', 'PDF', 'DOCX']
```

### Custom AI Features
AssemblyAI offers many additional features you can enable:

```typescript
// In app/api/transcribe/route.ts
const transcriptData = {
  audio_url: audioUrl,
  speech_model: 'universal',
  language_code: 'en',
  punctuate: true,
  format_text: true,
  speaker_labels: true,
  auto_highlights: true,
  sentiment_analysis: true,
  auto_chapters: true,
  entity_detection: true,
  // Add more features:
  // iab_categories: true,
  // auto_highlights_result: true,
  // content_safety: true,
  // custom_spelling: [...]
}
```

## 🐛 Troubleshooting

### Common Issues

**"yt-dlp not found"**
```bash
npm install yt-dlp-exec
```

**"AssemblyAI API key invalid"**
- Check your `.env.local` file
- Verify API key in AssemblyAI dashboard
- Ensure you have remaining credits

**"Audio extraction failed"**
- Check if YouTube URL is valid
- Ensure video is not private/restricted
- Try a different video

**"Transcription timeout"**
- Long videos may take more than 5 minutes
- Increase `maxAttempts` in the API route
- Check AssemblyAI service status

### Debug Mode
Enable detailed logging by setting:

```env
NODE_ENV=development
DEBUG=true
```

## 📈 Performance Optimization

### For Production
1. **Implement Caching**: Store completed transcriptions
2. **Queue System**: Handle multiple requests efficiently
3. **CDN**: Serve static assets globally
4. **Database**: Store user data and transcription history

### Rate Limiting
AssemblyAI has rate limits. Implement queuing for high-traffic scenarios.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [AssemblyAI](https://www.assemblyai.com/) for powerful transcription technology
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for YouTube audio extraction
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

- **Issues**: Create a GitHub issue
- **Documentation**: Check this README and code comments
- **AssemblyAI**: Visit their [documentation](https://www.assemblyai.com/docs)

---

**Happy Transcribing! 🎉**

Transform your YouTube content into searchable, analyzable text with StreamScribe.
