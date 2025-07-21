/**
 * 判断是否是Function
 *
 * @example
 *  isFunction(function () {})    // true
 *
 * @export
 * @param {any} val 变量
 * @returns {boolean} true为是函数，否则不是函数
 */
export declare function isFunction(val: unknown): boolean;
/**
 * 判断是否是Object
 *
 * @example
 *  isObject({})    // true
 *
 * @export
 * @param {any} val 变量
 * @returns {boolean}
 */
export declare function isObject(val: unknown): boolean;
/**
 * 判断是否是数组
 *
 * @example
 *  isArray([])     // true
 *
 * @export
 * @param {any} val 变量
 * @returns {boolean}
 */
export declare function isArray(val: unknown): boolean;
/**
 * 判断是否是null
 *
 * @example
 *  isNull(null)    // true
 *
 * @export
 * @param {any} val 变量
 * @returns {boolean}
 */
export declare function isNull(val: unknown): boolean;
/**
 * 判断是否是字符串
 * @example
 *  isString('') // true
 *
 * @param {any} val 变量
 * @return {boolean}
 */
export declare function isString(val: unknown): boolean;
/**
 * 判断是否是数字类型
 * @example
 *  isNumber(7) // true
 *
 * @param {any} val 变量
 * @return {boolean}
 */
export declare function isNumber(val: unknown): boolean;
/**
 * 判断是否是boolean变量
 * @example
 *  isBoolean(true) // true
 *
 * @param {any} val 变量
 * @return {boolean}
 */
export declare function isBoolean(val: unknown): boolean;
