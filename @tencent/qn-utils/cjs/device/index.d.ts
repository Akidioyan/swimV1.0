import { IsUAMatcEnv } from '../types';
export declare function ua(lower?: string, userAgent?: string): string;
export declare function isWindowSystem(userAgent?: string): boolean;
export declare const isMobile: IsUAMatcEnv;
export declare const isPC: IsUAMatcEnv;
export declare const iPhone: IsUAMatcEnv;
/**
 * 判断是否为 iPhone X 设备
 * 检查设备的像素比例 > 2,屏幕的宽度大于等于375,屏幕的高度大于等于812
*/
export declare function isIphoneXmodel(): boolean;
export declare function ieVersion(): number | string;
export declare function isIE(): boolean;
export declare function isWorkWeixin(): boolean;
export declare function isQQNews(): boolean;
export declare function isTenvideo(): boolean;
export declare function isYuanBaoApp(): boolean;
export declare const isWeiShi: IsUAMatcEnv;
export declare function isQQMusic(): boolean;
export declare function isQQbrowser(): boolean;
export declare function isBaiduBrowser(): boolean;
export declare function isBaiduMap(): boolean;
export declare function isKuaiShouNormal(): boolean;
export declare function isKuaiShouJiSu(): boolean;
export declare function isKuaiShou(): boolean;
export declare function isIma(): boolean;
export declare function isUCBrowser(): boolean;
export declare function isHuaWei(): boolean;
export declare function isHonor(): boolean;
export declare function isOppo(): boolean;
export declare function isVivo(): boolean;
export declare function isSamsung(): boolean;
export declare function isXiaomi(): boolean;
export declare function isRealme(): boolean;
export declare function isLenovo(): boolean;
export declare function isMeizu(): boolean;
/**
 * @description 是否是一加手机
 * 机型汇总：https://khwang9883.github.io/MobileModels/brands/oneplus.html
 */
export declare function isOnePlus(): boolean;
