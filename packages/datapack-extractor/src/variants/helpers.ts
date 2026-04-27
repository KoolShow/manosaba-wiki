import { normalizeCustomData, normalizeCustomName } from '../linker/normalizer';
import type { ItemDefinitionEvidence } from '../scanner/item/types';
import type { ItemTriggerEvidence } from '../scanner/advancement/types';

export const getDefinitionName = (definition: ItemDefinitionEvidence): string | undefined => {
  return normalizeCustomName(definition.customNameRaw);
};

export const getTriggerName = (trigger: ItemTriggerEvidence): string | undefined => {
  return normalizeCustomName(trigger.matchedCustomNameRaw);
};

export const getDefinitionData = (definition: ItemDefinitionEvidence): string | undefined => {
  return normalizeCustomData(definition.customDataRaw);
};

export const getTriggerData = (trigger: ItemTriggerEvidence): string | undefined => {
  return normalizeCustomData(trigger.matchedCustomDataRaw);
};

export const unique = <T>(values: T[]): T[] => {
  return Array.from(new Set(values));
};

export const compact = <T>(values: Array<T | undefined>): T[] => {
  return values.filter((value): value is T => value !== undefined);
};

export const buildVariantId = (candidateId: string, suffix: string): string => {
  return `${candidateId}:${suffix}`;
};

export const pickBaseDefinitionIndexes = (
  totalDefinitions: number,
  usedDefinitionIndexes: number[]
): number[] => {
  const used = new Set(usedDefinitionIndexes);
  const baseIndexes = Array.from({ length: totalDefinitions }, (_, index) => index)
    .filter(index => !used.has(index));

  if (baseIndexes.length > 0) {
    return baseIndexes;
  }

  return totalDefinitions > 0 ? [0] : [];
};
