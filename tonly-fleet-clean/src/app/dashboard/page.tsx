'use client'

import { useEffect, useState } from 'react'
import { Truck, AlertTriangle, ClipboardList, Zap } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/i18n'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e', MAINTENANCE: '#f59e0b', CHARGING: '#3b82f6', FAULTY: '#ef4444', IDLE: '#6b7280',
}
const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-500/20 text-blue-400', MEDIUM: 'bg-amber-500/20 text-amber-400',
  HIGH: 'bg-orange-500/20 text-orange-400', CRITICAL: 'bg-red-500/20 text-red-400',
}
const TASK_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-500/20 text-slate-400', ASSIGNED: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-400', COMPLETED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { locale } = useLang()

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">{t(locale, 'loadingFleetData')}</p>
      </div>
    </div>
  )

  const { stats, recentFaults, recentTasks, truckStatusDist } = data

  const kpiCards = [
    { title: t(locale, 'totalFleet'), value: stats.totalTrucks, sub: `${stats.activeTrucks} ${t(locale, 'active')}`, icon: Truck, color: 'blue' },
    { title: t(locale, 'openFaults'), value: stats.openFaults, sub: `${stats.criticalFaults} ${t(locale, 'critical')}`, icon: AlertTriangle, color: stats.criticalFaults > 0 ? 'red' : 'amber' },
    { title: t(locale, 'activeTasks'), value: stats.pendingTasks, sub: t(locale, 'inQueue'), icon: ClipboardList, color: 'purple' },
    { title: t(locale, 'energyToday'), value: `${stats.totalKwhToday.toFixed(1)} kWh`, sub: `${stats.todayChargingSessions} ${t(locale, 'sessions')}`, icon: Zap, color: 'green' },
  ]

  const statusLabels: Record<string, string> = {
    ACTIVE: t(locale, 'ACTIVE'), MAINTENANCE: t(locale, 'MAINTENANCE'),
    CHARGING: t(locale, 'CHARGING'), FAULTY: t(locale, 'FAULTY'), IDLE: t(locale, 'IDLE'),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t(locale, 'fleetDashboard')}</h1>
        <p className="text-slate-400 text-sm mt-0.5">{t(locale, 'realtimeOverview')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-${card.color}-500/10 border border-${card.color}-500/20`}>
                <card.icon className={`w-5 h-5 text-${card.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: 'ACTIVE', color: 'text-green-400', bg: 'bg-green-500/10', val: stats.activeTrucks },
          { key: 'CHARGING', color: 'text-blue-400', bg: 'bg-blue-500/10', val: stats.chargingTrucks },
          { key: 'MAINTENANCE', color: 'text-amber-400', bg: 'bg-amber-500/10', val: stats.maintenanceTrucks },
          { key: 'FAULTY', color: 'text-red-400', bg: 'bg-red-500/10', val: stats.faultyTrucks },
          { key: 'IDLE', color: 'text-slate-400', bg: 'bg-slate-500/10', val: stats.idleTrucks },
        ].map(s => (
          <div key={s.key} className={`${s.bg} border border-slate-800/60 rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{statusLabels[s.key]}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">{t(locale, 'truckStatusDist')}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={truckStatusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {truckStatusDist.map((entry: any, i: number) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#fff' }}
                  formatter={(value: any, name: any) => [value, statusLabels[name] || name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {truckStatusDist.map((d: any) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] }} />
                {statusLabels[d.name] || d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">{t(locale, 'recentFaults')}</h3>
            <a href="/dashboard/faults" className="text-xs text-blue-400 hover:text-blue-300 transition">{t(locale, 'viewAll')}</a>
          </div>
          <div className="space-y-2">
            {recentFaults.slice(0, 5).map((fault: any) => (
              <div key={fault.id} className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{fault.title}</p>
                  <p className="text-xs text-slate-500">{fault.truck.truckId} • {fault.reporter.name}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${SEVERITY_COLORS[fault.severity]}`}>
                  {t(locale, fault.severity as any)}
                </span>
              </div>
            ))}
            {recentFaults.length === 0 && <p className="text-slate-500 text-sm text-center py-6">{t(locale, 'noFaultsReported')}</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">{t(locale, 'activeTasks')}</h3>
          <a href="/dashboard/tasks" className="text-xs text-blue-400 hover:text-blue-300 transition">{t(locale, 'viewAll')}</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentTasks.slice(0, 6).map((task: any) => (
            <div key={task.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
              <div className="flex items-start justify-between mb-1.5">
                <p className="text-sm font-medium text-white truncate flex-1 mr-2">{task.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TASK_STATUS_COLORS[task.status]}`}>
                  {t(locale, task.status as any)}
                </span>
              </div>
              <p className="text-xs text-slate-500">{task.truck.truckId}{task.assignee ? ` • ${task.assignee.name}` : ` • ${t(locale, 'unassigned')}`}</p>
            </div>
          ))}
          {recentTasks.length === 0 && <p className="text-slate-500 text-sm col-span-3 text-center py-6">{t(locale, 'noActiveTasks')}</p>}
        </div>
      </div>
    </div>
  )
}
