"use strict";

exports.__esModule = true;

var _container = require("./container");

Object.keys(_container).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _container[key]) return;
  exports[key] = _container[key];
});

var _component = require("./component");

Object.keys(_component).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _component[key]) return;
  exports[key] = _component[key];
});