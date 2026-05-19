'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Users, Shield, Wrench, Truck, Zap, Mail, Calendar } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../../../lib/roles'
import { formatDateShort } from '../../../lib/utils'

const ROLE_ICONS: Record<string, any> = {
  WORKER: Truck, TECHNICIAN: Wrench, SUPERVISOR: Shield, CHARGING_OPERATOR: Zap,
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const role = (session?.user as any)?.role
  useEffect(() => {
    if (role && role !== 'SUPERVISOR') window.location.href = '/dashboard'
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(d); setLoading(false) })
  }, [role])

  const filtered = users.filter(u => !filter || u.role === filter)

  const counts = Object.entries(ROLE_LABELS).map(([key, label]) => ({
    key, label, count: users.filter(u => u.role === key).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Members</h1>
        <p className="text-slate-400 text-sm mt-0.5">All registered fleet management users</p>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {counts.map(({ key, label, count }) => {
          const Icon = ROLE_ICONS[key]
          return (
            <button key={key} onClick={() => setFilter(filter === key ? '' : key)}
              className={`p-4 rounded-2xl border text-left transition-all ${filter === key ? 'bg-blue-600/10 border-blue-600/30' : 'bg-slate-900 border-slate-800/60 hover:border-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4 text-slate-500" />
                <span className="text-xl font-bold text-white">{count}</span>
              </div>
              <p className="text-xs text-slate-400">{label}s</p>
            </button>
          )
        })}
      </div>

      {/* User grid */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(user => {
            const Icon = ROLE_ICONS[user.role] || Users
            return (
              <div key={user.id} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name || '—'}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-600" />
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${ROLE_COLORS[user.role] || 'bg-slate-500/20 text-slate-400'}`}>
                    <div className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {ROLE_LABELS[user.role] || user.role}
                    </div>
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Calendar className="w-3 h-3" />
                    {formatDateShort(user.createdAt)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500 text-sm">No users found</div>
      )}
    </div>
  )
}
