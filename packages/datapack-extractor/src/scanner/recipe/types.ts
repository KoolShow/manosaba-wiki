export type RecipeSourceType =
  | 'minecraft:crafting_shaped'
  | 'minecraft:crafting_shapeless'
  | 'crafting_shaped'
  | 'crafting_shapeless'
  | 'crafting_transmute'
  | 'campfire_cooking';

export interface RecipeIngredientEvidence {
  baseItemId?: string,
  itemId?: string,
  tagId?: string,
}

export interface RecipeEvidence {
  id: string,
  sourcePath: string,
  sourceStem: string,
  sourceDir: string,
  namespace: string,
  recipeType: RecipeSourceType,
  pattern?: string[],
  key?: Record<string, RecipeIngredientEvidence>,
  ingredients?: RecipeIngredientEvidence[],
  input?: RecipeIngredientEvidence,
  material?: RecipeIngredientEvidence,
  ingredient?: RecipeIngredientEvidence,
  resultBaseItemId?: string,
  resultCount?: number,
  resultItemModel?: string,
  resultCustomNameRaw?: string,
  resultCustomDataRaw?: string,
  warnings: string[],
}
