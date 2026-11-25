export interface TWFEval {
  failure_mode: string
  evidence_node: string
  observed_tool_wear: number
  documented_interval: [number, number]
  status: 'within_documented_interval' | 'outside_documented_interval'
  note: string
}

export interface HDFEval {
  failure_mode: string
  evidence_node: string
  temperature_difference: number
  temperature_threshold: number
  rotational_speed: number
  speed_threshold: number
  temperature_condition_met: boolean
  speed_condition_met: boolean
  status: 'evidence_condition_met' | 'evidence_condition_not_met'
}

export interface PWFEval {
  failure_mode: string
  evidence_node: string
  calculated_power_watts: number
  lower_threshold: number
  upper_threshold: number
  status: 'evidence_condition_met' | 'evidence_condition_not_met'
}

export interface OSFEval {
  failure_mode: string
  evidence_node: string
  tool_wear_times_torque: number
  product_quality: string | null
  applicable_threshold: number | null
  status: 'evidence_condition_met' | 'evidence_condition_not_met' | 'requires_product_quality'
}

export interface RNFEval {
  failure_mode: string
  evidence_node: string
  documented_probability: number
  probability_percentage: number
  status: 'probability_only'
  note: string
}

export interface KGEvaluationResults {
  TWF: TWFEval
  HDF: HDFEval
  PWF: PWFEval
  OSF: OSFEval
  RNF: RNFEval
  [key: string]: TWFEval | HDFEval | PWFEval | OSFEval | RNFEval
}

export interface KGEvaluation {
  status: string
  evaluation_type: string
  results: KGEvaluationResults
}

export interface KGNodeDetail {
  node_id: string
  node_type?: string
  name?: string
  description?: string
  source_id?: string
  unit?: string
  condition?: string
  relationship_provenance?: string
  provenance?: string
  validation_status?: string
  [key: string]: unknown
}

export interface KGDetailsRecord {
  failure_mode: KGNodeDetail
  symptoms: KGNodeDetail[]
  evidence: KGNodeDetail[]
  remedies: KGNodeDetail[]
}
