import React, { useState } from 'react'
import {
  Search,
  Database,
  FileText,
  Loader2,
  AlertCircle,
  Tag,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { knowledgeApi } from '../api/knowledgeApi'
import type { KnowledgeChunk } from '../types/knowledge'

const SUGGESTED_QUERIES = [
  'What causes heat dissipation failure during milling operations?',
  'What is the tool wear replacement interval and criteria?',
  'How is process power calculated and what are failure thresholds?',
  'What are the product-specific overstrain thresholds for L, M, and H?',
  'Why is random failure independent of operating parameters?',
]

export const RagExplorerPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<KnowledgeChunk[] | null>(null)
  const [executedQuery, setExecutedQuery] = useState<string | null>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await knowledgeApi.searchKnowledge(trimmed, topK)
      setResults(response.results)
      setExecutedQuery(response.query)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to retrieve knowledge chunks. Please ensure FastAPI is running.'
      setError(msg)
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSuggested = (suggested: string) => {
    setQuery(suggested)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-industrial-surface text-industrial-teal">
            FAISS Dense Vector Index
          </span>
          <span className="text-xs text-industrial-text-muted">Target Endpoint: POST /knowledge/search</span>
        </div>
        <h2 className="text-2xl font-bold text-industrial-text">RAG Knowledge Explorer</h2>
        <p className="text-sm text-industrial-text-muted mt-1 max-w-2xl">
          Semantic neural search across chunked technical documentation using sentence-transformers (<code className="font-mono text-xs text-industrial-teal">all-MiniLM-L6-v2</code>) and FAISS vector retrieval.
        </p>
      </div>

      {/* Search Input Bar Form */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-industrial-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. What causes heat dissipation failure during milling operations?"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-industrial-border bg-industrial-bg text-sm text-industrial-text placeholder:text-industrial-text-muted focus:outline-none focus:ring-1 focus:ring-industrial-teal"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-2.5 rounded-xl bg-industrial-teal hover:bg-industrial-teal-hover text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Knowledge</span>
                </>
              )}
            </button>
          </div>

          {/* Top-K Selector & Metadata Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-industrial-text-muted">
            <div className="flex items-center gap-2">
              <span className="font-medium text-industrial-text">Result Count (top_k):</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTopK(k)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                      topK === k
                        ? 'bg-industrial-teal text-white shadow-sm'
                        : 'bg-industrial-surface text-industrial-text hover:bg-industrial-border'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono">
                <Database className="w-3.5 h-3.5 text-industrial-teal" />
                Index: industrial_faiss.index (384-d)
              </span>
              <span>•</span>
              <span className="font-mono">Metric: Cosine Similarity</span>
            </div>
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="pt-2 border-t border-industrial-border space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-industrial-text-muted">
            <Sparkles className="w-3.5 h-3.5 text-industrial-teal" />
            <span className="font-medium text-industrial-text">Suggested Queries:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggested(sq)}
                className="px-3 py-1 rounded-xl bg-industrial-surface/70 hover:bg-industrial-surface text-industrial-text text-xs border border-industrial-border/60 transition-colors text-left"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-industrial-peach/25 border border-industrial-peach/50 text-xs text-amber-900 dark:text-amber-200 font-mono flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-10 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm text-center space-y-3 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-industrial-teal mx-auto" />
          <h4 className="text-base font-semibold text-industrial-text">Searching FAISS Knowledge Base...</h4>
          <p className="text-xs text-industrial-text-muted max-w-sm mx-auto">
            Encoding query via sentence-transformers and retrieving top {topK} matching chunks.
          </p>
        </div>
      )}

      {/* Results View */}
      {!isLoading && results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-industrial-teal" />
              <span className="text-sm font-semibold text-industrial-text">
                Retrieved {results.length} Knowledge {results.length === 1 ? 'Chunk' : 'Chunks'}
              </span>
              {executedQuery && (
                <span className="text-xs text-industrial-text-muted hidden sm:inline">
                  for &ldquo;{executedQuery}&rdquo;
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-industrial-text-muted">
              Source: POST /knowledge/search
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {results.map((chunk, idx) => {
              const similarityPercent = (chunk.similarity_score * 100).toFixed(1)
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-industrial-border">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-industrial-teal bg-industrial-surface px-2.5 py-1 rounded-lg border border-industrial-border">
                        {String(chunk.chunk_id)}
                      </span>
                      <h4 className="text-sm font-bold text-industrial-text">{chunk.topic}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] font-mono text-industrial-text-muted">
                        <Tag className="w-3 h-3 text-industrial-teal" />
                        {chunk.source_id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-industrial-teal bg-industrial-surface px-2.5 py-0.5 rounded-full border border-industrial-border">
                        Score: {similarityPercent}% ({chunk.similarity_score.toFixed(4)})
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-industrial-text leading-relaxed whitespace-pre-line font-sans">
                    {chunk.content}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !results && !error && (
        <div className="p-12 rounded-2xl bg-industrial-card border border-dashed border-industrial-border text-center space-y-2">
          <FileText className="w-10 h-10 text-industrial-text-muted mx-auto" />
          <h3 className="text-base font-semibold text-industrial-text">Awaiting Semantic Search Query</h3>
          <p className="text-xs text-industrial-text-muted max-w-md mx-auto">
            Type an industrial machinery question above or pick one of the suggested queries, then click <strong>"Search Knowledge"</strong> to query the real FAISS vector store.
          </p>
        </div>
      )}
    </div>
  )
}
