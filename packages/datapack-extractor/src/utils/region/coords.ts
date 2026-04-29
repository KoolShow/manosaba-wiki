import type { BlockCoordinate } from './types';

export const getChunkCoordinate = ({ x, z }: Pick<BlockCoordinate, 'x' | 'z'>) => {
  return {
    chunkX: Math.floor(x / 16),
    chunkZ: Math.floor(z / 16),
  };
};

export const getRegionCoordinate = ({ x, z }: Pick<BlockCoordinate, 'x' | 'z'>) => {
  const { chunkX, chunkZ } = getChunkCoordinate({ x, z });

  return {
    regionX: Math.floor(chunkX / 32),
    regionZ: Math.floor(chunkZ / 32),
  };
};

export const getChunkIndexInRegion = ({ x, z }: Pick<BlockCoordinate, 'x' | 'z'>) => {
  const { chunkX, chunkZ } = getChunkCoordinate({ x, z });

  const localChunkX = ((chunkX % 32) + 32) % 32;
  const localChunkZ = ((chunkZ % 32) + 32) % 32;

  return localChunkX + localChunkZ * 32;
};
