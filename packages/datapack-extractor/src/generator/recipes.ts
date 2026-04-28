import { buildDefinitionFingerprint } from '../linker/fingerprint';
import { normalizeBaseItemId, normalizeCustomData, normalizeCustomName } from '../linker/normalizer';
import type { LinkedItemCandidate } from '../linker/types';
import type { Recipe } from '@manosaba/types';
import type { RecipeEvidence } from '../scanner/recipe/types';

const normalizeIngredient = (ingredient?: { itemId?: string; tagId?: string }) => {
  if (!ingredient) {
    return undefined;
  }

  return {
    baseItemId: normalizeBaseItemId((ingredient as { baseItemId?: string }).baseItemId ?? ingredient.itemId) ?? (ingredient as { baseItemId?: string }).baseItemId ?? ingredient.itemId,
    tagId: ingredient.tagId,
  };
};

const buildIngredientItemId = (
  ingredient: { baseItemId?: string; itemId?: string; tagId?: string } | undefined,
  candidates: LinkedItemCandidate[],
): string | undefined => {
  if (!ingredient) return undefined;

  const baseItemId = normalizeBaseItemId(ingredient.baseItemId ?? ingredient.itemId);
  if (!baseItemId) {
    return undefined;
  }

  const matched = candidates.find(candidate =>
    candidate.definitions.some(definition => normalizeBaseItemId(definition.baseItemId) === baseItemId)
  );

  return matched?.id;
};

const matchesCandidate = (candidate: LinkedItemCandidate, recipe: RecipeEvidence): boolean => {
  const recipeBaseItemId = normalizeBaseItemId(recipe.resultBaseItemId);
  const recipeCustomName = normalizeCustomName(recipe.resultCustomNameRaw);
  const recipeCustomData = normalizeCustomData(recipe.resultCustomDataRaw);
  const recipeItemModel = recipe.resultItemModel?.trim();

  return candidate.definitions.some((definition) => {
    const { fingerprint } = buildDefinitionFingerprint(definition);

    if (fingerprint.itemModel && recipeItemModel && fingerprint.itemModel === recipeItemModel) {
      return true;
    }

    if (
      fingerprint.baseItemId &&
      recipeBaseItemId &&
      fingerprint.customDataNormalized &&
      recipeCustomData &&
      fingerprint.baseItemId === recipeBaseItemId &&
      fingerprint.customDataNormalized === recipeCustomData
    ) {
      return true;
    }

    if (fingerprint.customNameNormalized && recipeCustomName && fingerprint.customNameNormalized === recipeCustomName) {
      return true;
    }

    return false;
  });
};

const buildLinkedItemId = (
  recipe: RecipeEvidence,
  candidates: LinkedItemCandidate[],
): string | undefined => {
  return candidates.find((candidate) => matchesCandidate(candidate, recipe))?.id;
};

export const generateRecipes = (
  recipes: RecipeEvidence[],
  candidates: LinkedItemCandidate[],
): Recipe[] => {
  return recipes.map((recipe) => ({
    id: recipe.id,
    kind: recipe.recipeType === 'minecraft:crafting_shaped' ? 'crafting_shaped' : 'crafting_shapeless',
    pattern: recipe.pattern,
    key: recipe.key
      ? Object.fromEntries(
        Object.entries(recipe.key)
          .map(([symbol, ingredient]) => [symbol, normalizeIngredient(ingredient)])
          .filter((entry): entry is [string, NonNullable<ReturnType<typeof normalizeIngredient>>] => Boolean(entry[1]))
      )
      : undefined,
    ingredients: recipe.ingredients
      ?.map(ingredient => normalizeIngredient(ingredient))
      .filter((entry): entry is NonNullable<ReturnType<typeof normalizeIngredient>> => Boolean(entry)),
    result: {
      baseItemId: normalizeBaseItemId(recipe.resultBaseItemId),
      itemModel: recipe.resultItemModel,
      customName: normalizeCustomName(recipe.resultCustomNameRaw),
      customData: normalizeCustomData(recipe.resultCustomDataRaw),
      count: recipe.resultCount,
    },
    linkedItemId: buildLinkedItemId(recipe, candidates),
    warnings: recipe.warnings.length > 0 ? recipe.warnings : undefined,
  })).map((recipe) => ({
    ...recipe,
    key: recipe.key
      ? Object.fromEntries(
        Object.entries(recipe.key)
          .map(([symbol, ingredient]) => [
            symbol,
            ingredient && typeof ingredient === 'object'
              ? {
                  baseItemId: normalizeBaseItemId((ingredient as { baseItemId?: string; itemId?: string }).baseItemId ?? (ingredient as { itemId?: string }).itemId),
                  ...ingredient,
                  itemId: buildIngredientItemId(ingredient, candidates),
                }
              : ingredient,
          ])
          .filter((entry): entry is [string, NonNullable<(typeof recipe.key)[string]>] => Boolean(entry[1]))
      )
      : undefined,
    ingredients: recipe.ingredients
      ? recipe.ingredients.map(ingredient => ({
          baseItemId: normalizeBaseItemId((ingredient as { baseItemId?: string; itemId?: string }).baseItemId ?? (ingredient as { itemId?: string }).itemId),
          ...ingredient,
          itemId: buildIngredientItemId(ingredient, candidates),
        }))
      : undefined,
  }));
};
