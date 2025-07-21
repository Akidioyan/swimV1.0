import { StorageInterface } from './interface';
import { IndexedDbWrapper } from './wrapper/indexedDB';
export interface IndexedDBConfig {
    dbName: string;
    version: number;
    tables: Table[];
}
export interface Table {
    name: string;
    keyPath: string;
    autoIncrement?: boolean;
    indexes?: Index[];
}
export interface Index {
    name: string;
    keyPath: string;
    unique?: boolean;
    multiEntry?: boolean;
}
export declare enum StorageType {
    local = "local",
    session = "session",
    memory = "memory",
    indexedDB = "indexedDB"
}
export declare const Storage: {
    local: {
        getItem(key: string): any;
        setItem(key: string, value: any): void;
        removeItem(key: string): void;
        clear(): void;
    } | {
        getItem(): any;
        setItem(): any;
        removeItem(): any;
        clear(): any;
    };
    session: {
        getItem(key: string): any;
        setItem(key: string, value: any): void;
        removeItem(key: string): void;
        clear(): void;
    } | {
        getItem(): any;
        setItem(): any;
        removeItem(): any;
        clear(): any;
    };
    memory: import("./wrapper/memory").MemoryStorageWrapper;
};
export declare function getStorage(type: StorageType): StorageInterface;
export declare function getIndexedDB(config: IndexedDBConfig): IndexedDbWrapper;
