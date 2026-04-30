import path from 'node:path';
import { normalizeBaseItemId, normalizeCustomData } from '../linker/normalizer';
import type { ItemTriggerEvidence } from '../scanner/advancement/types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';
import { getDefinitionDisplayName } from '../scanner/item/name';

const EXCLUDED_PATH_SEGMENTS = [
  `${path.sep}function${path.sep}lobby${path.sep}`,
  `${path.sep}function${path.sep}minigames${path.sep}`,
  `${path.sep}function${path.sep}test${path.sep}`,
  `${path.sep}function${path.sep}tutorial${path.sep}`,
  `${path.sep}advancement${path.sep}lobby${path.sep}`,
  `${path.sep}advancement${path.sep}minigames${path.sep}`,
  `${path.sep}advancement${path.sep}test${path.sep}`,
  `${path.sep}advancement${path.sep}tutorial${path.sep}`,
];

const EXCLUDED_PATH_TOKENS = [
  'placeholder',
  'debug',
  'dummy',
  'spect',
  'ready',
  'unready',
  'start',
  'unstart',
];

const EXCLUDED_SOURCE_SEGMENTS = [
  'lobby',
  'minigames',
  'test',
  'tutorial',
];

const isPlaceholderBaseItem = (baseItemId?: string): boolean => {
  const normalized = normalizeBaseItemId(baseItemId);
  return normalized === 'minecraft:air';
};

const SUPPLY_WEAK_IDENTITY_BASE_WHITELIST = new Set([
  'minecraft:writable_book',
]);

const hasStrongDefinitionIdentity = (definition: ItemDefinitionEvidence): boolean => {
  return Boolean(
    definition.itemModel ||
    getDefinitionDisplayName(definition)
  );
};

const shouldIncludeSupplyDefinition = (definition: ItemDefinitionEvidence): boolean => {
  if (hasStrongDefinitionIdentity(definition)) {
    return true;
  }

  const baseItemId = normalizeBaseItemId(definition.baseItemId);
  if (!baseItemId) {
    return false;
  }

  return SUPPLY_WEAK_IDENTITY_BASE_WHITELIST.has(baseItemId);
};

const shouldIncludeRecipeDefinition = (definition: ItemDefinitionEvidence): boolean => {
  return hasStrongDefinitionIdentity(definition);
}

const hasExcludedPathSegment = (sourcePath: string): boolean => {
  return EXCLUDED_PATH_SEGMENTS.some(segment => sourcePath.includes(segment));
};

const hasExcludedPathToken = (sourcePath: string): boolean => {
  const normalized = sourcePath.toLowerCase();
  return EXCLUDED_PATH_TOKENS.some(token => normalized.includes(token));
};

const hasExcludedSourceSegment = (sourceDir: string): boolean => {
  const normalized = sourceDir.toLowerCase();
  return EXCLUDED_SOURCE_SEGMENTS.some(segment => normalized.includes(segment));
};

const shouldIncludeDefinition = (definition: ItemDefinitionEvidence): boolean => {
  if (isPlaceholderBaseItem(definition.baseItemId)) {
    return false;
  }

  if (definition.definitionSourceType === 'supply') {
    return shouldIncludeSupplyDefinition(definition);
  }

  if (definition.definitionSourceType === 'recipe') {
    return shouldIncludeRecipeDefinition(definition);
  }

  if (hasExcludedPathSegment(definition.sourcePath)) {
    return false;
  }

  if (hasExcludedPathToken(definition.sourcePath)) {
    return false;
  }

  if (hasExcludedSourceSegment(definition.sourceDir)) {
    return false;
  }

  return true;
};

const shouldIncludeTrigger = (trigger: ItemTriggerEvidence): boolean => {
  if (isPlaceholderBaseItem(trigger.matchedBaseItemId)) {
    return false;
  }

  if (hasExcludedPathSegment(trigger.sourcePath)) {
    return false;
  }

  if (hasExcludedPathToken(trigger.sourcePath)) {
    return false;
  }

  if (hasExcludedSourceSegment(trigger.sourceDir)) {
    return false;
  }

  if (trigger.rewardFunction) {
    const rewardFunction = trigger.rewardFunction.toLowerCase();
    if (EXCLUDED_SOURCE_SEGMENTS.some(segment => rewardFunction.includes(segment))) {
      return false;
    }
  }

  return true;
};

export const filterIngameItemDefinitions = (
  definitions: ItemDefinitionEvidence[],
): ItemDefinitionEvidence[] => {
  return definitions.filter(shouldIncludeDefinition);
};

export const filterIngameItemTriggers = (
  triggers: ItemTriggerEvidence[],
): ItemTriggerEvidence[] => {
  return triggers.filter(shouldIncludeTrigger);
};
