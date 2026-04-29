
const getValue = <T = unknown>(raw: Record<string, unknown>, key: string): T | undefined => {
  return raw[`minecraft:${key}`] as T ?? raw[key] as T ?? (void 0);
};

export const extractKnownFields = (raw: Record<string, unknown>) => {
  return {
    itemName: getValue<string>(raw, 'item_name'),
    itemModel: getValue<string>(raw, 'item_model'),
    customName: getValue<object>(raw, 'custom_name'),
    lore: getValue<Array<unknown>>(raw, 'lore'),
    customData: getValue<object>(raw, 'custom_data'),
    maxStackSize: getValue<number>(raw, 'max_stack_size'),
    maxDamage: getValue<number>(raw, 'max_damage'),
    damage: getValue<number>(raw, 'damage'),
  };
};
