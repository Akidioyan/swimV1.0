import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import { storageAvailable } from '../utils.js';

/**
 * LocalStorage Wrapper
 * 内部会将数据序列化为字符串存储（JSON.stringify），并在获取时恢复为原始对象（JSON.parse）
 * 如果取出的值不是有效的JSON，则会直接返回原始字符串
 */
var LocalStorageWrapper = /*#__PURE__*/function () {
  function LocalStorageWrapper() {
    _classCallCheck(this, LocalStorageWrapper);
  }
  _createClass(LocalStorageWrapper, [{
    key: "getItem",
    value: function getItem(key) {
      if (!storageAvailable('localStorage')) return null;
      var value = localStorage.getItem(key);
      try {
        return JSON.parse(value);
      } catch (_unused) {
        return value;
      }
    }
  }, {
    key: "setItem",
    value: function setItem(key, value) {
      if (!storageAvailable('localStorage')) return;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      if (!storageAvailable('localStorage')) return;
      try {
        return localStorage.removeItem(key);
      } catch (error) {
        console.error(error);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      if (!storageAvailable('localStorage')) return;
      try {
        return localStorage.clear();
      } catch (error) {
        console.error(error);
      }
    }
  }]);
  return LocalStorageWrapper;
}();
var storage = new LocalStorageWrapper();

export { storage as default };
