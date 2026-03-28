// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'          // or your global styles
import Providers from './providers'  // ← import here

export const metadata: Metadata = {
  title: 'Allowance System',
  description: 'Employee allowance request app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>           {/* ← wrap everything here */}
          {children}
        </Providers>
      </body>
    </html>
  )
}