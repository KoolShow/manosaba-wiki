
export interface BlockCoordinate {
  x: number,
  y: number,
  z: number,
}

export interface ContainerItemStack {
  slot: number,
  id?: string,
  count?: number,
  components?: Record<string, unknown>,
}

export interface ContainerSnapshot {
  coordinate: BlockCoordinate,
  id?: string,
  customName?: unknown,
  items: ContainerItemStack[],
}
