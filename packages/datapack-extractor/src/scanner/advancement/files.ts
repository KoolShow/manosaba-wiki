import { glob } from 'tinyglobby';

export const scanAdvancements = async () => {
  return glob([
    'data/**/advancement/**/*.json',
  ], {
    cwd: DATAPACK_ROOT,
    absolute: true,
  });
};
