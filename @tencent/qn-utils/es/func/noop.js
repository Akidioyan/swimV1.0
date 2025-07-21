import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';

/**
 * @file 一系列占位空函数
 */

/** 此函数用于消除 unused vars 警告 */
function noopArgs() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return args;
}

/**
 * 创建 noop 函数，内置的 noopStr、noopNum、noopObj、noopVoid 不满足使用场景时，可用此函数来创建新的 noop 函数
 * @example
 * ```
 * const noopCat = makeNoopAny({ name: 'cat' });
 * ```
 */
function makeNoopAny(result) {
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    noopArgs(args);
    return result;
  };
}

/** noopAny 默认返回 {}, 如不满足使用场景可基于 makeNoopAny 来定制 */
function noopAny() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }
  noopArgs(args);
  return {};
}
function noopStr() {
  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }
  noopArgs(args);
  return '';
}
function noopNum() {
  for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    args[_key5] = arguments[_key5];
  }
  noopArgs(args);
  return 0;
}
function noopObj() {
  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
  }
  noopArgs(args);
  return {};
}
function noopVoid() {
  for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    args[_key7] = arguments[_key7];
  }
  noopArgs(args);
}

/**
 * 创建 noop async 函数，内置的 noopStrAsync、noopNumAsync、noopObjAsync、noopVoidAsync 不满足使用场景时，
 * 可用此函数来创建新的 noop 函数
 * @example
 * ```
 * const noopCatAsync = makeNoopAnyAsync({ name: 'cat' });
 * ```
 */
function makeNoopAnyAsync(result) {
  return /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
    var _len8,
      args,
      _key8,
      _args = arguments;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          for (_len8 = _args.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
            args[_key8] = _args[_key8];
          }
          noopArgs(args);
          return _context.abrupt("return", result);
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
}

/** noopAnyAsync 默认返回 {}, 如不满足使用场景可基于 makeNoopAnyAsync 来定制 */
function noopAnyAsync() {
  return _noopAnyAsync.apply(this, arguments);
}
function _noopAnyAsync() {
  _noopAnyAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
    var _len9,
      args,
      _key9,
      _args2 = arguments;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          for (_len9 = _args2.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
            args[_key9] = _args2[_key9];
          }
          noopArgs(args);
          return _context2.abrupt("return", {});
        case 3:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _noopAnyAsync.apply(this, arguments);
}
function noopStrAsync() {
  return _noopStrAsync.apply(this, arguments);
}
function _noopStrAsync() {
  _noopStrAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
    var _len10,
      args,
      _key10,
      _args3 = arguments;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          for (_len10 = _args3.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
            args[_key10] = _args3[_key10];
          }
          noopArgs(args);
          return _context3.abrupt("return", '');
        case 3:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _noopStrAsync.apply(this, arguments);
}
function noopNumAsync() {
  return _noopNumAsync.apply(this, arguments);
}
function _noopNumAsync() {
  _noopNumAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
    var _len11,
      args,
      _key11,
      _args4 = arguments;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          for (_len11 = _args4.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
            args[_key11] = _args4[_key11];
          }
          noopArgs(args);
          return _context4.abrupt("return", 0);
        case 3:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _noopNumAsync.apply(this, arguments);
}
function noopObjAsync() {
  return _noopObjAsync.apply(this, arguments);
}
function _noopObjAsync() {
  _noopObjAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5() {
    var _len12,
      args,
      _key12,
      _args5 = arguments;
    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          for (_len12 = _args5.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
            args[_key12] = _args5[_key12];
          }
          noopArgs(args);
          return _context5.abrupt("return", {});
        case 3:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return _noopObjAsync.apply(this, arguments);
}
function noopVoidAsync() {
  return _noopVoidAsync.apply(this, arguments);
}
function _noopVoidAsync() {
  _noopVoidAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6() {
    var _len13,
      args,
      _key13,
      _args6 = arguments;
    return _regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          for (_len13 = _args6.length, args = new Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
            args[_key13] = _args6[_key13];
          }
          noopArgs(args);
        case 2:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _noopVoidAsync.apply(this, arguments);
}

export { makeNoopAny, makeNoopAnyAsync, noopAny, noopAnyAsync, noopNum, noopNumAsync, noopObj, noopObjAsync, noopStr, noopStrAsync, noopVoid, noopVoidAsync };
