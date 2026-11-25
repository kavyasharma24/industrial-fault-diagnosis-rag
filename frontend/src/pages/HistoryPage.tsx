import React, { useState, useMemo } from 'react'
import {
  History,
  Download,
  Clock,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Cpu,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { useDiagnosis, type HistoricalDiagnosisItem } from '../contexts/DiagnosisContext'
import { StatusBadge } from '../components/common/StatusBadge'
import type { PageId } from '../types/navigation'

interface HistoryPageProps {
  onNavigate?: (page: PageId) => void
}

type FilterOption = 'all' | 'failures' | 'nominal'

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { history, clearHistory, loadHistoricalItem } = useDiagnosis()

  const [filter, setFilter] = useState<FilterOption>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Sort history newest first
  const sortedHistory = useMemo(() => {
    return [...history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [history])

  // Filter history
  const filteredHistory = useMemo(() => {
    if (filter === 'all') return sortedHistory
    return sortedHistory.filter((item) => {
      const isFailure =
        item.result.ml_prediction?.prediction === 1 ||
        item.result.ml_prediction?.prediction_label === 'Machine Failure'
      return filter === 'failures' ? isFailure : !isFailure
    })
  }, [sortedHistory, filter])

  // Helper to extract KG evaluation details
  const getKGEvalDetails = (item: HistoricalDiagnosisItem) => {
    const kgEval = item.result.knowledge_graph_evaluation
    if (!kgEval?.results) return { met: [], twfInterval: false }

    const met: string[] = []
    let twfInterval = false

    Object.entries(kgEval.results).forEach(([code, evalData]) => {
      if (evalData && typeof evalData === 'object' && 'status' in evalData) {
        if (evalData.status === 'evidence_condition_met') {
          met.push(code)
        } else if (code === 'TWF' && evalData.status === 'within_documented_interval') {
          twfInterval = true
        }
      }
    })

    return { met, twfInterval }
  }

  // Handle Export Log as JSON
  const handleExportJson = () => {
    if (history.length === 0) return
    const jsonString = JSON.stringify(history, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `industrial_diagnosis_history_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Handle Reload Item in Live Diagnosis
  const handleReload = (item: HistoricalDiagnosisItem) => {
    loadHistoricalItem(item)
    if (onNavigate) {
      onNavigate('diagnosis')
    }
  }

  // Handle Clear History
  const handleConfirmClear = () => {
    clearHistory()
    setShowClearConfirm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-industrial-surface text-industrial-teal">
              Client Session Persistence
            </span>
            <span className="text-xs text-industrial-text-muted">
              localStorage Key: industrial_diagnosis_history
            </span>
          </div>
          <h2 className="text-2xl font-bold text-industrial-text">Diagnosis History</h2>
          <p className="text-sm text-industrial-text-muted mt-1 max-w-2xl">
            Chronological audit log of multi-modal diagnostic runs with telemetry inputs, XGBoost inferences, Knowledge Graph rule checks, and 1-click reload.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {history.length > 0 && (
            <>
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-red-500/10 border border-red-500/30">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 px-2">
                    Clear {history.length} runs?
                  </span>
                  <button
                    onClick={handleConfirmClear}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 rounded-lg bg-industrial-surface hover:bg-industrial-border text-industrial-text text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-industrial-border bg-industrial-card hover:bg-industrial-surface text-xs font-medium text-industrial-text transition-colors shadow-sm"
                  title="Clear all saved history runs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Clear History</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={handleExportJson}
            disabled={history.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
              history.length === 0
                ? 'border border-industrial-border bg-industrial-card text-industrial-text-muted opacity-50 cursor-not-allowed'
                : 'bg-industrial-teal hover:bg-industrial-teal-hover text-white cursor-pointer active:scale-95'
            }`}
            title={history.length === 0 ? 'No history runs to export' : 'Download history log as JSON'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log (JSON)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-4">
        {/* Subheader: Run Count & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-industrial-border gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-industrial-teal" />
            <h3 className="text-base font-semibold text-industrial-text">Previous Diagnostic Runs</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-industrial-surface text-industrial-teal">
              {history.length} {history.length === 1 ? 'Run' : 'Runs'} Logged
            </span>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-industrial-text-muted" />
              <span className="text-industrial-text-muted font-medium">Filter:</span>
              {(
                [
                  { id: 'all', label: `All (${history.length})` },
                  {
                    id: 'failures',
                    label: `Failures (${
                      history.filter(
                        (h) =>
                          h.result.ml_prediction?.prediction === 1 ||
                          h.result.ml_prediction?.prediction_label === 'Machine Failure'
                      ).length
                    })`,
                  },
                  {
                    id: 'nominal',
                    label: `Nominal (${
                      history.filter(
                        (h) =>
                          h.result.ml_prediction?.prediction === 0 ||
                          h.result.ml_prediction?.prediction_label === 'No Machine Failure'
                      ).length
                    })`,
                  },
                ] as { id: FilterOption; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filter === opt.id
                      ? 'bg-industrial-teal text-white shadow-sm font-semibold'
                      : 'bg-industrial-surface/70 text-industrial-text hover:bg-industrial-surface'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* History Entries List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const isExpanded = expandedId === item.id
              const isFailure =
                item.result.ml_prediction?.prediction === 1 ||
                item.result.ml_prediction?.prediction_label === 'Machine Failure'
              const failureProb =
                item.result.ml_prediction?.probabilities?.['1'] ??
                (item.result.ml_prediction?.prediction === 1 ? 1 : 0)
              const { met: metKgConditions, twfInterval } = getKGEvalDetails(item)

              const formattedTime = new Date(item.timestamp).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'medium',
              })

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all ${
                    isFailure
                      ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
                      : 'border-industrial-border bg-industrial-bg/40 hover:bg-industrial-bg/60'
                  }`}
                >
                  {/* Item Summary Bar */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Timestamp & Status Badges */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isFailure ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Machine Failure</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-industrial-surface text-industrial-teal border border-industrial-border">
                            <CheckCircle2 className="w-3.5 h-3.5 text-industrial-teal" />
                            <span>No Failure</span>
                          </span>
                        )}

                        <span className="text-xs font-mono font-semibold text-industrial-text">
                          {(failureProb * 100).toFixed(1)}% Failure Prob
                        </span>

                        {metKgConditions.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                            KG Met: {metKgConditions.join(', ')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-industrial-surface text-industrial-text-muted">
                            KG: All Clear
                          </span>
                        )}

                        {twfInterval && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            TWF Interval (Info)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-industrial-text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono">{formattedTime}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{item.id}</span>
                      </div>
                    </div>

                    {/* Center: Sensor Parameters Strip */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono bg-industrial-card/80 p-2.5 rounded-xl border border-industrial-border">
                      <div className="text-center">
                        <span className="text-[10px] text-industrial-text-muted block uppercase">Air</span>
                        <span className="font-bold text-industrial-text">{item.input.Air_Temperature.toFixed(1)}K</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-industrial-text-muted block uppercase">Proc</span>
                        <span className="font-bold text-industrial-text">{item.input.Process_Temperature.toFixed(1)}K</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-industrial-text-muted block uppercase">Speed</span>
                        <span className="font-bold text-industrial-teal">{item.input.Rotational_Speed}rpm</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-industrial-text-muted block uppercase">Torque</span>
                        <span className="font-bold text-industrial-teal">{item.input.Torque.toFixed(1)}Nm</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-industrial-text-muted block uppercase">Wear</span>
                        <span className="font-bold text-industrial-text">{item.input.Tool_Wear}min</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-industrial-text-muted block uppercase">Qual</span>
                        <span className="font-bold text-industrial-text">Type {item.input.product_quality || 'M'}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleReload(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-industrial-teal hover:bg-industrial-teal-hover text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                        title="Load this telemetry run into Live Diagnosis"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reload in Diagnosis</span>
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-xl border border-industrial-border bg-industrial-card hover:bg-industrial-surface text-industrial-text transition-colors"
                        title={isExpanded ? 'Collapse details' : 'Expand full evaluation breakdown'}
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Evaluation Breakdown */}
                  {isExpanded && (
                    <div className="p-4 border-t border-industrial-border bg-industrial-card/50 space-y-4">
                      {/* LLM Synthesis Preview if available */}
                      {item.result.llm_diagnosis && (
                        <div className="p-3 rounded-xl bg-industrial-bg/60 border border-industrial-border space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-industrial-teal block">
                            LLM Synthesized Diagnosis:
                          </span>
                          <p className="text-xs text-industrial-text leading-relaxed">
                            {item.result.llm_diagnosis}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ML Prediction Probabilities */}
                        <div className="p-3 rounded-xl bg-industrial-card border border-industrial-border space-y-2">
                          <span className="text-[11px] font-bold text-industrial-text flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-industrial-teal" />
                            XGBoost Classification Probabilities
                          </span>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-industrial-text-muted">Class 0 (No Failure):</span>
                              <span className="font-mono font-bold text-industrial-text">
                                {(((item.result.ml_prediction?.probabilities?.['0'] ?? (1 - failureProb))) * 100).toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-industrial-text-muted">Class 1 (Failure):</span>
                              <span className="font-mono font-bold text-red-600 dark:text-red-400">
                                {(failureProb * 100).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Knowledge Graph Evaluation Summary */}
                        <div className="p-3 rounded-xl bg-industrial-card border border-industrial-border space-y-2">
                          <span className="text-[11px] font-bold text-industrial-text flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-industrial-teal" />
                            Knowledge Graph Physical Rules Status
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {item.result.knowledge_graph_evaluation?.results &&
                              Object.entries(item.result.knowledge_graph_evaluation.results).map(
                                ([code, evalData]) => (
                                  <div
                                    key={code}
                                    className="p-1.5 rounded-lg bg-industrial-surface/40 border border-industrial-border flex items-center justify-between"
                                  >
                                    <span className="font-mono font-bold text-industrial-teal">{code}</span>
                                    <StatusBadge status={evalData.status} size="sm" />
                                  </div>
                                )
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic Query & Top K if present */}
                      {item.input.query && (
                        <div className="text-xs text-industrial-text-muted flex items-center justify-between pt-2 border-t border-industrial-border">
                          <span>
                            Query: <span className="italic text-industrial-text">"{item.input.query}"</span>
                          </span>
                          <span className="font-mono">Top K: {item.input.top_k ?? 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : history.length > 0 ? (
          <div className="p-8 rounded-xl bg-industrial-bg/50 border border-dashed border-industrial-border text-center space-y-2">
            <Filter className="w-8 h-8 text-industrial-text-muted mx-auto" />
            <h4 className="text-sm font-semibold text-industrial-text">No Matching Runs Found</h4>
            <p className="text-xs text-industrial-text-muted max-w-sm mx-auto">
              No historical runs match the selected filter ({filter}).
            </p>
            <button
              onClick={() => setFilter('all')}
              className="mt-2 px-3 py-1.5 rounded-lg bg-industrial-surface hover:bg-industrial-border text-xs font-medium text-industrial-text transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 rounded-xl bg-industrial-bg/50 border border-dashed border-industrial-border text-center space-y-3">
            <Clock className="w-10 h-10 text-industrial-text-muted mx-auto" />
            <h4 className="text-base font-semibold text-industrial-text">No Historical Runs Recorded</h4>
            <p className="text-xs text-industrial-text-muted max-w-md mx-auto leading-relaxed">
              Diagnostic runs initiated in the Live Diagnosis page will automatically populate here, complete with timestamped sensor parameters, ML probabilities, Knowledge Graph physical rule checks, and 1-click reload.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('diagnosis')}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-industrial-teal hover:bg-industrial-teal-hover text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Go to Live Diagnosis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
