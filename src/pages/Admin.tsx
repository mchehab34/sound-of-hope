import { useState, useEffect } from 'react'
import { supabase, GOALS, type Category, type Donation } from '../lib/supabase'

const CATEGORY_LABELS: Record<Category, string> = {
  hearing_aid: 'Hearing Aid',
  surgery: 'Surgery',
  batteries: 'Batteries',
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === ADMIN_PASSWORD) {
      onUnlock()
    } else {
      setError(true)
      setInput('')
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">Admin Portal</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Password"
            autoFocus
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? 'border-red-400' : 'border-gray-300'}`}
          />
          {error && <p className="text-xs text-red-500 text-center">Incorrect password</p>}
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

type EditState = { id: string; name: string; amount: string } | null

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false)
  const [donations, setDonations] = useState<Donation[]>([])
  const [form, setForm] = useState({ name: '', amount: '', category: 'hearing_aid' as Category })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editState, setEditState] = useState<EditState>(null)

  const fetchDonations = async () => {
    const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false })
    if (data) setDonations(data as Donation[])
  }

  useEffect(() => { if (unlocked) fetchDonations() }, [unlocked])

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  // Stats
  const totalRaised = donations.reduce((s, d) => s + d.amount, 0)
  const totalGoal = Object.values(GOALS).reduce((s, g) => s + g, 0)
  const biggestDonation = donations.reduce((max, d) => d.amount > max ? d.amount : max, 0)
  const latest = donations[0]

  const totals = (Object.keys(GOALS) as Category[]).map(cat => ({
    cat,
    raised: donations.filter(d => d.category === cat).reduce((s, d) => s + d.amount, 0),
  }))

  const handleAdd = async () => {
    const amount = parseFloat(form.amount)
    if (!form.name || isNaN(amount) || amount <= 0) return
    setSaving(true)
    const { error } = await supabase.from('donations').insert({ name: form.name, amount, category: form.category })
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this donation?')) return
    await supabase.from('donations').delete().eq('id', id)
    fetchDonations()
  }

  const handleEditSave = async () => {
    if (!editState) return
    const amount = parseFloat(editState.amount)
    if (!editState.name || isNaN(amount) || amount <= 0) return
    await supabase.from('donations').update({ name: editState.name, amount }).eq('id', editState.id)
    await fetchDonations()
    setEditState(null)
  }

  const handleExportCSV = () => {
    const rows = [
      ['Name', 'Category', 'Amount', 'Date'],
      ...donations.map(d => [d.name, CATEGORY_LABELS[d.category], d.amount, new Date(d.created_at).toLocaleDateString()]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'donations.csv'
    a.click()
    URL.revokeObjectURL(url)
  }


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin — Sound of Hope</h1>

        {/* Dashboard stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Raised', value: `$${totalRaised.toLocaleString()}` },
            { label: 'Donors', value: donations.length },
            { label: 'Biggest', value: `$${biggestDonation.toLocaleString()}` },
            { label: 'Latest', value: latest ? `$${latest.amount} · ${latest.name}` : '—' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="font-bold text-amber-700 text-sm truncate">{s.value}</p>
            </div>
          ))}
        </div>


        {/* Add donation */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-700 mb-4">Log Donation</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Donor Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. Anonymous" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Amount ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="50" min="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAdd} disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 transition-colors">
              {saving ? 'Saving...' : 'Add Donation'}
            </button>
            {message && <p className="text-sm text-center text-green-600 font-medium">{message}</p>}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-700 mb-3">Current Totals</h2>
          <div className="space-y-2">
            {totals.map(({ cat, raised }) => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-gray-600">{CATEGORY_LABELS[cat]}</span>
                <span className="font-semibold text-amber-700">${raised.toLocaleString()} / ${GOALS[cat].toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 border-t font-bold">
              <span className="text-gray-700">Total</span>
              <span className="text-amber-700">${totalRaised.toLocaleString()} / ${totalGoal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Donation log */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-700">Donation Log</h2>
            {donations.length > 0 && (
              <button onClick={handleExportCSV} className="text-xs text-amber-600 border border-amber-300 rounded-full px-3 py-1 hover:bg-amber-50 transition-colors">
                Export CSV
              </button>
            )}
          </div>
          {donations.length === 0 ? (
            <p className="text-sm text-gray-400">No donations yet.</p>
          ) : (
            <div className="space-y-2">
              {donations.map(d => (
                <div key={d.id} className="border border-gray-100 rounded-lg p-3">
                  {editState?.id === d.id ? (
                    <div className="flex gap-2 items-center">
                      <input value={editState.name} onChange={e => setEditState(s => s && ({ ...s, name: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                      <input value={editState.amount} onChange={e => setEditState(s => s && ({ ...s, amount: e.target.value }))}
                        type="number" className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                      <button onClick={handleEditSave} className="text-xs bg-amber-500 text-white rounded px-2 py-1">Save</button>
                      <button onClick={() => setEditState(null)} className="text-xs text-gray-400">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-700 text-sm">{d.name}</span>
                        <span className="text-xs text-gray-400 mx-2">·</span>
                        <span className="text-xs text-gray-500">{CATEGORY_LABELS[d.category]}</span>
                        <span className="text-xs text-gray-400 mx-2">·</span>
                        <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold text-sm">${d.amount}</span>
                        <button onClick={() => setEditState({ id: d.id, name: d.name, amount: String(d.amount) })}
                          className="text-xs text-amber-500 hover:text-amber-700">Edit</button>
                        <button onClick={() => handleDelete(d.id)}
                          className="text-xs text-red-400 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
