'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, Plus, X, Filter } from 'lucide-react'
import { hasPermission } from '../../../lib/roles'
import { formatDate } from '../../../lib/utils'
import { useLang } from '../../../lib/lang-context'
import { t } from '../../../lib/i18n'

const SEV_COLORS: Record<string, string> = {
  LOW: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/25',
}
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-500/15 text-red-400',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400',
  RESOLVED: 'bg-green-500/15 text-green-400',
}

export default function FaultsPage() {
  const { data: session } = useSession()
  const [faults, setFaults] = useState<any[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter] = useState({ severity: '', status: '' })
  const { locale } = useLang()

  const role = (session?.user as any)?.role || ''
  const canReport = hasPermission(role, 'faults:report')
  const canUpdate = role === 'SUPERVISOR' || role === 'TECHNICIAN'

  const load = () => { fetch('/api/faults').then(r => r.json()).then(d => { setFaults(d); setLoading(false) }) }
  useEffect(() => { load(); fetch('/api/trucks').then(r => r.json()).then(setTrucks) }, [])

  const filtered = faults.filter(f => {
    if (filter.severity && f.severity !== filter.severity) return false
    if (filter.status && f.status !== filter.status) return false
    return true
  })

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/faults', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (res.ok) load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t(locale, 'faultReports')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{t(locale, 'trackFaults')}</p>
        </div>
        {canReport && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition">
            <Plus className="w-4 h-4" /> {t(locale, 'reportFault')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><Filter className="w-3.5 h-3.5" />{t(locale, 'filter')}</div>
        <select value={filter.severity} onChange={e => setFilter({ ...filter, severity: e.target.value })}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">{t(locale, 'allSeverities')}</option>
          {['LOW','MEDIUM','HIGH','CRITICAL'].map(s => <option key={s} value={s}>{t(locale, s as any)}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">{t(locale, 'allStatuses')}</option>
          {['OPEN','IN_PROGRESS','RESOLVED'].map(s => <option key={s} value={s}>{t(locale, s as any)}</option>)}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{t(locale, 'faultsCount', { count: filtered.length, total: faults.length })}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                {[t(locale,'truck'),t(locale,'fault'),t(locale,'severity'),t(locale,'status'),t(locale,'reporter'),t(locale,'date')].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
                {canUpdate && <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t(locale,'actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-slate-500 text-sm">{t(locale,'loading')}</td></tr>
              : filtered.map(fault => (
                <tr key={fault.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors cursor-pointer" onClick={() => setSelected(fault)}>
                  <td className="px-4 py-3"><p className="text-sm font-bold text-white">{fault.truck.truckId}</p><p className="text-xs text-slate-500">{fault.truck.model}</p></td>
                  <td className="px-4 py-3"><p className="text-sm text-white max-w-xs truncate">{fault.title}</p><p className="text-xs text-slate-500 truncate max-w-xs">{fault.description}</p></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-lg font-medium border ${SEV_COLORS[fault.severity]}`}>{t(locale, fault.severity as any)}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${STATUS_COLORS[fault.status]}`}>{t(locale, fault.status as any)}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{fault.reporter.name || fault.reporter.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(fault.createdAt).toLocaleDateString()}</td>
                  {canUpdate && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {fault.status === 'OPEN' && <button onClick={() => updateStatus(fault.id, 'IN_PROGRESS')} className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg transition">{t(locale,'start')}</button>}
                        {fault.status !== 'RESOLVED' && <button onClick={() => updateStatus(fault.id, 'RESOLVED')} className="text-[10px] px-2 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition">{t(locale,'resolve')}</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">{t(locale,'noFaultsFound')}</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-start justify-between mb-4">
              <div><h2 className="text-lg font-bold text-white">{selected.title}</h2><p className="text-xs text-slate-400 mt-0.5">{selected.truck.truckId} • {selected.truck.model}</p></div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <p className="text-sm text-slate-300 mb-4">{selected.description}</p>
            <div className="flex gap-2 mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${SEV_COLORS[selected.severity]}`}>{t(locale, selected.severity as any)}</span>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${STATUS_COLORS[selected.status]}`}>{t(locale, selected.status as any)}</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1 mb-4">
              <p>{t(locale,'reportedBy')}: {selected.reporter.name || selected.reporter.email}</p>
              <p>{t(locale,'date')}: {formatDate(selected.createdAt)}</p>
            </div>
            {canUpdate && selected.status !== 'RESOLVED' && (
              <div className="flex gap-2">
                {selected.status === 'OPEN' && (
                  <button onClick={() => { updateStatus(selected.id, 'IN_PROGRESS'); setSelected({ ...selected, status: 'IN_PROGRESS' }) }}
                    className="flex-1 py-2 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-xl text-sm font-medium transition">{t(locale,'markInProgress')}</button>
                )}
                <button onClick={() => { updateStatus(selected.id, 'RESOLVED'); setSelected(null) }}
                  className="flex-1 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-xl text-sm font-medium transition">{t(locale,'markResolved')}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && <ReportFaultModal trucks={trucks} locale={locale} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); load() }} />}
    </div>
  )
}

function ReportFaultModal({ trucks, locale, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ truckId: '', title: '', description: '', severity: 'MEDIUM' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/faults', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { onSuccess() } else { const d = await res.json(); setError(d.error || 'Failed'); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{t(locale,'reportNewFault')}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'truck')}</label>
            <select value={form.truckId} onChange={e => setForm({ ...form, truckId: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required>
              <option value="">{t(locale,'selectTruck')}</option>
              {trucks.map((tr: any) => <option key={tr.id} value={tr.id}>{tr.truckId} — {tr.model} ({tr.licensePlate})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'faultTitle')}</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t(locale,'faultTitlePlaceholder')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'description')}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none"
              placeholder={t(locale,'faultDescPlaceholder')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'severity')}</label>
            <div className="grid grid-cols-4 gap-2">
              {['LOW','MEDIUM','HIGH','CRITICAL'].map(s => (
                <button key={s} type="button" onClick={() => setForm({ ...form, severity: s })}
                  className={`py-2 rounded-xl text-xs font-medium border transition ${form.severity === s
                    ? s === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : s === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    : s === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'}`}>
                  {t(locale, s as any)}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm">
            {loading ? t(locale,'submitting') : t(locale,'submitFaultReport')}
          </button>
        </form>
      </div>
    </div>
  )
}
