import { JsBridgeInstance } from '../interface';
export declare enum BridgeType {
    mqq = "mqq",
    weixin = "weixin",
    qqBrowser = "qqBrowser",
    tencentVideo = "TencentVideo",
    amap = "amap"
}
export default class JsBridge {
    private readyInstanceType;
    private instances;
    private readyInstance;
    private readyListener;
    constructor();
    ready(type: BridgeType): void;
    readyAny(): Promise<Partial<JsBridgeInstance>>;
}
