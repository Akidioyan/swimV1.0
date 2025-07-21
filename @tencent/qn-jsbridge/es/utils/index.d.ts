export declare const callOnce: (callback: Function) => (...args: any[]) => any;
export declare const isMqqUA: (ua: string) => boolean;
export declare const isWKWebView: (ua: string) => boolean;
export declare const isClient: () => boolean;
export declare const UA: string;
export declare function isInIframe(): boolean;
export declare function getParentWeixinJSBridge(): {
    invoke: (api: string, params: NormalObject, callback?: (params: {
        err_msg: string;
    }) => void) => void;
};
export declare function waitForParentWeixinJSBridge(maxAttempts: number, interval: number): Promise<unknown>;
