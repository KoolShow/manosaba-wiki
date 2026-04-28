import { NbtTag } from 'deepslate';

const stableSortValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stableSortValue);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entryValue]) => [key, stableSortValue(entryValue)])
    );
  }

  return value;
};

const safeJsonParse = (input: string): unknown | undefined => {
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
};

const splitTopLevelSnbtEntries = (input: string): string[] => {
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

const parseArrayLike = (input: string): unknown[] | undefined => {
  const trimmed = input.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return undefined;
  }

  return splitTopLevelSnbtEntries(trimmed).map((entry) => {
    const parsed = parseSnbtLike(entry);
    return parsed ?? entry;
  });
};

export const parseSnbtLike = (input: string): unknown | undefined => {
  const jsonValue = safeJsonParse(input);
  if (jsonValue !== undefined) {
    return jsonValue;
  }

  try {
    return NbtTag.fromString(input).toSimplifiedJson();
  } catch {
    return parseArrayLike(input);
  }
};

export const normalizeSnbtLike = (input: string): string | undefined => {
  const parsed = parseSnbtLike(input);
  if (parsed === undefined) {
    return undefined;
  }

  return JSON.stringify(stableSortValue(parsed));
};

const extractTextContent = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map(extractTextContent)
      .filter((part): part is string => Boolean(part));

    if (parts.length === 0) return undefined;
    return parts.join('');
  }

  if (value !== null && typeof value === 'object') {
    const text = Reflect.get(value, 'text');
    const extra = Reflect.get(value, 'extra');

    const parts = [extractTextContent(text), extractTextContent(extra)]
      .filter((part): part is string => Boolean(part));

    if (parts.length === 0) return undefined;
    return parts.join('');
  }

  return undefined;
};

export const normalizeTextComponentLike = (input: string): string | undefined => {
  const parsed = parseSnbtLike(input);
  if (parsed === undefined) {
    const trimmed = input.trim();
    return trimmed || undefined;
  }

  const text = extractTextContent(parsed);
  if (text) {
    return text;
  }

  return JSON.stringify(stableSortValue(parsed));
};
