import { IndexedDBConfig } from '../index';
/**
 * indexedDB存储
 */
export declare class IndexedDbWrapper {
    private config;
    private db;
    private dbName;
    private version;
    private tableList;
    constructor(config: IndexedDBConfig);
    /**
     * @method 打开数据库
     */
    openDB(): Promise<void>;
    /**
     * @method 关闭数据库
     */
    closeDB(): Promise<unknown>;
    /**
     * @method 获取所有数据
     * @param {string} tableName 表名
     */
    getAllData<T>(tableName: string): Promise<T[]>;
    /**
     * @method 根据具体的条件通过游标查询结果
     * @param {string} tableName 表名
     * @param {function} condition 查询的条件
     */
    getDataByCursor<T>(tableName: string, condition: (data: T) => boolean): Promise<T[]>;
    /**
     * @method 通过索引读取数据
     * @param {string} tableName 表名
     * @param {string} indexName 索引名称
     * @param {string} indexValue 索引值
     */
    getDataByKeyValue<T>(tableName: string, indexName: string, indexValue: string): Promise<T>;
    /**
     * @method 通过主键读取数据
     * @param {string} tableName 表名
     * @param {string} primaryKey 主键名称
     */
    getDataByPrimaryKey<T>(tableName: string, primaryKey: string | number): Promise<T>;
    /**
     * @method 通过索引和游标查询记录
     * @param {string} tableName 表名
     * @param {string} indexName 索引名称
     * @param {string} indexValue 索引值
     */
    cursorGetDataByIndex<T>(tableName: string, indexName: string, indexValue: string): Promise<T[]>;
    /**
     * @method 更新数据
     * @param {string} tableName 表名
     * @param {T} data 更新的数据
     */
    update<T>(tableName: string, data: T): Promise<void>;
    /**
     * @method 修改某条数据的主键，并返回修改的对象
     * @param {string} tableName 表名
     * @param {string|number} primaryKey 更新数据的主键
     * @param {T} data 更新的数据
     */
    updateByPrimaryKey<T>(tableName: string, primaryKey: string | number, data: T): Promise<T>;
    /**
     * @method 插入数据
     * @param {string} tableName 表名
     * @param {T} data 插入的数据
     */
    insert<T>(tableName: string, data: T | T[]): Promise<void>;
    /**
     * @method 删除指定名称的indexedDB数据库
     * @param {string} name 数据库名称
     */
    deleteDB(name: string): Promise<void>;
    /**
     * @method 删除存储对象仓库中的所有数据，不会删除该对象存储区本身
     * @param {string} tableName 表名
     */
    deleteStore(tableName: string): Promise<void>;
    /**
     * @method 删除部分数据
     * @param {string} tableName 表名
     * @param {string|number} primaryKey 主键名称
     */
    deleteByKey(tableName: string, primaryKey: string | number): Promise<void>;
    /**
     * @method 通过具体条件遍历删除数据
     * @param {string} tableName 表名
     * @param {function} condition 查询的条件
     */
    deleteByCondition<T>(tableName: string, condition: (data: T) => boolean): Promise<void>;
    private createTable;
    private createIndexes;
    private getWindowIndexedDB;
}
