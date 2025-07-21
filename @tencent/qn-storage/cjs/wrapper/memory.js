'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);

/**
 * 内存存储，基于 Map 实现
 */
var MemoryStorageWrapper = /*#__PURE__*/function () {
  function MemoryStorageWrapper() {
    _classCallCheck__default.default(this, MemoryStorageWrapper);
    this.storage = new Map();
  }
  _createClass__default.default(MemoryStorageWrapper, [{
    key: "getItem",
    value: function getItem(key) {
      return this.storage.get(key);
    }
  }, {
    key: "setItem",
    value: function setItem(key, value) {
      this.storage.set(key, value);
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      this.storage["delete"](key);
    }
  }, {
    key: "clear",
    value: function clear() {
      this.storage.clear();
    }
  }]);
  return MemoryStorageWrapper;
}();
var storage = new MemoryStorageWrapper();

exports.MemoryStorageWrapper = MemoryStorageWrapper;
exports.default = storage;
