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

const buildLocationSource = (
  snapshot: SupplyLocationSnapshot,
  stack: ContainerItemStack,
  probability: number,
): LocationSource => {
  return {
    type: 'location',
    name: snapshot.location.name,
    count: stack.count,
    probability,
    implementation: 'manual',
  };
};

const buildLocationSourceKey = (source: LocationSource): string => {
  return [
    source.name,
    source.count ?? '',
    source.implementation ?? '',
    source.lootTableId ?? '',
  ].join('|');
};

export const buildLocationSourcesForCandidate = (
  candidate: LinkedItemCandidate,
  supplies: SupplyLocationSnapshot[],
): ItemSource[] => {
  const aggregated = new Map<string, LocationSource>();

  for (const supply of supplies) {
    for (const item of supply.items) {
      if (matchesCandidate(candidate, item.stack)) {
        const source = buildLocationSource(supply, item.stack, item.probability);
        const key = buildLocationSourceKey(source);
        const existing = aggregated.get(key);

        if (existing) {
          aggregated.set(key, {
            ...existing,
            probability: (existing.probability ?? 0) + (source.probability ?? 0),
          });
          continue;
        }

        aggregated.set(key, source);
      }
    }
  }

  return Array.from(aggregated.values());
};
