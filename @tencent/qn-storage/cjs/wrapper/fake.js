'use strict';

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);

/**
 * FakeStorage Wrapper
 * 非window环境下使用该storage
 */
var FakeStorageWrapper = /*#__PURE__*/function () {
  function FakeStorageWrapper() {
    _classCallCheck__default.default(this, FakeStorageWrapper);
  }
  _createClass__default.default(FakeStorageWrapper, [{
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

module.exports = fakeStorage;
