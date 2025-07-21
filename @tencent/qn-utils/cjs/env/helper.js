'use strict';

var isSSR = function isSSR() {
  return typeof window === 'undefined';
};
function isBrowser() {
  return typeof window !== 'undefined';
}

exports.isBrowser = isBrowser;
exports.isSSR = isSSR;
