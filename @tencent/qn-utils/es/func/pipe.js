import _createClass from '@babel/runtime/helpers/createClass';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _inherits from '@babel/runtime/helpers/inherits';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _wrapNativeSuper from '@babel/runtime/helpers/wrapNativeSuper';

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var PipeError = /*#__PURE__*/function (_Error) {
  _inherits(PipeError, _Error);
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
    _classCallCheck(this, PipeError);
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
  return _createClass(PipeError);
}( /*#__PURE__*/_wrapNativeSuper(Error));
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

export { PipeError, pipe, pipeAsync };
