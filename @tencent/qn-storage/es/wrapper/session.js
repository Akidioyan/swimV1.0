import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import { storageAvailable } from '../utils.js';

/**
 * SessionStorage Wrapper
 * 内部会将数据序列化为字符串存储（JSON.stringify），并在获取时恢复为原始对象（JSON.parse）
 * 如果取出的值不是有效的JSON，则会直接返回原始字符串
 */
var SessionStorageWrapper = /*#__PURE__*/function () {
  function SessionStorageWrapper() {
    _classCallCheck(this, SessionStorageWrapper);
  }
  _createClass(SessionStorageWrapper, [{
    key: "getItem",
    value: function getItem(key) {
      if (!storageAvailable('sessionStorage')) return null;
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
      if (!storageAvailable('sessionStorage')) return;
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      if (!storageAvailable('sessionStorage')) return;
      try {
        return sessionStorage.removeItem(key);
      } catch (error) {
        console.error(error);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      if (!storageAvailable('sessionStorage')) return;
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

export { storage as default };
