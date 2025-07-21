'use strict';

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultCompat(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultCompat(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultCompat(_regeneratorRuntime);

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default.default(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * indexedDB存储
 */
var IndexedDbWrapper = /*#__PURE__*/function () {
  function IndexedDbWrapper(config) {
    _classCallCheck__default.default(this, IndexedDbWrapper);
    _defineProperty__default.default(this, "db", null);
    // 数据库名称
    _defineProperty__default.default(this, "dbName", '');
    // 数据库版本
    _defineProperty__default.default(this, "version", 1);
    // 存储列表
    _defineProperty__default.default(this, "tableList", []);
    this.config = config;
    var dbName = config.dbName,
      version = config.version,
      tables = config.tables;
    if (!dbName || !version || !tables) {
      throw Error('Must provide dbName、db version、tables info in IndexedDBConfig');
    }
    this.dbName = dbName;
    this.version = version;
    this.tableList = tables;
  }

  /**
   * @method 打开数据库
   */
  _createClass__default.default(IndexedDbWrapper, [{
    key: "openDB",
    value: (function () {
      var _openDB = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee() {
        var _this = this;
        return _regeneratorRuntime__default.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                var indexedDB = _this.getWindowIndexedDB();
                var request = indexedDB.open(_this.dbName, _this.version);
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function () {
                  _this.db = request.result;
                  resolve();
                };
                request.onupgradeneeded = function () {
                  _this.db = request.result;
                  _this.createTable(_this.db, _this.tableList);
                };
              }));
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function openDB() {
        return _openDB.apply(this, arguments);
      }
      return openDB;
    }()
    /**
     * @method 关闭数据库
     */
    )
  }, {
    key: "closeDB",
    value: (function () {
      var _closeDB = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee2() {
        var _this2 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                try {
                  if (!_this2.db) {
                    resolve('请开启数据库');
                    return;
                  }
                  _this2.db.close();
                  resolve(true);
                } catch (error) {
                  reject(error);
                }
              }));
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function closeDB() {
        return _closeDB.apply(this, arguments);
      }
      return closeDB;
    }()
    /**
     * @method 获取所有数据
     * @param {string} tableName 表名
     */
    )
  }, {
    key: "getAllData",
    value: (function () {
      var _getAllData = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee3(tableName) {
        var _this3 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this3.db.transaction([tableName], 'readonly');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.openCursor();
                var result = [];
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function (event) {
                  var cursor = event.target.result;
                  if (cursor) {
                    result.push(cursor.value);
                    // 遍历了存储对象中的所有内容
                    cursor["continue"]();
                  } else {
                    resolve(result);
                  }
                };
              }));
            case 1:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      function getAllData(_x) {
        return _getAllData.apply(this, arguments);
      }
      return getAllData;
    }()
    /**
     * @method 根据具体的条件通过游标查询结果
     * @param {string} tableName 表名
     * @param {function} condition 查询的条件
     */
    )
  }, {
    key: "getDataByCursor",
    value: (function () {
      var _getDataByCursor = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee4(tableName, condition) {
        var _this4 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this4.db.transaction([tableName], 'readonly');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.openCursor();
                var result = [];
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function (event) {
                  var cursor = event.target.result;
                  if (cursor) {
                    var _data = cursor.value;
                    if (condition(_data)) {
                      result.push(_data);
                    }
                    cursor["continue"]();
                  } else {
                    resolve(result);
                  }
                };
              }));
            case 1:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));
      function getDataByCursor(_x2, _x3) {
        return _getDataByCursor.apply(this, arguments);
      }
      return getDataByCursor;
    }()
    /**
     * @method 通过索引读取数据
     * @param {string} tableName 表名
     * @param {string} indexName 索引名称
     * @param {string} indexValue 索引值
     */
    )
  }, {
    key: "getDataByKeyValue",
    value: (function () {
      var _getDataByKeyValue = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee5(tableName, indexName, indexValue) {
        var _this5 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this5.db.transaction([tableName], 'readonly');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.index(indexName).get(indexValue);
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function () {
                  resolve(request.result);
                };
              }));
            case 1:
            case "end":
              return _context5.stop();
          }
        }, _callee5);
      }));
      function getDataByKeyValue(_x4, _x5, _x6) {
        return _getDataByKeyValue.apply(this, arguments);
      }
      return getDataByKeyValue;
    }()
    /**
     * @method 通过主键读取数据
     * @param {string} tableName 表名
     * @param {string} primaryKey 主键名称
     */
    )
  }, {
    key: "getDataByPrimaryKey",
    value: (function () {
      var _getDataByPrimaryKey = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee6(tableName, primaryKey) {
        var _this6 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this6.db.transaction([tableName]);
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.get(primaryKey);
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function () {
                  resolve(request.result);
                };
              }));
            case 1:
            case "end":
              return _context6.stop();
          }
        }, _callee6);
      }));
      function getDataByPrimaryKey(_x7, _x8) {
        return _getDataByPrimaryKey.apply(this, arguments);
      }
      return getDataByPrimaryKey;
    }()
    /**
     * @method 通过索引和游标查询记录
     * @param {string} tableName 表名
     * @param {string} indexName 索引名称
     * @param {string} indexValue 索引值
     */
    )
  }, {
    key: "cursorGetDataByIndex",
    value: (function () {
      var _cursorGetDataByIndex = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee7(tableName, indexName, indexValue) {
        var _this7 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this7.db.transaction([tableName], 'readwrite');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.index(indexName).openCursor(IDBKeyRange.only(indexValue));
                var result = [];
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function (event) {
                  var cursor = event.target.result;
                  if (cursor) {
                    var _data2 = cursor.value;
                    result.push(_data2);
                    cursor["continue"]();
                  } else {
                    resolve(result);
                  }
                };
              }));
            case 1:
            case "end":
              return _context7.stop();
          }
        }, _callee7);
      }));
      function cursorGetDataByIndex(_x9, _x10, _x11) {
        return _cursorGetDataByIndex.apply(this, arguments);
      }
      return cursorGetDataByIndex;
    }()
    /**
     * @method 更新数据
     * @param {string} tableName 表名
     * @param {T} data 更新的数据
     */
    )
  }, {
    key: "update",
    value: (function () {
      var _update = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee8(tableName, data) {
        var _this8 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this8.db.transaction([tableName], 'readwrite');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.put(data);
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function () {
                  resolve();
                };
              }));
            case 1:
            case "end":
              return _context8.stop();
          }
        }, _callee8);
      }));
      function update(_x12, _x13) {
        return _update.apply(this, arguments);
      }
      return update;
    }()
    /**
     * @method 修改某条数据的主键，并返回修改的对象
     * @param {string} tableName 表名
     * @param {string|number} primaryKey 更新数据的主键
     * @param {T} data 更新的数据
     */
    )
  }, {
    key: "updateByPrimaryKey",
    value: (function () {
      var _updateByPrimaryKey = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee9(tableName, primaryKey, data) {
        var _this9 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this9.db.transaction([tableName], 'readwrite');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.get(primaryKey);
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function () {
                  var newObject = _objectSpread(_objectSpread({}, request.result), data);
                  var newRequest = objectStore.put(newObject);
                  newRequest.onerror = function () {
                    reject(newRequest.error);
                  };
                  newRequest.onsuccess = function () {
                    resolve(newObject);
                  };
                };
              }));
            case 1:
            case "end":
              return _context9.stop();
          }
        }, _callee9);
      }));
      function updateByPrimaryKey(_x14, _x15, _x16) {
        return _updateByPrimaryKey.apply(this, arguments);
      }
      return updateByPrimaryKey;
    }()
    /**
     * @method 插入数据
     * @param {string} tableName 表名
     * @param {T} data 插入的数据
     */
    )
  }, {
    key: "insert",
    value: (function () {
      var _insert = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee10(tableName, data) {
        var _this10 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this10.db.transaction([tableName], 'readwrite');
                var objectStore = transaction.objectStore(tableName);
                if (Array.isArray(data)) {
                  data.forEach(function (item) {
                    // 这里使用put，如果不存在就新建，存在即更新
                    var request = objectStore.put(item);
                    request.onerror = function () {
                      reject(request.error);
                    };
                    request.onsuccess = function () {
                      resolve();
                    };
                  });
                } else {
                  var request = objectStore.put(data);
                  request.onerror = function () {
                    reject(request.error);
                  };
                  request.onsuccess = function () {
                    resolve();
                  };
                }
              }));
            case 1:
            case "end":
              return _context10.stop();
          }
        }, _callee10);
      }));
      function insert(_x17, _x18) {
        return _insert.apply(this, arguments);
      }
      return insert;
    }()
    /**
     * @method 删除指定名称的indexedDB数据库
     * @param {string} name 数据库名称
     */
    )
  }, {
    key: "deleteDB",
    value: (function () {
      var _deleteDB = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee11(name) {
        var _this11 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              return _context11.abrupt("return", new Promise(function (resolve, reject) {
                var indexedDB = _this11.getWindowIndexedDB();
                var request = indexedDB.deleteDatabase(name);
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function () {
                  resolve();
                };
              }));
            case 1:
            case "end":
              return _context11.stop();
          }
        }, _callee11);
      }));
      function deleteDB(_x19) {
        return _deleteDB.apply(this, arguments);
      }
      return deleteDB;
    }()
    /**
     * @method 删除存储对象仓库中的所有数据，不会删除该对象存储区本身
     * @param {string} tableName 表名
     */
    )
  }, {
    key: "deleteStore",
    value: (function () {
      var _deleteStore = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee12(tableName) {
        var _this12 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              return _context12.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this12.db.transaction([tableName], 'readwrite');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.clear();
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function () {
                  resolve();
                };
              }));
            case 1:
            case "end":
              return _context12.stop();
          }
        }, _callee12);
      }));
      function deleteStore(_x20) {
        return _deleteStore.apply(this, arguments);
      }
      return deleteStore;
    }()
    /**
     * @method 删除部分数据
     * @param {string} tableName 表名
     * @param {string|number} primaryKey 主键名称
     */
    )
  }, {
    key: "deleteByKey",
    value: (function () {
      var _deleteByKey = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee13(tableName, primaryKey) {
        var _this13 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee13$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              return _context13.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this13.db.transaction([tableName], 'readwrite');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore["delete"](primaryKey);
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function () {
                  resolve();
                };
              }));
            case 1:
            case "end":
              return _context13.stop();
          }
        }, _callee13);
      }));
      function deleteByKey(_x21, _x22) {
        return _deleteByKey.apply(this, arguments);
      }
      return deleteByKey;
    }()
    /**
     * @method 通过具体条件遍历删除数据
     * @param {string} tableName 表名
     * @param {function} condition 查询的条件
     */
    )
  }, {
    key: "deleteByCondition",
    value: (function () {
      var _deleteByCondition = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee14(tableName, condition) {
        var _this14 = this;
        return _regeneratorRuntime__default.default.wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              return _context14.abrupt("return", new Promise(function (resolve, reject) {
                var transaction = _this14.db.transaction([tableName], 'readwrite');
                var objectStore = transaction.objectStore(tableName);
                var request = objectStore.openCursor();
                request.onerror = function () {
                  reject(request.error);
                };
                request.onsuccess = function (event) {
                  var cursor = event.target.result;
                  if (cursor) {
                    var currentValue = cursor.value;
                    if (condition(currentValue)) {
                      cursor["delete"]();
                    }
                    cursor["continue"]();
                  } else {
                    resolve();
                  }
                };
              }));
            case 1:
            case "end":
              return _context14.stop();
          }
        }, _callee14);
      }));
      function deleteByCondition(_x23, _x24) {
        return _deleteByCondition.apply(this, arguments);
      }
      return deleteByCondition;
    }())
  }, {
    key: "createTable",
    value: function createTable(db, tableList) {
      var _iterator = _createForOfIteratorHelper(tableList),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var table = _step.value;
          if (!db.objectStoreNames.contains(table.name)) {
            var objectStore = db.createObjectStore(table.name,
            // keyPath：主键, autoIncrement：是否自增
            {
              keyPath: table.keyPath,
              autoIncrement: table.autoIncrement
            });
            if (table.indexes) {
              this.createIndexes(objectStore, table.indexes);
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "createIndexes",
    value: function createIndexes(objectStore, indexes) {
      var _iterator2 = _createForOfIteratorHelper(indexes),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var index = _step2.value;
          // createIndex是创建索引，name是索引名字，keyPath是键路径
          objectStore.createIndex(index.name, index.keyPath, {
            unique: index.unique,
            multiEntry: index.multiEntry
          });
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "getWindowIndexedDB",
    value: function getWindowIndexedDB() {
      var _window = window,
        indexedDB = _window.indexedDB;
      if (!indexedDB) {
        throw Error('This browser does not support indexedDB');
      }
      return indexedDB;
    }
  }]);
  return IndexedDbWrapper;
}();

exports.IndexedDbWrapper = IndexedDbWrapper;
