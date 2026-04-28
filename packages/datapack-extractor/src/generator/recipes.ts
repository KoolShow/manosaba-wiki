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

const normalizeRecipeKind = (recipeType: RecipeEvidence['recipeType']): Recipe['kind'] => {
  if (recipeType === 'minecraft:crafting_shaped' || recipeType === 'crafting_shaped') return 'crafting_shaped';
  if (recipeType === 'minecraft:crafting_shapeless' || recipeType === 'crafting_shapeless') return 'crafting_shapeless';
  if (recipeType === 'crafting_transmute') return 'crafting_transmute';
  return 'campfire_cooking';
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
    kind: normalizeRecipeKind(recipe.recipeType),
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
    input: normalizeIngredient(recipe.input),
    material: normalizeIngredient(recipe.material),
    ingredient: normalizeIngredient(recipe.ingredient),
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
    input: recipe.input
      ? {
          baseItemId: normalizeBaseItemId((recipe.input as { baseItemId?: string; itemId?: string }).baseItemId ?? recipe.input.itemId),
          ...recipe.input,
          itemId: buildIngredientItemId(recipe.input, candidates),
        }
      : undefined,
    material: recipe.material
      ? {
          baseItemId: normalizeBaseItemId((recipe.material as { baseItemId?: string; itemId?: string }).baseItemId ?? recipe.material.itemId),
          ...recipe.material,
          itemId: buildIngredientItemId(recipe.material, candidates),
        }
      : undefined,
    ingredient: recipe.ingredient
      ? {
          baseItemId: normalizeBaseItemId((recipe.ingredient as { baseItemId?: string; itemId?: string }).baseItemId ?? recipe.ingredient.itemId),
          ...recipe.ingredient,
          itemId: buildIngredientItemId(recipe.ingredient, candidates),
        }
      : undefined,
  }));
};
