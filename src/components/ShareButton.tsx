import { useState } from 'react'
import { useLang } from '../context/LangContext'

export default function ShareButton() {
  const { t } = useLang()
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: t.hero.title,
        text: t.hero.subtitle,
        url: window.location.href,
      }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 text-sm font-medium rounded-full px-4 py-1.5 border transition-all active:scale-95 shadow-sm ${shared ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white/80 backdrop-blur-sm border-amber-200 text-amber-700 hover:bg-amber-50'}`}
    >
      {shared ? (
        <>{t.actions.copied}</>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {t.actions.share}
        </>
      )}
    </button>
  )
}
