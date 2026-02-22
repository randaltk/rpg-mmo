import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Legends of Aldoria - RPG MMO 3D no Navegador',
  description: 'Explore castelos, cavernas cristalinas e vastas planícies neste RPG MMO 3D direto no navegador. Jogue com amigos em tempo real, sem downloads.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-roboto">{children}</body>
    </html>
  )
}
