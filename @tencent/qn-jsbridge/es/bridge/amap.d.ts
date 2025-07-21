import { CallbackFunction } from '../interface';
interface IShareInfo {
    title: string;
    desc?: string;
    imgUrl?: string;
}
export default class Amap {
    isReady: boolean;
    isAmap: boolean;
    readyListener: any[];
    readyState: string;
    constructor();
    ready(): Promise<unknown>;
    /**
     * 使用高德的 JSAPI 设置分享信息， 仅在高德 App 中起作用
     *
     * @param {string} options.title 分享标题
     * @param {string} options.desc 分享副标题
     * @param {string} options.imgUrl 分享图片
     * @param {CallbackFunction} onShare 回调方法，分享成功后调用
     * @returns Promise<boolean> 分享是否设置成功
     */
    setShareInfo(options: IShareInfo, onShare?: CallbackFunction): Promise<unknown>;
    getNetworkType(): Promise<unknown>;
}
export {};
