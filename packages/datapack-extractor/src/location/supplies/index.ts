import { scanSupplyTypeFiles } from './files';
import { parseSupplyTypeFile } from './parse';
import { buildSupplyLocationSnapshot } from './probability';
import { readContainerAt } from '../index';
import type { ContainerItemStack, ContainerSnapshot, SupplyLocationSnapshot } from '../types';

const SUPPLY_X = 1029;
const STORAGE_Y = 45;
const REPLACEMENT_Y = 44;

const getItemNameMarker = (stack?: ContainerItemStack): string | undefined => {
  const components = stack?.components;
  if (!components || typeof components !== 'object') {
    return undefined;
  }

  const record = components as Record<string, unknown>;
  const value = record['minecraft:item_name'] ?? record.item_name;
  return typeof value === 'string' ? value : undefined;
};

const isUniquePlaceholder = (stack?: ContainerItemStack): boolean => {
  return getItemNameMarker(stack) === 'unique';
};

const isReplacementPlaceholder = (stack?: ContainerItemStack): boolean => {
  return getItemNameMarker(stack) === 'placeholder';
};

const rebuildLogicalSupplyContainer = (
  storageContainer: ContainerSnapshot,
  replacementContainer?: ContainerSnapshot,
): ContainerSnapshot => {
  const replacementBySlot = new Map(
    (replacementContainer?.items ?? []).map((item) => [item.slot, item])
  );

  const items = storageContainer.items.flatMap((stack) => {
    if (!isUniquePlaceholder(stack)) {
      return [stack];
    }

    const replacement = replacementBySlot.get(stack.slot);
    if (!replacement || isReplacementPlaceholder(replacement)) {
      return [];
    }

    return [{
      ...replacement,
      slot: stack.slot,
    }];
  });

  return {
    ...storageContainer,
    coordinate: {
      ...storageContainer.coordinate,
      y: STORAGE_Y,
    },
    items,
  };
};

export const readSupplyLocations = async (worldPath: string): Promise<SupplyLocationSnapshot[]> => {
  const files = await scanSupplyTypeFiles();
  const configs = (await Promise.all(files.map(file => parseSupplyTypeFile(file))))
    .filter((config): config is NonNullable<typeof config> => Boolean(config));

  const snapshots = await Promise.all(configs.map(async (config) => {
    const storageContainer = await readContainerAt(worldPath, {
      x: SUPPLY_X,
      y: STORAGE_Y,
      z: config.posZ,
    });

    if (!storageContainer) {
      return undefined;
    }

    const replacementContainer = await readContainerAt(worldPath, {
      x: SUPPLY_X,
      y: REPLACEMENT_Y,
      z: config.posZ,
    });

    const logicalContainer = rebuildLogicalSupplyContainer(storageContainer, replacementContainer);

    return buildSupplyLocationSnapshot(config, logicalContainer);
  }));

  return snapshots.filter((snapshot): snapshot is SupplyLocationSnapshot => Boolean(snapshot));
};
