import { useState, useEffect } from 'react'
import { supabase, GOALS, type Category, type Donation } from '../lib/supabase'

const CATEGORY_LABELS: Record<Category, string> = {
  hearing_aid: 'Hearing Aid',
  surgery: 'Surgery',
  batteries: 'Batteries',
}

export default function Admin() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [form, setForm] = useState({ name: '', amount: '', category: 'hearing_aid' as Category })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchDonations = async () => {
    const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false })
    if (data) setDonations(data as Donation[])
  }

  useEffect(() => { fetchDonations() }, [])

  const handleAdd = async () => {
    const amount = parseFloat(form.amount)
    if (!form.name || isNaN(amount) || amount <= 0) return

    setSaving(true)
    const { error } = await supabase.from('donations').insert({
      name: form.name,
      amount,
      category: form.category,
    })
    setSaving(false)

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Donation added!')
      setForm(f => ({ ...f, name: '', amount: '' }))
      fetchDonations()
      setTimeout(() => setMessage(''), 2500)
    }
  }

  const totals = (Object.keys(GOALS) as Category[]).map(cat => ({
    cat,
    raised: donations.filter(d => d.category === cat).reduce((s, d) => s + d.amount, 0),
  }))

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
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              {saving ? 'Saving...' : 'Add Donation'}
            </button>
            {message && <p className="text-sm text-center text-green-600 font-medium">{message}</p>}
          </div>
        </div>

        {/* Current totals */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-3">Current Totals</h2>
          <div className="space-y-2">
            {totals.map(({ cat, raised }) => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-gray-600">{CATEGORY_LABELS[cat]}</span>
                <span className="font-semibold text-amber-700">
                  ${raised.toLocaleString()} / ${GOALS[cat].toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Donation log */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-700 mb-3">Donation Log</h2>
          {donations.length === 0 ? (
            <p className="text-sm text-gray-400">No donations yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b">
                  <th className="pb-1">Name</th>
                  <th className="pb-1">Category</th>
                  <th className="pb-1">Amount</th>
                  <th className="pb-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d.id} className="border-b border-gray-50">
                    <td className="py-1">{d.name}</td>
                    <td className="py-1 text-gray-500">{CATEGORY_LABELS[d.category]}</td>
                    <td className="py-1 text-green-600">${d.amount}</td>
                    <td className="py-1 text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
