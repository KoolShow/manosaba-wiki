import { normalizeSnbtLike, normalizeTextComponentLike } from '../utils/snbt';

export const normalizeBaseItemId = (value?: string): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return undefined;

  return trimmed.includes(':') ? trimmed : `minecraft:${trimmed}`;
};

export const normalizeCustomData = (value?: string): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalized = normalizeSnbtLike(trimmed);
  if (normalized) {
    return normalized;
  }

  return trimmed.replace(/\s+/g, '');
};

export const normalizeCustomName = (value?: string): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const looksLikeStructuredComponent =
    trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    trimmed.startsWith('"');

  if (looksLikeStructuredComponent) {
    return normalizeTextComponentLike(trimmed);
  }

  const normalized = normalizeTextComponentLike(trimmed);
  return normalized ?? trimmed;
};
