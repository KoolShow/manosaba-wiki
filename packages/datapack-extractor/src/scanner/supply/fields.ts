
const getValue = <T = unknown>(raw: Record<string, unknown>, key: string): T | undefined => {
  return raw[`minecraft:${key}`] as T ?? raw[key] as T ?? (void 0);
};

export const extractKnownFields = (raw: Record<string, unknown>) => {
  let customNameRaw: object | string | undefined = getValue(raw, 'custom_name') ?? getValue<string>(raw, 'item_name');
  if (typeof customNameRaw !== 'string')
    customNameRaw = JSON.stringify(customNameRaw);

  return {
    itemModel: getValue<string>(raw, 'item_model'),
    customNameRaw,
    loreRaw: getValue<Array<unknown>>(raw, 'lore'),
    customDataRaw: getValue<object>(raw, 'custom_data'),
    maxStackSize: getValue<number>(raw, 'max_stack_size'),
    maxDamage: getValue<number>(raw, 'max_damage'),
    damage: getValue<number>(raw, 'damage'),
  };
};
