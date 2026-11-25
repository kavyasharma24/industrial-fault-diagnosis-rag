export type PageId =
  | 'overview'
  | 'diagnosis'
  | 'prediction'
  | 'failure-modes'
  | 'rag-explorer'
  | 'graph-explorer'
  | 'ai-assistant'
  | 'history'

export interface NavItem {
  id: PageId
  title: string
  shortTitle: string
  description: string
  badge?: string
}
