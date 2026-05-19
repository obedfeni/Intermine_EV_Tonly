'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Truck, Eye, EyeOff, Globe } from 'lucide-react'
import { t, type Locale } from '../../../lib/i18n'

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', role:'WORKER' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locale, setLocale] = useState<Locale>('en')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('tonly-locale') as Locale
    if (saved === 'en' || saved === 'zh') setLocale(saved)
  }, [])
  const switchLang = (l: Locale) => { setLocale(l); localStorage.setItem('tonly-locale', l) }

  const roles = [
    { value:'WORKER', label:t(locale,'worker'), desc:t(locale,'roleDescWorker') },
    { value:'TECHNICIAN', label:t(locale,'technician'), desc:t(locale,'roleDescTechnician') },
    { value:'SUPERVISOR', label:t(locale,'supervisor'), desc:t(locale,'roleDescSupervisor') },
    { value:'CHARGING_OPERATOR', label:t(locale,'chargingOperator'), desc:t(locale,'roleDescChargingOperator') },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirmPassword) { setError(t(locale,'passwordMismatch')); return }
    if (form.password.length < 6) { setError(t(locale,'passwordTooShort')); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:form.name, email:form.email, password:form.password, role:form.role }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
      router.push('/login')
    } catch { setError('Something went wrong'); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="relative w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <button onClick={()=>switchLang('en')} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${locale==='en'?'bg-blue-600 text-white':'text-slate-400 hover:text-slate-200'}`}>EN</button>
            <button onClick={()=>switchLang('zh')} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${locale==='zh'?'bg-blue-600 text-white':'text-slate-400 hover:text-slate-200'}`}>中文</button>
          </div>
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-600/30">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">{t(locale,'createAccount')}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t(locale,'joinTeam')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t(locale,'fullName')}</label>
            <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t(locale,'email')}</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@tonly.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t(locale,'role')}</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {roles.map(r=><option key={r.value} value={r.value} className="bg-slate-800">{r.label}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">{roles.find(r=>r.value===form.role)?.desc}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t(locale,'password')}</label>
            <div className="relative">
              <input type={showPw?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="••••••••" required />
              <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t(locale,'confirmPassword')}</label>
            <input type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
            {loading?t(locale,'creatingAccount'):t(locale,'createAccount')}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          {t(locale,'alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">{t(locale,'signIn')}</Link>
        </p>
      </div>
    </div>
  )
}
