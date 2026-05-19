'use client'
import { Bell, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import { type Locale } from '../lib/i18n'

export function Header({ user }: { user: { name?: string; email?: string; role: string } }) {
  const [locale, setLocale] = useState<Locale>('en')
  useEffect(() => {
    const saved = localStorage.getItem('tonly-locale') as Locale
    if (saved === 'en' || saved === 'zh') setLocale(saved)
  }, [])
  const switchLang = (l: Locale) => { setLocale(l); localStorage.setItem('tonly-locale', l); window.location.reload() }
  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <button onClick={() => switchLang('en')} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${locale==='en'?'bg-blue-600 text-white':'text-slate-400 hover:text-slate-200'}`}>EN</button>
          <button onClick={() => switchLang('zh')} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${locale==='zh'?'bg-blue-600 text-white':'text-slate-400 hover:text-slate-200'}`}>中文</button>
        </div>
        <button className="relative p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
