import * as nbt from 'prismarine-nbt';
import type { BlockCoordinate, ContainerItemStack, ContainerSnapshot } from './types';

type NbtCompound = Record<string, unknown>;

const asObject = (value: unknown): NbtCompound | undefined => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as NbtCompound
    : undefined;
};

const asArray = (value: unknown): unknown[] | undefined => {
  return Array.isArray(value) ? value : undefined;
};

const asNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' ? value : undefined;
};

const toContainerItem = (item: unknown): ContainerItemStack | undefined => {
  const record = asObject(item);
  if (!record) return undefined;

  const slot = asNumber(record.Slot);
  return {
    slot: slot ?? -1,
    id: typeof record.id === 'string' ? record.id : undefined,
    count: asNumber(record.count),
    components: record.components,
  };
};

const getBlockEntities = (chunk: NbtCompound): unknown[] => {
  const root = asObject(chunk.parsed ?? chunk);
  const simplified = root ?? chunk;

  return asArray(simplified.block_entities)
    ?? asArray(asObject(simplified.Level)?.TileEntities)
    ?? [];
};

export const readBlockEntitySnapshot = async (
  chunkBuffer: Buffer,
  coordinate: BlockCoordinate,
): Promise<ContainerSnapshot | undefined> => {
  const parsed = await nbt.parse(chunkBuffer);
  const simplified = nbt.simplify(parsed.parsed);
  const blockEntities = getBlockEntities(simplified as NbtCompound);

  const matched = blockEntities
    .map(entry => asObject(entry))
    .find(entry => entry
      && asNumber(entry.x) === coordinate.x
      && asNumber(entry.y) === coordinate.y
      && asNumber(entry.z) === coordinate.z);

  if (!matched) {
    return undefined;
  }

  const items = (asArray(matched.Items) ?? [])
    .map(toContainerItem)
    .filter((item): item is ContainerItemStack => Boolean(item));

  return {
    coordinate,
    id: typeof matched.id === 'string' ? matched.id : undefined,
    customName: matched.CustomName,
    items,
  };
};
