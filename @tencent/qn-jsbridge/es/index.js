import JsBridge$1 from './bridge/index.js';
export { BridgeType } from './bridge/index.js';
import { isClient } from './utils/index.js';

var JsBridge = isClient() ? new JsBridge$1() : {
  ready: function ready(type) {
    return Promise.resolve(type);
  },
  readyAny: function readyAny() {
    return Promise.resolve();
  }
};

export { JsBridge as default };
