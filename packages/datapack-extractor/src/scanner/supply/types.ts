
export interface SupplyRandomRule {
  probStart: number,
  probEnd: number,
  slotStart: number,
  slotEnd: number,
};

export interface ItemDefinitionEvidence {
  kind: 'item_definition',

  sourcePath: string,
  sourceStem: string,
  sourceDir: string,
  namespace: string,

  definitionSourceType: 'supply',
  slotRange?: SupplyRandomRule,

  baseItemId?: string,
  count?: number,
  rawComponents?: Record<string, string>;

  itemModel?: string,
  customNameRaw?: string,
  loreRaw?: Array<unknown>,
  customDataRaw?: object,
  maxStackSize?: number,
  maxDamage?: number,
  damage?: number,

  warnings: string[],
}

