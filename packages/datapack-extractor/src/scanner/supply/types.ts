
export interface SupplyRandomRule {
  probStart: number,
  probEnd: number,
  slotStart: number,
  slotEnd: number,
};

export interface SupplyDefinitionEvidence {
  kind: 'supply_definition',

  locationName: string,
  slotRanges?: SupplyRandomRule[],

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

  warnings: string[],
}
