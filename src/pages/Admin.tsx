import { useState } from 'react'
import donationsData from '../data/donations.json'

type Category = 'hearing_aid' | 'surgery' | 'batteries'

const CATEGORY_LABELS: Record<Category, string> = {
  hearing_aid: 'Hearing Aid',
  surgery: 'Surgery',
  batteries: 'Batteries',
}

type Donation = { name: string; amount: number; date: string }

type DonationsState = {
  hearing_aid: { goal: number; raised: number; donations: Donation[] }
  surgery: { goal: number; raised: number; donations: Donation[] }
  batteries: { goal: number; raised: number; donations: Donation[] }
}

export default function Admin() {
  const [data, setData] = useState<DonationsState>(donationsData as DonationsState)
  const [form, setForm] = useState({ name: '', amount: '', category: 'hearing_aid' as Category })
  const [saved, setSaved] = useState(false)

  const handleAdd = () => {
    const amount = parseFloat(form.amount)
    if (!form.name || isNaN(amount) || amount <= 0) return

    const newDonation: Donation = {
      name: form.name,
      amount,
      date: new Date().toISOString().split('T')[0],
    }

    setData(prev => ({
      ...prev,
      [form.category]: {
        ...prev[form.category],
        raised: prev[form.category].raised + amount,
        donations: [...prev[form.category].donations, newDonation],
      },
    }))

    setForm(f => ({ ...f, name: '', amount: '' }))
    setSaved(false)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'donations.json'
    a.click()
    URL.revokeObjectURL(url)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin — Log Donation</h1>

        {/* Add donation form */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Donor Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="e.g. Anonymous"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Amount ($)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="50"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              Add Donation
            </button>
          </div>
        </div>

        {/* Current totals */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-3">Current Totals</h2>
          <div className="space-y-2">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-gray-600">{CATEGORY_LABELS[cat]}</span>
                <span className="font-semibold text-amber-700">
                  ${data[cat].raised.toLocaleString()} / ${data[cat].goal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Donation log */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-3">Donation Log</h2>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
            data[cat].donations.length > 0 && (
              <div key={cat} className="mb-4">
                <h3 className="text-sm font-semibold text-amber-700 mb-2">{CATEGORY_LABELS[cat]}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs border-b">
                      <th className="pb-1">Name</th>
                      <th className="pb-1">Amount</th>
                      <th className="pb-1">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data[cat].donations.map((d, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-1">{d.name}</td>
                        <td className="py-1 text-green-600">${d.amount}</td>
                        <td className="py-1 text-gray-400">{d.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ))}
        </div>

        {/* Export */}
        <button
          onClick={exportJson}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
        >
          {saved ? '✓ Downloaded — replace src/data/donations.json and push' : 'Export donations.json'}
        </button>
        {saved && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Replace <code>src/data/donations.json</code> with the downloaded file, then commit & push to update the site.
          </p>
        )}
      </div>
    </div>
  )
}
