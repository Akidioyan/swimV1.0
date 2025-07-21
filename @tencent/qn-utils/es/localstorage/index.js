/**
 * 判断是否支持本地存储
 *
 * @returns {boolean}
 */
function isLSSupported() {
  var _window;
  var supported = false;
  if ((_window = window) !== null && _window !== void 0 && (_window = _window.localStorage) !== null && _window !== void 0 && _window.setItem) {
    supported = true;
    var key = '__localstorage__test__';
    try {
      window.localStorage.setItem(key, key);
      window.localStorage.removeItem(key);
    } catch (err) {
      supported = false;
    }
  }
  return supported;
}

/**
 * 将输入值序列化为JSON字符串
 *
 * @param {any} obj 存入值
 * @returns {string} 序列化之后的值
 */
function serialize(obj) {
  return JSON.stringify(obj);
}

/**
 * 反序列化JSON字符串
 *
 * @param {string} jsonStr json字符串
 * @returns {any} 可能是字符串、整数、浮点数、对象、数组、null、甚至 ReactElement
 */
function deserialize(jsonStr) {
  if (!jsonStr) {
    return null;
  }
  var val = '';
  try {
    val = JSON.parse(jsonStr);
  } catch (e) {
    val = jsonStr;
  }
  return val;
}

/**
 * 获取本地存储的值
 *
 * @example
 *  getLS('user')     // {name: 'qqnews'}
 *
 * @export
 * @param {string} key 本地存储的key值
 * @returns 本地存储key对应的值, 可能是字符串、整数、浮点数、对象、数组、null、甚至 ReactElement
 */
function getLS(key) {
  if (!isLSSupported()) {
    return null;
  }
  return deserialize(window.localStorage.getItem(key));
}

/**
 * 设置本地存储的键值对
 *
 * @example
 *  setLS('user', {name: 'qqnews'})
 *
 * @export
 * @param {string} key key值
 * @param {any} data 对应的数据
 * @returns
 */
function setLS(key, data) {
  if (isLSSupported()) {
    window.localStorage.setItem(key, serialize(data));
  }
}

/**
 * 删除本地存储对应的键值对
 *
 * @example
 *  removeLS()
 *
 * @export
 * @param {string} key key值
 * @returns
 */
function removeLS(key) {
  if (isLSSupported()) {
    window.localStorage.removeItem(key);
  }
}

/**
 * 删除所有的本地存储数据
 *
 * @example
 *  clearAllLS()
 *
 * @export
 * @returns
 */
function clearAllLS() {
  if (isLSSupported()) {
    window.localStorage.clear();
  }
}

export { clearAllLS, getLS, removeLS, setLS };
