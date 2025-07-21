import { parse } from 'qs';

var getUrlParams = function getUrlParams(url) {
  var result = parse(url || window.location.search.slice(1));
  return result;
};

export { getUrlParams };
