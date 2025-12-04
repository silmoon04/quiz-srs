import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Design Showcase | Quiz SRS',
  description: 'Explore 7 unique UI theme variations for the Quiz SRS app',
};

const themes = [
  {
    id: 'ankidroid',
    name: 'AnkiDroid Warm',
    description: 'Warm, inviting aesthetic with soft curves and cream backgrounds',
    colors: ['#FDF6E9', '#5DADE2', '#F5B041', '#2C3E50'],
  },
  {
    id: 'aptitude',
    name: 'Aptitude Test',
    description: 'Ultra-clean, professional with thin borders and purple accents',
    colors: ['#FFFFFF', '#9B59B6', '#27AE60', '#E8E8E8'],
  },
  {
    id: 'playful',
    name: 'Math Quiz Playful',
    description: 'Fun, gamified with vibrant purples, pinks, and celebrations',
    colors: ['#F8F4FF', '#7C3AED', '#EC4899', '#10B981'],
  },
  {
    id: 'saas',
    name: 'Learning Content Pro',
    description: 'Professional SaaS dashboard with cards, tags, and filters',
    colors: ['#FAFAFA', '#8B5CF6', '#F59E0B', '#22C55E'],
  },
  {
    id: 'minimal',
    name: 'Minimalist B&W',
    description: 'Extreme minimalism with serif typography and monochrome palette',
    colors: ['#FAFAFA', '#000000', '#F5F5F5', '#E0E0E0'],
  },
  {
    id: 'dark',
    name: 'Dark Mode Premium',
    description: 'Premium dark aesthetic with bright yellow accents',
    colors: ['#0A0A0A', '#FACC15', '#1A1A1A', '#333333'],
  },
  {
    id: 'brand',
    name: 'Testree Brand',
    description: 'Bold color blocks with coral red, teal, and navy palette',
    colors: ['#FFFFFF', '#E63946', '#457B9D', '#1D3557'],
  },
];

export default function DesignShowcasePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            🎨 Design Showcase
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-400">
            Explore 7 unique UI theme variations for the Quiz SRS app. Each theme includes 4
            screens: Dashboard, Quiz, SRS Review, and Import.
          </p>
        </div>

        {/* Theme Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Link
              key={theme.id}
              href={`/design-showcase/theme-${theme.id}`}
              className="group block"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
                {/* Color Swatches */}
                <div className="mb-4 flex gap-2">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-lg border border-slate-200 shadow-inner dark:border-slate-600"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Theme Info */}
                <h2 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                  {theme.name}
                </h2>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  {theme.description}
                </p>

                {/* View Button */}
                <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  <span>View Theme</span>
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Click any theme to see all 4 screen variations
          </p>
        </div>
      </div>
    </main>
  );
}
