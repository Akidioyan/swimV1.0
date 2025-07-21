/// <reference types="ua-parser-js" />
/**
 * 对 UAParser 进行扩展支持几种常见但没有被支持的浏览器
 * 如果需要覆盖一些与正则也要来修改这个方法
 *
 * @param  {string} userAgent 正常取值 navigator.userAgent ｜ request.headers["user-agent"]
 */
export declare const getUAParser: (userAgent?: string) => import("ua-parser-js").UAParserInstance;
/**
 * 返回常见的浏览器名，如果不全请自行扩展
 */
export declare const getBrowserName: () => string;
