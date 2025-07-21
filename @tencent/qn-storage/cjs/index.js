'use strict';

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var local = require('./wrapper/local.js');
var session = require('./wrapper/session.js');
var memory = require('./wrapper/memory.js');
var indexedDB = require('./wrapper/indexedDB.js');
var fake = require('./wrapper/fake.js');
var utils = require('./utils.js');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultCompat(_defineProperty);

var StorageType = /*#__PURE__*/function (StorageType) {
  StorageType["local"] = "local";
  StorageType["session"] = "session";
  StorageType["memory"] = "memory";
  StorageType["indexedDB"] = "indexedDB";
  return StorageType;
}({});
var Storage = _defineProperty__default.default(_defineProperty__default.default(_defineProperty__default.default({}, StorageType.local, utils.isClient() ? local : fake), StorageType.session, utils.isClient() ? session : fake), StorageType.memory, memory.default);
function getStorage(type) {
  if (utils.isClient()) {
    return Storage[type] || memory.default;
  }
  return fake;
}
function getIndexedDB(config) {
  if (utils.isClient()) {
    return new indexedDB.IndexedDbWrapper(config);
  }
  return undefined;
}

exports.Storage = Storage;
exports.StorageType = StorageType;
exports.getIndexedDB = getIndexedDB;
exports.getStorage = getStorage;
