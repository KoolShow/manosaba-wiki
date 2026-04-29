
export interface SupplyRandomRule {
  probStart: number,
  probEnd: number,
  slotStart: number,
  slotEnd: number,
};

export interface SupplyDefinitionEvidence {
  kind: 'supply_definition',

  sourcePath: string,
  sourceStem: string,
  sourceDir: string,
  namespace: string,
  slot?: string,
  layer: 'template' | 'replacement',

  locationName: string,
  slotRanges?: SupplyRandomRule[],
  probability?: number,

  baseItemId?: string,
  count?: number,
  rawComponents?: Record<string, string>;

  itemName?: string,
  itemModel?: string,
  customName?: object,
  lore?: Array<unknown>,
  customData?: object,
  maxStackSize?: number,
  maxDamage?: number,
  damage?: number,
  isUnique?: boolean,

  warnings: string[],
}
