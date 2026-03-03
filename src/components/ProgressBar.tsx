type Props = {
  raised: number
  goal: number
  label?: string
  large?: boolean
}

export default function ProgressBar({ raised, goal, label, large }: Props) {
  const pct = Math.min((raised / goal) * 100, 100)

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-1 text-amber-800 font-medium">
          <span>{label}</span>
          <span>${raised.toLocaleString()} / ${goal.toLocaleString()}</span>
        </div>
      )}
      <div className={`w-full bg-amber-100 rounded-full overflow-hidden ${large ? 'h-5' : 'h-3'}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700 ${large ? 'shadow-md' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {large && (
        <p className="text-right text-xs text-amber-700 mt-1">{pct.toFixed(1)}% reached</p>
      )}
    </div>
  )
}
