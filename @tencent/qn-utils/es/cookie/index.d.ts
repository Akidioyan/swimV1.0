/**
 * 设置cookie
 *
 * @example
 *  setCookie('name', 'qqnews', 4)
 *
 * @export
 * @param {string} name cookie名
 * @param {string} value cookie值
 * @param {number|null} hour cookie存活时间，单位：小时
 * @param {string|null} domain 所在域名，如果没有定义，默认为当前文档位置的路径的域名部分
 * @param {string|null} path 所在路径，如果没有定义，默认为当前文档位置的路径
 * @param {boolean|null} secure cookie只会被https传输
 * @returns {boolean}
 */
export declare function setCookie(name: string, value: string, hour?: number, domain?: string, path?: string, secure?: boolean): boolean;
/**
 * 获取对应cookie值
 *
 * @example
 *  var ck = getCookie('name')     // qqnews
 *
 * @export
 * @param {string} name 要获取的cookie名
 * @returns {string} 获取的cookie值
 */
export declare function getCookie(name: string): string;
/**
 * 删除指定的cookie
 *
 * @example
 *  delCookie('name')
 *
 * @export
 * @param {string} name cookie名
 * @param {string|null} domain 所在域名，如果没有定义，默认为当前文档位置的路径的域名部分
 * @param {string|null} path 所在路径，如果没有定义，默认为当前文档位置的路径
 * @returns {boolean}
 */
export declare function delCookie(name: string, domain: string | null, path: string | null): boolean;
