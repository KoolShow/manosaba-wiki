import type { ItemCommandMatch } from './types';

const GiveCommReg = /^give\s+@s\s+(.+)$/;
const ReplaceCommReg = /^item\s+replace\s+entity\s+@s\s+([^\s]+)\s+with\s+(.+)$/;
const MacroReplaceCommReg = /^\$item\s+replace\s+entity\s+@s\s+([^\s]+)\s+with\s+(.+)$/;

export const commandMatch = (line: string): ItemCommandMatch | null => {
  const giveMatch = line.match(GiveCommReg);
  if (giveMatch) {
    return {
      type: 'give',
      itemExpr: giveMatch[1],
    };
  }

  const replaceMatch = line.match(ReplaceCommReg);
  if (replaceMatch) {
    return {
      type: 'item_replace',
      slot: replaceMatch[1],
      itemExpr: replaceMatch[2],
    };
  }

  const macroReplaceMatch = line.match(MacroReplaceCommReg);
  if (macroReplaceMatch) {
    return {
      type: 'macro_item_replace',
      slot: macroReplaceMatch[1],
      itemExpr: macroReplaceMatch[2],
    };
  }

  return null;
};
