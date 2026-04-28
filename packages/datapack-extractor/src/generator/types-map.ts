import type { ItemType } from '@manosaba/types';

const TYPE_MAP: Record<string, ItemType> = {
  weapon: 'weapon',
  weapons: 'weapon',
  'magical weapon': 'weapon',
  tool: 'tool',
  tools: 'tool',
  consumable: 'consumable',
  consume: 'consumable',
  food: 'consumable',
  medicine: 'consumable',
  utility: 'utility',
  props: 'utility',
  'magic props': 'magical_utility',
  'magical props': 'magical_utility',
  accessories: 'utility',
  clue: 'clue',
  clues: 'clue',
  magic: 'magic',
  quest: 'quest',
};

export const splitRawTypes = (value?: string): string[] => {
  if (!value) return [];

  return value
    .split('/')
    .map(part => part.trim().toLowerCase())
    .filter(Boolean);
};

export const mapItemTypes = (rawTypes: string[]): ItemType[] => {
  return Array.from(new Set(rawTypes.map(type => TYPE_MAP[type]).filter((value): value is ItemType => Boolean(value))));
};
