import { auth } from '../../lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '../../components/sidebar'
import { Header } from '../../components/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar user={session.user as any} />
      <div className="flex-1 flex flex-col ml-64">
        <Header user={session.user as any} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
