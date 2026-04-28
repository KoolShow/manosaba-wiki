import { glob } from 'tinyglobby';

export const scanRecipeFiles = async () => {
  return glob([
    'data/**/recipe/*.json',
    '!data/minecraft/recipe/*.json',
  ], {
    cwd: DATAPACK_ROOT,
    absolute: true,
  });
};
