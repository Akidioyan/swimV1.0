import { CallbackFunction, IShareInfo } from '../interface';
export default class Weixin {
    weixinJSBridge: any;
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
    /**
     * 分享给朋友 收藏
     * @param options
     */
    private setShareInfo4Friend;
    /**
     * 分享到朋友圈
     * @param options
     */
    private setShareInfo4Timeline;
    /**
     * 分享到QQ
     * @param options
     */
    private setShareInfo4QQ;
    /**
     * 分享到QQ空间
     * @param options
     */
    private setShareInfo4QZone;
}
