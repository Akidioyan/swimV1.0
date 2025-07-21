/**
 * xss过滤器
 *
 * @param {string} input 传入字符串
 * @returns {string} 过滤后的字符串
 */
export declare function xssFilter(input: string): string;
/**
 * html中的特殊字符转码，方法来源https://github.com/vercel/next.js/blob/canary/packages/next/src/server/htmlescape.ts
 */
export declare const htmlEscape: (html: string) => string;
