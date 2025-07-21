export interface StorageInterface {
    /**
     * 获取 key 对应的 value，获取不到时返回 `null`
     * @param {string} key
     * @returns value
     */
    getItem(key: string): any;
    /**
     * 存储数据
     * @param {string} key
     * @param {any} value
     */
    setItem(key: string, value: any): void;
    /**
     * 移除 key
     * @param {string} key
     */
    removeItem(key: string): void;
    /**
     * 清空数据
     */
    clear(): void;
}
