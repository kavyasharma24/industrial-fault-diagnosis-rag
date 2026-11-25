import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { diagnosisApi } from '../api/diagnosisApi'
import { healthApi } from '../api/healthApi'
import type { DiagnosisInput, DiagnosisResponse } from '../types/diagnosis'
import type { BackendConnectionState } from '../types/api'

export interface HistoricalDiagnosisItem {
  id: string
  timestamp: string
  input: DiagnosisInput
  result: DiagnosisResponse
}

interface DiagnosisContextType {
  inputData: DiagnosisInput
  setInputData: (data: Partial<DiagnosisInput>) => void
  resetToNominal: () => void
  latestDiagnosis: DiagnosisResponse | null
  isLoading: boolean
  error: string | null
  runDiagnosis: (customInput?: DiagnosisInput) => Promise<DiagnosisResponse | null>
  clearDiagnosis: () => void
  history: HistoricalDiagnosisItem[]
  clearHistory: () => void
  loadHistoricalItem: (item: HistoricalDiagnosisItem) => void
  backendStatus: BackendConnectionState
  checkBackendConnection: () => Promise<boolean>
}

const DEFAULT_INPUT: DiagnosisInput = {
  Air_Temperature: 300.0,
  Process_Temperature: 310.0,
  Rotational_Speed: 1500.0,
  Torque: 40.0,
  Tool_Wear: 120.0,
  query: 'What are the possible causes of industrial machine failure?',
  top_k: 3,
  product_quality: 'M',
}

const HISTORY_STORAGE_KEY = 'industrial_diagnosis_history'

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined)

export const DiagnosisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inputData, setInputDataState] = useState<DiagnosisInput>(DEFAULT_INPUT)
  const [latestDiagnosis, setLatestDiagnosis] = useState<DiagnosisResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<BackendConnectionState>('checking')

  const [history, setHistory] = useState<HistoricalDiagnosisItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // If parsing fails, start empty
    }
    return []
  })

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    } catch {
      // Handle storage quota limit if necessary
    }
  }, [history])

  // Periodic and on-mount health check using root GET /
  const checkBackendConnection = useCallback(async (): Promise<boolean> => {
    try {
      await healthApi.checkRoot()
      setBackendStatus('connected')
      return true
    } catch {
      // Fallback check on /health
      try {
        await healthApi.checkHealth()
        setBackendStatus('connected')
        return true
      } catch {
        setBackendStatus('offline')
        return false
      }
    }
  }, [])

  useEffect(() => {
    checkBackendConnection()
    const interval = setInterval(checkBackendConnection, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [checkBackendConnection])

  const setInputData = (data: Partial<DiagnosisInput>) => {
    setInputDataState((prev) => ({ ...prev, ...data }))
  }

  const resetToNominal = () => {
    setInputDataState(DEFAULT_INPUT)
  }

  const runDiagnosis = async (customInput?: DiagnosisInput): Promise<DiagnosisResponse | null> => {
    const activeInput = customInput || inputData
    setIsLoading(true)
    setError(null)

    try {
      const response = await diagnosisApi.analyzeMachine(activeInput)
      setLatestDiagnosis(response)

      // Add to session history
      const historyItem: HistoricalDiagnosisItem = {
        id: `run_${Date.now()}`,
        timestamp: new Date().toISOString(),
        input: { ...activeInput },
        result: response,
      }
      setHistory((prev) => [historyItem, ...prev.slice(0, 49)]) // Keep last 50 runs

      return response
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String(err.message)
        : 'An unexpected error occurred during diagnosis.'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const clearDiagnosis = () => {
    setLatestDiagnosis(null)
    setError(null)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_STORAGE_KEY)
  }

  const loadHistoricalItem = (item: HistoricalDiagnosisItem) => {
    setInputDataState({ ...item.input })
    setLatestDiagnosis(item.result)
  }

  return (
    <DiagnosisContext.Provider
      value={{
        inputData,
        setInputData,
        resetToNominal,
        latestDiagnosis,
        isLoading,
        error,
        runDiagnosis,
        clearDiagnosis,
        history,
        clearHistory,
        loadHistoricalItem,
        backendStatus,
        checkBackendConnection,
      }}
    >
      {children}
    </DiagnosisContext.Provider>
  )
}

export const useDiagnosis = (): DiagnosisContextType => {
  const context = useContext(DiagnosisContext)
  if (!context) {
    throw new Error('useDiagnosis must be used within a DiagnosisProvider')
  }
  return context
}
