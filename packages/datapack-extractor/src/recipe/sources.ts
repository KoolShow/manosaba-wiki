import type { ItemSource, Recipe } from '@manosaba/types';
import type { LinkedItemCandidate } from '../linker/types';

export const buildCraftingSourcesForCandidate = (
  candidate: LinkedItemCandidate,
  recipes: Recipe[],
): ItemSource[] => {
  const recipeSources = Array.from(new Set(
    candidate.definitions
      .filter(definition => definition.definitionSourceType === 'recipe' && definition.recipeId)
      .map(definition => definition.recipeId as string)
  )).map((recipeId) => ({
    type: 'crafting' as const,
    recipeId,
  }));

  if (recipeSources.length > 0) {
    return recipeSources;
  }

  return recipes
    .filter(recipe => recipe.linkedItemId === candidate.id)
    .map((recipe) => ({
      type: 'crafting',
      recipeId: recipe.id,
    }));
};
