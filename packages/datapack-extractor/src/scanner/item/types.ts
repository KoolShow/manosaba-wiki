
export interface ItemCommandMatch {
  type: 'give' | 'item_replace' | 'macro_item_replace',
  slot?: string,
  itemExpr: string,
}

export interface ParsedItemExpr {
  baseItemId: string
  componentsText?: string
  count?: number
};
