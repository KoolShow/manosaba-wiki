import { readFile } from 'node:fs/promises';
import { normalizeBaseItemId } from '../../linker/normalizer';
import { inferNamespace, inferSourceDir, inferSourceStem } from '../../utils/fs';
import { extractKnownFields } from '../item/fields';
import { scanRecipeFiles } from './files';
import type { RecipeEvidence, RecipeIngredientEvidence, RecipeSourceType } from './types';

const SUPPORTED_RECIPE_TYPES: RecipeSourceType[] = [
  'minecraft:crafting_shaped',
  'minecraft:crafting_shapeless',
];

const parseIngredient = (value: unknown): RecipeIngredientEvidence | undefined => {
  if (typeof value === 'string') {
    return { baseItemId: normalizeBaseItemId(value) ?? value };
  }

  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const itemId = Reflect.get(value, 'item');
  const tagId = Reflect.get(value, 'tag');

  if (typeof itemId === 'string') {
    return { baseItemId: normalizeBaseItemId(itemId) ?? itemId };
  }

  if (typeof tagId === 'string') {
    return { tagId };
  }

  return undefined;
};

const toStringRecord = (value: unknown): Record<string, string> | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      typeof entryValue === 'string' ? entryValue : JSON.stringify(entryValue),
    ])
  );
};

const parseResultFields = (result: unknown) => {
  if (!result || typeof result !== 'object') {
    return { warnings: ['Recipe result is missing or invalid'] };
  }

  const baseItemId = Reflect.get(result, 'id');
  const count = Reflect.get(result, 'count');
  const components = Reflect.get(result, 'components');
  const known = extractKnownFields(toStringRecord(components) ?? {});

  return {
    resultBaseItemId: typeof baseItemId === 'string' ? baseItemId : undefined,
    resultCount: typeof count === 'number' ? count : undefined,
    resultItemModel: known.itemModel,
    resultCustomNameRaw: known.customNameRaw,
    resultCustomDataRaw: known.customDataRaw,
    warnings: typeof baseItemId === 'string' ? [] : ['Recipe result is missing item id'],
  };
};

export const parseRecipeFile = async (filePath: string): Promise<RecipeEvidence | undefined> => {
  const content = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(content) as Record<string, unknown>;
  const recipeType = parsed.type;

  if (typeof recipeType !== 'string' || !SUPPORTED_RECIPE_TYPES.includes(recipeType as RecipeSourceType)) {
    return undefined;
  }

  const namespace = inferNamespace(filePath);
  const sourceStem = inferSourceStem(filePath);
  const id = `${namespace}:${sourceStem}`;
  const resultFields = parseResultFields(parsed.result);
  const warnings = [...resultFields.warnings];

  const evidence: RecipeEvidence = {
    id,
    sourcePath: filePath,
    sourceStem,
    sourceDir: inferSourceDir(filePath),
    namespace,
    recipeType: recipeType as RecipeSourceType,
    warnings,
    resultBaseItemId: resultFields.resultBaseItemId,
    resultCount: resultFields.resultCount,
    resultItemModel: resultFields.resultItemModel,
    resultCustomNameRaw: resultFields.resultCustomNameRaw,
    resultCustomDataRaw: resultFields.resultCustomDataRaw,
  };

  if (recipeType === 'minecraft:crafting_shaped') {
    evidence.pattern = Array.isArray(parsed.pattern)
      ? parsed.pattern.filter((entry): entry is string => typeof entry === 'string')
      : undefined;

    const rawKey = parsed.key;
    if (rawKey && typeof rawKey === 'object') {
      evidence.key = Object.fromEntries(
        Object.entries(rawKey)
          .map(([symbol, ingredient]) => [symbol, parseIngredient(ingredient)])
          .filter((entry): entry is [string, RecipeIngredientEvidence] => Boolean(entry[1]))
      );
    }
  }

  if (recipeType === 'minecraft:crafting_shapeless') {
    evidence.ingredients = Array.isArray(parsed.ingredients)
      ? parsed.ingredients
        .map(parseIngredient)
        .filter((entry): entry is RecipeIngredientEvidence => Boolean(entry))
      : undefined;
  }

  return evidence;
};

export const scanRecipes = async (): Promise<RecipeEvidence[]> => {
  const files = await scanRecipeFiles();
  const recipes: RecipeEvidence[] = [];

  for (const filePath of files) {
    const recipe = await parseRecipeFile(filePath);
    if (recipe) {
      recipes.push(recipe);
    }
  }

  return recipes;
};
