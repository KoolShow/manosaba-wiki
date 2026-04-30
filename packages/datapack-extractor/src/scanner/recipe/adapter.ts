import type { ItemDefinitionEvidence } from '../item/types';
import type { RecipeEvidence } from './types';

export const adaptRecipeResultToItemDefinition = (
  recipe: RecipeEvidence,
): ItemDefinitionEvidence => {
  return {
    kind: 'item_definition',
    definitionSourceType: 'recipe',
    recipeId: recipe.id,
    sourcePath: recipe.sourcePath,
    sourceStem: recipe.sourceStem,
    sourceDir: recipe.sourceDir,
    namespace: 'recipe',
    commandType: 'give',
    baseItemId: recipe.resultBaseItemId,
    count: recipe.resultCount,
    rawComponents: undefined,
    itemModel: recipe.resultItemModel,
    itemNameRaw: undefined,
    customNameRaw: recipe.resultCustomNameRaw,
    loreRaw: undefined,
    customDataRaw: recipe.resultCustomDataRaw,
    warnings: recipe.warnings,
  };
};

export const adaptRecipeResultsToItemDefinitions = (
  recipes: RecipeEvidence[],
): ItemDefinitionEvidence[] => {
  return recipes.map(adaptRecipeResultToItemDefinition);
};
