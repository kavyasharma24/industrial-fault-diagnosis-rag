import React, { useState } from 'react'
import {
  Play,
  RotateCcw,
  Sliders,
  AlertCircle,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useDiagnosis } from '../contexts/DiagnosisContext'
import { StatusBadge } from '../components/common/StatusBadge'
import type { PageId } from '../types/navigation'
import type { ProductQuality } from '../types/sensor'

interface DiagnosisPageProps {
  onNavigate?: (page: PageId) => void
}

interface PresetScenario {
  name: string
  description: string
  data: {
    Air_Temperature: number
    Process_Temperature: number
    Rotational_Speed: number
    Torque: number
    Tool_Wear: number
    product_quality: ProductQuality
  }
}

const PRESETS: PresetScenario[] = [
  {
    name: 'Nominal Milling',
    description: 'Standard baseline values within safe operating thresholds',
    data: {
      Air_Temperature: 300.0,
      Process_Temperature: 310.0,
      Rotational_Speed: 1500,
      Torque: 40.0,
      Tool_Wear: 120,
      product_quality: 'M',
    },
  },
  {
    name: 'HDF Condition Trigger',
    description: 'ΔT = 5.0 K (< 8.6 K) & Speed = 1350 rpm (< 1380 rpm)',
    data: {
      Air_Temperature: 300.0,
      Process_Temperature: 305.0,
      Rotational_Speed: 1350,
      Torque: 45.0,
      Tool_Wear: 100,
      product_quality: 'M',
    },
  },
  {
    name: 'PWF High Power Trigger',
    description: 'Speed = 2500 rpm, Torque = 60 Nm → Power ≈ 15.7 kW (> 9 kW)',
    data: {
      Air_Temperature: 298.0,
      Process_Temperature: 308.0,
      Rotational_Speed: 2500,
      Torque: 60.0,
      Tool_Wear: 50,
      product_quality: 'M',
    },
  },
  {
    name: 'TWF Replacement Zone',
    description: 'Tool Wear = 215 min (within [200, 240] documented interval)',
    data: {
      Air_Temperature: 301.0,
      Process_Temperature: 311.0,
      Rotational_Speed: 1520,
      Torque: 42.0,
      Tool_Wear: 215,
      product_quality: 'M',
    },
  },
  {
    name: 'OSF Stress Trigger (Type L)',
    description: 'Torque = 65 Nm, Wear = 190 min → 12,350 (> 11,000 for L)',
    data: {
      Air_Temperature: 300.0,
      Process_Temperature: 310.0,
      Rotational_Speed: 1450,
      Torque: 65.0,
      Tool_Wear: 190,
      product_quality: 'L',
    },
  },
]

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({ onNavigate }) => {
  const {
    inputData,
    setInputData,
    resetToNominal,
    latestDiagnosis,
    isLoading,
    error,
    runDiagnosis,
    clearDiagnosis,
  } = useDiagnosis()

  const [activePreset, setActivePreset] = useState<string>('Nominal Milling')

  const handleApplyPreset = (preset: PresetScenario) => {
    setActivePreset(preset.name)
    setInputData({
      Air_Temperature: preset.data.Air_Temperature,
      Process_Temperature: preset.data.Process_Temperature,
      Rotational_Speed: preset.data.Rotational_Speed,
      Torque: preset.data.Torque,
      Tool_Wear: preset.data.Tool_Wear,
      product_quality: preset.data.product_quality,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await runDiagnosis()
  }

  // Calculate real-time indicators for the engineer before running API
  const tempDiff = Number((inputData.Process_Temperature - inputData.Air_Temperature).toFixed(2))
  const calculatedPower = Math.round((inputData.Torque * inputData.Rotational_Speed * 2 * Math.PI) / 60)
  const overstrainValue = Math.round(inputData.Tool_Wear * inputData.Torque)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-industrial-surface text-industrial-teal">
              Multi-Modal Diagnosis Pipeline
            </span>
            <span className="text-xs text-industrial-text-muted">FastAPI Endpoint: POST /diagnosis/analyze</span>
          </div>
          <h2 className="text-2xl font-bold text-industrial-text">Live Machine Diagnosis</h2>
          <p className="text-sm text-industrial-text-muted mt-1 max-w-2xl">
            Input live machine telemetry to execute synchronous XGBoost failure inference, FAISS dense retrieval, deterministic Knowledge Graph rule evaluation, and Groq agentic synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {latestDiagnosis && (
            <button
              type="button"
              onClick={clearDiagnosis}
              className="px-3 py-2 rounded-xl border border-industrial-border bg-industrial-card hover:bg-industrial-surface text-xs font-medium text-industrial-text transition-colors"
            >
              Clear Output
            </button>
          )}

          <button
            type="button"
            onClick={resetToNominal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-industrial-border bg-industrial-card hover:bg-industrial-surface text-xs font-medium text-industrial-text transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-industrial-teal" />
            <span>Reset Inputs</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Selectors */}
      <div className="p-4 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-industrial-text-muted">
            Benchmark Test Scenarios:
          </span>
          <span className="text-[11px] text-industrial-text-muted">1-Click Telemetry Pre-fill</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const isSelected = activePreset === preset.name
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-industrial-teal text-white shadow-sm font-semibold'
                    : 'bg-industrial-surface/70 text-industrial-text hover:bg-industrial-surface border border-industrial-border/60'
                }`}
                title={preset.description}
              >
                {preset.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Form Left, Real-Time Diagnosis Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sensor Inputs Form (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-border">
              <h3 className="text-base font-semibold text-industrial-text flex items-center gap-2">
                <Sliders className="w-4 h-4 text-industrial-teal" />
                <span>Sensor Telemetry Inputs</span>
              </h3>
              <span className="text-[11px] text-industrial-text-muted font-mono">5 Parameters</span>
            </div>

            {/* Sensor 1: Air Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="air-temp" className="font-semibold text-industrial-text">Air Temperature</label>
                <div className="flex items-center gap-1">
                  <input
                    id="air-temp"
                    type="number"
                    step="0.1"
                    min="290"
                    max="315"
                    value={inputData.Air_Temperature}
                    onChange={(e) => setInputData({ Air_Temperature: parseFloat(e.target.value) || 290 })}
                    className="w-20 px-2 py-0.5 rounded border border-industrial-border bg-industrial-bg font-mono font-bold text-xs text-right text-industrial-teal focus:outline-none focus:ring-1 focus:ring-industrial-teal"
                  />
                  <span className="text-industrial-text-muted font-mono">K</span>
                </div>
              </div>
              <input
                type="range"
                min="290"
                max="315"
                step="0.1"
                value={inputData.Air_Temperature}
                onChange={(e) => setInputData({ Air_Temperature: parseFloat(e.target.value) })}
                className="w-full accent-industrial-teal"
              />
              <div className="flex justify-between text-[10px] text-industrial-text-muted font-mono">
                <span>290.0 K</span>
                <span>315.0 K</span>
              </div>
            </div>

            {/* Sensor 2: Process Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="process-temp" className="font-semibold text-industrial-text">Process Temperature</label>
                <div className="flex items-center gap-1">
                  <input
                    id="process-temp"
                    type="number"
                    step="0.1"
                    min="295"
                    max="325"
                    value={inputData.Process_Temperature}
                    onChange={(e) => setInputData({ Process_Temperature: parseFloat(e.target.value) || 295 })}
                    className="w-20 px-2 py-0.5 rounded border border-industrial-border bg-industrial-bg font-mono font-bold text-xs text-right text-industrial-teal focus:outline-none focus:ring-1 focus:ring-industrial-teal"
                  />
                  <span className="text-industrial-text-muted font-mono">K</span>
                </div>
              </div>
              <input
                type="range"
                min="295"
                max="325"
                step="0.1"
                value={inputData.Process_Temperature}
                onChange={(e) => setInputData({ Process_Temperature: parseFloat(e.target.value) })}
                className="w-full accent-industrial-teal"
              />
              <div className="flex justify-between text-[10px] text-industrial-text-muted font-mono">
                <span>295.0 K</span>
                <span>325.0 K</span>
              </div>
            </div>

            {/* Sensor 3: Rotational Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="rot-speed" className="font-semibold text-industrial-text">Rotational Speed</label>
                <div className="flex items-center gap-1">
                  <input
                    id="rot-speed"
                    type="number"
                    step="1"
                    min="1000"
                    max="3000"
                    value={inputData.Rotational_Speed}
                    onChange={(e) => setInputData({ Rotational_Speed: parseInt(e.target.value, 10) || 1000 })}
                    className="w-20 px-2 py-0.5 rounded border border-industrial-border bg-industrial-bg font-mono font-bold text-xs text-right text-industrial-teal focus:outline-none focus:ring-1 focus:ring-industrial-teal"
                  />
                  <span className="text-industrial-text-muted font-mono">rpm</span>
                </div>
              </div>
              <input
                type="range"
                min="1000"
                max="3000"
                step="5"
                value={inputData.Rotational_Speed}
                onChange={(e) => setInputData({ Rotational_Speed: parseInt(e.target.value, 10) })}
                className="w-full accent-industrial-teal"
              />
              <div className="flex justify-between text-[10px] text-industrial-text-muted font-mono">
                <span>1000 rpm</span>
                <span>3000 rpm</span>
              </div>
            </div>

            {/* Sensor 4: Torque */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="torque" className="font-semibold text-industrial-text">Torque</label>
                <div className="flex items-center gap-1">
                  <input
                    id="torque"
                    type="number"
                    step="0.1"
                    min="10"
                    max="100"
                    value={inputData.Torque}
                    onChange={(e) => setInputData({ Torque: parseFloat(e.target.value) || 10 })}
                    className="w-20 px-2 py-0.5 rounded border border-industrial-border bg-industrial-bg font-mono font-bold text-xs text-right text-industrial-teal focus:outline-none focus:ring-1 focus:ring-industrial-teal"
                  />
                  <span className="text-industrial-text-muted font-mono">Nm</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="0.1"
                value={inputData.Torque}
                onChange={(e) => setInputData({ Torque: parseFloat(e.target.value) })}
                className="w-full accent-industrial-teal"
              />
              <div className="flex justify-between text-[10px] text-industrial-text-muted font-mono">
                <span>10.0 Nm</span>
                <span>100.0 Nm</span>
              </div>
            </div>

            {/* Sensor 5: Tool Wear */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="tool-wear" className="font-semibold text-industrial-text">Tool Wear</label>
                <div className="flex items-center gap-1">
                  <input
                    id="tool-wear"
                    type="number"
                    step="1"
                    min="0"
                    max="300"
                    value={inputData.Tool_Wear}
                    onChange={(e) => setInputData({ Tool_Wear: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-0.5 rounded border border-industrial-border bg-industrial-bg font-mono font-bold text-xs text-right text-industrial-teal focus:outline-none focus:ring-1 focus:ring-industrial-teal"
                  />
                  <span className="text-industrial-text-muted font-mono">min</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="1"
                value={inputData.Tool_Wear}
                onChange={(e) => setInputData({ Tool_Wear: parseInt(e.target.value, 10) })}
                className="w-full accent-industrial-teal"
              />
              <div className="flex justify-between text-[10px] text-industrial-text-muted font-mono">
                <span>0 min</span>
                <span>300 min</span>
              </div>
            </div>

            {/* Product Quality Selection (L, M, H) */}
            <div className="pt-2 border-t border-industrial-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-industrial-text">Product Quality Variant</span>
                <span className="text-[11px] text-industrial-text-muted font-mono">OSF Threshold</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['L', 'M', 'H'] as ProductQuality[]).map((q) => {
                  const isSelected = inputData.product_quality === q
                  const threshold = q === 'L' ? '11k' : q === 'M' ? '12k' : '13k'
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInputData({ product_quality: q })}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isSelected
                          ? 'bg-industrial-teal text-white border-industrial-teal shadow-sm font-semibold'
                          : 'bg-industrial-bg/50 border-industrial-border text-industrial-text hover:bg-industrial-surface'
                      }`}
                    >
                      <div className="text-xs font-bold">Type {q}</div>
                      <div className="text-[10px] opacity-80">{threshold} min·Nm</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Diagnosis Query & Top K */}
            <div className="pt-2 border-t border-industrial-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="diag-query" className="font-semibold text-industrial-text">RAG Diagnosis Query</label>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-industrial-text-muted">Top K:</span>
                  {[1, 3, 5].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setInputData({ top_k: k })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        (inputData.top_k ?? 3) === k
                          ? 'bg-industrial-teal text-white'
                          : 'bg-industrial-surface text-industrial-text hover:bg-industrial-border'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                id="diag-query"
                rows={2}
                value={inputData.query ?? ''}
                onChange={(e) => setInputData({ query: e.target.value })}
                placeholder="What are the possible causes of industrial machine failure?"
                className="w-full p-2.5 rounded-xl border border-industrial-border bg-industrial-bg text-xs text-industrial-text placeholder:text-industrial-text-muted focus:outline-none focus:ring-1 focus:ring-industrial-teal"
              />
            </div>

            {/* Calculated Physical Indicators Preview */}
            <div className="p-3 rounded-xl bg-industrial-surface/40 border border-industrial-border grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-industrial-text-muted block">ΔT (Proc - Air)</span>
                <span className={`font-mono font-bold ${tempDiff < 8.6 ? 'text-amber-800 dark:text-amber-300' : 'text-industrial-teal'}`}>
                  {tempDiff} K
                </span>
              </div>
              <div>
                <span className="text-[10px] text-industrial-text-muted block">Calculated Power</span>
                <span className={`font-mono font-bold ${calculatedPower < 3500 || calculatedPower > 9000 ? 'text-amber-800 dark:text-amber-300' : 'text-industrial-teal'}`}>
                  {calculatedPower} W
                </span>
              </div>
              <div>
                <span className="text-[10px] text-industrial-text-muted block">Overstrain Val</span>
                <span className="font-mono font-bold text-industrial-text">
                  {overstrainValue}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-industrial-teal hover:bg-industrial-teal-hover text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Multi-Modal Diagnosis...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Machine Diagnosis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Diagnosis Results View (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="p-8 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm text-center space-y-4 animate-pulse">
              <div className="p-3.5 rounded-2xl bg-industrial-surface w-fit mx-auto text-industrial-teal">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-industrial-text">Analyzing Machine Telemetry...</h3>
                <p className="text-xs text-industrial-text-muted max-w-sm mx-auto mt-1">
                  FastAPI is orchestrating XGBoost probability, FAISS embeddings, Knowledge Graph traversal, and Groq LLM synthesis.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-4 max-w-md mx-auto text-[11px] text-industrial-text-muted font-medium">
                <div className="p-2 rounded-lg bg-industrial-surface/50 border border-industrial-border/60">
                  1. XGBoost
                </div>
                <div className="p-2 rounded-lg bg-industrial-surface/50 border border-industrial-border/60">
                  2. FAISS
                </div>
                <div className="p-2 rounded-lg bg-industrial-surface/50 border border-industrial-border/60">
                  3. KG Rules
                </div>
                <div className="p-2 rounded-lg bg-industrial-surface/50 border border-industrial-border/60">
                  4. Groq LLM
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && !isLoading && (
            <div className="p-5 rounded-2xl bg-industrial-peach/25 border border-industrial-peach/60 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Backend Diagnosis Request Failed</span>
              </div>
              <p className="text-xs text-industrial-text font-mono bg-industrial-card/60 p-3 rounded-xl border border-industrial-border leading-relaxed">
                {error}
              </p>
              <p className="text-[11px] text-industrial-text-muted">
                Please verify that the FastAPI backend is running on <code className="font-mono text-industrial-teal">http://127.0.0.1:8000</code> and the Groq API key is valid.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!latestDiagnosis && !isLoading && !error && (
            <div className="p-10 rounded-2xl bg-industrial-card border border-dashed border-industrial-border text-center space-y-3">
              <div className="p-4 rounded-full bg-industrial-surface text-industrial-teal w-fit mx-auto">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-industrial-text">Awaiting Live Machine Telemetry</h3>
              <p className="text-xs text-industrial-text-muted max-w-md mx-auto leading-relaxed">
                Select a benchmark preset or adjust sensor sliders on the left, then click <strong>"Execute Machine Diagnosis"</strong> to fetch live backend results.
              </p>
              <div className="pt-2 flex justify-center gap-4 text-xs font-mono text-industrial-text-muted">
                <span>• XGBoost Failure Probability</span>
                <span>• 5 Knowledge Graph Rules</span>
                <span>• Groq AI Synthesis</span>
              </div>
            </div>
          )}

          {/* Actual Diagnosis Output Card */}
          {latestDiagnosis && !isLoading && (
            <div className="space-y-6">
              {/* Primary ML Prediction Card */}
              <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-industrial-border">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-industrial-teal" />
                    <span className="text-sm font-semibold text-industrial-text">ML Failure Prediction (XGBoost)</span>
                  </div>
                  <StatusBadge status={latestDiagnosis.ml_prediction.prediction_label} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-industrial-bg/60 border border-industrial-border">
                    <span className="text-[11px] text-industrial-text-muted block">Normal Operation Probability</span>
                    <span className="text-lg font-bold font-mono text-industrial-teal">
                      {((latestDiagnosis.ml_prediction.probabilities['0'] ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-industrial-bg/60 border border-industrial-border">
                    <span className="text-[11px] text-industrial-text-muted block">Machine Failure Probability</span>
                    <span className="text-lg font-bold font-mono text-industrial-peach">
                      {((latestDiagnosis.ml_prediction.probabilities['1'] ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Knowledge Graph 5 Failure Modes Matrix */}
              <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-industrial-border">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-industrial-teal" />
                    <span className="text-sm font-semibold text-industrial-text">Knowledge Graph Rule Evaluations</span>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('failure-modes')}
                      className="text-xs text-industrial-teal hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>View Full Rules</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {Object.entries(latestDiagnosis.knowledge_graph_evaluation.results).map(([code, evalData]) => (
                    <div
                      key={code}
                      className="p-3 rounded-xl bg-industrial-bg/50 border border-industrial-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-industrial-teal font-mono">{code}</span>
                        <span className="font-medium text-industrial-text">{evalData.failure_mode}</span>
                      </div>
                      <StatusBadge status={evalData.status} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Groq LLM Diagnosis Preview */}
              <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-industrial-teal" />
                    <span className="text-sm font-semibold text-industrial-text">AI Diagnosis Synthesis (Groq API)</span>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('ai-assistant')}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-industrial-surface text-industrial-teal text-xs font-semibold hover:bg-industrial-teal hover:text-white transition-colors"
                    >
                      <span>Full Diagnosis Tab</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-industrial-bg/50 border border-industrial-border text-xs text-industrial-text max-h-40 overflow-hidden relative">
                  <p className="line-clamp-4 leading-relaxed font-sans whitespace-pre-line">
                    {latestDiagnosis.llm_diagnosis}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-industrial-card to-transparent pointer-events-none" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-industrial-text-muted pt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-industrial-teal" />
                    Model: openai/gpt-oss-20b
                  </span>
                  <span>RAG Chunks Retrieved: {latestDiagnosis.rag_retrieved_knowledge.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
