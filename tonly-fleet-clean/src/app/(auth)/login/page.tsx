'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Truck, Eye, EyeOff, Globe } from 'lucide-react'
import { translations, type Locale } from '@/lib/i18n'

function t(locale: Locale, key: keyof typeof translations.en): string {
  return (translations[locale] as any)[key] ?? (translations.en as any)[key] ?? key
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locale, setLocale] = useState<Locale>('en')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('tonly-locale') as Locale
    if (saved === 'en' || saved === 'zh') setLocale(saved)
  }, [])

  const switchLang = (l: Locale) => {
    setLocale(l)
    localStorage.setItem('tonly-locale', l)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError(t(locale, 'invalidCredentials')); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/50">
        {/* Language switcher */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button onClick={() => switchLang('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${locale === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              EN
            </button>
            <button onClick={() => switchLang('zh')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${locale === 'zh' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              中文
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t(locale, 'appName')}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t(locale, 'appSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale, 'email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="you@tonly.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale, 'password')}</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
                placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20">
            {loading ? t(locale, 'signingIn') : t(locale, 'signIn')}
          </button>
        </form>

        <div className="mt-5 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-500 text-center mb-2 font-medium">{t(locale, 'demoAccounts')}</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
            <span>supervisor@tonly.com</span><span className="text-slate-500">password123</span>
            <span>tech@tonly.com</span><span className="text-slate-500">password123</span>
            <span>worker@tonly.com</span><span className="text-slate-500">password123</span>
            <span>charger@tonly.com</span><span className="text-slate-500">password123</span>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          {t(locale, 'noAccount')}{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">{t(locale, 'registerHere')}</Link>
        </p>
      </div>
    </div>
  )
}
