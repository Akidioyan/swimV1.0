'use strict';

/**
 * xss过滤器
 *
 * @param {string} input 传入字符串
 * @returns {string} 过滤后的字符串
 */
function xssFilter(input) {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}
var ESCAPE_LOOKUP = {
  '&': "\\u0026",
  '>': "\\u003e",
  '<': "\\u003c",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var ESCAPE_REGEX = /[&><\u2028\u2029]/g;

/**
 * html中的特殊字符转码，方法来源https://github.com/vercel/next.js/blob/canary/packages/next/src/server/htmlescape.ts
 */
var htmlEscape = function htmlEscape(html) {
  return html.replace(ESCAPE_REGEX, function (match) {
    return ESCAPE_LOOKUP[match];
  });
};

exports.htmlEscape = htmlEscape;
exports.xssFilter = xssFilter;
