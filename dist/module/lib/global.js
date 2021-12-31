"use strict";

exports.__esModule = true;
exports.destroyGlobal = destroyGlobal;
exports.getGlobal = getGlobal;
exports.getGlobalKey = getGlobalKey;
exports.tryGlobal = tryGlobal;

var _src = require("cross-domain-utils/src");

var _src2 = require("belter/src");

function getGlobalKey() {
  if (__ZOID__.__SCRIPT_NAMESPACE__) {
    return `${__ZOID__.__GLOBAL_KEY__}_${(0, _src2.getCurrentScriptUID)()}`;
  } else {
    return __ZOID__.__GLOBAL_KEY__;
  }
}

function getGlobal(win) {
  const globalKey = getGlobalKey();

  if (!(0, _src.isSameDomain)(win)) {
    throw new Error(`Can not get global for window on different domain`);
  }

  if (!win[globalKey]) {
    win[globalKey] = {};
  }

  return win[globalKey];
}

function tryGlobal(win, handler) {
  try {
    return handler(getGlobal(win));
  } catch (err) {// pass
  }
}

function destroyGlobal() {
  const globalKey = getGlobalKey();
  delete window[globalKey];
}