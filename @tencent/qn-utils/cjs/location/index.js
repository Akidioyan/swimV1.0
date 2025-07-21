'use strict';

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _toArray = require('@babel/runtime/helpers/toArray');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultCompat(_defineProperty);
var _toArray__default = /*#__PURE__*/_interopDefaultCompat(_toArray);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultCompat(_slicedToArray);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default.default(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
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
function stringify(obj, sep, eq) {
  var newSep = sep || '&';
  var newEq = eq || '=';
  var str = '';
  Object.keys(obj).forEach(function (key) {
    str += key + newEq + decodeURIComponent(obj[key]) + newSep;
  });
  return str.slice(0, -1);
}

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
function parse(str) {
  var obj = {};
  var arr = str.split('&');
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var item = _step.value;
      var index = item.indexOf('=');
      obj[item.slice(0, index)] = decodeURIComponent(item.slice(index + 1));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return obj;
}

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
function getParams(params, search) {
  var _replace;
  var searchString = (_replace = (search || window.location.search).replace(/^\?/, '')) === null || _replace === void 0 ? void 0 : _replace.split('#')[0];
  var searchArray = parse(searchString);
  if (searchArray[params]) {
    if (Array.isArray(searchArray[params])) {
      return searchArray[params][searchArray[params].length - 1];
    }
    return searchArray[params];
  }
  return '';
}

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
function getParamsFromUrl(params, url) {
  var _ref;
  var searchString = (_ref = url || window.location.href) === null || _ref === void 0 ? void 0 : _ref.split('#')[0].split('?')[1];
  if (!searchString) {
    return '';
  }
  return getParams(params, searchString);
}

/**
 * @description url拼接参数
 * @param  String url 链接
 * @param  Object params 拼接参数,对象格式
 */
var addUrlParams = function addUrlParams(url, params) {
  // 如果传入的参数不是对象格式，则返回原url
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return url;
  }
  // 处理拼接参数--1、先将hash排除在外 2、去除重复的参数
  var _ref2 = (url === null || url === void 0 ? void 0 : url.split('#')) || [],
    _ref3 = _slicedToArray__default.default(_ref2, 1),
    oldUrl = _ref3[0];
  var _ref4 = oldUrl.split('?') || [],
    _ref5 = _toArray__default.default(_ref4),
    newUrl = _ref5[0],
    searchs = _ref5.slice(1);
  var search = searchs.join('?');
  var oldParams = parse(search);
  // 如果有search参数，则与新增参数比较去重
  var newParams = _objectSpread(_objectSpread({}, oldParams), params);
  var splicingUrl = "".concat(newUrl, "?").concat(stringify(newParams));

  // 如果有#特殊符号，特殊处理
  var isHashUrl = /#/.test(url);
  if (isHashUrl) {
    var urlArray = url.split('#');
    var _urlArray = _toArray__default.default(urlArray),
      urrRestArray = _urlArray.slice(1);
    urrRestArray.forEach(function (item) {
      splicingUrl += "#".concat(item);
    });
  }
  return splicingUrl;
};

exports.addUrlParams = addUrlParams;
exports.getParams = getParams;
exports.getParamsFromUrl = getParamsFromUrl;
exports.parse = parse;
exports.stringify = stringify;
