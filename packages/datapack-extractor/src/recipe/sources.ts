import type { ItemSource, Recipe } from '@manosaba/types';
import type { LinkedItemCandidate } from '../linker/types';

export const buildCraftingSourcesForCandidate = (
  candidate: LinkedItemCandidate,
  recipes: Recipe[],
): ItemSource[] => {
  return recipes
    .filter(recipe => recipe.linkedItemId === candidate.id)
    .map((recipe) => ({
      type: 'crafting',
      recipeId: recipe.id,
    }));
};
