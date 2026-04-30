
export type ItemCommandType = 'give' | 'macro_give' | 'item_replace' | 'macro_item_replace';

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

  definitionSourceType: 'mcfunction' | 'supply' | 'recipe',
  commandType: ItemCommandType,
  slot?: string,
  layer?: 'template' | 'replacement',
  locationName?: string,
  probability?: number,
  recipeId?: string,

  baseItemId?: string,
  count?: number,
  rawComponents?: Record<string, string>;

  itemModel?: string,
  itemNameRaw?: unknown,
  customNameRaw?: unknown,
  loreRaw?: unknown,
  customDataRaw?: unknown,
  maxStackSize?: number,
  maxDamage?: number,
  damage?: number,

  warnings: string[],
}
