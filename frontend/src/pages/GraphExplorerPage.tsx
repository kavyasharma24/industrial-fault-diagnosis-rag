import React, { useState, useRef, useMemo } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Layers,
  ArrowRight,
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
} from 'lucide-react'
import {
  KG_NODES,
  KG_EDGES,
  NODE_TYPE_COLORS,
  type KGNode,
  type KGNodeType,
} from '../data/knowledgeGraphData'
import { useDiagnosis } from '../contexts/DiagnosisContext'
import { useTheme } from '../contexts/ThemeContext'
import { StatusBadge } from '../components/common/StatusBadge'

// Canonical layout coordinates for the authentic 27 nodes
const DEFAULT_NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Machine
  MACHINE_001: { x: 500, y: 70 },

  // Sensors (Curved tier below machine)
  SENSOR_001: { x: 260, y: 175 },
  SENSOR_002: { x: 380, y: 175 },
  SENSOR_003: { x: 500, y: 175 },
  SENSOR_004: { x: 620, y: 175 },
  SENSOR_005: { x: 740, y: 175 },

  // Symptoms (Pointing into failure modes)
  SYM_001: { x: 100, y: 265 },
  SYM_002: { x: 280, y: 265 },
  SYM_003: { x: 370, y: 265 },
  SYM_004: { x: 500, y: 265 },
  SYM_005: { x: 670, y: 265 },
  SYM_006: { x: 860, y: 265 },

  // Failure Modes (Central evaluation hubs)
  FM_TWF: { x: 150, y: 380 },
  FM_HDF: { x: 325, y: 380 },
  FM_PWF: { x: 500, y: 380 },
  FM_OSF: { x: 675, y: 380 },
  FM_RNF: { x: 850, y: 380 },

  // Evidence Nodes (Condition rules)
  EVID_TWF: { x: 110, y: 505 },
  EVID_HDF: { x: 285, y: 505 },
  EVID_PWF: { x: 460, y: 505 },
  EVID_OSF: { x: 635, y: 505 },
  EVID_RNF: { x: 810, y: 505 },

  // Remedies (Investigation suggestions)
  REM_001: { x: 190, y: 615 },
  REM_002: { x: 365, y: 615 },
  REM_003: { x: 540, y: 615 },
  REM_004: { x: 715, y: 615 },
  REM_005: { x: 890, y: 615 },
}

const NODE_RADII: Record<KGNodeType, number> = {
  Machine: 26,
  Sensor: 20,
  Failure_Mode: 23,
  Symptom: 18,
  Evidence: 18,
  Remedy: 18,
}

export const GraphExplorerPage: React.FC = () => {
  const { latestDiagnosis } = useDiagnosis()
  const { theme } = useTheme()

  // Node Positions state (supports dragging)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    DEFAULT_NODE_POSITIONS
  )

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Interaction tracking state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<KGNodeType | 'ALL'>('ALL')

  // Dragging state
  const [isPanning, setIsPanning] = useState(false)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
  })

  const svgRef = useRef<SVGSVGElement | null>(null)

  // Nodes map for fast property lookups
  const nodesMap = useMemo(() => {
    const map = new Map<string, KGNode>()
    KG_NODES.forEach((n) => map.set(n.node_id, n))
    return map
  }, [])

  // Derive active diagnostic status from latestDiagnosis
  // STRICT RULES:
  // 1. 'evidence_condition_met' is the ONLY status counted as an active failure condition.
  // 2. 'within_documented_interval' is informational only (never counted as an active failure condition).
  const diagnosticData = useMemo(() => {
    if (!latestDiagnosis?.knowledge_graph_evaluation?.results) {
      return {
        hasDiagnosis: false,
        activeFailureCodes: [] as string[],
        activeFailureModeIds: new Set<string>(),
        activeEvidenceIds: new Set<string>(),
        activeSymptomIds: new Set<string>(),
        activeEdgeIndices: new Set<number>(),
        twfIntervalInfo: false,
        statusMap: {} as Record<string, string>,
        evaluatedCount: 0,
      }
    }

    const results = latestDiagnosis.knowledge_graph_evaluation.results
    const statusMap: Record<string, string> = {}
    const activeFailureCodes: string[] = []
    const activeFailureModeIds = new Set<string>()
    const activeEvidenceIds = new Set<string>()
    let twfIntervalInfo = false

    Object.entries(results).forEach(([code, evalData]) => {
      const fmId = `FM_${code}`
      statusMap[fmId] = evalData.status
      if (evalData.evidence_node) {
        statusMap[evalData.evidence_node] = evalData.status
      }

      // Rule 1: ONLY 'evidence_condition_met' counts as active failure condition
      if (evalData.status === 'evidence_condition_met') {
        activeFailureCodes.push(code)
        activeFailureModeIds.add(fmId)
        if (evalData.evidence_node) {
          activeEvidenceIds.add(evalData.evidence_node)
        }
      } else if (code === 'TWF' && evalData.status === 'within_documented_interval') {
        // Rule 2: 'within_documented_interval' is informational only
        twfIntervalInfo = true
      }
    })

    // Highlight existing edges connecting active failure modes to evidence and related symptoms
    const activeEdgeIndices = new Set<number>()
    const activeSymptomIds = new Set<string>()

    KG_EDGES.forEach((edge, idx) => {
      // Edge from active Failure Mode to its Evidence (SUPPORTED_BY)
      if (
        activeFailureModeIds.has(edge.source) &&
        activeEvidenceIds.has(edge.target) &&
        edge.relationship === 'SUPPORTED_BY'
      ) {
        activeEdgeIndices.add(idx)
      }
      // Edge from Symptom indicating active Failure Mode (INDICATES)
      if (
        activeFailureModeIds.has(edge.target) &&
        edge.relationship === 'INDICATES'
      ) {
        activeEdgeIndices.add(idx)
        activeSymptomIds.add(edge.source)
      }
    })

    return {
      hasDiagnosis: true,
      activeFailureCodes,
      activeFailureModeIds,
      activeEvidenceIds,
      activeSymptomIds,
      activeEdgeIndices,
      twfIntervalInfo,
      statusMap,
      evaluatedCount: Object.keys(results).length,
    }
  }, [latestDiagnosis])

  // Highlight calculations for manual node selection or hover
  const { connectedNodeIds, connectedEdgeIndices } = useMemo(() => {
    const activeId = selectedNodeId || hoveredNodeId
    if (!activeId) {
      return { connectedNodeIds: new Set<string>(), connectedEdgeIndices: new Set<number>() }
    }

    const nIds = new Set<string>([activeId])
    const eIndices = new Set<number>()

    KG_EDGES.forEach((edge, idx) => {
      if (edge.source === activeId || edge.target === activeId) {
        eIndices.add(idx)
        nIds.add(edge.source)
        nIds.add(edge.target)
      }
    })

    return { connectedNodeIds: nIds, connectedEdgeIndices: eIndices }
  }, [selectedNodeId, hoveredNodeId])

  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null

  // Relationships connected to the selected node
  const selectedNodeRelationships = useMemo(() => {
    if (!selectedNodeId) return { incoming: [], outgoing: [] }

    const incoming = KG_EDGES.filter((e) => e.target === selectedNodeId)
    const outgoing = KG_EDGES.filter((e) => e.source === selectedNodeId)

    return { incoming, outgoing }
  }, [selectedNodeId])

  // Text stroke halo color for crisp contrast in light and dark modes
  const textStrokeColor = theme === 'dark' ? '#202C32' : '#FFFFFF'

  // Pan & Drag Handlers
  const handleMouseDownSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-bg') {
      setIsPanning(true)
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        initialX: pan.x,
        initialY: pan.y,
      }
    }
  }

  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setDraggedNodeId(nodeId)
    const currentPos = positions[nodeId] || { x: 500, y: 350 }
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = (e.clientX - dragStartRef.current.mouseX) / zoom
      const dy = (e.clientY - dragStartRef.current.mouseY) / zoom
      setPan({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      })
    } else if (draggedNodeId) {
      const dx = (e.clientX - dragStartRef.current.mouseX) / zoom
      const dy = (e.clientY - dragStartRef.current.mouseY) / zoom
      setPositions((prev) => ({
        ...prev,
        [draggedNodeId]: {
          x: Math.max(30, Math.min(970, dragStartRef.current.initialX + dx)),
          y: Math.max(30, Math.min(670, dragStartRef.current.initialY + dy)),
        },
      }))
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggedNodeId(null)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
    setZoom((prev) => Math.min(2.5, Math.max(0.5, prev * zoomFactor)))
  }

  const handleResetView = () => {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
    setPositions(DEFAULT_NODE_POSITIONS)
    setSelectedNodeId(null)
    setFilterType('ALL')
  }

  // Focus and center canvas on active failure modes
  const handleFocusActiveNodes = () => {
    if (diagnosticData.activeFailureCodes.length === 0) return

    const activeFmIds = diagnosticData.activeFailureCodes.map((c) => `FM_${c}`)
    let sumX = 0
    let sumY = 0

    activeFmIds.forEach((id) => {
      const pos = positions[id] || DEFAULT_NODE_POSITIONS[id] || { x: 500, y: 380 }
      sumX += pos.x
      sumY += pos.y
    })

    const avgX = sumX / activeFmIds.length
    const avgY = sumY / activeFmIds.length

    setSelectedNodeId(activeFmIds[0])
    setFilterType('ALL')

    const targetZoom = 1.25
    setZoom(targetZoom)
    setPan({
      x: 500 - avgX * targetZoom,
      y: 350 - avgY * targetZoom,
    })
  }

  const hasManualSelection = Boolean(selectedNodeId || hoveredNodeId)
  const hasActiveFailures = diagnosticData.activeFailureCodes.length > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-industrial-surface text-industrial-teal">
              Interactive Ontology Graph
            </span>
            <span className="text-xs text-industrial-text-muted">
              NetworkX Model • 27 Nodes • 29 Relationships
            </span>
          </div>
          <h2 className="text-2xl font-bold text-industrial-text">Knowledge Graph Explorer</h2>
          <p className="text-sm text-industrial-text-muted mt-1 max-w-2xl">
            Interactive visualization of the actual milling machine knowledge graph. Inspect relational symptoms, physical evidence conditions, and investigation remedies linked to real-time diagnosis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-2 rounded-xl border border-industrial-border bg-industrial-card hover:bg-industrial-surface text-industrial-text transition-colors shadow-sm"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
            className="p-2 rounded-xl border border-industrial-border bg-industrial-card hover:bg-industrial-surface text-industrial-text transition-colors shadow-sm"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-industrial-border bg-industrial-card hover:bg-industrial-surface text-xs font-medium text-industrial-text transition-colors shadow-sm"
            title="Reset Graph Layout & View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-industrial-teal" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Legend & Filter Bar (The authentic 6 node types in kg_nodes.csv) */}
      <div className="p-4 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-industrial-text-muted">
          <Layers className="w-4 h-4 text-industrial-teal" />
          <span className="text-industrial-text font-semibold">Node Type Legend:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              filterType === 'ALL'
                ? 'bg-industrial-teal text-white shadow-sm font-semibold'
                : 'bg-industrial-surface text-industrial-text hover:bg-industrial-border'
            }`}
          >
            All (27)
          </button>

          {(
            [
              { type: 'Machine', count: 1, label: 'Machine' },
              { type: 'Sensor', count: 5, label: 'Sensors' },
              { type: 'Symptom', count: 6, label: 'Symptoms' },
              { type: 'Failure_Mode', count: 5, label: 'Failure Modes' },
              { type: 'Evidence', count: 5, label: 'Evidence' },
              { type: 'Remedy', count: 5, label: 'Remedies' },
            ] as { type: KGNodeType; count: number; label: string }[]
          ).map((item) => {
            const isFilter = filterType === item.type
            const colors = NODE_TYPE_COLORS[item.type]
            return (
              <button
                key={item.type}
                onClick={() => setFilterType(isFilter ? 'ALL' : item.type)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all border ${
                  isFilter
                    ? 'ring-2 ring-industrial-teal font-bold shadow-sm'
                    : 'border-industrial-border bg-industrial-card hover:bg-industrial-surface'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors.fill }}
                />
                <span className="text-industrial-text">{item.label}</span>
                <span className="text-[10px] text-industrial-text-muted font-mono">({item.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Diagnosis Banner */}
      {diagnosticData.hasDiagnosis && hasActiveFailures ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                  Live Diagnosis Evaluation
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
                  {diagnosticData.activeFailureCodes.length} Failure Condition{diagnosticData.activeFailureCodes.length === 1 ? '' : 's'} Met
                </span>
                {diagnosticData.twfIntervalInfo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                    TWF: Within Documented Interval (Informational)
                  </span>
                )}
              </div>
              <p className="text-xs text-industrial-text mt-1">
                Active failure modes and their physical evidence links are highlighted below:{' '}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {diagnosticData.activeFailureCodes
                    .map((code) => {
                      const name = nodesMap.get(`FM_${code}`)?.name || code
                      return `${name} (${code})`
                    })
                    .join(', ')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleFocusActiveNodes}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Zoom and focus on active failure mode nodes"
            >
              <Crosshair className="w-4 h-4" />
              <span>Focus Active Nodes</span>
            </button>
          </div>
        </div>
      ) : diagnosticData.hasDiagnosis ? (
        <div className="p-4 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-industrial-surface text-industrial-teal shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-industrial-teal">
                  Live Diagnosis Evaluation
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-industrial-surface text-industrial-text">
                  0 Failure Conditions Met (Normal Telemetry)
                </span>
                {diagnosticData.twfIntervalInfo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                    TWF: Within Documented Interval (Informational)
                  </span>
                )}
              </div>
              <p className="text-xs text-industrial-text-muted mt-1">
                Latest diagnosis evaluated {diagnosticData.evaluatedCount} failure modes against current telemetry. All physics-based evidence checks passed without triggering failure conditions.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-industrial-card/60 border border-industrial-border shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-industrial-surface/50 text-industrial-text-muted shrink-0">
              <Info className="w-4 h-4 text-industrial-teal" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-industrial-text-muted">
                Ontology Explorer Mode (Baseline)
              </span>
              <p className="text-xs text-industrial-text-muted mt-0.5">
                No active diagnosis session loaded. Run an evaluation in <span className="font-semibold text-industrial-teal">Live Diagnosis</span> to link real-time sensor evaluations with ontology failure modes and physical evidence rules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Graph Canvas + Details Side Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Canvas Area (8 cols if node selected, otherwise 12 cols) */}
        <div
          className={`${
            selectedNode ? 'lg:col-span-8' : 'lg:col-span-12'
          } rounded-2xl bg-industrial-card border border-industrial-border shadow-sm overflow-hidden relative select-none`}
        >
          {/* Canvas Instructions Header Overlay */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-industrial-card/90 backdrop-blur-sm border border-industrial-border px-3 py-1.5 rounded-xl text-[11px] text-industrial-text-muted">
            <Info className="w-3.5 h-3.5 text-industrial-teal shrink-0" />
            <span>Click node to inspect • Drag node to move • Drag canvas to pan • Scroll to zoom</span>
          </div>

          <div className="absolute top-3 right-3 z-10 bg-industrial-card/90 backdrop-blur-sm border border-industrial-border px-2.5 py-1 rounded-lg text-[11px] font-mono text-industrial-text-muted">
            Zoom: {(zoom * 100).toFixed(0)}%
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 1000 700"
            className="w-full h-[620px] cursor-grab active:cursor-grabbing bg-industrial-bg/40"
            onMouseDown={handleMouseDownSvg}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Background Rect for Click-To-Deselect & Panning */}
            <rect
              id="graph-bg"
              width="1000"
              height="700"
              fill="transparent"
              onClick={() => setSelectedNodeId(null)}
            />

            {/* Definitions: Arrowhead Markers & Filters */}
            <defs>
              {/* Default Arrow */}
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#7D969B" />
              </marker>

              {/* Selection Highlight Arrow */}
              <marker
                id="arrow-highlight"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#527C78" />
              </marker>

              {/* Active Diagnostic Failure Arrow (Red) */}
              <marker
                id="arrow-active-red"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7.5"
                markerHeight="7.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#DC2626" />
              </marker>

              {/* Active Diagnostic Symptom Arrow (Amber) */}
              <marker
                id="arrow-active-amber"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7.5"
                markerHeight="7.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#D97706" />
              </marker>

              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.16" />
              </filter>
            </defs>

            {/* Transformed Group (Handles Pan & Zoom) */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* 1. Directed Edges */}
              <g className="edges">
                {KG_EDGES.map((edge, idx) => {
                  const sourcePos = positions[edge.source] || { x: 500, y: 350 }
                  const targetPos = positions[edge.target] || { x: 500, y: 350 }

                  const isConnected = connectedEdgeIndices.has(idx)
                  const isActiveDiagEdge = diagnosticData.activeEdgeIndices.has(idx)
                  const isFiltered =
                    filterType !== 'ALL' &&
                    (nodesMap.get(edge.source)?.node_type !== filterType ||
                      nodesMap.get(edge.target)?.node_type !== filterType)

                  // Determine Edge Styling
                  let opacity = 0.65
                  let strokeColor = '#7D969B'
                  let strokeWidth = 1.3
                  let markerId = 'url(#arrow)'
                  let isEdgeActiveAlert = false

                  if (isActiveDiagEdge) {
                    isEdgeActiveAlert = true
                    opacity = 1
                    strokeWidth = 2.8
                    if (edge.relationship === 'SUPPORTED_BY') {
                      strokeColor = '#DC2626'
                      markerId = 'url(#arrow-active-red)'
                    } else {
                      strokeColor = '#D97706'
                      markerId = 'url(#arrow-active-amber)'
                    }
                  } else if (hasManualSelection) {
                    opacity = isConnected ? 1 : 0.15
                    strokeColor = isConnected ? '#527C78' : '#7D969B'
                    strokeWidth = isConnected ? 2.5 : 1.3
                    markerId = isConnected ? 'url(#arrow-highlight)' : 'url(#arrow)'
                  } else if (hasActiveFailures) {
                    // When active failure conditions exist, gently dim unrelated baseline edges
                    opacity = isFiltered ? 0.15 : 0.25
                  } else if (isFiltered) {
                    opacity = 0.15
                  }

                  // Midpoint for relationship label
                  const midX = (sourcePos.x + targetPos.x) / 2
                  const midY = (sourcePos.y + targetPos.y) / 2

                  return (
                    <g key={idx} opacity={opacity} className="transition-opacity duration-200">
                      <line
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={
                          isEdgeActiveAlert
                            ? undefined
                            : edge.relationship === 'SUGGESTS_REMEDY'
                            ? '4 3'
                            : undefined
                        }
                        markerEnd={markerId}
                      />
                      {/* Show relationship label if active diagnostic edge, highlighted, or zoomed in */}
                      {(isEdgeActiveAlert || isConnected || zoom > 1.25) && (
                        <text
                          x={midX}
                          y={midY}
                          fill={
                            isEdgeActiveAlert
                              ? edge.relationship === 'SUPPORTED_BY'
                                ? '#DC2626'
                                : '#D97706'
                              : isConnected
                              ? '#527C78'
                              : '#627980'
                          }
                          fontSize={isEdgeActiveAlert ? '9.5px' : isConnected ? '9px' : '8px'}
                          fontWeight={isEdgeActiveAlert || isConnected ? 'bold' : 'normal'}
                          textAnchor="middle"
                          dy="-3"
                          className="font-mono select-none"
                          style={{
                            paintOrder: 'stroke',
                            stroke: textStrokeColor,
                            strokeWidth: '3.5px',
                            strokeLinejoin: 'round',
                          }}
                        >
                          {edge.relationship}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>

              {/* 2. Nodes */}
              <g className="nodes">
                {KG_NODES.map((node) => {
                  const pos = positions[node.node_id] || { x: 500, y: 350 }
                  const radius = NODE_RADII[node.node_type] || 20
                  const isSelected = selectedNodeId === node.node_id
                  const isHovered = hoveredNodeId === node.node_id
                  const isConnected = connectedNodeIds.has(node.node_id)
                  const isFilteredOut = filterType !== 'ALL' && node.node_type !== filterType

                  // Active Diagnostic Classifications
                  const isActiveFailureMode = diagnosticData.activeFailureModeIds.has(node.node_id)
                  const isActiveEvidence = diagnosticData.activeEvidenceIds.has(node.node_id)
                  const isActiveSymptom = diagnosticData.activeSymptomIds.has(node.node_id)
                  const isTwfIntervalNode =
                    diagnosticData.twfIntervalInfo &&
                    (node.node_id === 'FM_TWF' || node.node_id === 'EVID_TWF')

                  // Opacity logic:
                  // 1. Manual selection takes priority
                  // 2. Otherwise if active failures exist, active nodes & symptoms remain 1.0, others 0.35
                  // 3. Otherwise standard filter opacity
                  let opacity = 1
                  if (hasManualSelection) {
                    opacity = isConnected ? 1 : 0.2
                  } else if (hasActiveFailures) {
                    if (isActiveFailureMode || isActiveEvidence || isActiveSymptom) {
                      opacity = 1
                    } else if (isFilteredOut) {
                      opacity = 0.15
                    } else {
                      opacity = 0.35
                    }
                  } else if (isFilteredOut) {
                    opacity = 0.2
                  }

                  const colors = NODE_TYPE_COLORS[node.node_type]

                  return (
                    <g
                      key={node.node_id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      opacity={opacity}
                      onMouseDown={(e) => handleMouseDownNode(e, node.node_id)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedNodeId(node.node_id === selectedNodeId ? null : node.node_id)
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.node_id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="cursor-pointer transition-opacity duration-200"
                    >
                      {/* Manual Selection / Hover Ring */}
                      {(isSelected || isHovered) && (
                        <circle
                          r={radius + 7}
                          fill="none"
                          stroke="#527C78"
                          strokeWidth="3"
                          strokeDasharray="4 2"
                          className="animate-spin"
                          style={{ transformOrigin: '0 0', animationDuration: '10s' }}
                        />
                      )}

                      {/* ACTIVE FAILURE MODE: High-Contrast Alert Double Rings */}
                      {isActiveFailureMode && (
                        <>
                          <circle
                            r={radius + 9}
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="2.5"
                            strokeDasharray="4 3"
                            className="animate-spin"
                            style={{ transformOrigin: '0 0', animationDuration: '6s' }}
                          />
                          <circle
                            r={radius + 4.5}
                            fill="none"
                            stroke="#DC2626"
                            strokeWidth="3"
                            className="animate-pulse"
                          />
                        </>
                      )}

                      {/* ACTIVE EVIDENCE: High-Contrast Amber Rings */}
                      {isActiveEvidence && (
                        <>
                          <circle
                            r={radius + 6}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="2"
                            strokeDasharray="3 2"
                            className="animate-pulse"
                          />
                          <circle
                            r={radius + 3}
                            fill="none"
                            stroke="#D97706"
                            strokeWidth="2.5"
                          />
                        </>
                      )}

                      {/* INFORMATIONAL TWF INTERVAL (Purple Informational Ring - Not a Failure Alert) */}
                      {isTwfIntervalNode && !isActiveFailureMode && (
                        <circle
                          r={radius + 4}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={radius}
                        fill={colors.fill}
                        stroke={
                          isActiveFailureMode
                            ? '#DC2626'
                            : isSelected
                            ? '#34454A'
                            : '#FFFFFF'
                        }
                        strokeWidth={isActiveFailureMode ? 3 : node.node_type === 'Machine' ? 3 : 2}
                        filter="url(#shadow)"
                      />

                      {/* Machine Inner Accent Ring */}
                      {node.node_type === 'Machine' && (
                        <circle r={radius - 5} fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
                      )}

                      {/* Node Code / Initial inside circle */}
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill={
                          node.node_type === 'Evidence' || node.node_type === 'Remedy'
                            ? '#34454A'
                            : '#FFFFFF'
                        }
                        fontSize={radius > 20 ? '11px' : '9px'}
                        fontWeight="bold"
                        className="font-mono select-none pointer-events-none"
                      >
                        {node.code || node.node_id.replace(/^([A-Z]+)_0*(\d+)/, '$1$2')}
                      </text>

                      {/* Node Badges at Top-Right */}
                      {isActiveFailureMode && (
                        <g transform={`translate(${radius * 0.72}, ${-radius * 0.72})`}>
                          <circle
                            r="8"
                            fill="#DC2626"
                            stroke={textStrokeColor}
                            strokeWidth="2"
                            filter="url(#shadow)"
                          />
                          <text
                            textAnchor="middle"
                            dy="3.5"
                            fill="#FFFFFF"
                            fontSize="10px"
                            fontWeight="bold"
                            className="font-mono pointer-events-none select-none"
                          >
                            !
                          </text>
                        </g>
                      )}

                      {isActiveEvidence && (
                        <g transform={`translate(${radius * 0.72}, ${-radius * 0.72})`}>
                          <circle
                            r="7.5"
                            fill="#D97706"
                            stroke={textStrokeColor}
                            strokeWidth="1.5"
                          />
                          <text
                            textAnchor="middle"
                            dy="3"
                            fill="#FFFFFF"
                            fontSize="8px"
                            fontWeight="bold"
                            className="font-mono pointer-events-none select-none"
                          >
                            ✓
                          </text>
                        </g>
                      )}

                      {isTwfIntervalNode && !isActiveFailureMode && (
                        <g transform={`translate(${radius * 0.72}, ${-radius * 0.72})`}>
                          <circle
                            r="7"
                            fill="#8B5CF6"
                            stroke={textStrokeColor}
                            strokeWidth="1.5"
                          />
                          <text
                            textAnchor="middle"
                            dy="3"
                            fill="#FFFFFF"
                            fontSize="8px"
                            fontWeight="bold"
                            className="font-mono pointer-events-none select-none"
                          >
                            i
                          </text>
                        </g>
                      )}

                      {/* Node Label Text Below Circle */}
                      <text
                        textAnchor="middle"
                        dy={radius + 14}
                        fill={
                          isActiveFailureMode
                            ? '#DC2626'
                            : isActiveEvidence
                            ? '#B45309'
                            : isSelected
                            ? '#527C78'
                            : theme === 'dark'
                            ? '#E7ECEB'
                            : '#34454A'
                        }
                        fontSize="10px"
                        fontWeight={isActiveFailureMode || isSelected ? 'bold' : '500'}
                        className="font-sans select-none pointer-events-none"
                        style={{
                          paintOrder: 'stroke',
                          stroke: textStrokeColor,
                          strokeWidth: '3.5px',
                          strokeLinejoin: 'round',
                        }}
                      >
                        {node.name.length > 20 ? `${node.name.slice(0, 18)}...` : node.name}
                      </text>
                    </g>
                  )
                })}
              </g>
            </g>
          </svg>
        </div>

        {/* Selected Node Properties Side Drawer (4 cols when selected) */}
        {selectedNode && (
          <div className="lg:col-span-4 p-6 rounded-2xl bg-industrial-card border border-industrial-border shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-industrial-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: NODE_TYPE_COLORS[selectedNode.node_type].fill }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-industrial-teal">
                      {selectedNode.node_type.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-industrial-text mt-1">{selectedNode.name}</h3>
                  <span className="font-mono text-xs text-industrial-text-muted">{selectedNode.node_id}</span>
                </div>

                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1.5 rounded-lg text-industrial-text-muted hover:bg-industrial-surface"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Diagnosis Status Badge (if linked) */}
              {diagnosticData.statusMap[selectedNode.node_id] && (
                <div className="p-3 rounded-xl bg-industrial-surface/50 border border-industrial-border space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-industrial-text-muted block">
                    Active Run Evaluation Status:
                  </span>
                  <StatusBadge status={diagnosticData.statusMap[selectedNode.node_id]} size="sm" />
                </div>
              )}

              {/* Active Diagnosis Alerts in Drawer */}
              {diagnosticData.activeFailureModeIds.has(selectedNode.node_id) && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                    Active Failure Condition Triggered in Latest Run
                  </span>
                </div>
              )}

              {diagnosticData.twfIntervalInfo &&
                (selectedNode.node_id === 'FM_TWF' || selectedNode.node_id === 'EVID_TWF') && (
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Tool wear is within documented replacement interval (Informational)
                    </span>
                  </div>
                )}

              {/* Node Properties List */}
              <div className="space-y-2.5 text-xs">
                {selectedNode.description && (
                  <div>
                    <span className="font-bold text-industrial-text-muted block text-[10px] uppercase">
                      Description
                    </span>
                    <p className="text-industrial-text mt-0.5 leading-relaxed bg-industrial-bg/50 p-2.5 rounded-xl border border-industrial-border">
                      {selectedNode.description}
                    </p>
                  </div>
                )}

                {selectedNode.condition && (
                  <div>
                    <span className="font-bold text-industrial-text-muted block text-[10px] uppercase">
                      Physical Evaluation Condition
                    </span>
                    <p className="text-industrial-text font-mono mt-0.5 bg-industrial-bg/50 p-2.5 rounded-xl border border-industrial-border">
                      {selectedNode.condition}
                    </p>
                  </div>
                )}

                {selectedNode.power_formula && (
                  <div>
                    <span className="font-bold text-industrial-text-muted block text-[10px] uppercase">
                      Power Formula
                    </span>
                    <p className="text-industrial-text font-mono mt-0.5 bg-industrial-bg/50 p-2.5 rounded-xl border border-industrial-border">
                      {selectedNode.power_formula}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selectedNode.unit && (
                    <div className="p-2.5 rounded-xl bg-industrial-surface/30 border border-industrial-border">
                      <span className="text-[10px] text-industrial-text-muted block uppercase">Unit</span>
                      <span className="font-mono font-bold text-industrial-text">{selectedNode.unit}</span>
                    </div>
                  )}

                  {selectedNode.code && (
                    <div className="p-2.5 rounded-xl bg-industrial-surface/30 border border-industrial-border">
                      <span className="text-[10px] text-industrial-text-muted block uppercase">Failure Code</span>
                      <span className="font-mono font-bold text-industrial-teal">{selectedNode.code}</span>
                    </div>
                  )}

                  {selectedNode.source_id && (
                    <div className="p-2.5 rounded-xl bg-industrial-surface/30 border border-industrial-border">
                      <span className="text-[10px] text-industrial-text-muted block uppercase">Source</span>
                      <span className="font-mono font-bold text-industrial-text">{selectedNode.source_id}</span>
                    </div>
                  )}

                  {selectedNode.provenance && (
                    <div className="p-2.5 rounded-xl bg-industrial-surface/30 border border-industrial-border">
                      <span className="text-[10px] text-industrial-text-muted block uppercase">Provenance</span>
                      <span className="font-medium text-industrial-text text-[11px] leading-tight block">
                        {selectedNode.provenance}
                      </span>
                    </div>
                  )}
                </div>

                {selectedNode.validation_status && (
                  <div className="p-2.5 rounded-xl bg-industrial-peach/20 border border-industrial-peach/40 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-industrial-teal shrink-0" />
                    <span className="text-[11px] text-industrial-text font-medium">
                      Status: {selectedNode.validation_status}
                    </span>
                  </div>
                )}
              </div>

              {/* Connected Relationships Section */}
              <div className="space-y-2 pt-2 border-t border-industrial-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-industrial-text-muted block">
                  Connected Relationships ({selectedNodeRelationships.incoming.length + selectedNodeRelationships.outgoing.length})
                </span>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {/* Incoming */}
                  {selectedNodeRelationships.incoming.map((edge, idx) => {
                    const sourceNode = nodesMap.get(edge.source)
                    return (
                      <button
                        key={`in-${idx}`}
                        onClick={() => setSelectedNodeId(edge.source)}
                        className="w-full text-left p-2 rounded-lg bg-industrial-bg/60 hover:bg-industrial-surface border border-industrial-border flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[10px] font-mono text-industrial-text-muted">← {edge.relationship}</span>
                          <span className="font-medium text-industrial-text truncate">
                            {sourceNode?.name || edge.source}
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-industrial-text-muted shrink-0" />
                      </button>
                    )
                  })}

                  {/* Outgoing */}
                  {selectedNodeRelationships.outgoing.map((edge, idx) => {
                    const targetNode = nodesMap.get(edge.target)
                    return (
                      <button
                        key={`out-${idx}`}
                        onClick={() => setSelectedNodeId(edge.target)}
                        className="w-full text-left p-2 rounded-lg bg-industrial-bg/60 hover:bg-industrial-surface border border-industrial-border flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[10px] font-mono text-industrial-teal">→ {edge.relationship}</span>
                          <span className="font-medium text-industrial-text truncate">
                            {targetNode?.name || edge.target}
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-industrial-text-muted shrink-0" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-industrial-border text-[11px] text-industrial-text-muted flex items-center justify-between">
              <span>Authentic Dataset: AI4I 2020</span>
              <span className="font-mono">kg_nodes.csv</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
