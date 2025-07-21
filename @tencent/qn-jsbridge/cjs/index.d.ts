import Bridge, { BridgeType } from './bridge';
declare const JsBridge: Bridge | {
    ready: (type: BridgeType) => Promise<BridgeType>;
    readyAny: () => Promise<void>;
};
export { BridgeType };
export default JsBridge;
