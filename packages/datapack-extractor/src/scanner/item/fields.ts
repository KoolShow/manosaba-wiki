
const unquoteString = (value: string): string | undefined => {
  const m = value.match(/^"(.*)"$/s);
  return m ? m[1] : undefined;
};

const parseInteger = (value?: string): number | undefined => {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const extractKnownFields = (raw: Record<string, string>) => {
  return {
    itemModel: raw.item_model ? unquoteString(raw.item_model) ?? raw.item_model : undefined,
    customNameRaw: raw.custom_name,
    loreRaw: raw.lore,
    customDataRaw: raw.custom_data ?? raw['minecraft:custom_data'],
    maxStackSize: parseInteger(raw.max_stack_size),
    maxDamage: parseInteger(raw.max_damage),
    damage: parseInteger(raw.damage),
  };
};
