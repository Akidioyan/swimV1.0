/**
 * 对象转换为字符串
 *
 * @example
 *  stringify({a: "1", b: "2", c: "3"})    // "a=1&b=4&c=3"
 *
 * @export
 * @param {obj} val 变量
 * @param {sep} val 分隔符, 可选
 * @param {eq} [val] key、value间的连接符，可选
 * @returns {string} 转换后的字符串
 */
export declare function stringify(obj: object, sep?: string, eq?: string): string;
/**
 * 序列化字符串
 *
 * @example
 *  parse('a=1&b=2&c=3')    // {a: "1", b: "2", c: "3"}
 *
 * @export
 * @param {str} val 变量
 * @returns {object} json对象
 */
export declare function parse(str: string): object;
/**
 * 获取参数
 *
 * @example
 *  getParams('paramsName')
 * @export
 * @param {params} val 参数名
 * @param {search} val 目标字符串，可选，默认从window.location.search里取
 * @returns {object} json对象
 */
export declare function getParams(params: string, search?: string): string;
/**
 * 获取url链接参数
 *
 * @example
 *  getParams('paramsName')
 * @export
 * @param {params} val 参数名
 * @param {search} val 目标url链接，可选，默认从window.location.href里取
 * @returns {object} json对象
 */
export declare function getParamsFromUrl(params: string, url?: string): string;
/**
 * @description url拼接参数
 * @param  String url 链接
 * @param  Object params 拼接参数,对象格式
 */
export declare const addUrlParams: (url: string, params: Record<string, unknown>) => string;
