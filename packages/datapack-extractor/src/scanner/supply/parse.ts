import type { SupplyRandomRule } from './types';

const SlotRangeReg = /supply_level=(\d+)(?:\.\.(\d+))?\}\].*?run random value (\d+)\.\.(\d+)/;
const ScoreboardPosZReg = /scoreboard players set @s posZ (-?\d+)/;

export const getSupplyPosZ = (content: string) => {
  const match = content.match(ScoreboardPosZReg);

  if (!match) return null;
  return Number(match[1]);
};

export const getSupplyRanges = (content: string): SupplyRandomRule[] => {
  const lines = content.split(/[\r\n]+/);
  const result: SupplyRandomRule[] = [];

  for (const line of lines) {
    const match = line.match(SlotRangeReg);
    if (!match) continue;

    const probStart = Number(match[1]);
    const probEnd = Number(match[2]);
    const slotStart = Number(match[3]);
    const slotEnd = Number(match[4]);
    
    if (isNaN(probStart) || isNaN(slotStart) || isNaN(slotEnd)) continue;
    result.push({
      probStart,
      probEnd: !isNaN(probEnd) ? probEnd : probStart,
      slotStart,
      slotEnd,
    });
  }

  return result;
};
