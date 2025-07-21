/**
 * 设置cookie
 *
 * @example
 *  setCookie('name', 'qqnews', 4)
 *
 * @export
 * @param {string} name cookie名
 * @param {string} value cookie值
 * @param {number|null} hour cookie存活时间，单位：小时
 * @param {string|null} domain 所在域名，如果没有定义，默认为当前文档位置的路径的域名部分
 * @param {string|null} path 所在路径，如果没有定义，默认为当前文档位置的路径
 * @param {boolean|null} secure cookie只会被https传输
 * @returns {boolean}
 */
function setCookie(name, value, hour, domain, path, secure) {
  var expire = new Date();
  if (hour) {
    expire.setTime(new Date().getTime() + 60 * 60 * 1000 * hour);
  }
  document.cookie = "".concat(encodeURIComponent(name), "=").concat(encodeURIComponent(value), "; ").concat(hour ? "expires=".concat(expire.toUTCString(), "; ") : '').concat(path ? "path=".concat(path, "; ") : '').concat(domain ? "domain=".concat(domain, ";") : '').concat(secure ? '; secure' : '');
  return true;
}

/**
 * 获取对应cookie值
 *
 * @example
 *  var ck = getCookie('name')     // qqnews
 *
 * @export
 * @param {string} name 要获取的cookie名
 * @returns {string} 获取的cookie值
 */
function getCookie(name) {
  var r = new RegExp("(?:^|;+|\\s+)".concat(encodeURIComponent(name), "=([^;]*)"));
  var m = document.cookie.match(r);
  return !m ? '' : decodeURIComponent(m[1]);
}

/**
 * 删除指定的cookie
 *
 * @example
 *  delCookie('name')
 *
 * @export
 * @param {string} name cookie名
 * @param {string|null} domain 所在域名，如果没有定义，默认为当前文档位置的路径的域名部分
 * @param {string|null} path 所在路径，如果没有定义，默认为当前文档位置的路径
 * @returns {boolean}
 */
function delCookie(name, domain, path) {
  setCookie(name, '', -1, domain, path);
  return true;
}

export { delCookie, getCookie, setCookie };
