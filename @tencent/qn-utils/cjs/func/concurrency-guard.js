'use strict';

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var flatPromise = require('./flat-promise.js');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultCompat(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultCompat(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultCompat(_regeneratorRuntime);

/**
 * 并发保护类，标识了相同key的多个函数在高并发场景同时执行时，只有一个函数会真正执行，其他的则进入等待并复用此函数结果
 * @example
 * ```ts
 * const guard = new ConcurrencyGuard();
 * await guard.call('key', heavyAsyncFn, 1, 2, 3);
 * await guard.apply('key', heavyAsyncFn, [1, 2, 3]);
 * ```
 */
var ConcurrencyGuard = /*#__PURE__*/function () {
  function ConcurrencyGuard(options) {
    _classCallCheck__default.default(this, ConcurrencyGuard);
    /** 运行中的 promise 对象 map */
    _defineProperty__default.default(this, "runningPromiseMap", new Map());
    /** 记录运行中的 promise 是否已被获取 */
    _defineProperty__default.default(this, "runningPromiseGettedMap", new Map());
    /** 缓存运行过的函数结果 */
    _defineProperty__default.default(this, "resultMap", new Map());
    /** 是否缓存函数运行结果 */
    _defineProperty__default.default(this, "cacheResult", false);
    var _ref = options || {},
      _ref$cacheResult = _ref.cacheResult,
      cacheResult = _ref$cacheResult === void 0 ? false : _ref$cacheResult;
    this.cacheResult = cacheResult;
  }

  /**
   * 标识key并调用函数，通过可变参数透传参数给函数参数，标识了相同key的多个函数在高并发时只有一个被执行，其他函数等待结果
   * @example - 自动推导类型
   * ```ts
   * const result = await guard.call('key', (p1, p2) => Promise.resolve([p1, p2]), 1, 2);
   * ```
   * @example - 通过泛型标注类型
   * ```ts
   * const result = await guard.call<number, [number, number]>('key', (p1, p2) => Promise.resolve(1), 1, 2);
   * ```
   */
  _createClass__default.default(ConcurrencyGuard, [{
    key: "call",
    value: (function () {
      var _call = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee(key, asyncFn) {
        var _len,
          args,
          _key,
          _args = arguments;
        return _regeneratorRuntime__default.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              for (_len = _args.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                args[_key - 2] = _args[_key];
              }
              return _context.abrupt("return", this.run.apply(this, [{
                key: key,
                asyncFn: asyncFn,
                isCall: true
              }].concat(args)));
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function call(_x, _x2) {
        return _call.apply(this, arguments);
      }
      return call;
    }()
    /**
     * 标识key并调用函数，通过参数列表透传参数给函数参数，标识了相同key的多个函数在高并发时只有一个被执行，其他函数等待结果
     * @example
     * ```
     * // [1,2] 透传给 asyncFn 的 p1、p2
     * const result = await guard.apply('key', (p1: number, p2: number) => Promise.resolve([p1, p2]), [1, 2]);
     * ```
     */
    )
  }, {
    key: "apply",
    value: (function () {
      var _apply = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee2(key, asyncFn, args) {
        return _regeneratorRuntime__default.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", this.run({
                key: key,
                asyncFn: asyncFn,
                isCall: false
              }, args));
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function apply(_x3, _x4, _x5) {
        return _apply.apply(this, arguments);
      }
      return apply;
    }()
    /**
     * 等待函数运行结果，如果函数存在且正在运行中，返回 promise 对象等待调用方获取，
     * 如果函数已运行结束且配置了 cacheResult=true，返回记录的缓存结果，
     * 其他情况则返回 undefined，用户需自行处理此情况
     */
    )
  }, {
    key: "waitResult",
    value: (function () {
      var _waitResult = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee3(key) {
        var _this$getRunningPromi, runningPromise, isExist;
        return _regeneratorRuntime__default.default.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _this$getRunningPromi = this.getRunningPromise(key), runningPromise = _this$getRunningPromi.runningPromise, isExist = _this$getRunningPromi.isExist;
              if (isExist) {
                _context3.next = 3;
                break;
              }
              return _context3.abrupt("return", this.resultMap.get(key));
            case 3:
              return _context3.abrupt("return", runningPromise);
            case 4:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function waitResult(_x6) {
        return _waitResult.apply(this, arguments);
      }
      return waitResult;
    }()
    /**
     * 获取运行中的 promise
     */
    )
  }, {
    key: "getRunningPromise",
    value: function getRunningPromise(key) {
      var runningPromise = this.runningPromiseMap.get(key);
      // 避免es-lint: Expected non-Promise value in a boolean conditional  @typescript-eslint/no-misused-promises
      var isExist = Boolean(runningPromise);
      if (isExist) {
        // 标记已被获取
        this.runningPromiseGettedMap.set(key, true);
      }
      return {
        isExist: isExist,
        runningPromise: runningPromise
      };
    }

    /**
     * 配合 flatPromise 和 reqKey，控制高并发时只有一个真正发起请求，其他函数等待结果
     */
  }, {
    key: "run",
    value: (function () {
      var _run = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee4(runCtx) {
        var key,
          asyncFn,
          isCall,
          _this$getRunningPromi2,
          runningPromise,
          isExist,
          result,
          resultProm,
          _result,
          _len2,
          args,
          _key2,
          fisrtArg,
          argArr,
          _args4 = arguments;
        return _regeneratorRuntime__default.default.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              key = runCtx.key, asyncFn = runCtx.asyncFn, isCall = runCtx.isCall;
              _this$getRunningPromi2 = this.getRunningPromise(key), runningPromise = _this$getRunningPromi2.runningPromise, isExist = _this$getRunningPromi2.isExist;
              if (!isExist) {
                _context4.next = 7;
                break;
              }
              _context4.next = 5;
              return runningPromise;
            case 5:
              result = _context4.sent;
              return _context4.abrupt("return", result);
            case 7:
              // 用这个promise来记录结果，对于其他执行中的函数来说，此对象就是 runningPromise
              resultProm = flatPromise.createFlatPromise();
              this.runningPromiseMap.set(key, resultProm);
              _context4.prev = 9;
              for (_len2 = _args4.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = _args4[_key2];
              }
              if (!isCall) {
                _context4.next = 17;
                break;
              }
              _context4.next = 14;
              return asyncFn.call.apply(asyncFn, [null].concat(args));
            case 14:
              _result = _context4.sent;
              _context4.next = 22;
              break;
            case 17:
              // 尽管 apply 函数做了类型纠错检查，为了防止使用 ts-ignore 绕过检测，此处需在运行时确保参数格式合法性
              fisrtArg = args[0];
              argArr = Array.isArray(fisrtArg) ? fisrtArg : [fisrtArg];
              _context4.next = 21;
              return asyncFn.apply(null, argArr);
            case 21:
              _result = _context4.sent;
            case 22:
              if (this.cacheResult) {
                this.resultMap.set(key, _result);
              }
              this.runningPromiseMap["delete"](key);
              this.runningPromiseGettedMap["delete"](key);
              resultProm.resolve(_result); // 通知可能存在的并发执行的其他函数获得结果
              return _context4.abrupt("return", _result);
            case 29:
              _context4.prev = 29;
              _context4.t0 = _context4["catch"](9);
              this.runningPromiseMap["delete"](key);
              // 通知可能存在的并发执行的其他函数捕捉错误，
              // 用于承载结果的 promise 必须判定已被获取后，才需要执行 reject 操作，
              // 否则会产生 unhandledRejection 错误到运行时顶层
              if (this.runningPromiseGettedMap.get(key)) {
                this.runningPromiseGettedMap["delete"](key);
                resultProm.reject(_context4.t0);
              }
              throw _context4.t0;
            case 34:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[9, 29]]);
      }));
      function run(_x7) {
        return _run.apply(this, arguments);
      }
      return run;
    }())
  }]);
  return ConcurrencyGuard;
}();

exports.ConcurrencyGuard = ConcurrencyGuard;
