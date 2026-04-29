import type { ItemDefinitionEvidence } from '../item/types';
import type { SupplyDefinitionEvidence } from './types';

const stringifyMaybe = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === 'string' ? value : JSON.stringify(value);
};

export const adaptSupplyDefinitionToItemDefinition = (
  definition: SupplyDefinitionEvidence,
): ItemDefinitionEvidence => {
  return {
    kind: 'item_definition',
    definitionSourceType: 'mcfunction',
    sourcePath: definition.sourcePath,
    sourceStem: definition.sourceStem,
    sourceDir: definition.sourceDir,
    namespace: definition.namespace,
    commandType: 'give',
    slot: definition.slot,
    baseItemId: definition.baseItemId,
    count: definition.count,
    rawComponents: definition.rawComponents,
    itemModel: definition.itemModel,
    customNameRaw: stringifyMaybe(definition.customName),
    loreRaw: stringifyMaybe(definition.lore),
    customDataRaw: stringifyMaybe(definition.customData),
    maxStackSize: definition.maxStackSize,
    maxDamage: definition.maxDamage,
    damage: definition.damage,
    warnings: definition.warnings,
  };
};

export const adaptSupplyDefinitionsToItemDefinitions = (
  definitions: SupplyDefinitionEvidence[],
): ItemDefinitionEvidence[] => {
  return definitions.map(adaptSupplyDefinitionToItemDefinition);
};
