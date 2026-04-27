import path from 'node:path';

export const inferNamespace = (filePath: string) => {
  const parts = filePath.split(path.sep);
  const dataIndex = parts.lastIndexOf('data');
  return dataIndex !== -1 ? parts[dataIndex + 1] : 'unknown';
};

export const inferSourceStem = (filePath: string) => {
  return path.parse(filePath).name;
};

export const inferSourceDir = (filePath: string) => {
  return path.parse(filePath).dir.replace(`${DATAPACK_ROOT}/data/`, '');
};
