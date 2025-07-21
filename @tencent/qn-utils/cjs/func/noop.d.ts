/**
 * @file 一系列占位空函数
 */
/**
 * 创建 noop 函数，内置的 noopStr、noopNum、noopObj、noopVoid 不满足使用场景时，可用此函数来创建新的 noop 函数
 * @example
 * ```
 * const noopCat = makeNoopAny({ name: 'cat' });
 * ```
 */
export declare function makeNoopAny<T = any>(result?: T): (...args: any[]) => T;
/** noopAny 默认返回 {}, 如不满足使用场景可基于 makeNoopAny 来定制 */
export declare function noopAny(...args: any[]): any;
export declare function noopStr(...args: any[]): string;
export declare function noopNum(...args: any[]): number;
export declare function noopObj<T = Record<string, any>>(...args: any[]): T;
export declare function noopVoid(...args: any[]): void;
/**
 * 创建 noop async 函数，内置的 noopStrAsync、noopNumAsync、noopObjAsync、noopVoidAsync 不满足使用场景时，
 * 可用此函数来创建新的 noop 函数
 * @example
 * ```
 * const noopCatAsync = makeNoopAnyAsync({ name: 'cat' });
 * ```
 */
export declare function makeNoopAnyAsync<T = any>(result?: T): (...args: any[]) => Promise<T>;
/** noopAnyAsync 默认返回 {}, 如不满足使用场景可基于 makeNoopAnyAsync 来定制 */
export declare function noopAnyAsync(...args: any[]): Promise<any>;
export declare function noopStrAsync(...args: any[]): Promise<string>;
export declare function noopNumAsync(...args: any[]): Promise<number>;
export declare function noopObjAsync<T = Record<string, any>>(...args: any[]): Promise<T>;
export declare function noopVoidAsync(...args: any[]): Promise<void>;
