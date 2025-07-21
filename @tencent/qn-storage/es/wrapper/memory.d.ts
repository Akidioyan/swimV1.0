import { StorageInterface } from '../interface';
/**
 * 内存存储，基于 Map 实现
 */
export declare class MemoryStorageWrapper implements StorageInterface {
    private storage;
    constructor();
    getItem(key: string): any;
    setItem(key: string, value: any): void;
    removeItem(key: string): void;
    clear(): void;
}
declare const storage: MemoryStorageWrapper;
export default storage;
