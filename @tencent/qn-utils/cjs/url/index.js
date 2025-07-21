'use strict';

var qs = require('qs');

var getUrlParams = function getUrlParams(url) {
  var result = qs.parse(url || window.location.search.slice(1));
  return result;
};

exports.getUrlParams = getUrlParams;
