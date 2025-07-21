'use strict';

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var utils = require('../utils.js');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);

/**
 * SessionStorage Wrapper
 * 内部会将数据序列化为字符串存储（JSON.stringify），并在获取时恢复为原始对象（JSON.parse）
 * 如果取出的值不是有效的JSON，则会直接返回原始字符串
 */
var SessionStorageWrapper = /*#__PURE__*/function () {
  function SessionStorageWrapper() {
    _classCallCheck__default.default(this, SessionStorageWrapper);
  }
  _createClass__default.default(SessionStorageWrapper, [{
    key: "getItem",
    value: function getItem(key) {
      if (!utils.storageAvailable('sessionStorage')) return null;
      var value = sessionStorage.getItem(key);
      try {
        return JSON.parse(value);
      } catch (_unused) {
        return value;
      }
    }
  }, {
    key: "setItem",
    value: function setItem(key, value) {
      if (!utils.storageAvailable('sessionStorage')) return;
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      if (!utils.storageAvailable('sessionStorage')) return;
      try {
        return sessionStorage.removeItem(key);
      } catch (error) {
        console.error(error);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      if (!utils.storageAvailable('sessionStorage')) return;
      try {
        return sessionStorage.clear();
      } catch (error) {
        console.error(error);
      }
    }
  }]);
  return SessionStorageWrapper;
}();
var storage = new SessionStorageWrapper();

module.exports = storage;
