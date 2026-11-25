import { apiClient } from './client'
import type { DiagnosisInput, DiagnosisResponse } from '../types/diagnosis'

export const diagnosisApi = {
  /**
   * Combined industrial machine diagnosis: POST /diagnosis/analyze
   * Orchestrates XGBoost + FAISS RAG + Knowledge Graph rules + Groq agentic LLM.
   */
  analyzeMachine: async (input: DiagnosisInput): Promise<DiagnosisResponse> => {
    return apiClient.post<DiagnosisResponse>('/diagnosis/analyze', {
      Air_Temperature: input.Air_Temperature,
      Process_Temperature: input.Process_Temperature,
      Rotational_Speed: input.Rotational_Speed,
      Torque: input.Torque,
      Tool_Wear: input.Tool_Wear,
      query: input.query || 'What are the possible causes of industrial machine failure?',
      top_k: input.top_k ?? 3,
      product_quality: input.product_quality ?? null,
    }, {
      timeoutMs: 35000, // Allow up to 35s for Groq LLM inference
    })
  },
}
