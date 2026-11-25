import { apiClient } from './client'
import type { SensorData } from '../types/sensor'
import type { PredictionApiResponse } from '../types/prediction'

export const predictionApi = {
  /**
   * Standalone machine failure prediction: POST /predict
   * Evaluates 5 sensor inputs using trained XGBoost model.
   */
  predictFailure: async (sensorData: SensorData): Promise<PredictionApiResponse> => {
    return apiClient.post<PredictionApiResponse>('/predict', {
      Air_Temperature: sensorData.Air_Temperature,
      Process_Temperature: sensorData.Process_Temperature,
      Rotational_Speed: sensorData.Rotational_Speed,
      Torque: sensorData.Torque,
      Tool_Wear: sensorData.Tool_Wear,
    })
  },
}
