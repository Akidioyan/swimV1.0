import _defineProperty from '@babel/runtime/helpers/defineProperty';
import storage from './wrapper/local.js';
import storage$1 from './wrapper/session.js';
import storage$2 from './wrapper/memory.js';
import { IndexedDbWrapper } from './wrapper/indexedDB.js';
import fakeStorage from './wrapper/fake.js';
import { isClient } from './utils.js';

var StorageType = /*#__PURE__*/function (StorageType) {
  StorageType["local"] = "local";
  StorageType["session"] = "session";
  StorageType["memory"] = "memory";
  StorageType["indexedDB"] = "indexedDB";
  return StorageType;
}({});
var Storage = _defineProperty(_defineProperty(_defineProperty({}, StorageType.local, isClient() ? storage : fakeStorage), StorageType.session, isClient() ? storage$1 : fakeStorage), StorageType.memory, storage$2);
function getStorage(type) {
  if (isClient()) {
    return Storage[type] || storage$2;
  }
  return fakeStorage;
}
function getIndexedDB(config) {
  if (isClient()) {
    return new IndexedDbWrapper(config);
  }
  return undefined;
}

export { Storage, StorageType, getIndexedDB, getStorage };
