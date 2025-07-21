export interface IGuardOptions {
    /**
     * default: true
     * 是否缓存函数运行结果
     */
    cacheResult?: boolean;
}
/**
 * 并发保护类，标识了相同key的多个函数在高并发场景同时执行时，只有一个函数会真正执行，其他的则进入等待并复用此函数结果
 * @example
 * ```ts
 * const guard = new ConcurrencyGuard();
 * await guard.call('key', heavyAsyncFn, 1, 2, 3);
 * await guard.apply('key', heavyAsyncFn, [1, 2, 3]);
 * ```
 */
export declare class ConcurrencyGuard {
    /** 运行中的 promise 对象 map */
    private runningPromiseMap;
    /** 记录运行中的 promise 是否已被获取 */
    private runningPromiseGettedMap;
    /** 缓存运行过的函数结果 */
    private resultMap;
    /** 是否缓存函数运行结果 */
    private cacheResult;
    constructor(options?: IGuardOptions);
    /**
     * 标识key并调用函数，通过可变参数透传参数给函数参数，标识了相同key的多个函数在高并发时只有一个被执行，其他函数等待结果
     * @example - 自动推导类型
     * ```ts
     * const result = await guard.call('key', (p1, p2) => Promise.resolve([p1, p2]), 1, 2);
     * ```
     * @example - 通过泛型标注类型
     * ```ts
     * const result = await guard.call<number, [number, number]>('key', (p1, p2) => Promise.resolve(1), 1, 2);
     * ```
     */
    call<T extends any = any, A extends any[] = any[]>(key: string, asyncFn: (...args: A) => Promise<T>, ...args: A): Promise<T>;
    /**
     * 标识key并调用函数，通过参数列表透传参数给函数参数，标识了相同key的多个函数在高并发时只有一个被执行，其他函数等待结果
     * @example
     * ```
     * // [1,2] 透传给 asyncFn 的 p1、p2
     * const result = await guard.apply('key', (p1: number, p2: number) => Promise.resolve([p1, p2]), [1, 2]);
     * ```
     */
    apply<T extends any = any, A extends any[] = any[]>(key: string, asyncFn: (...args: A) => Promise<T>, args: A): Promise<T>;
    /**
     * 等待函数运行结果，如果函数存在且正在运行中，返回 promise 对象等待调用方获取，
     * 如果函数已运行结束且配置了 cacheResult=true，返回记录的缓存结果，
     * 其他情况则返回 undefined，用户需自行处理此情况
     */
    waitResult<T extends any = any>(key: string): Promise<T | undefined>;
    /**
     * 获取运行中的 promise
     */
    private getRunningPromise;
    /**
     * 配合 flatPromise 和 reqKey，控制高并发时只有一个真正发起请求，其他函数等待结果
     */
    private run;
}
