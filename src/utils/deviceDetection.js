/**
 * 设备检测工具
 * 用于检测用户设备屏幕宽高比并控制游戏访问权限
 * 要求：竖屏模式且宽高比在3:4以下
 */

/**
 * 检测设备是否符合游戏要求
 * @returns {boolean} 是否为支持的设备（竖屏且宽高比3:4以下）
 */
export function isValidDevice() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // 必须是竖屏：宽度小于高度
  const isPortrait = width < height;
  
  if (!isPortrait) {
    console.log(`[设备检测] 屏幕方向不符合要求: ${width}×${height} (需要竖屏)`);
    return false;
  }
  
  // 计算宽高比（宽度/高度，因为已确保是竖屏）
  const aspectRatio = width / height;
  
  // 3:4 = 0.75，宽高比必须小于等于0.75
  const maxAspectRatio = 3 / 4; // 0.75
  
  const isValidRatio = aspectRatio <= maxAspectRatio;
  
  console.log(`[设备检测] 屏幕尺寸: ${width}×${height}, 竖屏: ${isPortrait}, 宽高比: ${aspectRatio.toFixed(3)}, 最大允许: ${maxAspectRatio}, 符合要求: ${isValidRatio}`);
  
  return isValidRatio;
}

// 设备检测状态管理
let deviceDetectionCallbacks = {
  onShowModal: null,
  onHideModal: null,
  onAction: null
};

/**
 * 注册设备检测回调函数
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onShowModal - 显示弹窗回调
 * @param {Function} callbacks.onHideModal - 隐藏弹窗回调  
 * @param {Function} callbacks.onAction - 按钮点击回调
 */
export function registerDeviceDetectionCallbacks(callbacks) {
  deviceDetectionCallbacks = { ...deviceDetectionCallbacks, ...callbacks };
}

/**
 * 显示设备不支持的提示
 */
export function showUnsupportedDeviceMessage() {
  if (deviceDetectionCallbacks.onShowModal) {
    deviceDetectionCallbacks.onShowModal();
  } else {
    // 降级方案：使用原生alert
    alert('此游戏仅支持竖屏模式且宽高比在3:4以下的设备，请调整屏幕方向或更换设备');
  }
}

/**
 * 隐藏设备检测提示
 */
export function hideDeviceDetectionMessage() {
  if (deviceDetectionCallbacks.onHideModal) {
    deviceDetectionCallbacks.onHideModal();
  }
}

/**
 * 处理设备检测弹窗按钮点击
 */
export function handleDeviceDetectionAction() {
  if (deviceDetectionCallbacks.onAction) {
    deviceDetectionCallbacks.onAction();
  } else {
    // 默认行为：尝试跳转到体育频道
    window.open('https://sports.qq.com/', '_blank');
  }
}

/**
 * 检查设备兼容性并处理不兼容情况
 * @returns {boolean} 是否为支持的设备（竖屏且宽高比3:4以下）
 */
export function checkDeviceCompatibility() {
  const isValid = isValidDevice();
  
  if (!isValid) {
    console.warn('[设备检测] 设备不符合要求，显示不支持提示');
    showUnsupportedDeviceMessage();
    return false;
  }
  
  console.log('[设备检测] 设备兼容性检查通过 - 竖屏且宽高比符合要求');
  hideDeviceDetectionMessage();
  return true;
}

/**
 * 初始化设备检测监听
 * 监听窗口大小变化和屏幕方向变化
 */
export function initDeviceDetectionListener() {
  // 监听窗口大小变化
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      checkDeviceCompatibility();
    }, 200); // 防抖处理
  });
  
  // 监听屏幕方向变化
  if (screen.orientation) {
    screen.orientation.addEventListener('change', () => {
      setTimeout(() => {
        checkDeviceCompatibility();
      }, 100); // 延迟检测，确保orientation值已更新
    });
  } else if (window.orientation !== undefined) {
    // 兼容旧版本的orientationchange事件
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        checkDeviceCompatibility();
      }, 100);
    });
  }
  
  console.log('[设备检测] 设备检测监听器已初始化');
}

// 兼容旧版本的函数名（保持API兼容性）
export const isValidAspectRatio = isValidDevice;
export const getDeviceType = () => isValidDevice() ? 'valid' : 'invalid';
export const isPortraitMode = () => window.innerWidth < window.innerHeight;
export const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
export const showUnsupportedOrientationMessage = showUnsupportedDeviceMessage;
export const showDesktopUnsupportedMessage = showUnsupportedDeviceMessage;
export const hideOrientationMessage = hideDeviceDetectionMessage;