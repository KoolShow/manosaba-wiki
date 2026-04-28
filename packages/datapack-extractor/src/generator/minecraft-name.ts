import { readFileSync } from 'node:fs';
import path from 'node:path';
import { normalizeBaseItemId } from '../linker/normalizer';

const LANGUAGE_FILE_PATH = path.resolve(
  process.cwd(),
  'assets/minecraft-lang/1.21.10/zh_cn.json',
);

const loadMinecraftLanguageMap = (): Record<string, string> => {
  try {
    const content = readFileSync(LANGUAGE_FILE_PATH, 'utf8');
    return JSON.parse(content) as Record<string, string>;
  } catch {
    return {};
  }
};

const MINECRAFT_LANGUAGE_MAP = loadMinecraftLanguageMap();

const buildCandidateTranslationKeys = (baseItemId?: string): string[] => {
  const normalized = normalizeBaseItemId(baseItemId);
  if (!normalized) {
    return [];
  }

  const [namespace, pathPart] = normalized.split(':');
  if (!namespace || !pathPart) {
    return [];
  }

  return [
    `item.${namespace}.${pathPart}`,
    `block.${namespace}.${pathPart}`,
  ];
};

export const getMinecraftLocalizedItemName = (baseItemId?: string): string | undefined => {
  for (const key of buildCandidateTranslationKeys(baseItemId)) {
    const name = MINECRAFT_LANGUAGE_MAP[key];
    if (name) {
      return name;
    }
  }

  return undefined;
};
