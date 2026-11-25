import type { SensorData } from './sensor'

export interface MLPredictionResult {
  prediction: number // 0 or 1
  prediction_label: 'Machine Failure' | 'No Machine Failure' | string
  probabilities: Record<string, number> // e.g. { "0": 0.98, "1": 0.02 }
}

export interface PredictionApiResponse {
  status: string
  input_data: SensorData
  prediction_result: MLPredictionResult
}
