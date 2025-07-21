export declare enum ShareType {
    weixin = "wx",
    timeLine = "timeline",
    qq = "qq",
    qZone = "qzone",
    tencentVideo = "tencentVideo",
    amap = "amap"
}
export type CallbackFunction = (options: {
    target: ShareType;
    link: string;
}) => void;
export interface IShareInfo {
    title: string;
    desc?: string;
    imgUrl?: string;
    sourceName?: string;
    back?: boolean;
}
export interface JsBridgeInstance {
    ready: () => void;
    setShareInfo: (options: IShareInfo, callback?: CallbackFunction) => Promise<void>;
    getNetworkType: () => Promise<string>;
}
