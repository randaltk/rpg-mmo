import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RPG MMO 3D - Jogo de RPG Multiplayer no Navegador',
  description: 'Explore castelos, cavernas cristalinas e vastas planícies neste RPG MMO 3D direto no navegador. Jogue com amigos em tempo real, sem downloads.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

