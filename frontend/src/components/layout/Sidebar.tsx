import React from 'react'
import {
  LayoutDashboard,
  Activity,
  Cpu,
  AlertTriangle,
  Search,
  Network,
  Sparkles,
  History,
  X,
  Boxes,
} from 'lucide-react'
import type { PageId } from '../../types/navigation'

interface SidebarProps {
  currentPage: PageId
  onSelectPage: (page: PageId) => void
  isOpen: boolean
  onClose: () => void
}

interface NavItemConfig {
  id: PageId
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'diagnosis', label: 'Live Diagnosis', icon: Activity, badge: 'Live' },
  { id: 'prediction', label: 'ML Prediction', icon: Cpu },
  { id: 'failure-modes', label: 'Failure Modes', icon: AlertTriangle, badge: '5 Rules' },
  { id: 'rag-explorer', label: 'RAG Explorer', icon: Search },
  { id: 'graph-explorer', label: 'Knowledge Graph', icon: Network },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'Groq' },
  { id: 'history', label: 'Diagnosis History', icon: History },
]

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-industrial-sidebar border-r border-industrial-border z-40 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo / Branding */}
        <div>
          <div className="h-16 px-5 border-b border-industrial-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-industrial-teal text-white shadow-sm">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-industrial-text block leading-none">
                  Industrial AI
                </span>
                <span className="text-[10px] font-semibold text-industrial-teal uppercase tracking-wider block mt-1">
                  Command Center
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-industrial-text-muted hover:bg-industrial-surface lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-industrial-text-muted">
              Monitoring & Intelligence
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectPage(item.id)
                    onClose()
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-industrial-teal text-white shadow-sm font-semibold'
                      : 'text-industrial-text hover:bg-industrial-surface hover:text-industrial-text'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-industrial-teal'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-industrial-surface text-industrial-teal font-semibold'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Machine Status Footer */}
        <div className="p-4 border-t border-industrial-border bg-industrial-card/40 m-2 rounded-2xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-industrial-text">Asset #MACHINE_001</span>
            <span className="text-[10px] font-medium text-industrial-teal bg-industrial-surface px-2 py-0.5 rounded-full">
              Connected
            </span>
          </div>
          <p className="text-[11px] text-industrial-text-muted leading-tight">
            AI4I 2020 Predictive Maintenance Dataset Asset
          </p>
        </div>
      </aside>
    </>
  )
}
