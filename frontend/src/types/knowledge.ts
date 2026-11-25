export interface KnowledgeQuery {
  query: string
  top_k?: number // default 3, ge 1, le 6
}

export interface KnowledgeChunk {
  chunk_id: string | number
  topic: string
  content: string
  source_id: string
  similarity_score: number
}

export interface KnowledgeApiResponse {
  status: string
  query: string
  total_results: number
  results: KnowledgeChunk[]
}
