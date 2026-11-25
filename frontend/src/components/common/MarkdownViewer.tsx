import React from 'react'

interface MarkdownViewerProps {
  content: string
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  // Simple, clean, safe Markdown renderer for structured AI diagnosis
  const lines = content.split('\n')

  const renderFormattedText = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-industrial-text">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-industrial-surface font-mono text-xs text-industrial-teal">
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  const elements: React.ReactNode[] = []
  let inList = false
  let listItems: React.ReactNode[] = []

  const flushList = (key: number) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1.5 my-3 text-sm text-industrial-text">
          {listItems}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Empty line
    if (!trimmed) {
      flushList(index)
      return
    }

    // Heading 1: # Title
    if (trimmed.startsWith('# ')) {
      flushList(index)
      elements.push(
        <h1 key={index} className="text-xl md:text-2xl font-bold text-industrial-text mt-6 mb-3 pb-2 border-b border-industrial-border">
          {trimmed.slice(2)}
        </h1>
      )
      return
    }

    // Heading 2: ## Section
    if (trimmed.startsWith('## ')) {
      flushList(index)
      elements.push(
        <h2 key={index} className="text-lg md:text-xl font-bold text-industrial-text mt-6 mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-industrial-teal inline-block" />
          {trimmed.slice(3)}
        </h2>
      )
      return
    }

    // Heading 3: ### Subsection
    if (trimmed.startsWith('### ')) {
      flushList(index)
      elements.push(
        <h3 key={index} className="text-base font-semibold text-industrial-text mt-4 mb-2 text-industrial-teal">
          {trimmed.slice(4)}
        </h3>
      )
      return
    }

    // Heading 4: #### Sub-subsection
    if (trimmed.startsWith('#### ')) {
      flushList(index)
      elements.push(
        <h4 key={index} className="text-sm font-semibold uppercase tracking-wider text-industrial-text-muted mt-3 mb-1.5">
          {trimmed.slice(5)}
        </h4>
      )
      return
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList(index)
      elements.push(
        <blockquote key={index} className="p-3 my-3 rounded-xl bg-industrial-surface/50 border-l-4 border-industrial-teal text-sm text-industrial-text italic">
          {renderFormattedText(trimmed.slice(2))}
        </blockquote>
      )
      return
    }

    // List item: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true
      listItems.push(
        <li key={index} className="leading-relaxed">
          {renderFormattedText(trimmed.slice(2))}
        </li>
      )
      return
    }

    // Numbered item: 1. , 2. 
    if (/^\d+\.\s/.test(trimmed)) {
      flushList(index)
      const text = trimmed.replace(/^\d+\.\s/, '')
      elements.push(
        <div key={index} className="flex gap-2 text-sm text-industrial-text my-1.5 leading-relaxed">
          <span className="font-bold text-industrial-teal shrink-0">{trimmed.match(/^\d+\./)?.[0]}</span>
          <div>{renderFormattedText(text)}</div>
        </div>
      )
      return
    }

    // Regular paragraph
    flushList(index)
    elements.push(
      <p key={index} className="text-sm text-industrial-text leading-relaxed my-2">
        {renderFormattedText(line)}
      </p>
    )
  })

  flushList(lines.length)

  return (
    <div className="prose prose-industrial max-w-none space-y-1">
      {elements}
    </div>
  )
}
