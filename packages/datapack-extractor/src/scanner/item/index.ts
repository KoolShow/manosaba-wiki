import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { commandMatch } from './commands';
import { scanItemFunctions } from './files';
import { parseItemExpression, parseTopLevelComponents } from './parser';
import { extractKnownFields } from './fields';
import { normalizer } from '../../utils/mcfunction';

const inferNamespace = (filePath: string) => {
  const parts = filePath.split(path.sep);
  const dataIndex = parts.lastIndexOf('data');
  return dataIndex !== -1 ? parts[dataIndex + 1] : 'unknown';
};

export const extractItemFromFile = async (filePath: string) => {
  const content = await readFile(filePath, { encoding: 'utf8' });
  const lines = normalizer(content);
  const items = []; // TODO: Types

  for (const line of lines) {
    const match = commandMatch(line);
    if (!match) continue;

    try {
      const parsedExpr = parseItemExpression(match.itemExpr);
      const rawComponents = (
        parsedExpr.componentsText ?
        parseTopLevelComponents(parsedExpr.componentsText) : {}
      );

      const known = extractKnownFields(rawComponents);

      items.push({
        sourcePath: filePath,
        namespace: inferNamespace(filePath),
        commandType: match.type,
        slot: match.slot,
        baseItemId: parsedExpr.baseItemId,
        count: parsedExpr.count,
        rawComponents,
        warnings: [],
        ...known,
      });
    } catch (error) {
      items.push({
        sourcePath: filePath,
        namespace: inferNamespace(filePath),
        commandType: match.type,
        slot: match.slot,
        baseItemId: 'unknown',
        warnings: [ error instanceof Error ? error.message : String(error) ],
      });
    }
  }

  return items;
};

export const scanItems = async () => {
  const fileList = await scanItemFunctions();
  const result = []; // TODO: Types

  for (const filePath of fileList) {
    result.push(...(await extractItemFromFile(filePath)));
  }

  return result;
};
