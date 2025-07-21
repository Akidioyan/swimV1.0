import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';

/**
 * 内存存储，基于 Map 实现
 */
var MemoryStorageWrapper = /*#__PURE__*/function () {
  function MemoryStorageWrapper() {
    _classCallCheck(this, MemoryStorageWrapper);
    this.storage = new Map();
  }
  _createClass(MemoryStorageWrapper, [{
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

export { MemoryStorageWrapper, storage as default };
