import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-1 text-sm rounded transition-colors',
    isActive
      ? 'bg-zinc-900 text-white'
      : 'text-zinc-700 hover:bg-zinc-100',
  ].join(' ')

export function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold mb-1">
            @teamsparta/rich-editor — Playground
          </h1>
          <p className="text-sm text-zinc-500 mb-3">
            Phase 14 — 9확장 회귀 검증 (marks 6종 포함)
          </p>
          <nav className="flex gap-2" aria-label="playground sections">
            <NavLink to="/basics" className={navLinkClass}>
              Basics
            </NavLink>
            <NavLink to="/text" className={navLinkClass}>
              Text
            </NavLink>
            <NavLink to="/code" className={navLinkClass}>
              Code
            </NavLink>
            <NavLink to="/images" className={navLinkClass}>
              Images
            </NavLink>
            <NavLink to="/tables" className={navLinkClass}>
              Tables
            </NavLink>
            <NavLink to="/marks" className={navLinkClass}>
              Marks
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
