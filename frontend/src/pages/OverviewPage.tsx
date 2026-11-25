import React from 'react'
import { Activity, AlertTriangle, Cpu, CheckCircle2, ArrowRight } from 'lucide-react'
import type { PageId } from '../types/navigation'

interface OverviewPageProps {
  onNavigate: (page: PageId) => void
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-industrial-surface text-industrial-teal">
              System Ready
            </span>
            <span className="text-xs text-industrial-text-muted">Milling Machine #001 Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-industrial-text">Industrial Intelligence Command Center</h2>
          <p className="text-sm text-industrial-text-muted mt-1 max-w-2xl">
            Real-time machine health monitoring integrating XGBoost failure probability, semantic RAG documentation, deterministic Knowledge Graph rules, and Groq agentic diagnosis.
          </p>
        </div>

        <button
          onClick={() => onNavigate('diagnosis')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-industrial-teal hover:bg-industrial-teal-hover text-white text-sm font-medium transition-all shadow-sm"
        >
          <span>Run Live Diagnosis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-industrial-text-muted">Machine Health</span>
            <div className="p-2 rounded-xl bg-industrial-surface text-industrial-teal">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-industrial-text">Nominal</div>
            <p className="text-xs text-industrial-text-muted mt-1">Ready for sensor telemetry input</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-industrial-text-muted">ML Failure Probability</span>
            <div className="p-2 rounded-xl bg-industrial-surface text-industrial-teal">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-industrial-text">-- %</div>
            <p className="text-xs text-industrial-text-muted mt-1">Awaiting live prediction run</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-industrial-text-muted">KG Rules Monitored</span>
            <div className="p-2 rounded-xl bg-industrial-surface text-industrial-teal">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-industrial-text">5 Modes</div>
            <p className="text-xs text-industrial-text-muted mt-1">TWF, HDF, PWF, OSF, RNF</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-industrial-text-muted">Active Rule Conditions</span>
            <div className="p-2 rounded-xl bg-industrial-surface text-industrial-teal">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-industrial-text">0 Met</div>
            <p className="text-xs text-industrial-text-muted mt-1">No threshold breaches detected</p>
          </div>
        </div>
      </div>

      {/* Placeholder Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm">
          <h3 className="text-base font-semibold text-industrial-text mb-2">Live Machine Telemetry Status</h3>
          <p className="text-xs text-industrial-text-muted mb-4">
            Connects to <code className="px-1.5 py-0.5 rounded bg-industrial-surface font-mono">POST /diagnosis/analyze</code> to monitor 5 physical parameters.
          </p>
          <div className="h-64 rounded-xl border border-dashed border-industrial-border flex flex-col items-center justify-center p-6 text-center bg-industrial-bg/50">
            <Activity className="w-8 h-8 text-industrial-text-muted mb-2 animate-pulse" />
            <p className="text-sm font-medium text-industrial-text">Sensor Telemetry Visualizer</p>
            <p className="text-xs text-industrial-text-muted max-w-sm mt-1">
              Displays air and process temperature, rotational speed, torque, and tool wear profiles once analysis is triggered.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm">
          <h3 className="text-base font-semibold text-industrial-text mb-2">Failure Mode Distribution</h3>
          <p className="text-xs text-industrial-text-muted mb-4">
            Rule coverage across 5 documented modes.
          </p>
          <div className="space-y-3">
            {[
              { code: 'TWF', name: 'Tool Wear Failure', tag: 'Interval [200-240]' },
              { code: 'HDF', name: 'Heat Dissipation Failure', tag: 'ΔT < 8.6K & RPM < 1380' },
              { code: 'PWF', name: 'Power Failure', tag: 'Power < 3.5kW or > 9kW' },
              { code: 'OSF', name: 'Overstrain Failure', tag: 'Wear × Torque > Threshold' },
              { code: 'RNF', name: 'Random Failure', tag: 'Probability: 0.1%' },
            ].map((mode) => (
              <div key={mode.code} className="p-3 rounded-xl bg-industrial-surface/50 border border-industrial-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-industrial-teal">{mode.code}</span>
                  <p className="text-xs font-medium text-industrial-text">{mode.name}</p>
                </div>
                <span className="text-[11px] font-mono text-industrial-text-muted bg-industrial-card px-2 py-0.5 rounded border border-industrial-border">
                  {mode.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
