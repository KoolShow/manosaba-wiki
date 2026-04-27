import type { AdvancementTriggerType } from '../types';

export const readObject = (value: unknown): Record<string, unknown> | undefined => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
};

export const readString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

export const readFirstString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }
  return undefined;
};

export const readStringOrObject = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' || (value instanceof Array)) return JSON.stringify(value);
  return (void 0);
};

export const normalizeTriggerType = (rawTrigger?: string): AdvancementTriggerType => {
  if (!rawTrigger) return 'unknown';

  const normalized = rawTrigger.startsWith('minecraft:')
    ? rawTrigger.slice('minecraft:'.length)
    : rawTrigger;

  switch (normalized) {
    case 'consume_item':
    case 'using_item':
    case 'inventory_changed':
    case 'player_hurt_entity':
    case 'entity_hurt_player':
    case 'item_used_on_block':
      return normalized;
    default:
      return 'unknown';
  }
};

export const extractItemMatchFromCondition = (condition: unknown) => {
  const obj = readObject(condition);
  if (!obj) return {};

  const components = readObject(obj.components);

  return {
    matchedBaseItemId: readFirstString(obj.items),
    matchedItemModel: readString(
      components?.item_model ?? components?.['minecraft:item_model']
    ),
    matchedCustomDataRaw: readString(
      components?.custom_data ?? components?.['minecraft:custom_data']
    ),
    matchedCustomNameRaw: readStringOrObject(
      components?.custom_name ?? components?.['minecraft:custom_name']
    ),
  };
};

export const hasAnyItemIdentity = (value: {
  matchedBaseItemId?: string;
  matchedItemModel?: string;
  matchedCustomDataRaw?: string;
  matchedCustomNameRaw?: string;
}) => {
  return Boolean(
    value.matchedBaseItemId ||
    value.matchedItemModel ||
    value.matchedCustomDataRaw ||
    value.matchedCustomNameRaw
  );
};
