interface IShareInfo {
    title: string;
    desc?: string;
    imgUrl?: string;
}
export default class QQBrowser {
    isReady: boolean;
    isQQBrowser: boolean;
    readyListener: any[];
    readyState: string;
    constructor();
    ready(): Promise<unknown>;
    /**
     * 设置分享信息
     * @param options
     * @returns`
     */
    setShareInfo(options: IShareInfo): Promise<unknown>;
    /**
     * 获取网络状态
     * @returns
     */
    getNetworkType(): Promise<unknown>;
}
export {};
