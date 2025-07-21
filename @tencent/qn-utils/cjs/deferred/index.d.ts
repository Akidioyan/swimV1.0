/**
 * 拆解Promise构造函数，使Promise对象、resolve方法、reject方法可以分开使用
 * 方便异步场景，例如确保js bridge是否成功注入
 * @example
 * ```ts
 * const d = new Deferred();
 * function onJsBridgeReady() { d.resolve() }
 * async function jsBridgeCall() {
 *   await d.promise;
 *   // Do js bridge call here
 * }
 * ```
 */
export default class Deferred<V, E = {
    code: number;
    message: string;
}> {
    resolve: (v?: V) => void;
    reject: (v?: E) => void;
    promise: Promise<V>;
    constructor(options?: {
        timeout?: number;
        timeoutError?: E;
    });
}
