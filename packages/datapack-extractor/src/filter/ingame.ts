import path from 'node:path';
import { normalizeBaseItemId } from '../linker/normalizer';
import type { ItemTriggerEvidence } from '../scanner/advancement/types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';

const EXCLUDED_PATH_SEGMENTS = [
  `${path.sep}function${path.sep}lobby${path.sep}`,
  `${path.sep}function${path.sep}test${path.sep}`,
  `${path.sep}function${path.sep}tutorial${path.sep}`,
  `${path.sep}advancement${path.sep}lobby${path.sep}`,
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
  'test',
  'tutorial',
];

const isPlaceholderBaseItem = (baseItemId?: string): boolean => {
  const normalized = normalizeBaseItemId(baseItemId);
  return normalized === 'minecraft:air';
};

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
