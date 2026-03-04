import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import CategoryCard from '../components/CategoryCard'
import ProgressBar from '../components/ProgressBar'
import ShareButton from '../components/ShareButton'
import { supabase, GOALS, type Category, type Donation } from '../lib/supabase'
import logo from '../assets/logo.jpg'
import photo1 from '../assets/1.jpg'
import photo2 from '../assets/2.jpg'
import photo3 from '../assets/3.jpg'

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


  // Milestone badges
  const milestones = (Object.keys(GOALS) as Category[]).filter(cat => {
    const pct = totals[cat].raised / GOALS[cat]
    return pct >= 0.5
  })

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
          <img src={logo} alt="Sounds of Hope" className="relative w-32 h-32 rounded-full object-cover shadow-xl ring-4 ring-amber-200" />
        </div>
        <h1 className="text-5xl font-bold text-amber-900 mb-3 tracking-normal">{t.hero.title}</h1>
        <p className="text-xl text-orange-600 font-medium">{t.hero.subtitle}</p>
        {milestones.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {milestones.map(cat => (
              <span key={cat} className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                🎉 {t.categories[cat].title} — 50%+ reached!
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Overall Progress */}
      <section className="w-full py-10">
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

      {/* Description */}
      <section className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white/70 rounded-2xl p-7 shadow-sm border border-amber-100 space-y-4 leading-relaxed">
          {t.description.map((para, i) => {
            if (i === 0) return <p key={i} className="whitespace-pre-line text-lg font-semibold text-amber-950">{para}</p>
            if (i === 6) return <p key={i} dir="rtl" className="text-center text-xl font-bold text-orange-600 border-t border-b border-amber-200 py-4">{para}</p>
            if (i === t.description.length - 1) return <p key={i} className="whitespace-pre-line font-semibold text-orange-600">{para}</p>
            return <p key={i} className="whitespace-pre-line text-amber-800">{para}</p>
          })}
        </div>
      </section>

      {/* Photos */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-3 gap-3">
          {[photo1, photo2, photo3].map((src, i) => (
            <div key={i} className="overflow-hidden rounded-2xl shadow-md aspect-[3/4]">
              <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
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
            <a
              href={`https://wa.me/${t.donate.number.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I want to donate to Sounds of Hope 🤍')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors mx-auto"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t.donate.whatsapp}
            </a>
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
