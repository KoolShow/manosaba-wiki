export type RecipeSourceType = 'minecraft:crafting_shaped' | 'minecraft:crafting_shapeless';

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
  resultBaseItemId?: string,
  resultCount?: number,
  resultItemModel?: string,
  resultCustomNameRaw?: string,
  resultCustomDataRaw?: string,
  warnings: string[],
}
