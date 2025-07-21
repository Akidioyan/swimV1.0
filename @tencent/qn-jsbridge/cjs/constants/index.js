'use strict';

// 0-无网络 1-wifi 2-2g 3-3g 4-4g 5-其他网络
var NetworkType = /*#__PURE__*/function (NetworkType) {
  NetworkType["unknown"] = "Unknown";
  NetworkType["fail"] = "fail";
  NetworkType["wifi"] = "wifi";
  NetworkType["second"] = "2g";
  NetworkType["third"] = "3g";
  NetworkType["fourth"] = "4g";
  NetworkType["fifth"] = "5g";
  NetworkType["other"] = "other";
  return NetworkType;
}({});

exports.NetworkType = NetworkType;
