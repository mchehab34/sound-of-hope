import { useLang } from '../context/LangContext'
import logo from '../assets/logo.jpg'

export default function Navbar() {
  const { t, toggleLang } = useLang()

  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Sounds of Hope" className="w-20 h-20 rounded-full object-cover" />
          <span className="font-bold text-amber-900 text-lg">{t.hero.title}</span>
        </div>
        <button
          onClick={toggleLang}
          className="text-sm font-medium text-amber-700 border border-amber-300 rounded-full px-4 py-1 hover:bg-amber-50 transition-colors"
        >
          {t.nav.switchLang}
        </button>
      </div>
    </nav>
  )
}
