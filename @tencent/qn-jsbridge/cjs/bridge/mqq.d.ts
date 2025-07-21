import { CallbackFunction, IShareInfo } from '../interface';
export default class Mqq {
    isReady: boolean;
    isMqqUA: any;
    readyListener: any[];
    qqSdkVersion: string;
    readyState: string;
    constructor();
    ready(): Promise<unknown>;
    /**
     * 获取网络状态
     * @returns
     */
    getNetworkType(): Promise<unknown>;
    /**
     * 设置分享信息
     * @param options
     * @returns
     */
    setShareInfo(options: IShareInfo, onShare?: CallbackFunction): Promise<void>;
}
