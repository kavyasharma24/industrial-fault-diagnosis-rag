import React, { useState } from 'react'
import {
  Cpu,
  BarChart2,
  Play,
  Info,
  Loader2,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useDiagnosis } from '../contexts/DiagnosisContext'
import { predictionApi } from '../api/predictionApi'
import { StatusBadge } from '../components/common/StatusBadge'
import type { PredictionApiResponse, MLPredictionResult } from '../types/prediction'
import type { SensorData } from '../types/sensor'

export const PredictionPage: React.FC = () => {
  const { inputData, latestDiagnosis } = useDiagnosis()

  const [standaloneResult, setStandaloneResult] = useState<PredictionApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastEvaluatedAt, setLastEvaluatedAt] = useState<string | null>(null)

  // Use standalone result if run on this page; otherwise use latestDiagnosis if available
  const activePrediction: MLPredictionResult | null =
    standaloneResult?.prediction_result ?? latestDiagnosis?.ml_prediction ?? null

  const activeSensorData: SensorData =
    standaloneResult?.input_data ?? latestDiagnosis?.sensor_data ?? {
      Air_Temperature: inputData.Air_Temperature,
      Process_Temperature: inputData.Process_Temperature,
      Rotational_Speed: inputData.Rotational_Speed,
      Torque: inputData.Torque,
      Tool_Wear: inputData.Tool_Wear,
    }

  const handleRunPredict = async () => {
    // Prevent duplicate submissions while request is in progress
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Await real prediction API call with a minimum visible duration for clear user feedback
      const [res] = await Promise.all([
        predictionApi.predictFailure({
          Air_Temperature: inputData.Air_Temperature,
          Process_Temperature: inputData.Process_Temperature,
          Rotational_Speed: inputData.Rotational_Speed,
          Torque: inputData.Torque,
          Tool_Wear: inputData.Tool_Wear,
        }),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ])

      // Store real response in React state
      setStandaloneResult(res)
      setLastEvaluatedAt(new Date().toLocaleTimeString())
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to run ML prediction endpoint. Please ensure FastAPI is running.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const prob0 = activePrediction ? (activePrediction.probabilities['0'] ?? 0) * 100 : 0
  const prob1 = activePrediction ? (activePrediction.probabilities['1'] ?? 0) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-industrial-surface text-industrial-teal">
              Supervised Machine Learning
            </span>
            <span className="text-xs text-industrial-text-muted">Target Endpoint: POST /predict</span>
          </div>
          <h2 className="text-2xl font-bold text-industrial-text">ML Prediction Analysis</h2>
          <p className="text-sm text-industrial-text-muted mt-1 max-w-2xl">
            Binary failure classification evaluating the 5-dimensional machine telemetry vector against the trained XGBoost model (<code className="font-mono text-xs text-industrial-teal">xgboost_failure_model.json</code>).
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunPredict}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-industrial-teal hover:bg-industrial-teal-hover text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating XGBoost...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Evaluate POST /predict</span>
            </>
          )}
        </button>
      </div>

      {/* Engineering Disclaimers Banner */}
      <div className="p-4 rounded-xl bg-industrial-surface/50 border border-industrial-border flex items-start gap-3">
        <Info className="w-5 h-5 text-industrial-teal shrink-0 mt-0.5" />
        <div className="text-xs text-industrial-text space-y-1">
          <strong className="font-semibold text-industrial-text">Statistical Model Boundary:</strong>
          <p className="text-industrial-text-muted leading-relaxed">
            The XGBoost failure probability is a supervised statistical inference trained on historical AI4I 2020 operational records. A high failure probability indicates operational risk patterns and must not be conflated with confirmed physical breakage or sudden mechanical failure.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-industrial-peach/25 border border-industrial-peach/50 text-xs text-amber-900 dark:text-amber-200 font-mono flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Prediction Results + Sensor Telemetry Used */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Probabilities and Prediction (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-border">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-industrial-teal" />
                <span className="text-sm font-semibold text-industrial-text">XGBoost Classification Output</span>
              </div>
              <div className="flex items-center gap-2">
                {isLoading && (
                  <span className="flex items-center gap-1.5 text-xs text-industrial-text-muted font-medium bg-industrial-surface px-2.5 py-1 rounded-full animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin text-industrial-teal" />
                    Inferencing...
                  </span>
                )}
                {activePrediction && !isLoading && (
                  <StatusBadge status={activePrediction.prediction_label} />
                )}
              </div>
            </div>

            {/* Success update feedback notification */}
            {lastEvaluatedAt && !isLoading && (
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-industrial-surface/60 border border-industrial-border">
                <div className="flex items-center gap-2 text-industrial-teal font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Prediction evaluated via <code className="font-mono font-bold text-xs">POST /predict</code>
                  </span>
                </div>
                <span className="font-mono text-industrial-text-muted text-[11px]">
                  Updated: {lastEvaluatedAt}
                </span>
              </div>
            )}

            {isLoading ? (
              <div className="p-10 rounded-xl bg-industrial-bg/50 border border-dashed border-industrial-border text-center space-y-3 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-industrial-teal mx-auto" />
                <h4 className="text-sm font-semibold text-industrial-text">Running XGBoost Inference...</h4>
                <p className="text-xs text-industrial-text-muted max-w-sm mx-auto">
                  Evaluating 5-parameter telemetry vector via <code className="font-mono text-industrial-teal">POST /predict</code>.
                </p>
              </div>
            ) : activePrediction ? (
              <div className="space-y-6">
                {/* Visual Probability Gauges */}
                <div className="space-y-4">
                  {/* Nominal Operation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-industrial-text">Class 0: Nominal Operation</span>
                      <span className="font-mono font-bold text-industrial-teal text-sm">
                        {prob0.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full h-4 rounded-full bg-industrial-bg overflow-hidden border border-industrial-border p-0.5">
                      <div
                        className="h-full bg-industrial-teal rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${prob0}%` }}
                      />
                    </div>
                  </div>

                  {/* Machine Failure */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-industrial-text">Class 1: Machine Failure</span>
                      <span className={`font-mono font-bold text-sm ${prob1 > 50 ? 'text-amber-800 dark:text-amber-300' : 'text-industrial-text-muted'}`}>
                        {prob1.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full h-4 rounded-full bg-industrial-bg overflow-hidden border border-industrial-border p-0.5">
                      <div
                        className="h-full bg-industrial-peach rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${prob1}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-industrial-bg/60 border border-industrial-border">
                    <span className="text-[11px] text-industrial-text-muted block">Model Decision</span>
                    <span className="text-base font-bold text-industrial-text mt-1 block">
                      {activePrediction.prediction === 1 ? 'Machine Failure (1)' : 'Nominal (0)'}
                    </span>
                    <span className="text-[10px] text-industrial-text-muted mt-0.5 block">
                      Threshold = 0.50 cutoff
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-industrial-bg/60 border border-industrial-border">
                    <span className="text-[11px] text-industrial-text-muted block">Failure Confidence</span>
                    <span className="text-base font-bold text-industrial-text mt-1 block">
                      {prob1 > 50 ? `${prob1.toFixed(1)}% High Risk` : `${prob0.toFixed(1)}% Safe`}
                    </span>
                    <span className="text-[10px] text-industrial-text-muted mt-0.5 block">
                      Supervised probabilistic posterior
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-industrial-bg/50 border border-dashed border-industrial-border text-center space-y-2">
                <BarChart2 className="w-10 h-10 text-industrial-text-muted mx-auto" />
                <h4 className="text-sm font-semibold text-industrial-text">Awaiting Model Evaluation</h4>
                <p className="text-xs text-industrial-text-muted max-w-sm mx-auto">
                  Click <strong>"Evaluate POST /predict"</strong> above to test the standalone XGBoost inference endpoint with the active sensor parameters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sensor Inputs Fed into XGBoost (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-border">
              <h3 className="text-base font-semibold text-industrial-text flex items-center gap-2">
                <Sliders className="w-4 h-4 text-industrial-teal" />
                <span>Feature Vector Evaluated</span>
              </h3>
              <span className="text-[11px] text-industrial-text-muted font-mono">5 Features</span>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Air Temperature', val: activeSensorData.Air_Temperature, unit: 'K', min: '295-305 K nominal' },
                { label: 'Process Temperature', val: activeSensorData.Process_Temperature, unit: 'K', min: '305-315 K nominal' },
                { label: 'Rotational Speed', val: activeSensorData.Rotational_Speed, unit: 'rpm', min: '1400-1600 rpm nominal' },
                { label: 'Torque', val: activeSensorData.Torque, unit: 'Nm', min: '35-45 Nm nominal' },
                { label: 'Tool Wear', val: activeSensorData.Tool_Wear, unit: 'min', min: '0-200 min nominal' },
              ].map((feat) => (
                <div
                  key={feat.label}
                  className="p-3 rounded-xl bg-industrial-bg/50 border border-industrial-border flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-industrial-text block">{feat.label}</span>
                    <span className="text-[10px] text-industrial-text-muted">{feat.min}</span>
                  </div>
                  <span className="font-mono font-bold text-industrial-teal text-sm bg-industrial-surface px-2.5 py-1 rounded-lg border border-industrial-border">
                    {feat.val} {feat.unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-industrial-text-muted leading-relaxed">
              Features are aligned exactly with <code className="font-mono text-industrial-teal">model_info.joblib</code> feature ordering before model execution.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
