export type KGNodeType =
  | 'Machine'
  | 'Sensor'
  | 'Symptom'
  | 'Failure_Mode'
  | 'Evidence'
  | 'Remedy'

export interface KGNode {
  node_id: string
  node_type: KGNodeType
  name: string
  dataset?: string
  unit?: string
  code?: string
  description?: string
  source_id?: string
  condition?: string
  condition_operator?: string
  power_formula?: string
  independent_of_parameters?: string
  provenance?: string
  validation_status?: string
}

export interface KGEdge {
  source: string
  target: string
  edge_key: number
  relationship: 'HAS_SENSOR' | 'RELEVANT_TO' | 'INDICATES' | 'SUPPORTED_BY' | 'SUGGESTS_REMEDY'
  source_id?: string
  provenance?: string
}

/**
 * Authentic 27 nodes exactly from Industrial_KG/data/kg_nodes.csv
 */
export const KG_NODES: KGNode[] = [
  {
    node_id: 'MACHINE_001',
    node_type: 'Machine',
    name: 'Industrial Milling Machine',
    dataset: 'AI4I 2020',
  },
  {
    node_id: 'SENSOR_001',
    node_type: 'Sensor',
    name: 'Air Temperature',
    unit: 'K',
  },
  {
    node_id: 'SENSOR_002',
    node_type: 'Sensor',
    name: 'Process Temperature',
    unit: 'K',
  },
  {
    node_id: 'SENSOR_003',
    node_type: 'Sensor',
    name: 'Rotational Speed',
    unit: 'rpm',
  },
  {
    node_id: 'SENSOR_004',
    node_type: 'Sensor',
    name: 'Torque',
    unit: 'Nm',
  },
  {
    node_id: 'SENSOR_005',
    node_type: 'Sensor',
    name: 'Tool Wear',
    unit: 'min',
  },
  {
    node_id: 'FM_TWF',
    node_type: 'Failure_Mode',
    name: 'Tool Wear Failure',
    code: 'TWF',
    description: 'Failure associated with tool wear',
    source_id: 'SRC_001',
  },
  {
    node_id: 'FM_HDF',
    node_type: 'Failure_Mode',
    name: 'Heat Dissipation Failure',
    code: 'HDF',
    description: 'Failure associated with heat dissipation conditions',
    source_id: 'SRC_001',
  },
  {
    node_id: 'FM_PWF',
    node_type: 'Failure_Mode',
    name: 'Power Failure',
    code: 'PWF',
    description: 'Failure associated with process power limits',
    source_id: 'SRC_001',
  },
  {
    node_id: 'FM_OSF',
    node_type: 'Failure_Mode',
    name: 'Overstrain Failure',
    code: 'OSF',
    description: 'Failure associated with tool wear and torque thresholds',
    source_id: 'SRC_001',
  },
  {
    node_id: 'FM_RNF',
    node_type: 'Failure_Mode',
    name: 'Random Failure',
    code: 'RNF',
    description: 'Random failure independent of operating parameters',
    source_id: 'SRC_001',
  },
  {
    node_id: 'SYM_001',
    node_type: 'Symptom',
    name: 'Excessive Tool Wear',
    description: 'Tool wear reaches the documented failure interval.',
    source_id: 'SRC_001',
  },
  {
    node_id: 'SYM_002',
    node_type: 'Symptom',
    name: 'Low Temperature Difference',
    description: 'Air and process temperature difference falls below 8.6 K.',
    source_id: 'SRC_001',
  },
  {
    node_id: 'SYM_003',
    node_type: 'Symptom',
    name: 'Low Rotational Speed',
    description: 'Rotational speed falls below 1380 rpm in the documented HDF condition.',
    source_id: 'SRC_001',
  },
  {
    node_id: 'SYM_004',
    node_type: 'Symptom',
    name: 'Abnormal Process Power',
    description: 'Process power is below 3500 W or above 9000 W.',
    source_id: 'SRC_001',
  },
  {
    node_id: 'SYM_005',
    node_type: 'Symptom',
    name: 'Excessive Tool Stress',
    description: 'Tool wear multiplied by torque exceeds the product-specific threshold.',
    source_id: 'SRC_001',
  },
  {
    node_id: 'SYM_006',
    node_type: 'Symptom',
    name: 'Random Failure Event',
    description: 'Failure occurs independently of operating parameters.',
    source_id: 'SRC_001',
  },
  {
    node_id: 'EVID_TWF',
    node_type: 'Evidence',
    name: 'Tool Wear Failure Interval',
    unit: 'minutes',
    description: 'The tool is replaced or fails at a random tool-wear time between 200 and 240 minutes.',
    source_id: 'SRC_001',
    condition: '200 <= tool_wear <= 240',
  },
  {
    node_id: 'EVID_HDF',
    node_type: 'Evidence',
    name: 'Heat Dissipation Failure Condition',
    unit: 'K and rpm',
    description: 'Both conditions must hold: air-process temperature difference is below 8.6 K AND rotational speed is below 1380 rpm.',
    source_id: 'SRC_001',
    condition: 'temperature_difference < 8.6 AND rotational_speed < 1380',
    condition_operator: 'AND',
  },
  {
    node_id: 'EVID_PWF',
    node_type: 'Evidence',
    name: 'Process Power Failure Range',
    unit: 'Watts',
    description: 'Process power is below 3500 W or above 9000 W. Power is calculated using torque multiplied by angular speed.',
    source_id: 'SRC_001',
    condition: 'power < 3500 OR power > 9000',
    condition_operator: 'OR',
    power_formula: 'torque * rotational_speed * 2*pi/60',
  },
  {
    node_id: 'EVID_OSF',
    node_type: 'Evidence',
    name: 'Product-Specific Overstrain Thresholds',
    unit: 'minute-Nm',
    description: 'Tool wear multiplied by torque exceeds the threshold for the product quality: L=11000, M=12000, H=13000.',
    source_id: 'SRC_001',
    condition: 'tool_wear * torque > product_specific_threshold',
  },
  {
    node_id: 'EVID_RNF',
    node_type: 'Evidence',
    name: 'Random Failure Probability',
    unit: 'probability',
    description: 'The dataset documentation describes a 0.1 percent probability of random failure per process, independent of operating parameters.',
    source_id: 'SRC_001',
    condition: 'probability = 0.001',
    independent_of_parameters: 'True',
  },
  {
    node_id: 'REM_001',
    node_type: 'Remedy',
    name: 'Inspect Tool Condition',
    description: 'Inspect tool wear and review the tool replacement schedule.',
    source_id: 'PROJECT_KNOWLEDGE',
    provenance: 'Project-generated investigation recommendation',
    validation_status: 'Not independently validated',
  },
  {
    node_id: 'REM_002',
    node_type: 'Remedy',
    name: 'Inspect Thermal System',
    description: 'Inspect the cooling and thermal management system and verify temperature and RPM readings.',
    source_id: 'PROJECT_KNOWLEDGE',
    provenance: 'Project-generated investigation recommendation',
    validation_status: 'Not independently validated',
  },
  {
    node_id: 'REM_003',
    node_type: 'Remedy',
    name: 'Inspect Power and Load Conditions',
    description: 'Review machine load, torque, rotational speed, and calculated process power.',
    source_id: 'PROJECT_KNOWLEDGE',
    provenance: 'Project-generated investigation recommendation',
    validation_status: 'Not independently validated',
  },
  {
    node_id: 'REM_004',
    node_type: 'Remedy',
    name: 'Inspect Tool Stress Conditions',
    description: 'Inspect tool condition and verify the applicable product-specific tool wear and torque threshold.',
    source_id: 'PROJECT_KNOWLEDGE',
    provenance: 'Project-generated investigation recommendation',
    validation_status: 'Not independently validated',
  },
  {
    node_id: 'REM_005',
    node_type: 'Remedy',
    name: 'Review Machine Event Logs',
    description: 'Review machine logs and investigate other possible factors because this failure is documented as independent of operating parameters.',
    source_id: 'PROJECT_KNOWLEDGE',
    provenance: 'Project-generated investigation recommendation',
    validation_status: 'Not independently validated',
  },
]

/**
 * Authentic 29 relationships exactly from Industrial_KG/data/kg_relationships.csv
 */
export const KG_EDGES: KGEdge[] = [
  { source: 'MACHINE_001', target: 'SENSOR_001', edge_key: 0, relationship: 'HAS_SENSOR' },
  { source: 'MACHINE_001', target: 'SENSOR_002', edge_key: 0, relationship: 'HAS_SENSOR' },
  { source: 'MACHINE_001', target: 'SENSOR_003', edge_key: 0, relationship: 'HAS_SENSOR' },
  { source: 'MACHINE_001', target: 'SENSOR_004', edge_key: 0, relationship: 'HAS_SENSOR' },
  { source: 'MACHINE_001', target: 'SENSOR_005', edge_key: 0, relationship: 'HAS_SENSOR' },
  { source: 'SENSOR_001', target: 'FM_HDF', edge_key: 0, relationship: 'RELEVANT_TO', source_id: 'SRC_001' },
  { source: 'SENSOR_002', target: 'FM_HDF', edge_key: 0, relationship: 'RELEVANT_TO', source_id: 'SRC_001' },
  { source: 'SENSOR_003', target: 'FM_HDF', edge_key: 0, relationship: 'RELEVANT_TO', source_id: 'SRC_001' },
  { source: 'SENSOR_003', target: 'FM_PWF', edge_key: 0, relationship: 'RELEVANT_TO', source_id: 'SRC_001' },
  { source: 'SENSOR_004', target: 'FM_PWF', edge_key: 0, relationship: 'RELEVANT_TO', source_id: 'SRC_001' },
  { source: 'SENSOR_004', target: 'FM_OSF', edge_key: 0, relationship: 'RELEVANT_TO', source_id: 'SRC_001' },
  { source: 'SENSOR_005', target: 'FM_TWF', edge_key: 0, relationship: 'RELEVANT_TO', source_id: 'SRC_001' },
  { source: 'SENSOR_005', target: 'FM_OSF', edge_key: 0, relationship: 'RELEVANT_TO', source_id: 'SRC_001' },
  { source: 'FM_TWF', target: 'EVID_TWF', edge_key: 0, relationship: 'SUPPORTED_BY', source_id: 'SRC_001' },
  { source: 'FM_TWF', target: 'REM_001', edge_key: 0, relationship: 'SUGGESTS_REMEDY', provenance: 'Project-generated recommendation' },
  { source: 'FM_HDF', target: 'EVID_HDF', edge_key: 0, relationship: 'SUPPORTED_BY', source_id: 'SRC_001' },
  { source: 'FM_HDF', target: 'REM_002', edge_key: 0, relationship: 'SUGGESTS_REMEDY', provenance: 'Project-generated recommendation' },
  { source: 'FM_PWF', target: 'EVID_PWF', edge_key: 0, relationship: 'SUPPORTED_BY', source_id: 'SRC_001' },
  { source: 'FM_PWF', target: 'REM_003', edge_key: 0, relationship: 'SUGGESTS_REMEDY', provenance: 'Project-generated recommendation' },
  { source: 'FM_OSF', target: 'EVID_OSF', edge_key: 0, relationship: 'SUPPORTED_BY', source_id: 'SRC_001' },
  { source: 'FM_OSF', target: 'REM_004', edge_key: 0, relationship: 'SUGGESTS_REMEDY', provenance: 'Project-generated recommendation' },
  { source: 'FM_RNF', target: 'EVID_RNF', edge_key: 0, relationship: 'SUPPORTED_BY', source_id: 'SRC_001' },
  { source: 'FM_RNF', target: 'REM_005', edge_key: 0, relationship: 'SUGGESTS_REMEDY', provenance: 'Project-generated recommendation' },
  { source: 'SYM_001', target: 'FM_TWF', edge_key: 0, relationship: 'INDICATES', source_id: 'SRC_001' },
  { source: 'SYM_002', target: 'FM_HDF', edge_key: 0, relationship: 'INDICATES', source_id: 'SRC_001' },
  { source: 'SYM_003', target: 'FM_HDF', edge_key: 0, relationship: 'INDICATES', source_id: 'SRC_001' },
  { source: 'SYM_004', target: 'FM_PWF', edge_key: 0, relationship: 'INDICATES', source_id: 'SRC_001' },
  { source: 'SYM_005', target: 'FM_OSF', edge_key: 0, relationship: 'INDICATES', source_id: 'SRC_001' },
  { source: 'SYM_006', target: 'FM_RNF', edge_key: 0, relationship: 'INDICATES', source_id: 'SRC_001' },
]

export const NODE_TYPE_COLORS: Record<KGNodeType, { bg: string; border: string; text: string; fill: string }> = {
  Machine: { bg: 'bg-[#527C78]', border: 'border-[#436562]', text: 'text-white', fill: '#527C78' },
  Sensor: { bg: 'bg-[#829DB5]', border: 'border-[#69859D]', text: 'text-white', fill: '#829DB5' },
  Failure_Mode: { bg: 'bg-[#D5A98F]', border: 'border-[#B88D73]', text: 'text-[#202C32]', fill: '#D5A98F' },
  Symptom: { bg: 'bg-[#A995C0]', border: 'border-[#8F7BA6]', text: 'text-white', fill: '#A995C0' },
  Evidence: { bg: 'bg-[#DCE8E2]', border: 'border-[#527C78]', text: 'text-[#34454A]', fill: '#A6C6B8' },
  Remedy: { bg: 'bg-[#E9C9B5]', border: 'border-[#CB9E83]', text: 'text-[#34454A]', fill: '#E9C9B5' },
}
