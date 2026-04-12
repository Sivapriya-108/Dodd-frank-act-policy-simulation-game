// src/components/layout/Layout.jsx
import { Header } from './Header'

export function Layout({ children, className = '' }) {
  return (
    <div className={`min-h-screen app-shell ${className}`}>
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
