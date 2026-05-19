'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Truck, AlertTriangle, ClipboardList, Zap, LogOut, TruckIcon, Users, ChevronRight } from 'lucide-react'
import { hasPermission, ROLE_COLORS } from '../lib/roles'
import { t, type Locale } from '../lib/i18n'
import { useState, useEffect } from 'react'

const navItems = [
  { href:'/dashboard', icon:LayoutDashboard, perm:'dashboard:view', exact:true, key:'dashboard' as const },
  { href:'/dashboard/trucks', icon:Truck, perm:'trucks:view', exact:false, key:'fleetTrucks' as const },
  { href:'/dashboard/faults', icon:AlertTriangle, perm:'faults:view', exact:false, key:'faultReports' as const },
  { href:'/dashboard/tasks', icon:ClipboardList, perm:'tasks:view', exact:false, key:'taskManagement' as const },
  { href:'/dashboard/charging', icon:Zap, perm:'charging:view', exact:false, key:'chargingLogs' as const },
  { href:'/dashboard/users', icon:Users, perm:'*', exact:false, key:'teamMembers' as const, supervisorOnly:true },
]

export function Sidebar({ user }: { user: { name?: string; email?: string; role: string } }) {
  const pathname = usePathname()
  const [locale, setLocale] = useState<Locale>('en')
  useEffect(() => {
    const saved = localStorage.getItem('tonly-locale') as Locale
    if (saved === 'en' || saved === 'zh') setLocale(saved)
  }, [])

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800/60 flex flex-col z-50">
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <TruckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{t(locale,'appName')}</h2>
            <p className="text-xs text-slate-500">{locale==='zh'?'电动车队管理':'EV Management'}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2 mt-1">{t(locale,'navigation')}</p>
        {navItems.map((item) => {
          if (item.supervisorOnly && user.role !== 'SUPERVISOR') return null
          if (!hasPermission(user.role, item.perm)) return null
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive?'bg-blue-600/15 text-blue-400 border border-blue-600/20':'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}>
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive?'text-blue-400':'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1">{t(locale, item.key)}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-800/60">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/40 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || user.email}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${ROLE_COLORS[user.role]||'bg-slate-500/20 text-slate-400'}`}>
              {t(locale, user.role === 'CHARGING_OPERATOR' ? 'chargingOperator' : user.role.toLowerCase() as any)}
            </span>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl:'/login' })}
          className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut className="w-4 h-4" />{t(locale,'signOut')}
        </button>
      </div>
    </aside>
  )
}
