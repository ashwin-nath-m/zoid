"use strict";

exports.__esModule = true;

var _child = require("./child");

Object.keys(_child).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _child[key]) return;
  exports[key] = _child[key];
});