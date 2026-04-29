import { glob } from 'tinyglobby'

export const scanSupplyDefinitionFiles = async () => {
  return await glob([
    'data/supplies/function/type/*/random.mcfunction'
  ], {
    cwd: DATAPACK_ROOT,
    absolute: true,
  });
};
