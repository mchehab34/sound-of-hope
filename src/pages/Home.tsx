import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import CategoryCard from '../components/CategoryCard'
import ProgressBar from '../components/ProgressBar'
import ShareButton from '../components/ShareButton'
import { supabase, GOALS, type Category, type Donation } from '../lib/supabase'
import logo from '../assets/logo.jpg'

const CATEGORY_ICONS: Record<Category, string> = {
  hearing_aid: '🦻',
  surgery: '🏥',
  batteries: '🔋',
}

type Totals = Record<Category, { raised: number; donors: number }>

const DEFAULT_TOTALS: Totals = {
  hearing_aid: { raised: 0, donors: 0 },
  surgery: { raised: 0, donors: 0 },
  batteries: { raised: 0, donors: 0 },
}

function computeTotals(donations: Donation[]): Totals {
  const totals = structuredClone(DEFAULT_TOTALS)
  for (const d of donations) {
    totals[d.category].raised += d.amount
    totals[d.category].donors += 1
  }
  return totals
}

function HomeContent() {
  const { t, toggleLang } = useLang()
  const [totals, setTotals] = useState<Totals>(DEFAULT_TOTALS)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchDonations = async () => {
      const { data } = await supabase.from('donations').select('*')
      if (data) setTotals(computeTotals(data as Donation[]))
    }

    fetchDonations()

    const channel = supabase
      .channel('donations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => {
        fetchDonations()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const totalRaised = Object.values(totals).reduce((sum, c) => sum + c.raised, 0)
  const totalGoal = Object.values(GOALS).reduce((sum, g) => sum + g, 0)

  const handleCopyNumber = async () => {
    await navigator.clipboard.writeText(t.donate.number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* Top-right controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ShareButton />
        <button
          onClick={toggleLang}
          className="text-sm font-medium text-amber-700 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-full px-4 py-1.5 shadow-sm hover:bg-amber-50 transition-colors"
        >
          {t.nav.switchLang}
        </button>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-8 text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-40 scale-125"
            style={{ background: 'radial-gradient(circle, #fbbf24, #f97316, transparent 70%)' }} />
          <img src={logo} alt="Sound of Hope" className="relative w-32 h-32 rounded-full object-cover shadow-xl ring-4 ring-amber-200" />
        </div>
        <h1 className="text-5xl font-bold text-amber-900 mb-3 tracking-normal">{t.hero.title}</h1>
        <p className="text-xl text-orange-600 font-medium">{t.hero.subtitle}</p>
      </section>

      {/* Description */}
      <section className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white/70 rounded-2xl p-7 shadow-sm border border-amber-100 space-y-4 leading-relaxed">
          {t.description.map((para, i) => {
            if (i === 0) return <p key={i} className="whitespace-pre-line text-lg font-semibold text-amber-950">{para}</p>
            if (i === 6) return <p key={i} className="text-center text-xl font-bold text-orange-600 border-t border-b border-amber-200 py-4">{para}</p>
            if (i === t.description.length - 1) return <p key={i} className="whitespace-pre-line font-semibold text-orange-600">{para}</p>
            return <p key={i} className="whitespace-pre-line text-amber-800">{para}</p>
          })}
        </div>
      </section>

      {/* Overall Progress */}
      <section className="w-full bg-white/50 py-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-md p-7 border border-amber-100">
            <h2 className="text-2xl font-bold text-amber-900 mb-1">{t.goal.title}</h2>
            <p className="text-amber-600 text-sm mb-5">{t.goal.subtitle}</p>
            <ProgressBar raised={totalRaised} goal={totalGoal} large />
            <div className="flex justify-between mt-3 text-sm text-amber-700">
              <span>{t.goal.totalRaised}: <strong className="text-orange-600">${totalRaised.toLocaleString()}</strong></span>
              <span>{t.goal.totalGoal}: <strong className="text-amber-800">${totalGoal.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {(Object.keys(GOALS) as Category[]).map(cat => (
          <CategoryCard
            key={cat}
            category={cat}
            raised={totals[cat].raised}
            goal={GOALS[cat]}
            icon={CATEGORY_ICONS[cat]}
            donorCount={totals[cat].donors}
          />
        ))}
      </section>

      {/* How to Donate */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-br from-amber-700 to-amber-500 px-7 py-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-1">{t.donate.title}</h2>
            <p className="text-amber-100 text-sm">{t.donate.subtitle}</p>
          </div>
          <div className="bg-amber-50 px-7 py-6 text-center space-y-3">
            <p className="text-sm text-amber-700">{t.donate.instructions}</p>
            <button
              onClick={handleCopyNumber}
              className="block mx-auto font-mono font-black text-2xl tracking-wide transition-all active:scale-95"
              style={{ color: copied ? '#d97706' : '#92400e' }}
              dir="ltr"
            >
              {copied ? t.actions.copied : t.donate.number}
            </button>
            <p className="text-xs text-amber-400">{t.donate.omt.title} · {t.donate.wish.title} · {t.actions.copyNumber}</p>
            <p className="text-sm text-amber-600 italic pt-1">{t.donate.contact}</p>
          </div>
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
