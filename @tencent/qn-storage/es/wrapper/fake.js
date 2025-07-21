import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';

/**
 * FakeStorage Wrapper
 * 非window环境下使用该storage
 */
var FakeStorageWrapper = /*#__PURE__*/function () {
  function FakeStorageWrapper() {
    _classCallCheck(this, FakeStorageWrapper);
  }
  _createClass(FakeStorageWrapper, [{
    key: "getItem",
    value: function getItem() {
      return null;
    }
  }, {
    key: "setItem",
    value: function setItem() {
      return null;
    }
  }, {
    key: "removeItem",
    value: function removeItem() {
      return null;
    }
  }, {
    key: "clear",
    value: function clear() {
      return null;
    }
  }]);
  return FakeStorageWrapper;
}();
var fakeStorage = new FakeStorageWrapper();

export { fakeStorage as default };
