import type { ItemType } from '@manosaba/types';

export const LocationMap: Readonly<Record<string, string>> = {
  'dining_table': '餐桌',
  'storage_room': '杂物间',
  'outside': '野外',
  'atrium': '中庭',
  'shower_room': '浴室',
  'libaray': '图书馆',
  'play_room': '娱乐室',
  'lobby_table': '大厅桌面',
  'burn_room': '焚烧室',
  'noah_studio': '诺亚画室',
  'infirmary': '医务室',
  'museum': '展览室',
};

export const ItemTypeMap: Readonly<Record<ItemType, string>> = {
  weapon: '武器',
  consumable: '消耗品',
  food: '食物',
  medicine: '药品',
  tool: '工具',
  // quest: '任务',
  clue: '线索',
  magic: '魔法',
  utility: '道具',
  magical_utility: '魔法道具',
  accessories: '饰品',
  unknown: '未知'
};

export const getLocationName = (id: string) => {
  return LocationMap[id] ?? id;
};

export const getItemType = (id: string) => {
  return ItemTypeMap[id as ItemType] ?? ItemTypeMap.unknown;
};
