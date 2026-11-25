import React from 'react'
import { Sun, Moon, Menu, Shield, RefreshCw } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useDiagnosis } from '../../contexts/DiagnosisContext'
import type { PageId } from '../../types/navigation'

interface HeaderProps {
  currentPage: PageId
  onToggleSidebar: () => void
}

const PAGE_TITLES: Record<PageId, { title: string; category: string }> = {
  overview: { title: 'Overview Dashboard', category: 'Executive Monitoring' },
  diagnosis: { title: 'Live Machine Diagnosis', category: 'Operational Control' },
  prediction: { title: 'ML Prediction Analysis', category: 'Inference Models' },
  'failure-modes': { title: 'Failure Mode Analysis', category: 'Rule Evaluation' },
  'rag-explorer': { title: 'RAG Knowledge Explorer', category: 'Semantic Search' },
  'graph-explorer': { title: 'Knowledge Graph Explorer', category: 'Relational Intelligence' },
  'ai-assistant': { title: 'AI Diagnosis Assistant', category: 'Agentic Synthesis' },
  history: { title: 'Diagnosis History', category: 'Historical Records' },
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme()
  const { backendStatus, checkBackendConnection } = useDiagnosis()
  const pageMeta = PAGE_TITLES[currentPage] || { title: 'Dashboard', category: 'Industrial AI' }

  return (
    <header className="h-16 border-b border-industrial-border bg-industrial-card px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-industrial-text hover:bg-industrial-surface lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-industrial-teal">
            {pageMeta.category}
          </div>
          <h1 className="text-base md:text-lg font-bold text-industrial-text leading-tight">
            {pageMeta.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real Backend Connection Status Indicator */}
        <button
          onClick={() => checkBackendConnection()}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-industrial-surface/70 border border-industrial-border text-xs font-medium text-industrial-text hover:bg-industrial-surface transition-colors cursor-pointer"
          title="Click to re-check backend connection"
        >
          {backendStatus === 'connected' && (
            <>
              <span className="w-2 h-2 rounded-full bg-industrial-teal" />
              <span className="text-industrial-teal font-semibold">Backend Connected</span>
              <span className="text-industrial-text-muted">(:8000)</span>
            </>
          )}

          {backendStatus === 'checking' && (
            <>
              <RefreshCw className="w-3 h-3 text-industrial-text-muted animate-spin" />
              <span className="text-industrial-text-muted">Checking API...</span>
            </>
          )}

          {backendStatus === 'offline' && (
            <>
              <span className="w-2 h-2 rounded-full bg-industrial-peach animate-pulse" />
              <span className="text-industrial-peach font-semibold">Backend Offline</span>
              <span className="text-industrial-text-muted">(:8000)</span>
            </>
          )}
        </button>

        {/* Project Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-industrial-card border border-industrial-border text-xs text-industrial-text-muted">
          <Shield className="w-3.5 h-3.5 text-industrial-teal" />
          <span>Graph-Enhanced Agentic RAG</span>
        </div>

        {/* Light / Dark Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-industrial-border bg-industrial-card hover:bg-industrial-surface text-industrial-text transition-all shadow-sm"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-industrial-teal" />
          ) : (
            <Sun className="w-4 h-4 text-industrial-peach" />
          )}
        </button>
      </div>
    </header>
  )
}
