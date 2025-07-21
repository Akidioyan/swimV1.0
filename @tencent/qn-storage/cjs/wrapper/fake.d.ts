import { StorageInterface } from '../interface';
/**
 * FakeStorage Wrapper
 * 非window环境下使用该storage
 */
declare class FakeStorageWrapper implements StorageInterface {
    getItem(): any;
    setItem(): any;
    removeItem(): any;
    clear(): any;
}
declare const fakeStorage: FakeStorageWrapper;
export default fakeStorage;
