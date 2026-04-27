
export type ItemCommandType = 'give' | 'item_replace' | 'macro_item_replace';

export interface ItemCommandMatch {
  type: ItemCommandType,
  slot?: string,
  itemExpr: string,
}

export interface ParsedItemExpr {
  baseItemId: string
  componentsText?: string
  count?: number
};

// TODO: Base interface
export interface ItemDefinitionEvidence {
  kind: 'item_definition',

  sourcePath: string,
  sourceStem: string,
  sourceDir: string,
  namespace: string,

  definitionSourceType: 'mcfunction',
  commandType: ItemCommandType,
  slot?: string,

  baseItemId?: string,
  count?: number,
  rawComponents?: Record<string, string>;

  itemModel?: string,
  customNameRaw?: string,
  loreRaw?: string,
  customDataRaw?: string,
  maxStackSize?: number,
  maxDamage?: number,
  damage?: number,

  warnings: string[],
}
