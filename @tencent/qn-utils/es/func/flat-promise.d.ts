export type FlatPromise<T = any> = Promise<T> & {
    resolve: any;
    reject: any;
};
/**
 * 创建一个可脱离回调修改状态的扁平化 Promise，简化接收异步结果的写法，在处理复杂的控制流语句场景时更方便、更灵活。
 * @example
 * ```ts
 * async function getIns(databaseName, version) {
 *   // with new Promise()
 *   const promise = new Promise((resolve, reject) => {
 *     const request = window.indexedDB.open(databaseName, version);
 *     request.onsuccess = () => resolve(request.result);
 *     request.onerror = (event) => reject(event);
 *   });
 *
 *   // with createFlatPromise()
 *   const promise = createFlatPromise();
 *   const request = window.indexedDB.open(databaseName, version);
 *   request.onsuccess = () => promise.resolve(request.result);
 *   request.onerror = (event) => promise.reject(event);
 *
 *   // return promise ins
 *   return promise;
 * }
 * ```
 */
export declare function createFlatPromise<T = any>(): FlatPromise<T>;
