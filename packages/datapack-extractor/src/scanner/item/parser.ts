import type { ParsedItemExpr } from './types';

export const parseItemExpression = (input: string): ParsedItemExpr => {
  const text = input.trim();

  const bracketStart = text.indexOf('[');

  if (bracketStart === -1) {
    const [ baseItemId, countText ] = text.split(/\s+/);

    return {
      baseItemId,
      count: countText ? Number(countText) : undefined,
    };
  }

  let depthSquare = 0;
  let depthCurly = 0;
  let inString = false;
  let stringQuote = '';
  let end = -1;

  for (let i = bracketStart; i < text.length; i++) {
    const ch = text[i];
    const prev = text[i - 1];

    if (inString) {
      if (ch === stringQuote && prev !== '\\') {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringQuote = ch;
      continue;
    }

    if (ch === '[') depthSquare++;
    else if (ch === ']') {
      depthSquare--;

      if (depthSquare === 0 && depthCurly === 0) {
        end = i;
        break;
      }
    } else if (ch === '{') depthCurly++;
    else if (ch === '}') depthCurly--;
  }

  if (end === -1)
    throw new Error(`Unclosed item components: ${input}`);

  const baseItemId = text.slice(0, bracketStart).trim();
  const componentsText = text.slice(bracketStart + 1, end).trim();
  const tail = text.slice(end + 1).trim();
  const count = tail ? Number(tail) : undefined;

  return { baseItemId, componentsText, count };
};

export const splitTopLevelComma = (input: string): string[] => {
  const parts: string[] = [];
  let start = 0;

  let depthSquare = 0;
  let depthCurly = 0;
  let inString = false;
  let stringQuote = '';

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const prev = input[i - 1];

    if (inString) {
      if (ch === stringQuote && prev !== '\\') {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringQuote = ch;
      continue;
    }

    if (ch === '[') depthSquare++;
    else if (ch === ']') depthSquare--;
    else if (ch === '{') depthCurly++;
    else if (ch === '}') depthCurly--;
    else if (ch === ',' && depthSquare === 0 && depthCurly === 0) {
      parts.push(input.slice(start, i).trim());
      start = i + 1;
    }
  }

  const last = input.slice(start).trim();
  if (last) parts.push(last);

  return parts;
};

export const parseTopLevelComponents = (componentsText: string): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const entry of splitTopLevelComma(componentsText)) {
    const eqIndex = entry.indexOf('=');

    if (eqIndex === -1) {
      result[entry] = 'true';
      continue;
    }

    const key = entry.slice(0, eqIndex).trim();
    const value = entry.slice(eqIndex + 1).trim();

    result[key] = value;
  }

  return result;
};
