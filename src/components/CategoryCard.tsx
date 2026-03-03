import ProgressBar from './ProgressBar'
import { useLang } from '../context/LangContext'

type Category = 'hearing_aid' | 'surgery' | 'batteries'

type Props = {
  category: Category
  raised: number
  icon: string
}

export default function CategoryCard({ category, raised, icon }: Props) {
  const { t } = useLang()
  const info = t.categories[category]
  const pct = Math.min((raised / info.goal) * 100, 100)

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-amber-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{icon}</span>
        <div>
          <h3 className="text-lg font-bold text-amber-900">{info.title}</h3>
          <p className="text-sm text-amber-700">{info.description}</p>
        </div>
      </div>
      <ProgressBar raised={raised} goal={info.goal} />
      <div className="flex justify-between text-sm font-semibold">
        <span className="text-orange-600">${raised.toLocaleString()} {t.progress.raised}</span>
        <span className="text-amber-500">{pct.toFixed(1)}%</span>
        <span className="text-amber-800">${info.goal.toLocaleString()} {t.progress.goal}</span>
      </div>
    </div>
  )
}
