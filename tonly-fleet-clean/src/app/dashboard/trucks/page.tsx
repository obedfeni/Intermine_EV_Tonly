'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Battery, Gauge, MapPin, Wrench, Calendar, X } from 'lucide-react'
import { formatDateShort } from '../../../lib/utils'
import { useLang } from '../../../lib/lang-context'
import { t } from '../../../lib/i18n'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border-green-500/25',
  MAINTENANCE: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  CHARGING: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  FAULTY: 'bg-red-500/15 text-red-400 border-red-500/25',
  IDLE: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
}
const STATUS_DOT: Record<string, string> = {
  ACTIVE: 'bg-green-400', MAINTENANCE: 'bg-amber-400', CHARGING: 'bg-blue-400', FAULTY: 'bg-red-400', IDLE: 'bg-slate-400',
}
const ALL_STATUSES = ['ACTIVE', 'MAINTENANCE', 'CHARGING', 'FAULTY', 'IDLE']

export default function TrucksPage() {
  const { data: session } = useSession()
  const [trucks, setTrucks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [editTruck, setEditTruck] = useState<any>(null)
  const { locale } = useLang()
  const isSupervisor = (session?.user as any)?.role === 'SUPERVISOR'

  useEffect(() => {
    fetch('/api/trucks').then(r => r.json()).then(d => { setTrucks(d); setLoading(false) })
  }, [])

  const filtered = trucks.filter(truck => {
    if (filter && truck.status !== filter) return false
    if (search && !truck.truckId.toLowerCase().includes(search.toLowerCase()) &&
        !truck.model.toLowerCase().includes(search.toLowerCase()) &&
        !truck.licensePlate.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleStatusUpdate = async (truckId: string, status: string) => {
    const res = await fetch('/api/trucks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: truckId, status }) })
    if (res.ok) {
      const updated = await res.json()
      setTrucks(prev => prev.map(tr => tr.id === truckId ? { ...tr, status: updated.status } : tr))
    }
    setEditTruck(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t(locale, 'fleetTrucks')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{t(locale, 'managingTrucks', { count: trucks.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder={t(locale, 'searchTrucks')} value={search} onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">{t(locale, 'allStatus')}</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{t(locale, s as any)}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map(s => {
          const count = trucks.filter(tr => tr.status === s).length
          return (
            <button key={s} onClick={() => setFilter(filter === s ? '' : s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${filter === s ? STATUS_STYLES[s] : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:border-slate-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
              {t(locale, s as any)} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((truck) => (
          <div key={truck.id} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{truck.truckId}</h3>
                <p className="text-xs text-slate-400">{truck.model}</p>
                <p className="text-xs text-slate-500">{truck.year}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] px-2 py-1 rounded-lg font-medium border ${STATUS_STYLES[truck.status]}`}>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[truck.status]} animate-pulse`} />
                    {t(locale, truck.status as any)}
                  </div>
                </span>
                {isSupervisor && (
                  <button onClick={() => setEditTruck(truck)} className="text-[10px] text-slate-500 hover:text-blue-400 transition opacity-0 group-hover:opacity-100">
                    {t(locale, 'changeStatus')}
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <span className="truncate">{truck.licensePlate}{truck.location ? ` • ${truck.location}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Battery className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                {truck.batteryCapacity} {t(locale, 'kWh')}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Gauge className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                {truck.mileage.toLocaleString()} {t(locale, 'km')}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Wrench className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                {truck._count.faults} {t(locale, 'faultReports').toLowerCase()} • {truck._count.tasks} {t(locale, 'taskManagement').toLowerCase()}
              </div>
              {truck.lastService && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  {t(locale, 'lastServiced')} {formatDateShort(truck.lastService)}
                </div>
              )}
            </div>
            {truck.nextService && (
              <div className={`text-[10px] px-2 py-1 rounded-lg ${new Date(truck.nextService) < new Date() ? 'bg-red-500/10 text-red-400' : 'bg-slate-800/60 text-slate-500'}`}>
                {t(locale, 'nextService')}: {formatDateShort(truck.nextService)}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">{t(locale, 'noTrucksFound')}</p>
          <p className="text-sm mt-1">{t(locale, 'adjustFilters')}</p>
        </div>
      )}

      {editTruck && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">{t(locale, 'updateStatus', { id: editTruck.truckId })}</h3>
              <button onClick={() => setEditTruck(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-2">
              {ALL_STATUSES.map(s => (
                <button key={s} onClick={() => handleStatusUpdate(editTruck.id, s)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${editTruck.status === s ? STATUS_STYLES[s] : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:border-slate-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                  {t(locale, s as any)}
                  {editTruck.status === s && <span className="ml-auto text-xs opacity-60">{t(locale, 'current')}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
