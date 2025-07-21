/**
 * 获取本地存储的值
 *
 * @example
 *  getLS('user')     // {name: 'qqnews'}
 *
 * @export
 * @param {string} key 本地存储的key值
 * @returns 本地存储key对应的值, 可能是字符串、整数、浮点数、对象、数组、null、甚至 ReactElement
 */
export declare function getLS(key: string): any;
/**
 * 设置本地存储的键值对
 *
 * @example
 *  setLS('user', {name: 'qqnews'})
 *
 * @export
 * @param {string} key key值
 * @param {any} data 对应的数据
 * @returns
 */
export declare function setLS(key: string, data: unknown): void;
/**
 * 删除本地存储对应的键值对
 *
 * @example
 *  removeLS()
 *
 * @export
 * @param {string} key key值
 * @returns
 */
export declare function removeLS(key: string): void;
/**
 * 删除所有的本地存储数据
 *
 * @example
 *  clearAllLS()
 *
 * @export
 * @returns
 */
export declare function clearAllLS(): void;
