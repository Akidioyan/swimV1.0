import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';

var withCache = function withCache(fn) {
  var cache = {};
  return /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(url) {
      var res;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            res = cache[url]; // eslint-disable-next-line @typescript-eslint/no-misused-promises
            if (res) {
              _context.next = 12;
              break;
            }
            res = fn(url);
            _context.prev = 3;
            _context.next = 6;
            return res;
          case 6:
            cache[url] = res;
            _context.next = 12;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](3);
            cache[url] = null;
          case 12:
            return _context.abrupt("return", res);
          case 13:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 9]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();
};
var loadJavaScript = function loadJavaScript(url, toBody) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute('charset', 'utf-8');
    script.onload = function () {
      return resolve();
    };
    var container = toBody ? document.body : document.head;
    script.onerror = function () {
      reject(new Error("Failed to load ".concat(url)));
      container.removeChild(script);
    };
    script.src = url;
    container.appendChild(script);
  });
};
var loadScript = withCache(loadJavaScript);

export { loadScript };
