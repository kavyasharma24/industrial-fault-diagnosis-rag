import { apiClient } from './client'
import type { KnowledgeApiResponse } from '../types/knowledge'

export const knowledgeApi = {
  /**
   * Semantic industrial knowledge retrieval: POST /knowledge/search
   * Embeds query with all-MiniLM-L6-v2 and searches FAISS index.
   */
  searchKnowledge: async (query: string, topK: number = 3): Promise<KnowledgeApiResponse> => {
    return apiClient.post<KnowledgeApiResponse>('/knowledge/search', {
      query,
      top_k: topK,
    })
  },
}
