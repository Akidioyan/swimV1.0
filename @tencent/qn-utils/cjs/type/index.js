'use strict';

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
function isFunction(val) {
  return {}.toString.call(val) === '[object Function]';
}

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
function isObject(val) {
  return {}.toString.call(val) === '[object Object]';
}

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
function isArray(val) {
  return {}.toString.call(val) === '[object Array]';
}

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
function isNull(val) {
  return {}.toString.call(val) === '[object Null]';
}

/**
 * 判断是否是字符串
 * @example
 *  isString('') // true
 *
 * @param {any} val 变量
 * @return {boolean}
 */
function isString(val) {
  return {}.toString.call(val) === '[object String]';
}

/**
 * 判断是否是数字类型
 * @example
 *  isNumber(7) // true
 *
 * @param {any} val 变量
 * @return {boolean}
 */
function isNumber(val) {
  return {}.toString.call(val) === '[object Number]';
}

/**
 * 判断是否是boolean变量
 * @example
 *  isBoolean(true) // true
 *
 * @param {any} val 变量
 * @return {boolean}
 */
function isBoolean(val) {
  return {}.toString.call(val) === '[object Boolean]';
}

exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isFunction = isFunction;
exports.isNull = isNull;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isString = isString;
