import { normalizeBaseItemId, normalizeCustomData, normalizeCustomName } from '../linker/normalizer';
import type { ItemSource, LocationSource } from '@manosaba/types';
import type { LinkedItemCandidate } from '../linker/types';
import type { ContainerItemStack, SupplyLocationSnapshot } from './types';

const getStackItemModel = (stack: ContainerItemStack): string | undefined => {
  const components = stack.components as Record<string, unknown> | undefined;
  const value = components?.['minecraft:item_model'];
  return typeof value === 'string' ? value : undefined;
};

const getStackCustomName = (stack: ContainerItemStack): string | undefined => {
  const components = stack.components as Record<string, unknown> | undefined;
  const value = components?.['minecraft:custom_name'];
  return value ? normalizeCustomName(JSON.stringify(value)) : undefined;
};

const getStackCustomData = (stack: ContainerItemStack): string | undefined => {
  const components = stack.components as Record<string, unknown> | undefined;
  const value = components?.['minecraft:custom_data'];
  return value ? normalizeCustomData(JSON.stringify(value)) : undefined;
};

const matchesCandidate = (candidate: LinkedItemCandidate, stack: ContainerItemStack): boolean => {
  const stackBaseItemId = normalizeBaseItemId(stack.id);
  const stackItemModel = getStackItemModel(stack);
  const stackCustomName = getStackCustomName(stack);
  const stackCustomData = getStackCustomData(stack);

  return candidate.definitions.some((definition) => {
    const definitionBaseItemId = normalizeBaseItemId(definition.baseItemId);
    const definitionItemModel = definition.itemModel;
    const definitionCustomName = normalizeCustomName(definition.customNameRaw);
    const definitionCustomData = normalizeCustomData(definition.customDataRaw);

    if (definitionItemModel && stackItemModel && definitionItemModel === stackItemModel) {
      return true;
    }

    if (
      definitionBaseItemId &&
      stackBaseItemId &&
      definitionCustomData &&
      stackCustomData &&
      definitionBaseItemId === stackBaseItemId &&
      definitionCustomData === stackCustomData
    ) {
      return true;
    }

    if (
      definitionCustomName &&
      stackCustomName &&
      definitionCustomName === stackCustomName
    ) {
      return true;
    }

    return false;
  });
};

const buildLocationSource = (snapshot: SupplyLocationSnapshot, probability: number): LocationSource => {
  return {
    type: 'location',
    name: snapshot.location.name,
    probability,
    implementation: 'manual',
  };
};

export const buildLocationSourcesForCandidate = (
  candidate: LinkedItemCandidate,
  supplies: SupplyLocationSnapshot[],
): ItemSource[] => {
  const sources: ItemSource[] = [];

  for (const supply of supplies) {
    for (const item of supply.items) {
      if (matchesCandidate(candidate, item.stack)) {
        sources.push(buildLocationSource(supply, item.probability));
      }
    }
  }

  return sources;
};
