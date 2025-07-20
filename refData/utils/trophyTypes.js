export const TrophyTypes = {
  CUP_COLLECTOR_20: 'CUP_COLLECTOR_20',     // Corresponds to cupFall20.png
  CUP_COLLECTOR_100: 'CUP_COLLECTOR_100',   // Corresponds to cupFall100.png
  CUP_COLLECTOR_300: 'CUP_COLLECTOR_300',   // Corresponds to cupFall300.png
  METAL_BUSTER: 'METAL_BUSTER',           // Corresponds to cupMetalFall.png
  ONE_SHOT_CLEAR: 'ONE_SHOT_CLEAR',       // Corresponds to cupOneshot.png
  LEVEL_CONQUEROR_5: 'LEVEL_CONQUEROR_5'  // Corresponds to cupPass5.png
};

// Optional: Descriptions or names for UI, if needed later
export const TrophyDetails = {
  [TrophyTypes.CUP_COLLECTOR_20]: { name: '杯子收藏家 (20)', description: '单局游戏击落20个杯子！', icon: 'cupFall20.png' },
  [TrophyTypes.CUP_COLLECTOR_100]: { name: '杯子收藏家 (100)', description: '单局游戏击落100个杯子！', icon: 'cupFall100.png' },
  [TrophyTypes.CUP_COLLECTOR_300]: { name: '杯子收藏家 (300)', description: '单局游戏击落300个杯子！', icon: 'cupFall300.png' },
  [TrophyTypes.METAL_BUSTER]: { name: '金属克星', description: '成功击落一个金属杯子！', icon: 'cupMetalFall.png' },
  [TrophyTypes.ONE_SHOT_CLEAR]: { name: '一球通关', description: '用一球通过一个关卡！', icon: 'cupOneshot.png' },
  [TrophyTypes.LEVEL_CONQUEROR_5]: { name: '关卡征服者', description: '累计通过5个关卡！', icon: 'cupPass5.png' },
}; 