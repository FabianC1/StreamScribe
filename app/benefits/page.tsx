import Link from 'next/link'
import {
  BrainCircuit,
  Clock3,
  FileText,
  FolderKanban,
  Languages,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const benefits = [
  {
    title: 'Faster Content Workflow',
    description:
      'Turn long videos into searchable notes in minutes so you can extract what matters without rewatching everything.',
    icon: Clock3,
  },
  {
    title: 'Clear, Exportable Output',
    description:
      'Use ready-to-share transcript formats for docs, captions, and team handoff with no manual cleanup.',
    icon: FileText,
  },
  {
    title: 'Smarter Learning And Review',
    description:
      'Find key sections quickly and revisit ideas with timestamps, instead of scrubbing through entire videos.',
    icon: BrainCircuit,
  },
  {
    title: 'Organized History',
    description:
      'Keep all past transcriptions in one place so you can reuse insights across projects and teams.',
    icon: FolderKanban,
  },
  {
    title: 'Better Accessibility',
    description:
      'Support different audiences with readable text output and easier review for non-native listeners.',
    icon: Languages,
  },
  {
    title: 'Private, Account-Based Access',
    description:
      'Your activity stays tied to your account with secure access and settings control from one dashboard.',
    icon: ShieldCheck,
  },
]

export default function BenefitsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <Header />

      <main className="pt-28 pb-16 px-4">
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Why StreamScribe Helps
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Benefits You Actually Feel
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              This page focuses on practical value: saving time, reducing manual work,
              and making video knowledge easy to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <article
                  key={benefit.title}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </article>
              )
            })}
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                Ready to use these benefits?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start a transcription now or tune your account from Settings.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/transcribe" className="btn-primary">
                Start Transcribing
              </Link>
              <Link href="/settings" className="btn-secondary">
                Open Settings
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
