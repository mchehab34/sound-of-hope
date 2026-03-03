import { useLang } from '../context/LangContext'
import Navbar from '../components/Navbar'
import CategoryCard from '../components/CategoryCard'
import ProgressBar from '../components/ProgressBar'
import donationsData from '../data/donations.json'

const CATEGORY_ICONS = {
  hearing_aid: '🦻',
  surgery: '🏥',
  batteries: '🔋',
}

function HomeContent() {
  const { t } = useLang()

  const totalRaised = donationsData.hearing_aid.raised + donationsData.surgery.raised + donationsData.batteries.raised
  const totalGoal = donationsData.hearing_aid.goal + donationsData.surgery.goal + donationsData.batteries.goal

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-8 text-center">
        <h1 className="text-5xl font-extrabold text-amber-900 mb-3 tracking-tight">
          {t.hero.title}
        </h1>
        <p className="text-xl text-orange-600 font-medium">{t.hero.subtitle}</p>
      </section>

      {/* Description */}
      <section className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white/70 rounded-2xl p-7 shadow-sm border border-amber-100 space-y-4 text-amber-900 leading-relaxed">
          {t.description.map((para, i) => (
            <p key={i} className={`whitespace-pre-line ${i === 6 ? 'text-center font-semibold text-lg text-orange-700 border-t border-b border-amber-200 py-3' : ''} ${i === t.description.length - 1 ? 'font-semibold text-orange-600' : ''}`}>
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Overall Progress */}
      <section className="max-w-2xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl shadow-md p-7 border border-amber-100">
          <h2 className="text-2xl font-bold text-amber-900 mb-1">{t.goal.title}</h2>
          <p className="text-amber-600 text-sm mb-5">{t.goal.subtitle}</p>
          <ProgressBar raised={totalRaised} goal={totalGoal} large />
          <div className="flex justify-between mt-3 text-sm text-amber-700">
            <span>{t.goal.totalRaised}: <strong className="text-orange-600">${totalRaised.toLocaleString()}</strong></span>
            <span>{t.goal.totalGoal}: <strong className="text-amber-800">${totalGoal.toLocaleString()}</strong></span>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="max-w-4xl mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {(['hearing_aid', 'surgery', 'batteries'] as const).map(cat => (
          <CategoryCard
            key={cat}
            category={cat}
            raised={donationsData[cat].raised}
            icon={CATEGORY_ICONS[cat]}
          />
        ))}
      </section>

      {/* How to Donate */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-7 border border-amber-100">
          <h2 className="text-2xl font-bold text-amber-900 mb-1">{t.donate.title}</h2>
          <p className="text-amber-600 text-sm mb-6">{t.donate.subtitle}</p>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mb-5 text-center">
            <p className="text-sm text-amber-700 mb-1">{t.donate.instructions}</p>
            <p className="font-mono font-bold text-orange-600 text-lg" dir="ltr">{t.donate.number}</p>
            <p className="text-xs text-amber-500 mt-2">{t.donate.omt.title} · {t.donate.wish.title}</p>
          </div>
          <p className="text-sm text-center text-amber-700 italic">{t.donate.contact}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center pb-8 text-amber-700 text-sm">
        <p className="font-semibold">{t.footer.tagline}</p>
        <p className="mt-1 opacity-60">© {new Date().getFullYear()} {t.footer.rights}</p>
      </footer>
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}
