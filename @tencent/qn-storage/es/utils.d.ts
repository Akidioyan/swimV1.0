/**
 * 判断localStorage和sessionStorage是否可用
 * 参考：https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 * @param type
 * @returns
 */
export declare const storageAvailable: (type: string) => boolean;
export declare const isClient: () => boolean;
