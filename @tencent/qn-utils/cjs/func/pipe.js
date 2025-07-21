'use strict';

var _createClass = require('@babel/runtime/helpers/createClass');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _inherits = require('@babel/runtime/helpers/inherits');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _inherits__default = /*#__PURE__*/_interopDefaultCompat(_inherits);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultCompat(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultCompat(_getPrototypeOf);
var _wrapNativeSuper__default = /*#__PURE__*/_interopDefaultCompat(_wrapNativeSuper);

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf__default.default(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default.default(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default.default(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var PipeError = /*#__PURE__*/function (_Error) {
  _inherits__default.default(PipeError, _Error);
  var _super = _createSuper(PipeError);
  function PipeError(message) {
    var _this;
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        error: ''
      },
      error = _ref.error,
      _ref$name = _ref.name,
      name = _ref$name === void 0 ? '' : _ref$name,
      _ref$index = _ref.index,
      index = _ref$index === void 0 ? -1 : _ref$index;
    _classCallCheck__default.default(this, PipeError);
    console.log('new pipe error', message);
    _this = _super.call(this, message);
    _this.name = name;
    _this.index = index;
    _this.message = message;
    console.error('PipeError: ', {
      message: message,
      name: name,
      index: index,
      error: error
    });
    return _this;
  }
  return _createClass__default.default(PipeError);
}( /*#__PURE__*/_wrapNativeSuper__default.default(Error));
function pipe() {
  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }
  return function (x) {
    return fns.reduce(function (acc, fn, index) {
      try {
        return fn(acc);
      } catch (error) {
        throw new PipeError("pipe(".concat(fn.name, ") at index ").concat(index, ": ").concat(error.message), {
          error: error,
          name: fn.name || 'unknown',
          index: index
        });
      }
    }, x);
  };
}
function pipeAsync() {
  for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
  }
  return function (x) {
    return fns.reduce(function (acc, fn, index) {
      return acc.then(function (result) {
        try {
          return fn(result);
        } catch (error) {
          throw new PipeError("pipeAsync error: ".concat(fn.name, " at index ").concat(index, ": ").concat(error.message), {
            error: error,
            name: fn.name || 'unknown',
            index: index
          });
        }
      });
    }, Promise.resolve(x));
  };
}

exports.PipeError = PipeError;
exports.pipe = pipe;
exports.pipeAsync = pipeAsync;
