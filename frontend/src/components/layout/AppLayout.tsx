import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import type { PageId } from '../../types/navigation'

interface AppLayoutProps {
  currentPage: PageId
  onSelectPage: (page: PageId) => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onSelectPage,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-industrial-bg flex transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
