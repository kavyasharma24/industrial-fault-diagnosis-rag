import type { SensorData, ProductQuality } from './sensor'
import type { MLPredictionResult } from './prediction'
import type { KnowledgeChunk } from './knowledge'
import type { KGEvaluation, KGDetailsRecord } from './kg'

export interface DiagnosisInput {
  Air_Temperature: number
  Process_Temperature: number
  Rotational_Speed: number
  Torque: number
  Tool_Wear: number
  query?: string
  top_k?: number
  product_quality?: ProductQuality | null
}

export interface DiagnosisResponse {
  status: string
  sensor_data: SensorData
  ml_prediction: MLPredictionResult
  rag_retrieved_knowledge: KnowledgeChunk[]
  knowledge_graph_evaluation: KGEvaluation
  knowledge_graph_details: Record<string, KGDetailsRecord>
  llm_diagnosis: string
}
