import { TaskDefinition } from '@/types/orchestrator';

export const TASK_DEFINITIONS: TaskDefinition[] = [
  {
    id: 'Z4',
    name: 'Format Transform',
    description: 'Transform document content from one format to another. Converts raw data into structured, formatted outputs suitable for downstream processing.',
    category: 'general',
    icon: '🔄',
    costRange: { min: 0.50, max: 1.50 },
    avgCost: 0.50,
    successRate: 94,
    avgTokens: { min: 50, max: 200 },
    avgDuration: { min: 1, max: 3 },
    inputs: [
      { name: 'raw_document', type: 'string', description: 'Raw document content to transform', required: true },
      { name: 'transform_type', type: 'string', description: 'Type of transformation (mortgage_eligibility_summary, solar_quote_format)', required: true },
    ],
    outputs: [
      { name: 'formatted_json', type: 'object', description: 'Formatted JSON output' },
      { name: 'structured_data', type: 'object', description: 'Structured data ready for processing' },
    ],
    limitations: [
      'Output is NON-AUTHORITATIVE',
      'Human review required',
      'Does NOT make decisions',
    ],
    supportedFormats: ['mortgage_eligibility_summary', 'solar_quote_format'],
  },
  {
    id: 'Z5',
    name: 'Extract Data',
    description: 'Extract structured data from documents including PDFs, images, and text files. Uses AI to identify and parse key information fields.',
    category: 'general',
    icon: '📊',
    costRange: { min: 0.80, max: 2.00 },
    avgCost: 0.80,
    successRate: 89,
    avgTokens: { min: 100, max: 500 },
    avgDuration: { min: 2, max: 5 },
    inputs: [
      { name: 'document', type: 'file', description: 'Document to extract data from (PDF, image, text)', required: true },
      { name: 'extraction_schema', type: 'object', description: 'Schema defining fields to extract', required: false },
    ],
    outputs: [
      { name: 'extracted_data', type: 'object', description: 'Extracted key-value pairs' },
      { name: 'confidence_scores', type: 'object', description: 'Confidence score for each extracted field' },
    ],
    limitations: [
      'Output is NON-AUTHORITATIVE',
      'Human review required',
      'Accuracy varies by document quality',
      'Does NOT validate extracted data',
    ],
  },
  {
    id: 'Z6',
    name: 'Compare Documents',
    description: 'Compare two or more documents to identify differences, similarities, and discrepancies. Useful for contract review and version comparison.',
    category: 'general',
    icon: '⚖️',
    costRange: { min: 1.00, max: 1.00 },
    avgCost: 1.00,
    successRate: 91,
    avgTokens: { min: 200, max: 800 },
    avgDuration: { min: 3, max: 8 },
    inputs: [
      { name: 'document_a', type: 'file', description: 'First document for comparison', required: true },
      { name: 'document_b', type: 'file', description: 'Second document for comparison', required: true },
      { name: 'comparison_type', type: 'string', description: 'Type of comparison (diff, semantic, structural)', required: false },
    ],
    outputs: [
      { name: 'differences', type: 'array', description: 'List of identified differences' },
      { name: 'similarities', type: 'array', description: 'List of identified similarities' },
      { name: 'comparison_summary', type: 'string', description: 'Human-readable summary of comparison' },
    ],
    limitations: [
      'Output is NON-AUTHORITATIVE',
      'Human review required',
      'May miss subtle differences',
      'Does NOT provide legal analysis',
    ],
  },
  {
    id: 'Z7',
    name: 'Validate Input',
    description: 'Validate data against predefined rules and schemas. Checks for completeness, format compliance, and business rule adherence.',
    category: 'general',
    icon: '✅',
    costRange: { min: 0.30, max: 0.30 },
    avgCost: 0.30,
    successRate: 97,
    avgTokens: { min: 20, max: 100 },
    avgDuration: { min: 0.5, max: 1 },
    inputs: [
      { name: 'data', type: 'object', description: 'Data to validate', required: true },
      { name: 'validation_rules', type: 'object', description: 'Rules to validate against', required: false },
    ],
    outputs: [
      { name: 'valid', type: 'boolean', description: 'Whether data passes all validations' },
      { name: 'warnings', type: 'array', description: 'List of validation warnings' },
      { name: 'errors', type: 'array', description: 'List of validation errors' },
    ],
    limitations: [
      'Output is NON-AUTHORITATIVE',
      'Human review required',
      'Does NOT guarantee data accuracy',
      'Rule-based, not context-aware',
    ],
  },
  {
    id: 'Z8',
    name: 'Summarize Document',
    description: 'Generate concise summaries of long documents while preserving key information. Supports multiple summary lengths and formats.',
    category: 'general',
    icon: '📝',
    costRange: { min: 0.60, max: 0.60 },
    avgCost: 0.60,
    successRate: 92,
    avgTokens: { min: 100, max: 400 },
    avgDuration: { min: 1.5, max: 4 },
    inputs: [
      { name: 'document', type: 'string', description: 'Document content to summarize', required: true },
      { name: 'summary_length', type: 'string', description: 'Desired length (brief, standard, detailed)', required: false },
      { name: 'focus_areas', type: 'array', description: 'Specific topics to focus on', required: false },
    ],
    outputs: [
      { name: 'summary', type: 'string', description: 'Generated summary' },
      { name: 'key_points', type: 'array', description: 'Extracted key points' },
      { name: 'word_count', type: 'number', description: 'Word count of summary' },
    ],
    limitations: [
      'Output is NON-AUTHORITATIVE',
      'Human review required',
      'May omit important details',
      'Does NOT replace full document review',
    ],
  },
  {
    id: 'Z9',
    name: 'Convert Format',
    description: 'Convert documents between different file formats while preserving structure and content. Supports common document formats.',
    category: 'general',
    icon: '🔀',
    costRange: { min: 0.40, max: 0.40 },
    avgCost: 0.40,
    successRate: 98,
    avgTokens: { min: 10, max: 50 },
    avgDuration: { min: 0.5, max: 2 },
    inputs: [
      { name: 'source_file', type: 'file', description: 'Source file to convert', required: true },
      { name: 'target_format', type: 'string', description: 'Desired output format (pdf, docx, json, csv)', required: true },
    ],
    outputs: [
      { name: 'converted_file', type: 'file', description: 'Converted file in target format' },
      { name: 'conversion_status', type: 'string', description: 'Status of conversion' },
    ],
    limitations: [
      'Output is NON-AUTHORITATIVE',
      'Human review required',
      'Complex formatting may not preserve perfectly',
      'Does NOT validate content accuracy',
    ],
  },
];

export const TASK_CATEGORIES = [
  { id: 'all', name: 'All Tasks' },
  { id: 'mortgage', name: 'Mortgage' },
  { id: 'solar', name: 'Solar' },
  { id: 'general', name: 'General' },
];

export function getTaskById(taskId: string): TaskDefinition | undefined {
  return TASK_DEFINITIONS.find(task => task.id === taskId);
}

export function getTasksByCategory(category: string): TaskDefinition[] {
  if (category === 'all') return TASK_DEFINITIONS;
  return TASK_DEFINITIONS.filter(task => task.category === category);
}
