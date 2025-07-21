export declare const QQ_NEWS_START_REFERRER_KEY = "start_referrer_key";
export declare const DEFAULT_PREFIX = "qq_news_";
export declare function getReferrer(): string;
export declare function getDomainFromURL(urlString: string): string;
export declare function getStartReferrer(prefix?: string): any;
/**
 * 第一次打开页面时把 Referrer 作为 start referrer 存起来，当前 Session 页面二次跳转或刷新都不再更新
 * 注意这里只存了域名
 */
export declare function initStartReferrer(prefix?: string): void;
