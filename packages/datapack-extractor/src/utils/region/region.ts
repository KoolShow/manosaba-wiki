import { readFile } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { getChunkIndexInRegion, getRegionCoordinate } from './coords';
import type { BlockCoordinate } from './types';

const SECTOR_BYTES = 4096;

const readUInt24BE = (buffer: Buffer, offset: number): number => {
  return (buffer[offset] << 16) | (buffer[offset + 1] << 8) | buffer[offset + 2];
};

const decompressChunk = (compressionType: number, payload: Buffer): Buffer => {
  switch (compressionType) {
    case 1:
      return zlib.gunzipSync(payload);
    case 2:
      return zlib.inflateSync(payload);
    case 3:
      return payload;
    default:
      throw new Error(`Unsupported chunk compression type: ${compressionType}`);
  }
};

export const getRegionFilePath = (worldPath: string, coordinate: Pick<BlockCoordinate, 'x' | 'z'>): string => {
  const { regionX, regionZ } = getRegionCoordinate(coordinate);
  return path.join(worldPath, 'region', `r.${regionX}.${regionZ}.mca`);
};

export const readChunkNbtBuffer = async (
  worldPath: string,
  coordinate: Pick<BlockCoordinate, 'x' | 'z'>,
): Promise<Buffer | undefined> => {
  const regionPath = getRegionFilePath(worldPath, coordinate);
  const regionBuffer = await readFile(regionPath);
  const chunkIndex = getChunkIndexInRegion(coordinate);
  const locationOffset = chunkIndex * 4;

  const sectorOffset = readUInt24BE(regionBuffer, locationOffset);
  const sectorCount = regionBuffer[locationOffset + 3];

  if (sectorOffset === 0 || sectorCount === 0) {
    return undefined;
  }

  const chunkOffset = sectorOffset * SECTOR_BYTES;
  const length = regionBuffer.readUInt32BE(chunkOffset);
  const compressionType = regionBuffer[chunkOffset + 4];
  const payload = regionBuffer.subarray(chunkOffset + 5, chunkOffset + 4 + length);

  return decompressChunk(compressionType, payload);
};
