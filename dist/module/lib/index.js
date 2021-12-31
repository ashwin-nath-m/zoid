"use strict";

exports.__esModule = true;

var _global = require("./global");

Object.keys(_global).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _global[key]) return;
  exports[key] = _global[key];
});

var _serialize = require("./serialize");

Object.keys(_serialize).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _serialize[key]) return;
  exports[key] = _serialize[key];
});

var _window = require("./window");

Object.keys(_window).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _window[key]) return;
  exports[key] = _window[key];
});