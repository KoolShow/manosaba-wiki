export type RecipeKind = 'crafting_shaped' | 'crafting_shapeless' | 'crafting_transmute' | 'campfire_cooking';

export interface RecipeIngredient {
  baseItemId?: string,
  itemId?: string,
  tagId?: string,
}

export interface RecipeResultIdentity {
  baseItemId?: string,
  itemModel?: string,
  customName?: string,
  customData?: string,
  count?: number,
}

export interface Recipe {
  id: string,
  kind: RecipeKind,
  pattern?: string[],
  key?: Record<string, RecipeIngredient>,
  ingredients?: RecipeIngredient[],
  input?: RecipeIngredient,
  material?: RecipeIngredient,
  ingredient?: RecipeIngredient,
  result: RecipeResultIdentity,
  linkedItemId?: string,
  warnings?: string[],
}
