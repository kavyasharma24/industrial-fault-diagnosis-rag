import React from 'react'

export type FailureStatus =
  | 'evidence_condition_met'
  | 'evidence_condition_not_met'
  | 'within_documented_interval'
  | 'outside_documented_interval'
  | 'requires_product_quality'
  | 'probability_only'
  | string

interface StatusBadgeProps {
  status: FailureStatus
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  switch (status) {
    case 'evidence_condition_met':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-industrial-peach/30 text-amber-900 dark:text-amber-200 border border-industrial-peach/50 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          Condition Met
        </span>
      )
    case 'evidence_condition_not_met':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-industrial-surface text-industrial-teal border border-industrial-border ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-industrial-teal" />
          Condition Not Met
        </span>
      )
    case 'within_documented_interval':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-industrial-lavender/40 text-purple-900 dark:text-purple-200 border border-industrial-lavender/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
          Within Interval
        </span>
      )
    case 'outside_documented_interval':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-industrial-surface text-industrial-teal border border-industrial-border ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-industrial-teal" />
          Outside Interval
        </span>
      )
    case 'requires_product_quality':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-industrial-bg text-industrial-text-muted border border-industrial-border ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-industrial-text-muted" />
          Requires Quality (L/M/H)
        </span>
      )
    case 'probability_only':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-industrial-dusty-blue/30 text-slate-800 dark:text-slate-200 border border-industrial-dusty-blue/50 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-industrial-dusty-blue" />
          Probability Only (0.1%)
        </span>
      )
    case 'Machine Failure':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-industrial-peach/40 text-amber-950 dark:text-amber-100 border border-industrial-peach ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
          Machine Failure
        </span>
      )
    case 'No Machine Failure':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-industrial-surface text-industrial-teal border border-industrial-teal/40 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-industrial-teal" />
          No Machine Failure
        </span>
      )
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-industrial-surface text-industrial-text-muted border border-industrial-border ${sizeClasses}`}>
          {status}
        </span>
      )
  }
}
