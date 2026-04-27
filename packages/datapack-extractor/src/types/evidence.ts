
export type EvidenceType = 'item_definition' | 'item_trigger';

export interface BaseEvidence {
  kind: EvidenceType,

  sourcePath: string,
  sourceStem: string,
  sourceDir: string,
  namespace: string,

  warnings: string[],
}
