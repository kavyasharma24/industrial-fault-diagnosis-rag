import React, { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { DiagnosisProvider } from './contexts/DiagnosisContext'
import { AppLayout } from './components/layout/AppLayout'
import type { PageId } from './types/navigation'

import { OverviewPage } from './pages/OverviewPage'
import { DiagnosisPage } from './pages/DiagnosisPage'
import { PredictionPage } from './pages/PredictionPage'
import { FailureModesPage } from './pages/FailureModesPage'
import { RagExplorerPage } from './pages/RagExplorerPage'
import { GraphExplorerPage } from './pages/GraphExplorerPage'
import { AiAssistantPage } from './pages/AiAssistantPage'
import { HistoryPage } from './pages/HistoryPage'

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview')

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage onNavigate={setCurrentPage} />
      case 'diagnosis':
        return <DiagnosisPage onNavigate={setCurrentPage} />
      case 'prediction':
        return <PredictionPage />
      case 'failure-modes':
        return <FailureModesPage onNavigate={setCurrentPage} />
      case 'rag-explorer':
        return <RagExplorerPage />
      case 'graph-explorer':
        return <GraphExplorerPage />
      case 'ai-assistant':
        return <AiAssistantPage onNavigate={setCurrentPage} />
      case 'history':
        return <HistoryPage onNavigate={setCurrentPage} />
      default:
        return <OverviewPage onNavigate={setCurrentPage} />
    }
  }

  return (
    <AppLayout currentPage={currentPage} onSelectPage={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  )
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DiagnosisProvider>
        <AppContent />
      </DiagnosisProvider>
    </ThemeProvider>
  )
}

export default App
