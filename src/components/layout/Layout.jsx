// src/components/layout/Layout.jsx
import { Header } from './Header'

export function Layout({ children }) {
  return (
    <div className="min-h-screen app-shell">
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
