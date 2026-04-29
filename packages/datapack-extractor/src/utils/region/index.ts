import { readBlockEntitySnapshot } from './chunk';
import { readChunkNbtBuffer } from './region';
import type { BlockCoordinate, ContainerSnapshot } from './types';

export const readContainerAt = async (
  worldPath: string,
  coordinate: BlockCoordinate,
): Promise<ContainerSnapshot | undefined> => {
  const chunkBuffer = await readChunkNbtBuffer(worldPath, coordinate);
  if (!chunkBuffer) {
    return undefined;
  }

  return readBlockEntitySnapshot(chunkBuffer, coordinate);
};
