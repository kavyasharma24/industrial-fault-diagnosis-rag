import React from 'react'
import {
  Wrench,
  Thermometer,
  Zap,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  Info,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react'
import { useDiagnosis } from '../contexts/DiagnosisContext'
import { StatusBadge } from '../components/common/StatusBadge'
import type { PageId } from '../types/navigation'

interface FailureModesPageProps {
  onNavigate?: (page: PageId) => void
}

const FAILURE_MODE_CONFIG = [
  {
    code: 'TWF',
    name: 'Tool Wear Failure',
    icon: Wrench,
    category: 'Mechanical Wear Interval',
    formula: '200 min <= Tool Wear <= 240 min',
    officialDescription: 'Failure associated with cumulative tool wear reaching the random replacement interval.',
  },
  {
    code: 'HDF',
    name: 'Heat Dissipation Failure',
    icon: Thermometer,
    category: 'Thermal Dynamics Rule',
    formula: '(Process Temp - Air Temp) < 8.6 K AND Rotational Speed < 1380 rpm',
    officialDescription: 'Heat dissipation is insufficient if both temperature difference and rotational speed are below documented thresholds.',
  },
  {
    code: 'PWF',
    name: 'Power Failure',
    icon: Zap,
    category: 'Electrical & Power Threshold',
    formula: 'Process Power < 3500 W OR Process Power > 9000 W',
    officialDescription: 'Process power calculated as Torque × Rotational Speed × 2π / 60 outside documented 3.5 kW - 9.0 kW limits.',
  },
  {
    code: 'OSF',
    name: 'Overstrain Failure',
    icon: ShieldAlert,
    category: 'Cutting Stress Threshold',
    formula: 'Tool Wear × Torque > Threshold (L: 11,000 | M: 12,000 | H: 13,000 min·Nm)',
    officialDescription: 'Overstrain failure condition when cutting load multiplied by wear exceeds product-specific variant limit.',
  },
  {
    code: 'RNF',
    name: 'Random Failure',
    icon: HelpCircle,
    category: 'Stochastic Process',
    formula: 'Documented Probability = 0.001 (0.1% per process)',
    officialDescription: 'Independent of process operating parameters; cannot be predicted from instant sensor telemetry.',
  },
]

export const FailureModesPage: React.FC<FailureModesPageProps> = ({ onNavigate }) => {
  const { latestDiagnosis } = useDiagnosis()

  const kgEval = latestDiagnosis?.knowledge_graph_evaluation
  const kgDetails = latestDiagnosis?.knowledge_graph_details

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-industrial-surface text-industrial-teal">
              Deterministic Knowledge Graph
            </span>
            <span className="text-xs text-industrial-text-muted">NetworkX Multigraph • 5 Documented Modes</span>
          </div>
          <h2 className="text-2xl font-bold text-industrial-text">Failure Mode Analysis</h2>
          <p className="text-sm text-industrial-text-muted mt-1 max-w-2xl">
            Formal rule-based evaluation and relational ontology mapping symptoms, evidence criteria, and investigation remedies for all 5 documented failure modes.
          </p>
        </div>

        {!latestDiagnosis && onNavigate && (
          <button
            onClick={() => onNavigate('diagnosis')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-industrial-teal hover:bg-industrial-teal-hover text-white text-sm font-semibold transition-all shadow-sm"
          >
            <span>Run Diagnosis to Evaluate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Engineering Guardrail Warning */}
      <div className="p-4 rounded-xl bg-industrial-surface/50 border border-industrial-border flex items-start gap-3">
        <Info className="w-5 h-5 text-industrial-teal shrink-0 mt-0.5" />
        <div className="text-xs text-industrial-text space-y-1">
          <strong className="font-semibold text-industrial-text">Engineering Rule & Disclaimer:</strong>
          <p className="text-industrial-text-muted leading-relaxed">
            A Knowledge Graph rule match represents an <strong>evidence-based condition indicator</strong>, never an independently confirmed physical machine breakdown. Investigation remedies are project-generated diagnostic suggestions with validation status: <code className="font-mono text-industrial-teal">Not independently validated</code>.
          </p>
        </div>
      </div>

      {/* 5 Failure Mode Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {FAILURE_MODE_CONFIG.map((config) => {
          const Icon = config.icon
          const evalResult = kgEval?.results[config.code]
          const details = kgDetails?.[config.code]

          return (
            <div
              key={config.code}
              className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-industrial-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-industrial-surface text-industrial-teal shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-industrial-teal text-sm">{config.code}</span>
                        <h3 className="text-base font-bold text-industrial-text">{config.name}</h3>
                      </div>
                      <span className="text-[11px] text-industrial-text-muted">{config.category}</span>
                    </div>
                  </div>

                  {evalResult ? (
                    <StatusBadge status={evalResult.status} />
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-industrial-bg text-industrial-text-muted border border-industrial-border font-medium">
                      Awaiting Telemetry
                    </span>
                  )}
                </div>

                {/* Mathematical Condition Formula */}
                <div className="p-3.5 rounded-xl bg-industrial-bg/60 border border-industrial-border space-y-1 font-mono text-xs">
                  <div className="text-[10px] uppercase font-sans font-bold text-industrial-text-muted">
                    Formal Mathematical Condition:
                  </div>
                  <div className="text-industrial-text font-medium leading-relaxed">
                    {config.formula}
                  </div>
                </div>

                {/* Real Live Calculation Values from Backend */}
                {evalResult && (
                  <div className="p-3.5 rounded-xl bg-industrial-surface/30 border border-industrial-border space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-industrial-teal flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Live Evaluated Values from Backend:</span>
                    </div>

                    {/* TWF Specifics */}
                    {'observed_tool_wear' in evalResult && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-industrial-text-muted block text-[11px]">Observed Tool Wear:</span>
                          <span className="font-mono font-bold text-industrial-text">{evalResult.observed_tool_wear} min</span>
                        </div>
                        <div>
                          <span className="text-industrial-text-muted block text-[11px]">Documented Interval:</span>
                          <span className="font-mono font-bold text-industrial-text">[200, 240] min</span>
                        </div>
                      </div>
                    )}

                    {/* HDF Specifics */}
                    {'temperature_difference' in evalResult && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-industrial-text-muted block text-[11px]">Temp Difference:</span>
                          <span className="font-mono font-bold text-industrial-text">
                            {evalResult.temperature_difference.toFixed(2)} K (threshold: &lt; 8.6 K)
                          </span>
                        </div>
                        <div>
                          <span className="text-industrial-text-muted block text-[11px]">Rotational Speed:</span>
                          <span className="font-mono font-bold text-industrial-text">
                            {evalResult.rotational_speed} rpm (threshold: &lt; 1380 rpm)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* PWF Specifics */}
                    {'calculated_power_watts' in evalResult && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-industrial-text-muted block text-[11px]">Calculated Power:</span>
                          <span className="font-mono font-bold text-industrial-text">
                            {Math.round(evalResult.calculated_power_watts)} W
                          </span>
                        </div>
                        <div>
                          <span className="text-industrial-text-muted block text-[11px]">Allowable Bounds:</span>
                          <span className="font-mono font-bold text-industrial-text">3,500 W – 9,000 W</span>
                        </div>
                      </div>
                    )}

                    {/* OSF Specifics */}
                    {'tool_wear_times_torque' in evalResult && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-industrial-text-muted block text-[11px]">Tool Wear × Torque:</span>
                          <span className="font-mono font-bold text-industrial-text">
                            {Math.round(evalResult.tool_wear_times_torque)} min·Nm
                          </span>
                        </div>
                        <div>
                          <span className="text-industrial-text-muted block text-[11px]">Quality Threshold:</span>
                          <span className="font-mono font-bold text-industrial-text">
                            {evalResult.product_quality ? `Type ${evalResult.product_quality} (${evalResult.applicable_threshold} min·Nm)` : 'Unspecified'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* RNF Specifics */}
                    {'documented_probability' in evalResult && (
                      <div>
                        <span className="text-industrial-text-muted block text-[11px]">Independent Probability:</span>
                        <span className="font-mono font-bold text-industrial-text">
                          0.1% ({evalResult.documented_probability})
                        </span>
                      </div>
                    )}

                    {'note' in evalResult && evalResult.note && (
                      <p className="text-[11px] text-industrial-text-muted pt-1 border-t border-industrial-border/60 italic">
                        "{evalResult.note}"
                      </p>
                    )}
                  </div>
                )}

                {/* Knowledge Graph Symptoms, Evidence and Remedies */}
                {details && (
                  <div className="space-y-3 pt-1">
                    {/* Symptoms */}
                    {details.symptoms.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-industrial-text-muted block">
                          Associated Symptoms:
                        </span>
                        <div className="space-y-1">
                          {details.symptoms.map((sym) => (
                            <div key={sym.node_id} className="text-xs text-industrial-text flex items-start gap-1.5">
                              <span className="font-mono text-industrial-teal text-[10px] font-bold shrink-0 mt-0.5">[{sym.node_id}]</span>
                              <span>{sym.name}: {sym.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remedies */}
                    {details.remedies.length > 0 && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-industrial-peach/15 border border-industrial-peach/40">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-industrial-text">Suggested Investigation Remedy:</span>
                          <span className="text-[10px] font-mono text-amber-900 dark:text-amber-200 font-semibold bg-industrial-peach/30 px-2 py-0.5 rounded">
                            Unvalidated Suggestion
                          </span>
                        </div>
                        {details.remedies.map((rem) => (
                          <div key={rem.node_id} className="text-xs text-industrial-text">
                            <strong className="text-industrial-text block">{rem.name}</strong>
                            <p className="text-[11px] text-industrial-text-muted mt-0.5">{rem.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Provenance */}
              <div className="pt-3 border-t border-industrial-border flex items-center justify-between text-[11px] text-industrial-text-muted">
                <span className="flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-industrial-teal" />
                  Dataset: AI4I 2020 Documentation
                </span>
                <span className="font-mono">Evidence: EVID_{config.code}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
