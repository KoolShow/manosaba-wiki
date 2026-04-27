import { glob } from 'tinyglobby';

export const scanItemDefinitionFunctions = async () => {
  return glob([
    // 'data/**/function/give/**/*.mcfunction',
    // 'data/**/function/regive/**/*.mcfunction',
    'data/**/*.mcfunction', // TODO: Not items but magics?
  ], {
    cwd: DATAPACK_ROOT,
    absolute: true,
  });
};
