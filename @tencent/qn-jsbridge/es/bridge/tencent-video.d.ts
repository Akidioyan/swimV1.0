import { CallbackFunction } from '../interface';
interface IShareInfo {
    title: string;
    desc?: string;
    imgUrl?: string;
}
/**
 * fixme later 视频 JSAPI 目前有问题，调用此方法无回调，后续视频侧修复后再放开 @changlin
 * 视频 JSAPI 检测到的网络类型
 */
/**
 * 腾讯视频 App 中， 视频会自动注入 SDK ，无需再手动加载
 * 详细文档参考 README.md
 */
export default class TencentVideo {
    isReady: boolean;
    isTencentVideo: boolean;
    readyListener: any[];
    readyState: string;
    constructor();
    ready(): Promise<unknown>;
    /**
     * 使用腾讯视频的 JSAPI 设置分享信息， 仅在腾讯视频 App 中起作用
     *
     * @param {string} options.title 分享标题
     * @param {string} options.desc 分享副标题
     * @param {string} options.imgUrl 分享图片
     * @param {CallbackFunction} onShare 回调方法，分享成功后调用
     * @returns Promise<boolean> 分享是否设置成功
     */
    setShareInfo(options: IShareInfo, onShare?: CallbackFunction): Promise<unknown>;
    /**
     * 获取网络状态
     *
     * @returns Promise<stirng>
     */
    getNetworkType(): Promise<unknown>;
}
export {};
