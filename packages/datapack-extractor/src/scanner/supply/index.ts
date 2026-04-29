import { readFile } from 'node:fs/promises';
import { scanSupplyDefinitionFiles } from './files';
import { getSupplyPosZ, getSupplyRanges } from './parse';
import { extractKnownFields } from './fields';
import { containerFilter, inferLocationName } from './utils';
import { readContainerAt } from '../../utils/region';
import type { SupplyDefinitionEvidence } from './types';

const SupplyPosX = 1029;
const SupplyStoragePosY = 45;
const SupplyReplacePosY = 44;

const componentParser = (component?: Record<string, unknown>) => {
  const result: Record<string, string> = {};
  if (!component) return (void 0);

  for (const key of Object.keys(component)) {
    const value = component[key];

    if (typeof value !== 'string') result[key] = JSON.stringify(value);
    else result[key] = value;
  }

  return result;
}

export const extractItemDefinitionsFromSupply = async (
  filePath: string,
  isReplace: boolean = false,
): Promise<SupplyDefinitionEvidence[]> => {
  const content = await readFile(filePath, { encoding: 'utf8' });

  const supplyRanges = getSupplyRanges(content);
  const supplyPosZ = getSupplyPosZ(content) ?? NaN;

  if (isNaN(supplyPosZ))
    throw new Error(`Cannot parse supply container Z coords in definition: ${filePath}`);

  const containerItems = containerFilter(
    await readContainerAt(
      WORLD_ROOT,
      {
        x: SupplyPosX,
        y: !isReplace ? SupplyStoragePosY : SupplyReplacePosY,
        z: supplyPosZ,
      }
    )
  );

  const evidences: SupplyDefinitionEvidence[] = [];

  for (const item of containerItems) {
    const ranges = supplyRanges.filter(e => item.slot >= e.slotStart && item.slot <= e.slotEnd);

    evidences.push({
      kind: 'supply_definition',

      locationName: inferLocationName(filePath),
      slotRanges: ranges,

      baseItemId: item.id,
      count: item.count,
      rawComponents: componentParser(item.components),
      ...extractKnownFields(item.components ?? {}),

      warnings: [],
    });
  }

  return evidences;
};

export const scanItemDefinitions = async () => {
  const fileList = await scanSupplyDefinitionFiles();
  const result: SupplyDefinitionEvidence[] = [];
  const resultReplace: SupplyDefinitionEvidence[] = [];

  for (const filePath of fileList) {
    result.push(...(await extractItemDefinitionsFromSupply(filePath)));
    resultReplace.push(...(await extractItemDefinitionsFromSupply(filePath, true)));
  }

  return {
    template: result,
    replacement: resultReplace,
  };
};
