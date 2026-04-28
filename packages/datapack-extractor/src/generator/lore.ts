import { normalizeTextComponentLike } from '../utils/snbt';

export const splitTopLevelLoreEntries = (input: string): string[] => {
  const content = input.slice(1, -1);
  const entries: string[] = [];
  let current = '';
  let squareDepth = 0;
  let braceDepth = 0;
  let inString = false;
  let escaped = false;

  for (const char of content) {
    current += char;

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '[') squareDepth++;
    if (char === ']') squareDepth--;
    if (char === '{') braceDepth++;
    if (char === '}') braceDepth--;
    if (char === ',' && squareDepth === 0 && braceDepth === 0) {
      entries.push(current.slice(0, -1).trim());
      current = '';
    }
  }

  const trimmed = current.trim();
  if (trimmed) {
    entries.push(trimmed);
  }

  return entries;
};

const stringifyLoreEntry = (value: string): string | undefined => {
  const normalized = normalizeTextComponentLike(value);
  const trimmed = normalized?.trim();

  if (!trimmed || trimmed === '""' || trimmed === '{"text":""}') {
    return undefined;
  }

  return trimmed;
};

export const parseLoreLines = (loreRaw?: string): string[] => {
  if (!loreRaw) return [];

  const trimmed = loreRaw.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return [];
  }

  return splitTopLevelLoreEntries(trimmed)
    .map(entry => stringifyLoreEntry(entry))
    .filter((entry): entry is string => Boolean(entry));
};

export const getLoreDescription = (loreLines: string[]): string | undefined => {
  if (loreLines.length === 0) return undefined;
  if (loreLines.length === 1) return loreLines[0];

  return loreLines.slice(0, -1).join('\n') || undefined;
};

export const getLoreTypeCandidates = (loreLines: string[]): string[] => {
  if (loreLines.length === 0) return [];

  const lastLine = loreLines[loreLines.length - 1];
  if (!lastLine) return [];

  return lastLine
    .split('/')
    .map(part => part.trim().toLowerCase())
    .filter(Boolean);
};
