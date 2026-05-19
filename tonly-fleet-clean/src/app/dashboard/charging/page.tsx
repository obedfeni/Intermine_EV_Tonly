'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, X, Upload, FileSpreadsheet, Download, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { hasPermission } from '../../../lib/roles'
import { formatDate, formatCurrency } from '../../../lib/utils'
import { useLang } from '../../../lib/lang-context'
import { t } from '../../../lib/i18n'
import * as XLSX from 'xlsx'

export default function ChargingPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<any[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [filter, setFilter] = useState('')
  const { locale } = useLang()

  const role = (session?.user as any)?.role || ''
  const canLog = hasPermission(role, 'charging:log')

  const load = () => fetch('/api/charging').then(r => r.json()).then(d => { setLogs(d); setLoading(false) })
  useEffect(() => { load(); fetch('/api/trucks').then(r => r.json()).then(setTrucks) }, [])

  const filtered = logs.filter(l => !filter || l.truck.truckId === filter)
  const totalKwh = logs.reduce((s, l) => s + (l.kwhDelivered || 0), 0)
  const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0)

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['truckId','startTime','endTime','startBattery','endBattery','kwhDelivered','stationId','cost','notes'],
      ['TNL-001','2025-01-15 08:00','2025-01-15 10:30',20,90,145.5,'CS-01',18.50,'Full charge'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Charging Logs')
    XLSX.writeFile(wb, 'tonly_charging_template.xlsx')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t(locale,'chargingLogs')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{t(locale,'monitorCharging')}</p>
        </div>
        {canLog && (
          <div className="flex gap-2">
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition border border-slate-600">
              <FileSpreadsheet className="w-4 h-4" /> {t(locale,'importExcel')}
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition">
              <Plus className="w-4 h-4" /> {t(locale,'logSession')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t(locale,'totalSessions'), value: logs.length },
          { label: t(locale,'totalEnergy'), value: `${totalKwh.toFixed(1)} kWh` },
          { label: t(locale,'totalCost'), value: formatCurrency(totalCost) },
        ].map(c => (
          <div key={c.label} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">{t(locale,'allTrucks')}</option>
          {trucks.map(tr => <option key={tr.id} value={tr.truckId}>{tr.truckId}</option>)}
        </select>
        <span className="text-xs text-slate-500">{t(locale,'sessionCount',{ count: filtered.length })}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                {[t(locale,'truck'),t(locale,'startTime'),t(locale,'endTime'),t(locale,'battery'),t(locale,'kWh'),t(locale,'station'),t(locale,'cost'),t(locale,'operator')].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-12 text-slate-500 text-sm">{t(locale,'loading')}</td></tr>
              : filtered.map(log => (
                <tr key={log.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3"><p className="text-sm font-bold text-white">{log.truck.truckId}</p><p className="text-xs text-slate-500">{log.truck.model}</p></td>
                  <td className="px-4 py-3 text-xs text-slate-300">{formatDate(log.startTime)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{log.endTime ? formatDate(log.endTime) : <span className="text-blue-400 text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-lg">{t(locale,'inProgress')}</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full w-16 overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${log.endBattery || log.startBattery}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{log.startBattery}%{log.endBattery ? `→${log.endBattery}%` : ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-green-400 font-medium">{log.kwhDelivered ? `${log.kwhDelivered} kWh` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{log.stationId}</td>
                  <td className="px-4 py-3 text-xs text-amber-400">{log.cost ? formatCurrency(log.cost) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{log.operator.name || log.operator.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">{locale === 'zh' ? '暂无充电记录' : 'No charging logs found'}</div>}
        </div>
      </div>

      {showModal && <LogChargingModal trucks={trucks} locale={locale} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); load() }} />}
      {showUpload && <ExcelUploadModal trucks={trucks} locale={locale} onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); load() }} onDownloadTemplate={downloadTemplate} />}
    </div>
  )
}

function LogChargingModal({ trucks, locale, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ truckId:'', startTime:'', endTime:'', startBattery:'', endBattery:'', kwhDelivered:'', stationId:'', cost:'', notes:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const payload = { truckId: form.truckId, startTime: form.startTime, endTime: form.endTime || null, startBattery: parseInt(form.startBattery), endBattery: form.endBattery ? parseInt(form.endBattery) : null, kwhDelivered: form.kwhDelivered ? parseFloat(form.kwhDelivered) : null, stationId: form.stationId, cost: form.cost ? parseFloat(form.cost) : null, notes: form.notes || null }
    const res = await fetch('/api/charging', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { onSuccess() } else { const d = await res.json(); setError(d.error || 'Failed'); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{t(locale,'logChargingSession')}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'truck')}</label>
            <select value={form.truckId} onChange={e => setForm({...form,truckId:e.target.value})}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required>
              <option value="">{t(locale,'selectTruck')}</option>
              {trucks.map((tr:any) => <option key={tr.id} value={tr.id}>{tr.truckId} — {tr.model}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'startTime')}</label><input type="datetime-local" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'endTime')}</label><input type="datetime-local" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'startBattery')}</label><input type="number" min="0" max="100" value={form.startBattery} onChange={e=>setForm({...form,startBattery:e.target.value})} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="20" required /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'endBattery')}</label><input type="number" min="0" max="100" value={form.endBattery} onChange={e=>setForm({...form,endBattery:e.target.value})} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="90" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'kwhDelivered')}</label><input type="number" step="0.1" value={form.kwhDelivered} onChange={e=>setForm({...form,kwhDelivered:e.target.value})} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="150" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'stationId')}</label><input value={form.stationId} onChange={e=>setForm({...form,stationId:e.target.value})} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="CS-01" required /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'cost')} ($)</label><input type="number" step="0.01" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0.00" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">{t(locale,'notes')}</label><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm">
            {loading ? t(locale,'saving') : t(locale,'logSessionBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}

function ExcelUploadModal({ trucks, locale, onClose, onSuccess, onDownloadTemplate }: any) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle'|'parsed'|'uploading'|'success'|'error'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)
  const truckMap = Object.fromEntries(trucks.map((tr:any) => [tr.truckId, tr.id]))

  const parseFile = (f: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { raw: false })
      const errs: string[] = []
      const parsed = rows.map((row, i) => {
        const truckId = row.truckId || row['Truck ID'] || ''
        const dbId = truckMap[truckId]
        if (!dbId) errs.push(`Row ${i+2}: Unknown truckId "${truckId}"`)
        return { truckId: dbId||'', startTime: row.startTime||'', endTime: row.endTime||null, startBattery: parseInt(row.startBattery||'0')||0, endBattery: row.endBattery?parseInt(row.endBattery):null, kwhDelivered: row.kwhDelivered?parseFloat(row.kwhDelivered):null, stationId: row.stationId||'CS-00', cost: row.cost?parseFloat(row.cost):null, notes: row.notes||null, _truckId: truckId, _valid: !!dbId }
      })
      setPreview(parsed); setErrors(errs); setStatus('parsed')
    }
    reader.readAsArrayBuffer(f)
  }

  const handleFile = (f: File) => { setFile(f); parseFile(f) }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }

  const handleUpload = async () => {
    const valid = preview.filter(r => r._valid)
    if (!valid.length) return
    setLoading(true); setStatus('uploading')
    const payload = valid.map(({ _truckId, _valid, ...rest }) => rest)
    const res = await fetch('/api/charging', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { setStatus('success'); setTimeout(onSuccess, 1000) } else { setStatus('error'); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{t(locale,'importChargingData')}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
        </div>
        <div className="flex gap-3 mb-5">
          <button onClick={onDownloadTemplate} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition border border-slate-700">
            <Download className="w-3.5 h-3.5" /> {t(locale,'downloadTemplate')}
          </button>
        </div>
        {status === 'idle' && (
          <div onDrop={handleDrop} onDragOver={e=>e.preventDefault()} onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-10 text-center cursor-pointer transition group">
            <FileSpreadsheet className="w-10 h-10 text-slate-600 group-hover:text-blue-500 mx-auto mb-3 transition" />
            <p className="text-sm font-medium text-slate-400">{t(locale,'dropExcelHere')}</p>
            <p className="text-xs text-slate-600 mt-1">{t(locale,'xlsxFiles')}</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        )}
        {status === 'success' && (
          <div className="text-center py-10"><CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" /><p className="text-white font-semibold">{t(locale,'importSuccessful')}</p></div>
        )}
        {status === 'parsed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-white font-medium">{file?.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-lg ${errors.length ? 'bg-amber-500/15 text-amber-400' : 'bg-green-500/15 text-green-400'}`}>{t(locale,'validRows',{ count: preview.filter(r=>r._valid).length })}</span>
              </div>
              <button onClick={() => { setFile(null); setPreview([]); setErrors([]); setStatus('idle') }} className="text-xs text-slate-500 hover:text-slate-300">{t(locale,'changeFile')}</button>
            </div>
            {errors.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-1"><AlertCircle className="w-3.5 h-3.5" />{t(locale,'issuesFound',{ count: errors.length })}</div>
                {errors.slice(0,3).map((e,i) => <p key={i} className="text-xs text-amber-400/70">{e}</p>)}
              </div>
            )}
            <div className="bg-slate-800/40 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-700">{['Truck','Start','kWh','Station','✓'].map(h=><th key={h} className="text-left px-3 py-2 text-slate-500">{h}</th>)}</tr></thead>
                <tbody>{preview.map((row,i) => (
                  <tr key={i} className={`border-b border-slate-800/50 ${!row._valid?'bg-red-500/5':''}`}>
                    <td className="px-3 py-1.5 text-white">{row._truckId}</td>
                    <td className="px-3 py-1.5 text-slate-400">{row.startTime?.toString().slice(0,16)}</td>
                    <td className="px-3 py-1.5 text-green-400">{row.kwhDelivered||'—'}</td>
                    <td className="px-3 py-1.5 text-slate-400">{row.stationId}</td>
                    <td className="px-3 py-1.5">{row._valid ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <AlertCircle className="w-3.5 h-3.5 text-red-400" />}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <button onClick={handleUpload} disabled={loading||!preview.filter(r=>r._valid).length}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              {loading ? t(locale,'importing') : t(locale,'importRecords',{ count: preview.filter(r=>r._valid).length })}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
