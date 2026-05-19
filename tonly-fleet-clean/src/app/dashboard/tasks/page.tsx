'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, X, Filter } from 'lucide-react'
import { hasPermission } from '../../../lib/roles'
import { formatDateShort } from '../../../lib/utils'
import { useLang } from '../../../lib/lang-context'
import { t } from '../../../lib/i18n'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  ASSIGNED: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  COMPLETED: 'bg-green-500/15 text-green-400 border-green-500/25',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
}
const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-400', MEDIUM: 'text-blue-400', HIGH: 'text-orange-400', URGENT: 'text-red-400',
}
const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-slate-400', MEDIUM: 'bg-blue-400', HIGH: 'bg-orange-400', URGENT: 'bg-red-400',
}

export default function TasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<any[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter] = useState({ status: '', priority: '' })
  const { locale } = useLang()

  const role = (session?.user as any)?.role || ''
  const isSupervisor = role === 'SUPERVISOR'
  const isTechnician = role === 'TECHNICIAN'

  const load = () => fetch('/api/tasks').then(r => r.json()).then(d => { setTasks(d); setLoading(false) })
  useEffect(() => {
    load()
    fetch('/api/trucks').then(r => r.json()).then(setTrucks)
    fetch('/api/users?role=TECHNICIAN').then(r => r.json()).then(setTechnicians)
  }, [])

  const filtered = tasks.filter(task => {
    if (filter.status && task.status !== filter.status) return false
    if (filter.priority && task.priority !== filter.priority) return false
    return true
  })

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (res.ok) { load(); if (selected?.id === id) setSelected(null) }
  }

  const columns = ['PENDING','ASSIGNED','IN_PROGRESS','COMPLETED']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t(locale,'taskManagement')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{t(locale,'scheduleAssign')}</p>
        </div>
        {isSupervisor && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition">
            <Plus className="w-4 h-4" /> {t(locale,'createTask')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">{t(locale,'allStatuses')}</option>
          {['PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{t(locale, s as any)}</option>)}
        </select>
        <select value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">{t(locale,'allPriorities')}</option>
          {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{t(locale, p as any)}</option>)}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{t(locale,'tasksCount',{ count: filtered.length })}</span>
      </div>

      {!filter.status ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = tasks.filter(task => task.status === col)
            return (
              <div key={col} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${STATUS_COLORS[col]}`}>{t(locale, col as any)}</span>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg">{colTasks.length}</span>
                </div>
                <div className="space-y-2 min-h-24">
                  {colTasks.map(task => (
                    <div key={task.id} onClick={() => setSelected(task)}
                      className="p-3 bg-slate-900 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="text-sm font-medium text-white leading-tight flex-1 mr-1">{task.title}</p>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${PRIORITY_DOT[task.priority]}`} title={t(locale, task.priority as any)} />
                      </div>
                      <p className="text-xs text-slate-500 truncate">{task.truck.truckId}</p>
                      {task.assignee && <p className="text-xs text-slate-500 truncate mt-0.5">→ {task.assignee.name}</p>}
                      {task.scheduledAt && <p className="text-xs text-slate-600 mt-0.5">{formatDateShort(task.scheduledAt)}</p>}
                    </div>
                  ))}
                  {colTasks.length === 0 && <div className="h-16 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-600">{t(locale,'empty')}</div>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-800/60">
              {[t(locale,'taskTitle'),t(locale,'truck'),t(locale,'priority'),t(locale,'assignee'),t(locale,'scheduled'),t(locale,'status')].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 cursor-pointer" onClick={() => setSelected(task)}>
                  <td className="px-4 py-3"><p className="text-sm text-white">{task.title}</p></td>
                  <td className="px-4 py-3 text-sm text-slate-300">{task.truck.truckId}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}>{t(locale, task.priority as any)}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{task.assignee?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{task.scheduledAt ? formatDateShort(task.scheduledAt) : '—'}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-lg border font-medium ${STATUS_COLORS[task.status]}`}>{t(locale, task.status as any)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">{t(locale,'noTasksFound')}</div>}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-start justify-between mb-4">
              <div><h2 className="text-lg font-bold text-white">{selected.title}</h2><p className="text-xs text-slate-400 mt-0.5">{selected.truck.truckId} • {t(locale,'createdBy')} {selected.creator?.name}</p></div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-300 mb-4">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="bg-slate-800/40 rounded-xl p-3"><p className="text-slate-500 mb-0.5">{t(locale,'priority')}</p><p className={`font-semibold ${PRIORITY_COLORS[selected.priority]}`}>{t(locale, selected.priority as any)}</p></div>
              <div className="bg-slate-800/40 rounded-xl p-3"><p className="text-slate-500 mb-0.5">{t(locale,'status')}</p><span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${STATUS_COLORS[selected.status]}`}>{t(locale, selected.status as any)}</span></div>
              <div className="bg-slate-800/40 rounded-xl p-3"><p className="text-slate-500 mb-0.5">{t(locale,'assignee')}</p><p className="text-white">{selected.assignee?.name || t(locale,'unassigned')}</p></div>
              <div className="bg-slate-800/40 rounded-xl p-3"><p className="text-slate-500 mb-0.5">{t(locale,'scheduled')}</p><p className="text-white">{selected.scheduledAt ? formatDateShort(selected.scheduledAt) : '—'}</p></div>
            </div>
            {(isSupervisor || isTechnician) && selected.status !== 'CANCELLED' && selected.status !== 'COMPLETED' && (
              <div className="flex gap-2">
                {(selected.status === 'PENDING' || selected.status === 'ASSIGNED') && (
                  <button onClick={() => updateStatus(selected.id, 'IN_PROGRESS')} className="flex-1 py-2 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-xl text-sm font-medium transition">{t(locale,'startTask')}</button>
                )}
                {selected.status === 'IN_PROGRESS' && (
                  <button onClick={() => updateStatus(selected.id, 'COMPLETED')} className="flex-1 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-xl text-sm font-medium transition">{t(locale,'markComplete')}</button>
                )}
                {isSupervisor && (
                  <button onClick={() => updateStatus(selected.id, 'CANCELLED')} className="flex-1 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl text-sm font-medium transition">{t(locale,'cancel')}</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && <CreateTaskModal trucks={trucks} technicians={technicians} locale={locale} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); load() }} />}
    </div>
  )
}

function CreateTaskModal({ trucks, technicians, locale, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ truckId: '', title: '', description: '', priority: 'MEDIUM', assignedTo: '', scheduledAt: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { onSuccess() } else { const d = await res.json(); setError(d.error || 'Failed'); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{t(locale,'createTask')}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'truck')}</label>
            <select value={form.truckId} onChange={e => setForm({ ...form, truckId: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required>
              <option value="">{t(locale,'selectTruck')}</option>
              {trucks.map((tr: any) => <option key={tr.id} value={tr.id}>{tr.truckId} — {tr.model} ({t(locale, tr.status as any)})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'taskTitle')}</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t(locale,'taskTitlePlaceholder')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'description')}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 resize-none"
              placeholder={t(locale,'taskDescPlaceholder')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'priority')}</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{t(locale, p as any)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'assignTo')}</label>
              <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">{t(locale,'unassigned')}</option>
                {technicians.map((tech: any) => <option key={tech.id} value={tech.id}>{tech.name || tech.email}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'scheduledDate')}</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'notes')} <span className="text-slate-600">({t(locale,'optional')})</span></label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t(locale,'notesPlaceholder')} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm">
            {loading ? t(locale,'creating') : t(locale,'createTaskBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}
