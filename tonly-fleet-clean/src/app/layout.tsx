import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '../components/providers'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Tonly EV Fleet Management',
  description: 'Complete fleet management system for Tonly EV trucks',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
