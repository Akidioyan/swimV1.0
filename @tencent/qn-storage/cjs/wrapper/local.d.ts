import { StorageInterface } from '../interface';
/**
 * LocalStorage Wrapper
 * 内部会将数据序列化为字符串存储（JSON.stringify），并在获取时恢复为原始对象（JSON.parse）
 * 如果取出的值不是有效的JSON，则会直接返回原始字符串
 */
declare class LocalStorageWrapper implements StorageInterface {
    getItem(key: string): any;
    setItem(key: string, value: any): void;
    removeItem(key: string): void;
    clear(): void;
}
declare const storage: LocalStorageWrapper;
export default storage;
